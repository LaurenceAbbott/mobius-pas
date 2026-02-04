const tabBar = document.querySelector("#tabBar");
const workspaceContent = document.querySelector("#workspaceContent");
const searchToggle = document.querySelector("#searchToggle");
const searchOverlay = document.querySelector("#searchOverlay");
const tabActions = document.querySelector("#tabActions");
const breadcrumbBar = document.querySelector("#breadcrumbBar");

const clients = window.CLIENTS || {};

const TAB_STORAGE_KEY = "mobiusTabs";
const ACTIVE_TAB_STORAGE_KEY = "mobiusActiveTab";
const RECENT_TAB_STORAGE_KEY = "mobiusRecentTabs";
const TOOLTIP_ID = "app-tooltip";
const LOCK_NOTE_POPOVER_ID = "lock-note-popover";
const LOCK_NOTE_MAX = 60;

const clientList = Object.values(clients);
const clientIndex = clientList.reduce((acc, client) => {
  acc[client.id] = client;
  return acc;
}, {});

let tabs = [];
let activeTabId = null;
let recentTabs = [];
let lockNoteEditorState = { tabId: null, isOpen: false, mode: "add" };
let lockPopoverListeners = { outside: null, keydown: null };
let appTooltip = null;
let tooltipTarget = null;
let lockNoteOverlay = null;
let lockNotePopover = null;
let lockNotePopoverElements = null;
let isWorkAreaFullscreen = false;
let previousBodyOverflow = "";

const clientActions = [
  "Summary",
  "Business details",
  "Transactions",
  "Activity",
  "Complaints",
  "Portal access",
  "Claims",
  "Client checks"
];

const policyActions = [
  "Risk",
  "Breakdown",
  "Quote details & conditions",
  "Notes",
  "Checklist",
  "Attachments",
  "History",
  "Tasks",
  "Transactions",
  "Documents",
  "Claims"
];

const isMacPlatform =
  /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
  /Mac OS X/.test(navigator.userAgent);
const shortcutPrefix = isMacPlatform ? "⌥" : "Alt+";
const formatShortcutLabel = (key, { shift = false } = {}) => {
  const shiftLabel = shift ? (isMacPlatform ? "⇧" : "Shift+") : "";
  return `${shortcutPrefix}${shiftLabel}${key}`;
};

const buildActionShortcuts = (actions, specs) =>
  actions.reduce((acc, action, index) => {
    const spec = specs[index];
    if (!spec) return acc;
    acc[action] = {
      key: spec.key,
      code: spec.code,
      label: formatShortcutLabel(spec.key)
    };
    return acc;
  }, {});

const policyShortcutSpecs = [
  { key: "1", code: "Digit1" },
  { key: "2", code: "Digit2" },
  { key: "3", code: "Digit3" },
  { key: "4", code: "Digit4" },
  { key: "5", code: "Digit5" },
  { key: "6", code: "Digit6" },
  { key: "7", code: "Digit7" },
  { key: "8", code: "Digit8" },
  { key: "9", code: "Digit9" },
  { key: "0", code: "Digit0" },
  { key: "-", code: "Minus" }
];
const clientShortcutSpecs = [
  { key: "1", code: "Digit1" },
  { key: "2", code: "Digit2" },
  { key: "3", code: "Digit3" },
  { key: "4", code: "Digit4" },
  { key: "5", code: "Digit5" },
  { key: "6", code: "Digit6" },
  { key: "7", code: "Digit7" },
  { key: "8", code: "Digit8" }
];
const policyActionShortcuts = buildActionShortcuts(policyActions, policyShortcutSpecs);
const clientActionShortcuts = buildActionShortcuts(clientActions, clientShortcutSpecs);
const policySelectionShortcutSpecs = [
  { key: "1", code: "Digit1", shift: true },
  { key: "2", code: "Digit2", shift: true },
  { key: "3", code: "Digit3", shift: true }
];
const policySelectionShortcuts = policySelectionShortcutSpecs.map((spec) => ({
  ...spec,
  label: formatShortcutLabel(spec.key, { shift: spec.shift })
}));
const backToClientShortcut = { key: "Escape", label: "Esc" };
const policyActionByCode = Object.entries(policyActionShortcuts).reduce((acc, [action, data]) => {
  acc[data.code] = action;
  return acc;
}, {});
const clientActionByCode = Object.entries(clientActionShortcuts).reduce((acc, [action, data]) => {
  acc[data.code] = action;
  return acc;
}, {});
const policySelectionByCode = policySelectionShortcuts.reduce((acc, data, index) => {
  acc[data.code] = index;
  return acc;
}, {});

const policyTypeLabels = {
  motor: "Motor",
  home: "Home",
  travel: "Travel"
};

const policyIconClasses = {
  motor: "fa-sharp fa-light fa-car-side",
  home: "fa-sharp fa-light fa-house",
  travel: "fa-sharp fa-light fa-plane-up"
};

const policyNavIcons = {
  Risk: "fa-sharp fa-light fa-shield",
  Breakdown: "fa-sharp fa-light fa-list",
  "Quote details & conditions": "fa-sharp fa-light fa-file-invoice",
  Notes: "fa-sharp fa-light fa-note-sticky",
  Checklist: "fa-sharp fa-light fa-list-check",
  Attachments: "fa-sharp fa-light fa-paperclip",
  History: "fa-sharp fa-light fa-clock-rotate-left",
  Tasks: "fa-sharp fa-light fa-list",
  Transactions: "fa-sharp fa-light fa-money-bill-transfer",
  Documents: "fa-sharp fa-light fa-folder-open",
  Claims: "fa-sharp fa-light fa-file-circle-exclamation",
  Summary: "fa-sharp fa-light fa-chart-pie",
  "Business details": "fa-sharp fa-light fa-building",
  Activity: "fa-sharp fa-light fa-wave-pulse",
  Complaints: "fa-sharp fa-light fa-comment-dots",
  "Portal access": "fa-sharp fa-light fa-door-open",
  "Client checks": "fa-sharp fa-light fa-badge-check"
};

const normalizePolicyStatus = (policy) => {
  const rawStatus = policy?.status;
  if (rawStatus) {
    const statusValue = rawStatus.toString().toLowerCase();
    if (["lapsed", "cancelled", "expired"].includes(statusValue)) {
      return "lapsed";
    }
    if (["live", "active"].includes(statusValue)) {
      return "active";
    }
    return "active";
  }
  return "active";
};

const splitPoliciesByStatus = (policies = []) =>
  policies.reduce(
    (acc, policy) => {
      if (!policy) return acc;
      const status = normalizePolicyStatus(policy);
      if (status === "lapsed") {
        acc.lapsed.push(policy);
      } else {
        acc.active.push(policy);
      }
      return acc;
    },
    { active: [], lapsed: [] }
  );

const formatAddress = (address) => {
  if (!address) return "";
  const parts = [address.line1, address.line2, address.city, address.country].filter(Boolean);
  const strongPostcode = address.postcode
    ? `<strong>${address.postcode}</strong>`
    : "";
  return `${parts.join(", ")}${parts.length ? " " : ""}${strongPostcode}`.trim();
};

const getClientById = (clientId) => clientIndex[clientId];

const getPolicyById = (client, policyId) =>
  client?.policies?.find((policy) => policy.id === policyId);

const createTabId = (clientId) => `client-${clientId}`;

const buildClientTab = (clientId, { selectedPolicyId = null } = {}) => {
  const client = getClientById(clientId);
  if (!client) return null;

  const policyActionByPolicyId = selectedPolicyId ? { [selectedPolicyId]: "Risk" } : {};

  return {
    id: createTabId(clientId),
    type: "client",
    pinned: false,
    isLocked: false,
    lockNote: "",
    dataRef: { clientId },
    activeClientAction: "Summary",
    activePolicyAction: "Risk",
    selectedPolicyId,
    lastSelectedPolicyId: selectedPolicyId,
    policyActionByPolicyId
  };
};

const getTabDisplay = (tab) => {
  const client = getClientById(tab.dataRef.clientId);
  if (!client) {
    return { title: "Unknown client", subtitle: "" };
  }

  if (tab.selectedPolicyId) {
    const policy = getPolicyById(client, tab.selectedPolicyId);
    if (policy?.ref) {
      const policyType = policyTypeLabels[policy.type] || policy.type || "";
      return {
        title: policy.ref,
        subtitle: policyType ? `${policyType} · ${client.name}` : client.name
      };
    }
  }

  return { title: client.name, subtitle: client.email || "" };
};

const persistTabs = () => {
  localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs));
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId || "");
  localStorage.setItem(RECENT_TAB_STORAGE_KEY, JSON.stringify(recentTabs));
};

const normalizeLockNote = (note) => {
  if (typeof note !== "string") return "";
  return note.trim().slice(0, LOCK_NOTE_MAX);
};

const normalizeStoredTab = (tab) => {
  const clientId = tab?.dataRef?.clientId ?? tab?.dataRef?.customerId ?? tab?.clientId ?? tab?.customerId;
  if (!clientId) return null;
  const policyId = tab?.dataRef?.policyId ?? tab?.policyId;
  const selectedPolicyId =
    tab?.selectedPolicyId ??
    (tab?.type === "policy" ? policyId : null) ??
    null;
  const policyActionByPolicyId =
    tab?.policyActionByPolicyId && typeof tab.policyActionByPolicyId === "object"
      ? tab.policyActionByPolicyId
      : {};
  const storedPolicyAction = selectedPolicyId ? policyActionByPolicyId[selectedPolicyId] : null;
  
  return {
    id: createTabId(clientId),
    type: "client",
    pinned: Boolean(tab?.pinned),
    isLocked: Boolean(tab?.isLocked),
    lockNote: normalizeLockNote(tab?.lockNote),
    dataRef: { clientId },
    activeClientAction: tab?.activeClientAction || "Summary",
    activePolicyAction: tab?.activePolicyAction || storedPolicyAction || "Risk",
    selectedPolicyId,
    lastSelectedPolicyId: tab?.lastSelectedPolicyId ?? selectedPolicyId,
    policyActionByPolicyId
  };
};

const getActiveSelection = (storedTabs, storedActiveId) => {
  if (!storedActiveId) return null;
  const activeTab = storedTabs.find((tab) => tab.id === storedActiveId);
  if (!activeTab) return null;
  const clientId =
    activeTab?.dataRef?.clientId ?? activeTab?.dataRef?.customerId ?? activeTab?.clientId ?? activeTab?.customerId;
  if (!clientId) return null;
  const policyId =
    activeTab?.type === "policy"
      ? activeTab?.dataRef?.policyId ?? activeTab?.policyId
      : activeTab?.selectedPolicyId ?? null;
  return {
    clientId,
    selectedPolicyId: policyId ?? null,
    activePolicyAction: activeTab?.activePolicyAction
  };
};

const restoreTabs = () => {
  const storedTabs = localStorage.getItem(TAB_STORAGE_KEY);
  const storedActive = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  const storedRecent = localStorage.getItem(RECENT_TAB_STORAGE_KEY);

  let parsedTabs = [];
  if (storedTabs) {
    try {
      parsedTabs = JSON.parse(storedTabs) || [];
    } catch (error) {
      parsedTabs = [];
    }
  }

  let parsedRecent = [];
  if (storedRecent) {
    try {
      parsedRecent = JSON.parse(storedRecent) || [];
    } catch (error) {
      parsedRecent = [];
    }
  }

  const activeSelection = getActiveSelection(parsedTabs, storedActive);
  const tabMap = new Map();
  parsedTabs
    .map(normalizeStoredTab)
    .filter(Boolean)
    .forEach((tab) => {
      const existing = tabMap.get(tab.dataRef.clientId);
      if (!existing) {
        tabMap.set(tab.dataRef.clientId, tab);
        return;
      }
      existing.pinned = existing.pinned || tab.pinned;
      existing.isLocked = existing.isLocked || tab.isLocked;
      if (!existing.lockNote && tab.lockNote) {
        existing.lockNote = tab.lockNote;
      }
      existing.activeClientAction = existing.activeClientAction || tab.activeClientAction;
      existing.activePolicyAction = existing.activePolicyAction || tab.activePolicyAction;
      existing.lastSelectedPolicyId = existing.lastSelectedPolicyId || tab.lastSelectedPolicyId;
      existing.policyActionByPolicyId = {
        ...tab.policyActionByPolicyId,
        ...existing.policyActionByPolicyId
      };
      if (!existing.selectedPolicyId && tab.selectedPolicyId) {
        existing.selectedPolicyId = tab.selectedPolicyId;
      }
    });

  if (activeSelection && tabMap.has(activeSelection.clientId)) {
    const activeTab = tabMap.get(activeSelection.clientId);
    if (activeSelection.selectedPolicyId) {
      activeTab.selectedPolicyId = activeSelection.selectedPolicyId;
    }
    if (activeSelection.activePolicyAction) {
      activeTab.activePolicyAction = activeSelection.activePolicyAction;
    }
  }

  tabs = Array.from(tabMap.values());
  activeTabId = activeSelection
    ? createTabId(activeSelection.clientId)
    : tabs[0]
    ? tabs[0].id
    : null;

  const recentSeen = new Set();
  recentTabs = parsedRecent
    .map(normalizeStoredTab)
    .filter(Boolean)
    .filter((tab) => {
      if (recentSeen.has(tab.id)) return false;
      recentSeen.add(tab.id);
      return true;
    });
};

const updateRecentTabs = (tab) => {
  if (!tab) return;
  recentTabs = [tab, ...recentTabs.filter((item) => item.id !== tab.id)].slice(0, 6);
};

const clearLockPopoverListeners = () => {
  if (lockPopoverListeners.outside) {
    document.removeEventListener("click", lockPopoverListeners.outside);
  }
  if (lockPopoverListeners.keydown) {
    document.removeEventListener("keydown", lockPopoverListeners.keydown);
  }
  lockPopoverListeners = { outside: null, keydown: null };
};

const closeLockNoteEditor = () => {
  lockNoteEditorState = { tabId: null, isOpen: false, mode: "add" };
  if (lockNoteOverlay) {
    lockNoteOverlay.classList.remove("is-open");
    lockNoteOverlay.setAttribute("aria-hidden", "true");
    lockNoteOverlay.hidden = true;
  }
  clearLockPopoverListeners();
};

const openLockNoteEditor = (tabId, mode = "add") => {
  lockNoteEditorState = { tabId, isOpen: true, mode };
};

const ensureTooltip = () => {
  if (appTooltip) return appTooltip;
  const tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  tooltip.className = "app-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  appTooltip = tooltip;
  return tooltip;
};

const positionTooltip = (target, tooltip) => {
  if (!target || !tooltip) return;
  const rect = target.getBoundingClientRect();
  const spacing = 10;
  const tooltipRect = tooltip.getBoundingClientRect();
  let top = rect.top - tooltipRect.height - spacing;
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

  if (top < spacing) {
    top = rect.bottom + spacing;
  }
  const maxLeft = window.innerWidth - tooltipRect.width - spacing;
  if (left < spacing) left = spacing;
  if (left > maxLeft) left = maxLeft;

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
};

const showTooltip = (target) => {
  if (!target) return;
  const text = target.getAttribute("data-tooltip");
  if (!text) return;
  const tooltip = ensureTooltip();
  tooltip.textContent = text;
  tooltip.hidden = false;
  tooltipTarget?.removeAttribute("aria-describedby");
  tooltipTarget = target;
  target.setAttribute("aria-describedby", TOOLTIP_ID);
  positionTooltip(target, tooltip);
};

const hideTooltip = () => {
  if (!appTooltip) return;
  appTooltip.hidden = true;
  tooltipTarget?.removeAttribute("aria-describedby");
  tooltipTarget = null;
};

const updateLockNoteCount = () => {
  if (!lockNotePopoverElements?.input || !lockNotePopoverElements?.count) return;
  if (lockNotePopoverElements.input.value.length > LOCK_NOTE_MAX) {
    lockNotePopoverElements.input.value = lockNotePopoverElements.input.value.slice(0, LOCK_NOTE_MAX);
  }
  lockNotePopoverElements.count.textContent = `${lockNotePopoverElements.input.value.length}/${LOCK_NOTE_MAX}`;
};

const getLockNoteTab = () => tabs.find((tab) => tab.id === lockNoteEditorState.tabId);

const ensureLockNotePopover = () => {
  if (lockNotePopover) return lockNotePopoverElements;
  lockNoteOverlay = document.createElement("div");
  lockNoteOverlay.className = "lock-note-overlay";
  lockNoteOverlay.setAttribute("aria-hidden", "true");
  lockNoteOverlay.hidden = true;

  lockNotePopover = document.createElement("div");
  lockNotePopover.id = LOCK_NOTE_POPOVER_ID;
  lockNotePopover.className = "lock-note-popover";
  lockNotePopover.setAttribute("role", "dialog");
  lockNotePopover.setAttribute("aria-modal", "true");
  lockNotePopover.innerHTML = `
    <div class="lock-note-popover__header">
      <div class="lock-note-popover__title" id="lock-note-title">Lock note</div>
      <button
        type="button"
        class="lock-note-popover__close"
        data-action="close-lock-note"
        aria-label="Close lock note"
      >
        &times;
      </button>
    </div>
    <label class="lock-note-popover__label" for="lock-note-input">Note</label>
    <input
      id="lock-note-input"
      class="lock-note-popover__input"
      type="text"
      maxlength="${LOCK_NOTE_MAX}"
      placeholder="Add a note (optional)…"
    />
    <div class="lock-note-popover__meta">
      <span class="lock-note-popover__count">0/${LOCK_NOTE_MAX}</span>
    </div>
    <div class="lock-note-popover__actions">
      <button type="button" class="is-primary" data-action="save-lock-note">Save</button>
      <button type="button" data-action="clear-lock-note">Clear</button>
    </div>
  `;
  lockNotePopover.setAttribute("aria-labelledby", "lock-note-title");
  lockNoteOverlay.appendChild(lockNotePopover);
  document.body.appendChild(lockNoteOverlay);
  lockNotePopoverElements = {
    input: lockNotePopover.querySelector(".lock-note-popover__input"),
    count: lockNotePopover.querySelector(".lock-note-popover__count"),
    title: lockNotePopover.querySelector(".lock-note-popover__title")
  };
  lockNotePopoverElements.input.addEventListener("input", updateLockNoteCount);
  lockNotePopoverElements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveLockNote();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelLockNote();
    }
  });
  return lockNotePopoverElements;
};

const updateLockNotePopoverContent = (tab) => {
  if (!tab || !lockNotePopoverElements) return;
  const { input, count } = lockNotePopoverElements;
  input.value = tab.lockNote || "";
  if (input.value.length > LOCK_NOTE_MAX) {
    input.value = input.value.slice(0, LOCK_NOTE_MAX);
  }
  count.textContent = `${input.value.length}/${LOCK_NOTE_MAX}`;
};

const showLockNotePopover = (tab) => {
  if (!tab) return;
  ensureLockNotePopover();
  lockNoteOverlay.hidden = false;
  lockNoteOverlay.classList.add("is-open");
  lockNoteOverlay.setAttribute("aria-hidden", "false");
  updateLockNotePopoverContent(tab);
  lockNotePopoverElements.input.focus();
  lockNotePopoverElements.input.setSelectionRange(
    lockNotePopoverElements.input.value.length,
    lockNotePopoverElements.input.value.length
  );

  clearLockPopoverListeners();
  lockPopoverListeners.outside = (event) => {
    if (
      lockNotePopover.contains(event.target)
    ) {
      return;
    }
    closeLockNoteEditor();
    renderActiveView();
  };
  lockPopoverListeners.keydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeLockNoteEditor();
      renderActiveView();
    }
  };
  document.addEventListener("click", lockPopoverListeners.outside);
  document.addEventListener("keydown", lockPopoverListeners.keydown);
};

function handleSaveLockNote() {
  const tab = getLockNoteTab();
  if (!tab || !lockNotePopoverElements?.input) return;
  const noteValue = normalizeLockNote(lockNotePopoverElements.input.value);
  updateTabLockState(tab.id, { isLocked: true, lockNote: noteValue });
  closeLockNoteEditor();
  renderActiveView();
}

function handleCancelLockNote() {
  closeLockNoteEditor();
  renderActiveView();
}

function handleClearLockNote() {
  const tab = getLockNoteTab();
  if (!tab) return;
  updateTabLockState(tab.id, { isLocked: true, lockNote: "" });
  closeLockNoteEditor();
  renderActiveView();
}

const updateTabLockState = (tabId, { isLocked, lockNote }) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  if (typeof isLocked === "boolean") {
    tab.isLocked = isLocked;
  }
  if (lockNote !== undefined) {
    tab.lockNote = normalizeLockNote(lockNote);
  }
  if (!tab.isLocked) {
    tab.lockNote = "";
  }
  persistTabs();
  renderTabs();
  renderActiveView();
};

const setActiveTab = (tabId) => {
  activeTabId = tabId;
  const tab = tabs.find((item) => item.id === tabId);
  updateRecentTabs(tab);
  if (lockNoteEditorState.tabId !== tabId) {
    closeLockNoteEditor();
  }
  persistTabs();
  renderTabs();
  renderActiveView();
};

const openClientTab = (clientId, { selectedPolicyId } = {}) => {
  const existingTab = tabs.find((tab) => tab.dataRef.clientId === clientId);
  
  if (existingTab) {
    if (selectedPolicyId !== undefined) {
      setActiveTab(existingTab.id);
      if (selectedPolicyId === null) {
        clearPolicySelection(existingTab.id);
        return;
      }
      selectPolicyForTab(existingTab.id, selectedPolicyId);
      return;
    }
    setActiveTab(existingTab.id);
    return;
  }

  const newTab = buildClientTab(clientId, { selectedPolicyId: selectedPolicyId ?? null });
  if (!newTab) return;

  tabs.push(newTab);
  setActiveTab(newTab.id);
};

const closeTab = (tabId) => {
  const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
  if (tabIndex === -1) return;
  if (tabs[tabIndex].pinned) return;

  const isActive = tabs[tabIndex].id === activeTabId;
  tabs.splice(tabIndex, 1);

  if (isActive) {
    const nextTab = tabs[tabIndex - 1] || tabs[tabIndex] || null;
    activeTabId = nextTab ? nextTab.id : null;
  }

  persistTabs();
  renderTabs();
  renderActiveView();
};

const togglePinTab = (tabId) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  tab.pinned = !tab.pinned;
  persistTabs();
  renderTabs();
};

const renderTabs = () => {
  if (!tabBar) return;
  tabBar.innerHTML = "";

  if (tabs.length === 0) {
    searchToggle?.classList.add("is-hidden");
    tabActions?.classList.add("is-hidden");
    if (typeof closeSearchOverlay === "function") {
      closeSearchOverlay();
    }
    return;
  }
  searchToggle?.classList.remove("is-hidden");
  tabActions?.classList.remove("is-hidden");
  
  tabs.forEach((tab) => {
    const tabElement = document.createElement("div");
    tabElement.className = "tab";
    tabElement.setAttribute("role", "tab");
    tabElement.tabIndex = 0;
    tabElement.dataset.tabId = tab.id;

    if (tab.id === activeTabId) {
      tabElement.classList.add("tab--active");
    }
    if (tab.pinned) {
      tabElement.classList.add("tab--pinned");
    }
    if (tab.isLocked) {
      tabElement.classList.add("tab--locked");
    }
    
    const meta = document.createElement("div");
    meta.className = "tab__meta";
    const { title, subtitle } = getTabDisplay(tab);
    const titleRow = document.createElement("div");
    titleRow.className = "tab__title-row";
    if (tab.isLocked) {
      const lockIcon = document.createElement("button");
      const tooltipText = `Locked — ${tab.lockNote ? tab.lockNote : "no note"}`;
      lockIcon.type = "button";
      lockIcon.className = "tab__lock-button";
      lockIcon.innerHTML = `<i class="fa-sharp fa-light fa-lock" aria-hidden="true"></i>`;
      lockIcon.setAttribute("data-tooltip", tooltipText);
      lockIcon.setAttribute("aria-label", tooltipText);
      titleRow.appendChild(lockIcon);
    }
    const titleText = document.createElement("span");
    titleText.className = "tab__title";
    titleText.textContent = title;
    titleRow.appendChild(titleText);
    meta.appendChild(titleRow);
    if (subtitle) {
      const subtitleText = document.createElement("span");
      subtitleText.className = "tab__subtitle";
      subtitleText.textContent = subtitle;
      meta.appendChild(subtitleText);
    }

    const pinButton = document.createElement("button");
    pinButton.type = "button";
    pinButton.className = "tab__pin-button";
    pinButton.innerHTML = `<i class="fa-sharp fa-light fa-thumbtack tab__pin" aria-hidden="true"></i>`;
    pinButton.setAttribute("aria-label", tab.pinned ? "Unpin tab" : "Pin tab");

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "tab__close";
    closeButton.innerHTML = `<i class="fa-sharp fa-light fa-xmark" aria-hidden="true"></i>`;
    closeButton.setAttribute("aria-label", "Close tab");

    pinButton.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePinTab(tab.id);
    });

    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    tabElement.addEventListener("click", () => {
      setActiveTab(tab.id);
    });
    tabElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveTab(tab.id);
      }
    });

    tabElement.append(meta, pinButton, closeButton);
    tabBar.appendChild(tabElement);
  });
if (tabActions) {
    tabBar.appendChild(tabActions);
  }
  };

    const renderEmptyState = () => {
  if (!workspaceContent) return;
  workspaceContent.innerHTML = "";
if (breadcrumbBar) {
    breadcrumbBar.classList.add("is-hidden");
    breadcrumbBar.innerHTML = "";
  }
      
      const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.innerHTML = `
    <div class="empty-state__title">Start your work</div>
    <div class="empty-state__hint">Search for a client or policy</div>
    <div class="empty-state__search" data-search-container></div>
  `;
       
  const searchContainer = emptyState.querySelector("[data-search-container]");
  if (searchContainer) {
    initSearchInterface(searchContainer, { mode: "empty" });
  }

  workspaceContent.appendChild(emptyState);
};

const setClientActionForTab = (tabId, action) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  tab.activeClientAction = action;
  persistTabs();
  renderActiveView();
};

const setPolicyActionForTab = (tabId, action) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  tab.activePolicyAction = action;
  if (!tab.policyActionByPolicyId || typeof tab.policyActionByPolicyId !== "object") {
    tab.policyActionByPolicyId = {};
  }
  if (tab.selectedPolicyId) {
    tab.policyActionByPolicyId[tab.selectedPolicyId] = action;
  }
  persistTabs();
  renderActiveView();
};

const setClientAction = (action) => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab) return;
  setClientActionForTab(tab.id, action);
};

const setPolicyAction = (action) => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.selectedPolicyId) return;
  setPolicyActionForTab(tab.id, action);
};

const goBackToClientSummary = () => {
  const tab = tabs.find((item) => item.id === activeTabId);
  if (!tab || !tab.selectedPolicyId) return;
  clearPolicySelection(tab.id);
};

const activateNextTab = () => {
  if (!tabs.length) return;
  const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % tabs.length;
  setActiveTab(tabs[nextIndex].id);
};

const activatePreviousTab = () => {
  if (!tabs.length) return;
  const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  const previousIndex =
    currentIndex === -1 ? tabs.length - 1 : (currentIndex - 1 + tabs.length) % tabs.length;
  setActiveTab(tabs[previousIndex].id);
};

const selectPolicyForTab = (tabId, policyId, { preserveAction = false, restoreScroll = false } = {}) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  if (!tab.policyActionByPolicyId || typeof tab.policyActionByPolicyId !== "object") {
    tab.policyActionByPolicyId = {};
  }
  const policyChanged = tab.selectedPolicyId !== policyId;
  const currentAction = tab.activePolicyAction;
    if (policyChanged && tab.selectedPolicyId) {
    tab.lastSelectedPolicyId = tab.selectedPolicyId;
  }
  tab.selectedPolicyId = policyId;
  const storedAction = tab.policyActionByPolicyId[policyId];
  tab.activePolicyAction =
    preserveAction && currentAction ? currentAction : storedAction || "Risk";
  tab.policyActionByPolicyId[policyId] = tab.activePolicyAction;
  updateRecentTabs(tab);
  persistTabs();
  renderTabs();
  const scrollTop = restoreScroll ? window.scrollY : null;
  renderActiveView();
  if (restoreScroll && scrollTop !== null) {
    requestAnimationFrame(() => window.scrollTo(0, scrollTop));
  }
};

const clearPolicySelection = (tabId) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  if (tab.selectedPolicyId) {
    tab.lastSelectedPolicyId = tab.selectedPolicyId;
  }
  tab.selectedPolicyId = null;
  updateRecentTabs(tab);
  persistTabs();
  renderTabs();
  renderActiveView();
};

const getTopNavLabel = () => {
  const navLabel = document.querySelector(".header-nav .nav-link--active");
  return navLabel?.textContent?.trim() || "Quotes and policies";
};

const renderBreadcrumbs = (tab) => {
  if (!breadcrumbBar) return;
  if (!tab) {
    breadcrumbBar.classList.add("is-hidden");
    breadcrumbBar.innerHTML = "";
    return;
  }

  const client = getClientById(tab.dataRef.clientId);
  if (!client) return;

  const topLabel = getTopNavLabel();
  const selectedPolicy = tab.selectedPolicyId
    ? getPolicyById(client, tab.selectedPolicyId)
    : null;
  const policyLabel = selectedPolicy
    ? `${selectedPolicy.ref || "Policy"} (${policyTypeLabels[selectedPolicy.type] || selectedPolicy.type || "Policy"})`
    : "";
  const sectionLabel = selectedPolicy ? tab.activePolicyAction : tab.activeClientAction;

  const crumbs = [
    {
      label: topLabel,
      onClick: () => clearPolicySelection(tab.id)
    },
    {
      label: client.name,
      onClick: () => clearPolicySelection(tab.id)
    }
  ];

  if (selectedPolicy) {
    crumbs.push({
      label: policyLabel,
      onClick: () => selectPolicyForTab(tab.id, selectedPolicy.id)
    });
  }

  crumbs.push({ label: sectionLabel });

  breadcrumbBar.innerHTML = "";
  breadcrumbBar.classList.remove("is-hidden");

  crumbs.forEach((crumb, index) => {
    const isLast = index === crumbs.length - 1;
    const item = document.createElement(crumb.onClick && !isLast ? "button" : "span");
    item.className = "breadcrumb-bar__item";
    if (isLast) {
      item.classList.add("breadcrumb-bar__item--current");
    }
    if (crumb.onClick && !isLast) {
      item.type = "button";
      item.classList.add("breadcrumb-bar__button");
      item.addEventListener("click", (event) => {
        event.preventDefault();
        crumb.onClick?.();
      });
    }
    item.textContent = crumb.label;
    breadcrumbBar.appendChild(item);
    if (!isLast) {
      const separator = document.createElement("span");
      separator.className = "breadcrumb-bar__separator";
      separator.textContent = "/";
      breadcrumbBar.appendChild(separator);
    }
  });
};

const renderClientPanel = ({ client }) => {
  const panel = document.createElement("div");
  panel.className = "panel-card panel-card--stack client-panel";
  const aiSummary = client.aiSummary || "No AI summary available.";
  panel.innerHTML = `
    <div class="customer-card">
      <div class="customer-card__header">
        <div class="customer-card__identity">
          <div class="customer-card__avatar">
            <i class="fa-sharp fa-light fa-user" aria-hidden="true"></i>
          </div>
          <div class="customer-card__identity-text">
            <h2 class="customer-card__name">${client.name}</h2>
            <span class="customer-card__email">${client.email}</span>
            <span class="customer-card__since">Client since: ${client.personal?.clientSince || ""}</span>
          </div>
        </div>
        <details class="customer-card__actions-menu">
          <summary class="customer-card__actions-toggle" aria-label="Client actions">
            <i class="fa-sharp fa-light fa-ellipsis-vertical" aria-hidden="true"></i>
          </summary>
          <div class="customer-card__actions-popover" role="menu">
            <button class="customer-card__action-item" type="button" role="menuitem">
              <i class="fa-sharp fa-light fa-headset" aria-hidden="true"></i>
              Client support
            </button>
            <button class="customer-card__action-item" type="button" role="menuitem">
              <i class="fa-sharp fa-light fa-plus" aria-hidden="true"></i>
              Add quote
            </button>
            <button class="customer-card__action-item" type="button" role="menuitem">
              <i class="fa-sharp fa-light fa-phone" aria-hidden="true"></i>
              Call now
            </button>
          </div>
        </details>
      </div>
      <div class="customer-card__ai-summary">
        <span class="customer-card__ai-icon" aria-hidden="true">✨</span>
        <p class="customer-card__ai-text">${aiSummary}</p>
      </div>
    </div>
     <div class="customer-card__details">
      <div class="customer-card__detail">
        <span class="detail-icon"><i class="fa-sharp fa-light fa-cake-candles" aria-hidden="true"></i></span>
        <span class="detail-text">${client.personal?.dob || ""}</span>
      </div>
      <div class="customer-card__detail">
        <span class="detail-icon"><i class="fa-sharp fa-light fa-phone" aria-hidden="true"></i></span>
        <span class="detail-text">${client.personal?.phone || ""}</span>
      </div>
      <div class="customer-card__detail">
        <span class="detail-icon"><i class="fa-sharp fa-light fa-house" aria-hidden="true"></i></span>
        <span class="detail-text">${formatAddress(client.personal?.address)}</span>
      </div>
    </div>
  `;
  return panel;
};

const renderActionList = ({ actions, activeAction, onSelect, shortcutMap }) => {
  const menuList = document.createElement("ul");
  menuList.className = "menu-list";

  actions.forEach((label) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-link";
    if (label === activeAction) {
      button.classList.add("is-active");
    }
    const iconClass = policyNavIcons[label] || "fa-sharp fa-light fa-file";
    const shortcutLabel = shortcutMap?.[label]?.label;
    button.innerHTML = `
      <i class="${iconClass}" aria-hidden="true"></i>
      <span class="menu-link__text">${label}</span>
      ${
        shortcutLabel
          ? `<span class="shortcut-hint" aria-hidden="true">${shortcutLabel}</span>`
          : ""
      }
    `;

    button.addEventListener("click", () => onSelect(label));

    listItem.appendChild(button);
    menuList.appendChild(listItem);
  });

  return menuList;
};

const renderNavigationPanel = ({ client, tab, policy }) => {
  const panel = document.createElement("div");
  panel.className = "panel-card panel-card--stack action-panel";

  const actionShell = document.createElement("div");
  actionShell.className = "actions-panel";
  panel.appendChild(actionShell);

  const isPolicyView = Boolean(policy);

  if (isPolicyView) {
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "menu-back";
    backButton.setAttribute("aria-label", "Back to client");
    backButton.innerHTML = `
      <i class="fa-sharp fa-light fa-arrow-left" aria-hidden="true"></i>
      <span>Back to client</span>
      <span class="shortcut-hint" aria-hidden="true">${backToClientShortcut.label}</span>
    `;
    backButton.addEventListener("click", () => clearPolicySelection(tab.id));
    actionShell.appendChild(backButton);

    const policySelector = document.createElement("details");
    policySelector.className = "policy-select is-selected";
    policySelector.innerHTML = `
      <summary class="policy-select__summary">
        <span class="policy-select__icon">
          <i class="${policyIconClasses[policy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
        </span>
        <span class="policy-select__text">
          <span class="policy-select__name">${policy.ref || "Policy"}</span>
          <span class="policy-select__meta">
            ${policyTypeLabels[policy.type] || policy.type || "Policy"}
            ${policy.internalRef ? ` ${policy.internalRef}` : ""}
          </span>
        </span>
        <i class="fa-sharp fa-light fa-chevron-down" aria-hidden="true"></i>
      </summary>
      <div class="policy-select__list" role="listbox"></div>
    `;
    const policyList = policySelector.querySelector(".policy-select__list");
    (client.policies || []).forEach((policyItem) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "policy-select__option";
      if (policyItem.id === tab.selectedPolicyId) {
        option.classList.add("is-active");
      }
      option.innerHTML = `
        <span class="policy-select__option-icon">
          <i class="${policyIconClasses[policyItem.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
        </span>
        <span class="policy-select__option-text">
          <span class="policy-select__option-name">${policyItem.ref || "Policy"}</span>
          <span class="policy-select__option-meta">
            ${policyTypeLabels[policyItem.type] || policyItem.type || "Policy"}
            ${policyItem.internalRef ? ` ${policyItem.internalRef}` : ""}
          </span>
        </span>
      `;
      option.addEventListener("click", () => {
        policySelector.open = false;
        selectPolicyForTab(tab.id, policyItem.id, { preserveAction: true, restoreScroll: true });
      });
      policyList.appendChild(option);
    });
    actionShell.appendChild(policySelector);

    const policySection = document.createElement("div");
    policySection.className = "menu-section";
    policySection.innerHTML = `<p class="menu-title">Policy</p>`;
    policySection.appendChild(
      renderActionList({
        actions: policyActions,
        activeAction: tab.activePolicyAction,
        onSelect: (action) => setPolicyAction(action),
        shortcutMap: policyActionShortcuts
      })
    );
    actionShell.appendChild(policySection);

    return panel;
  }

  const clientSection = document.createElement("div");
  clientSection.className = "menu-section";
  clientSection.innerHTML = `<p class="menu-title">Client</p>`;
  clientSection.appendChild(
    renderActionList({
      actions: clientActions,
      activeAction: tab.activeClientAction,
      onSelect: (action) => setClientAction(action),
      shortcutMap: clientActionShortcuts
    })
  );
  actionShell.appendChild(clientSection);

  const menuDivider = document.createElement("div");
  menuDivider.className = "menu-divider";
  menuDivider.setAttribute("role", "separator");
  actionShell.appendChild(menuDivider);

  const policySection = document.createElement("div");
  policySection.className = "menu-section";
  policySection.innerHTML = `<p class="menu-title">Policies</p>`;

  const { active, lapsed } = splitPoliciesByStatus(client.policies || []);
  const activeShortcuts = active
    .slice(0, policySelectionShortcuts.length)
    .reduce((acc, policyItem, index) => {
      acc[policyItem.id] = policySelectionShortcuts[index];
      return acc;
    }, {});

  const buildPolicyGroup = (label, items, { showEmpty } = {}) => {
    const group = document.createElement("div");
    group.className = "policy-group";
    group.innerHTML = `
      <div class="policy-group__header">${label} (${items.length})</div>
      <div class="policy-group__list"></div>
    `;
    const list = group.querySelector(".policy-group__list");
    if (!items.length) {
      if (showEmpty) {
        const empty = document.createElement("div");
        empty.className = "policy-group__empty";
        empty.textContent = "None";
        list.appendChild(empty);
      }
      return group;
    }

    items.forEach((policyItem) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "policy-row";
      if (policyItem.id === tab.selectedPolicyId) {
        row.classList.add("is-active");
      }
      const isLapsed = normalizePolicyStatus(policyItem) === "lapsed";
      const shortcutLabel = activeShortcuts[policyItem.id]?.label;
      row.innerHTML = `
        <span class="policy-row__icon">
          <i class="${policyIconClasses[policyItem.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
        </span>
        <span class="policy-row__text">
          <span class="policy-row__ref">${policyItem.ref || "Policy"}</span>
          <span class="policy-row__type">${policyTypeLabels[policyItem.type] || policyItem.type || "Policy"}</span>
        ${policyItem.internalRef ? `<span class="policy-row__internal-ref">${policyItem.internalRef}</span>` : ""}
        </span>
        <span class="policy-row__meta">
          ${isLapsed ? `<span class="policy-row__status">Lapsed</span>` : ""}
          ${
            shortcutLabel
              ? `<span class="shortcut-hint" aria-hidden="true">${shortcutLabel}</span>`
              : ""
          }
        </span>
      `;

      row.addEventListener("click", () => selectPolicyForTab(tab.id, policyItem.id));
      list.appendChild(row);
    });
    return group;
  };

  policySection.appendChild(buildPolicyGroup("Active", active, { showEmpty: true }));
  policySection.appendChild(buildPolicyGroup("Lapsed", lapsed, { showEmpty: true }));
  actionShell.appendChild(policySection);

  return panel;
};

const formatCurrency = (premium) => {
  if (!premium?.gross || !premium?.currency) return "";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: premium.currency
    }).format(premium.gross);
  } catch (error) {
    return `${premium.currency} ${premium.gross}`;
  }
};

const renderKeyValueList = (items) =>
  items
    .filter(({ value }) => value)
    .map(
      ({ label, value }) => `
        <div class="kv-item">
          <span class="kv-label">${label}</span>
          <span class="kv-value">${value}</span>
        </div>
      `
    )
    .join("");

const extractKeyValuePairs = (rows) =>
  rows
    .map((entry) => {
      const [label, ...rest] = entry.split(":");
      if (!rest.length) return null;
      return { label: label.trim(), value: rest.join(":").trim() };
    })
    .filter(Boolean);

const renderClientSummary = (client) => {
  const snapshotItems = [
    { label: "Email", value: client.email },
    { label: "Phone", value: client.personal?.phone },
    { label: "Date of birth", value: client.personal?.dob },
    { label: "Address", value: formatAddress(client.personal?.address) },
    { label: "Client since", value: client.personal?.clientSince },
    { label: "Main driver", value: client.personal?.isMainDriver ? "Yes" : "No" }
  ];

  const productCards = (client.policies || [])
    .map((policy) => {
      const metaItems = [
        policy.status ? `Status: ${policy.status}` : null,
        policy.renewalDate ? `Renewal: ${policy.renewalDate}` : null,
        policy.premium ? `Premium: ${formatCurrency(policy.premium)}` : null
      ].filter(Boolean);

      return `
        <div class="mini-card">
          <div class="mini-card__title">${policyTypeLabels[policy.type] || "Policy"}</div>
          <div class="mini-card__ref">${policy.ref}</div>
          <div class="mini-card__meta">
            ${metaItems.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </div>
      `;
    })
    .join("");

  const recentItems = [
    "New document request logged",
    "Policy renewal reminder scheduled",
    "Payment plan updated",
    "Portal access reviewed"
  ];

  return `
    <div class="work-section">
      <div class="snapshot-card">
        <div class="snapshot-card__header">
          <h2>Client snapshot</h2>
          <span class="snapshot-pill">Active client</span>
        </div>
        <div class="snapshot-card__grid">
          ${renderKeyValueList(snapshotItems)}
        </div>
      </div>
    </div>
    <div class="work-section">
      <h2 class="section-title">Policies overview</h2>
      <div class="mini-card-grid">
        ${productCards}
      </div>
    </div>
    <div class="work-section">
      <h2 class="section-title">Recent items</h2>
      <ul class="recent-list">
        ${recentItems.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
};

const renderPolicyRisk = (client, policy) => {
  const snapshotItems = [
    { label: "Policy ref", value: policy.ref },
    { label: "Product type", value: policyTypeLabels[policy.type] || policy.type },
    { label: "Term", value: policy.term },
    { label: "Renewal", value: policy.renewalDate },
    { label: "Premium", value: formatCurrency(policy.premium) },
    { label: "Cover type", value: policy.cover?.title },
    { label: "Excess", value: policy.excesses?.items?.[0]?.value }
  ];

  const riskDetails = [
    ...(policy.riskCard?.details || []),
    ...(policy.people?.list || []).flatMap((person) => person.bullets || [])
  ];
  const riskPairs = extractKeyValuePairs(riskDetails);

  return `
    <div class="work-section">
      <div class="snapshot-card">
        <div class="snapshot-card__header">
          <h2>Policy snapshot</h2>
          <span class="snapshot-pill">${client.name}</span>
        </div>
        <div class="snapshot-card__grid">
          ${renderKeyValueList(snapshotItems)}
        </div>
      </div>
    </div>
    <div class="work-section">
      <h2 class="section-title">Risk details</h2>
      ${
        riskPairs.length
          ? `<div class="risk-grid">${renderKeyValueList(riskPairs)}</div>`
          : `<p class="panel-subtitle">No risk details captured.</p>`
      }
    </div>
  `;
};

const renderBentoGrid = () => `
  <div class="bento-grid">
    <div class="bento-card bento-card--wide">
      <h3>Overview</h3>
      <p class="bento-muted">Policy servicing timeline, status checkpoints, and upcoming reviews.</p>
      <ul class="bento-list">
        <li>Mid-term adjustment workflow ready</li>
        <li>Scheduled renewal review pending</li>
        <li>Quote comparison checklist in progress</li>
      </ul>
    </div>
    <div class="bento-card">
      <h3>Summary stats</h3>
      <div class="bento-stats">
        <div>
          <span class="bento-stat__label">Open items</span>
          <span class="bento-stat__value">4</span>
        </div>
        <div>
          <span class="bento-stat__label">Next milestone</span>
          <span class="bento-stat__value">3 days</span>
        </div>
      </div>
    </div>
    <div class="bento-card">
      <h3>Recent updates</h3>
      <ul class="bento-list">
        <li>Broker note added to timeline</li>
        <li>Document request queued</li>
        <li>Customer contact attempt logged</li>
      </ul>
    </div>
    <div class="bento-card bento-card--tall">
      <h3>Items</h3>
      <ul class="bento-list">
        <li>Awaiting supporting evidence</li>
        <li>Referral placed with underwriter</li>
        <li>Statement of fact shared</li>
        <li>Payment plan review</li>
      </ul>
    </div>
    <div class="bento-card">
      <h3>Quick actions</h3>
      <div class="bento-actions">
        <button type="button">Create task</button>
        <button type="button">Send reminder</button>
        <button type="button">Generate pack</button>
      </div>
    </div>
    <div class="bento-card">
      <h3>Summary notes</h3>
      <p class="bento-muted">Capture narrative updates for service journeys and compliance reviews.</p>
    </div>
  </div>
`;

  const renderWorkArea = ({ client, policy, activeAction, tab }) => {
  const panel = document.createElement("div");
  panel.className = "panel-card panel-card--stack work-panel";
  const isPolicyView = Boolean(policy);
  const headerTitle = activeAction;
  const subheader = isPolicyView
    ? `${policy.ref} • ${policyTypeLabels[policy.type] || policy.type}${
        policy.internalRef ? ` • ${policy.internalRef}` : ""
      } • ${client.name}`
    : `${client.name}${client.email ? ` • ${client.email}` : ""}`;
  const isLocked = Boolean(tab?.isLocked);
    
  let content = renderBentoGrid();
  if (!isPolicyView && activeAction === "Summary") {
    content = renderClientSummary(client);
  }
  if (isPolicyView && activeAction === "Risk") {
    content = renderPolicyRisk(client, policy);
  }

    const fullscreenButton = `
          <button
            type="button"
            class="work-header__icon-button"
            data-action="toggle-work-area-fullscreen"
            data-tooltip="${isWorkAreaFullscreen ? "Exit full screen" : "Full screen"}"
            aria-label="${isWorkAreaFullscreen ? "Exit full screen" : "Enter full screen"}"
          >
            <i class="fa-sharp fa-light ${
              isWorkAreaFullscreen ? "fa-xmark" : "fa-up-right-and-down-left-from-center"
            }" aria-hidden="true"></i>
          </button>
        `;
  const lockEditLink = isLocked
    ? `<a href="#" class="lock-edit" data-action="edit-lock-note">Edit note</a>`
    : "";
  const lockDivider = isLocked ? `<span class="work-header__divider" aria-hidden="true"></span>` : "";

  panel.innerHTML = `
    <div class="work-area">
      <div class="work-header">
        <div class="work-header__titles">
          <h1>${headerTitle}</h1>
          <p class="work-subheader">${subheader}</p>
        </div>
        <div class="work-header__actions">
          <button type="button" class="lock-toggle" aria-pressed="${isLocked ? "true" : "false"}">
            <i class="fa-sharp fa-light ${isLocked ? "fa-lock" : "fa-lock-open"}" aria-hidden="true"></i>
            <span>${isLocked ? "Locked" : "Lock"}</span>
          </button>
          ${lockEditLink}
          ${lockDivider}
          ${fullscreenButton}
        </div>
      </div>
      <div class="work-area__body">
        ${content}
      </div>
    </div>
  `;
    
  const lockToggle = panel.querySelector(".lock-toggle");
  const lockEdit = panel.querySelector(".lock-edit");
    const fullscreenToggle = panel.querySelector("[data-action='toggle-work-area-fullscreen']");

  if (lockToggle && tab) {
    lockToggle.addEventListener("click", () => {
      if (tab.isLocked) {
        closeLockNoteEditor();
        updateTabLockState(tab.id, { isLocked: false, lockNote: "" });
      } else {
        openLockNoteEditor(tab.id, "add");
        updateTabLockState(tab.id, { isLocked: true, lockNote: "" });
      }
    });
  }
    
   if (fullscreenToggle) {
    fullscreenToggle.addEventListener("click", () => {
      setWorkAreaFullscreen(!isWorkAreaFullscreen);
    });
  }
    
  if (tab?.id && lockNoteEditorState.isOpen && lockNoteEditorState.tabId === tab.id && isLocked) {
    showLockNotePopover(tab);
  }
    
  return panel;
};

const renderClientView = (tab) => {
  const client = getClientById(tab.dataRef.clientId);
  if (!client) return;
  const selectedPolicy = tab.selectedPolicyId
    ? getPolicyById(client, tab.selectedPolicyId)
    : null;

  const container = document.createElement("div");
  container.className = "workspace-grid";

  container.appendChild(
    renderClientPanel({
      client
    })
  );

  container.appendChild(
    renderNavigationPanel({
      client,
      tab,
      policy: selectedPolicy
    })
  );

  container.appendChild(
    renderWorkArea({
      client,
      policy: selectedPolicy,
      activeAction: selectedPolicy ? tab.activePolicyAction : tab.activeClientAction,
      tab
    })
  );
  
  workspaceContent.appendChild(container);
};

const renderActiveView = () => {
  if (!workspaceContent) return;
  workspaceContent.innerHTML = "";

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  if (!activeTab) {
    renderEmptyState();
    return;
  }

  renderClientView(activeTab);
  renderBreadcrumbs(activeTab);
  updateWorkAreaFullscreen();
};

let overlaySearchUI = null;
let overlayIsOpen = false;
let overlayPreviousFocus = null;

  const getSearchMatches = (query) => {
  if (!query) return [];
  return clientList.filter((client) =>
    [client.name, client.email].some((field) =>
      field?.toLowerCase().includes(query)
    )
  );
};

const renderSearchResults = (query, resultsContainer, onClose) => {
  if (!resultsContainer) return [];
  const matches = getSearchMatches(query);
  resultsContainer.innerHTML = "";

  if (matches.length === 0) {
    return [];
  }

  matches.forEach((client) => {
    const resultCard = document.createElement("div");
    resultCard.className = "search-result";

    const clientButton = document.createElement("button");
    clientButton.type = "button";
    clientButton.className = "search-result__client";
    clientButton.innerHTML = `
      <span class="search-result__header">
        <span class="search-result__name">${client.name}</span>
        <span class="search-result__meta">${client.email}</span>
      </span>
    `;
    clientButton.addEventListener("click", () => {
      openClientTab(client.id, { selectedPolicyId: null });
      onClose?.();
    });
    
    const branch = document.createElement("div");
    branch.className = "policy-branch";
    branch.innerHTML = `<div class="policy-branch__title">Policies</div>`;

    client.policies?.forEach((policy) => {
      const policyButton = document.createElement("button");
      policyButton.type = "button";
      policyButton.className = "policy-branch__item";
      policyButton.innerHTML = `
        <i class="${policyIconClasses[policy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
        ${policy.ref}
        <span>${policyTypeLabels[policy.type] || "Policy"}</span>
      `;
      policyButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openClientTab(client.id, { selectedPolicyId: policy.id });
        onClose?.();
      });
      branch.appendChild(policyButton);
    });

    resultCard.append(clientButton, branch);
    resultsContainer.appendChild(resultCard);
  });

return matches;
};

const initSearchInterface = (container, { mode, onClose } = {}) => {
  if (!container) return null;
  container.innerHTML = `
    <div class="search-shell">
      <div class="search-input">
        <i class="fa-sharp fa-light fa-magnifying-glass" aria-hidden="true"></i>
        <input
          type="text"
          placeholder="Search by name or email"
          autocomplete="off"
          aria-label="Search clients by name or email"
        />
        <button class="search-clear" type="button" aria-label="Clear search">
          <i class="fa-sharp fa-light fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <div class="search-results" role="listbox" aria-label="Client search results"></div>
    </div>
  `;

  const input = container.querySelector("input");
  const results = container.querySelector(".search-results");
  const clearButton = container.querySelector(".search-clear");
  let latestMatches = [];

  const handleInput = () => {
    const query = input.value.trim().toLowerCase();
    latestMatches = renderSearchResults(query, results, onClose);
  };

  const clearSearch = () => {
    input.value = "";
    handleInput();
    input.focus();
  };

  input.addEventListener("input", handleInput);
  input.addEventListener("focus", handleInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && latestMatches[0]) {
      event.preventDefault();
      openClientTab(latestMatches[0].id, { selectedPolicyId: null });
      onClose?.();
    }
    if (event.key === "Escape" && mode === "overlay") {
      event.preventDefault();
      onClose?.();
    }
  });
  clearButton?.addEventListener("click", clearSearch);
  
  if (mode === "overlay") {
    input.focus();
  }

  return { input, results };
};

const openSearchOverlay = () => {
  if (!searchOverlay) return;
  if (!overlayIsOpen) {
    overlayPreviousFocus = document.activeElement;
  }
  overlayIsOpen = true;
  searchOverlay.classList.add("is-open");
  searchOverlay.setAttribute("aria-hidden", "false");
  if (!overlaySearchUI) {
    overlaySearchUI = initSearchInterface(searchOverlay, {
      mode: "overlay",
      onClose: closeSearchOverlay
    });
  }
  if (overlaySearchUI?.input) {
    overlaySearchUI.input.focus();
    overlaySearchUI.input.select();
  }
};

const closeSearchOverlay = () => {
  if (!searchOverlay) return;
  overlayIsOpen = false;
  searchOverlay.classList.remove("is-open");
  searchOverlay.setAttribute("aria-hidden", "true");
  if (overlaySearchUI?.input) {
    overlaySearchUI.input.value = "";
    overlaySearchUI.results.innerHTML = "";
  }
  if (overlayPreviousFocus && typeof overlayPreviousFocus.focus === "function") {
    overlayPreviousFocus.focus();
  }
  overlayPreviousFocus = null;
};

const toggleSearchOverlay = () => {
  if (overlayIsOpen) {
    closeSearchOverlay();
  } else {
    openSearchOverlay();
  }
};

const handleDocumentClick = (event) => {
  if (!overlayIsOpen) return;
  const searchShell = searchOverlay?.querySelector(".search-shell");
  if (searchShell?.contains(event.target) || searchToggle?.contains(event.target)) {
    return;
  }
  closeSearchOverlay();
};

const handleDocumentActionClick = (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === "edit-lock-note") {
    event.preventDefault();
    event.stopPropagation();
    const tab = tabs.find((item) => item.id === activeTabId);
    if (!tab || !tab.isLocked) return;
    openLockNoteEditor(tab.id, "edit");
    showLockNotePopover(tab);
    return;
  }

  if (action === "save-lock-note") {
    event.preventDefault();
    handleSaveLockNote();
  }

  if (action === "close-lock-note") {
    event.preventDefault();
    handleCancelLockNote();
  }

  if (action === "clear-lock-note") {
    event.preventDefault();
    handleClearLockNote();
  }
};

const handleTooltipMouseOver = (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  showTooltip(target);
};

const handleTooltipMouseOut = (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  if (target.contains(event.relatedTarget)) return;
  hideTooltip();
};

const handleTooltipFocusIn = (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  showTooltip(target);
};

const handleTooltipFocusOut = (event) => {
  const target = event.target.closest("[data-tooltip]");
  if (!target) return;
  if (target.contains(event.relatedTarget)) return;
  hideTooltip();
};

const handleTooltipDismiss = () => {
  hideTooltip();
};

const updateWorkAreaFullscreen = () => {
  const workArea = document.querySelector(".work-area");
  if (!workArea) return;
  workArea.classList.toggle("is-fullscreen", isWorkAreaFullscreen);
  const button = workArea.querySelector("[data-action='toggle-work-area-fullscreen']");
  if (!button) return;
  const icon = button.querySelector("i");
  if (icon) {
    icon.className = `fa-sharp fa-light ${
      isWorkAreaFullscreen ? "fa-xmark" : "fa-up-right-and-down-left-from-center"
    }`;
  }
  button.setAttribute("aria-label", isWorkAreaFullscreen ? "Exit full screen" : "Enter full screen");
  button.setAttribute("data-tooltip", isWorkAreaFullscreen ? "Exit full screen" : "Full screen");
};

const setWorkAreaFullscreen = (nextState) => {
  if (isWorkAreaFullscreen === nextState) return;
  isWorkAreaFullscreen = nextState;
  if (isWorkAreaFullscreen) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = previousBodyOverflow || "";
    previousBodyOverflow = "";
  }
  updateWorkAreaFullscreen();
};

const isEditableTarget = (target) => {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA") return true;
  if (typeof target.closest === "function") {
    return Boolean(
      target.closest(
        "input, textarea, [contenteditable='true'], [contenteditable=''], [contenteditable='plaintext-only']"
      )
    );
  }
  return false;
};

const handleGlobalKeydown = (event) => {
  const key = event.key;
  const keyLower = key.toLowerCase();
  const keyCode = event.code;

  if (key === "Escape" && isWorkAreaFullscreen) {
    event.preventDefault();
    setWorkAreaFullscreen(false);
    return;
  }
  
  if (keyLower === "k" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    toggleSearchOverlay();
    return;
  }

  if (key === backToClientShortcut.key) {
    if (overlayIsOpen) {
      event.preventDefault();
      closeSearchOverlay();
      return;
    }
    if (isEditableTarget(event.target)) return;
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (activeTab?.selectedPolicyId) {
      event.preventDefault();
      goBackToClientSummary();
    }
    return;
  }

  if (overlayIsOpen) return;
  if (isEditableTarget(event.target)) return;

  const isAltOnly = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
  const isAltShiftOnly = event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey;

  if (isAltOnly) {
    if (key === "ArrowRight") {
      event.preventDefault();
      activateNextTab();
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      activatePreviousTab();
      return;
    }
  }

  if (isAltShiftOnly) {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab || activeTab.selectedPolicyId) return;
    const client = getClientById(activeTab.dataRef.clientId);
    const { active } = splitPoliciesByStatus(client?.policies || []);
    const policyIndex = policySelectionByCode[keyCode];
    const policy = policyIndex !== undefined ? active[policyIndex] : null;
    if (policy) {
      event.preventDefault();
      selectPolicyForTab(activeTab.id, policy.id);
    }
    return;
  }

  if (!isAltOnly) return;

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  if (!activeTab) return;

  if (activeTab.selectedPolicyId) {
    const policyAction = policyActionByCode[keyCode];
    if (policyAction) {
      event.preventDefault();
      setPolicyAction(policyAction);
    }
    return;
  }

  const clientAction = clientActionByCode[keyCode];
  if (clientAction) {
    event.preventDefault();
    setClientAction(clientAction);
  }
};

restoreTabs();
renderTabs();
renderActiveView();

searchToggle?.addEventListener("click", () => {
  toggleSearchOverlay();
});
document.addEventListener("click", handleDocumentClick);
document.addEventListener("click", handleDocumentActionClick);
document.addEventListener("keydown", handleGlobalKeydown);
document.addEventListener("mouseover", handleTooltipMouseOver);
document.addEventListener("mouseout", handleTooltipMouseOut);
document.addEventListener("focusin", handleTooltipFocusIn);
document.addEventListener("focusout", handleTooltipFocusOut);
window.addEventListener("scroll", handleTooltipDismiss, true);
window.addEventListener("resize", handleTooltipDismiss);
