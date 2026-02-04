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

const clientList = Object.values(clients);
const clientIndex = clientList.reduce((acc, client) => {
  acc[client.id] = client;
  return acc;
}, {});

let tabs = [];
let activeTabId = null;
let recentTabs = [];

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

const setActiveTab = (tabId) => {
  activeTabId = tabId;
  const tab = tabs.find((item) => item.id === tabId);
  updateRecentTabs(tab);
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

    const meta = document.createElement("div");
    meta.className = "tab__meta";
    const { title, subtitle } = getTabDisplay(tab);
    meta.innerHTML = `
      <span class="tab__title">${title}</span>
      ${subtitle ? `<span class="tab__subtitle">${subtitle}</span>` : ""}
    `;

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

const setClientAction = (tabId, action) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  tab.activeClientAction = action;
  persistTabs();
  renderActiveView();
};

    const setPolicyAction = (tabId, action) => {
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

const selectPolicyForTab = (tabId, policyId) => {
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  if (!tab.policyActionByPolicyId || typeof tab.policyActionByPolicyId !== "object") {
    tab.policyActionByPolicyId = {};
  }
  const policyChanged = tab.selectedPolicyId !== policyId;
  if (policyChanged && tab.selectedPolicyId) {
    tab.lastSelectedPolicyId = tab.selectedPolicyId;
  }
  tab.selectedPolicyId = policyId;
   const storedAction = tab.policyActionByPolicyId[policyId];
  tab.activePolicyAction = storedAction || "Risk";
  if (!tab.policyActionByPolicyId[policyId]) {
    tab.policyActionByPolicyId[policyId] = tab.activePolicyAction;
  }
  updateRecentTabs(tab);
  persistTabs();
  renderTabs();
  renderActiveView();
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

const renderClientPanel = ({ client, selectedPolicyId, onSelectPolicy, isPolicyView, onBack }) => {
  const selectedPolicy = selectedPolicyId
    ? getPolicyById(client, selectedPolicyId)
    : null;
  const panel = document.createElement("div");
  panel.className = "panel-card panel-card--stack client-panel";
  if (isPolicyView) {
    panel.classList.add("client-panel--policy");
  }
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
            ${isPolicyView ? `<button class="client-back" type="button">Back to client summary</button>` : ""}
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
      <div class="customer-card__detail customer-card__detail--address">
        <span class="detail-icon"><i class="fa-sharp fa-light fa-house" aria-hidden="true"></i></span>
        <span class="detail-text">${formatAddress(client.personal?.address)}</span>
      </div>
    </div>
    <div class="client-panel__section">
      <p class="menu-title">Policy list</p>
      <div class="policy-dropdown${selectedPolicy ? " is-selected" : ""}" data-policy-dropdown>
        <button class="policy-dropdown__trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          ${
            selectedPolicy
              ? `
                <span class="policy-dropdown__value">
                  <span class="policy-dropdown__value-icon">
                    <i class="${policyIconClasses[selectedPolicy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
                  </span>
                  <span class="policy-dropdown__value-text">
                    <span class="policy-dropdown__value-ref">${selectedPolicy.ref || "Policy"}</span>
                    <span class="policy-dropdown__value-type">${policyTypeLabels[selectedPolicy.type] || selectedPolicy.type || "Policy"}</span>
                  </span>
                </span>
              `
              : `<span class="policy-dropdown__placeholder">Select a policy</span>`
          }
          <i class="fa-sharp fa-light fa-chevron-down" aria-hidden="true"></i>
        </button>
        <div class="policy-dropdown__menu" role="listbox" tabindex="-1"></div>
      </div>
    </div>
  `;

  if (isPolicyView) {
    const backButton = panel.querySelector(".client-back");
    if (backButton) {
      backButton.addEventListener("click", () => onBack?.());
    }
  }

  const dropdown = panel.querySelector("[data-policy-dropdown]");
  const trigger = dropdown?.querySelector(".policy-dropdown__trigger");
  const menu = dropdown?.querySelector(".policy-dropdown__menu");
  let dropdownOpen = false;
  let outsideHandler = null;

  const closeDropdown = () => {
    if (!dropdown || !trigger || !menu) return;
    dropdownOpen = false;
    dropdown.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    if (outsideHandler) {
      document.removeEventListener("click", outsideHandler);
      outsideHandler = null;
    }
  };

  const openDropdown = () => {
    if (!dropdown || !trigger || !menu) return;
    dropdownOpen = true;
    dropdown.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    outsideHandler = (event) => {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("click", outsideHandler);
  };

  if (trigger && menu) {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDropdown();
        trigger.focus();
      }
    });
  }

  client.policies?.forEach((policy) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "policy-dropdown__option";
    if (policy.id === selectedPolicyId) {
      button.classList.add("is-active");
    }
    button.dataset.policyId = policy.id;
    button.setAttribute("role", "option");
    button.innerHTML = `
      <span class="policy-dropdown__option-left">
        <i class="${policyIconClasses[policy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
        <span class="policy-dropdown__option-text">
          <span class="policy-dropdown__option-ref">${policy.ref || "Policy"}</span>
          <span class="policy-dropdown__option-type">${policyTypeLabels[policy.type] || policy.type || "Policy"}</span>
        </span>
      </span>
      <span class="policy-dropdown__option-meta">${policy.internalRef || ""}</span>
    `;

    button.addEventListener("click", () => {
      if (onSelectPolicy) {
        onSelectPolicy(policy.id);
      }
      closeDropdown();
    });

    menu?.appendChild(button);
  });

  return panel;
};

const renderActionPanel = ({ title, actions, activeAction, onSelect }) => {
  const panel = document.createElement("div");
  panel.className = "panel-card panel-card--stack action-panel";
  panel.innerHTML = `
    <div class="actions-panel">
      <div class="menu-section">
        <p class="menu-title">${title}</p>
        <ul class="menu-list"></ul>
      </div>
    </div>
  `;

  const menuList = panel.querySelector(".menu-list");
  actions.forEach((label) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-link";
    if (label === activeAction) {
      button.classList.add("is-active");
    }
    const iconClass = policyNavIcons[label] || "fa-sharp fa-light fa-file";
    button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>${label}`;

    button.addEventListener("click", () => onSelect(label));

    listItem.appendChild(button);
    menuList.appendChild(listItem);
  });

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
      <h2 class="section-title">Products overview</h2>
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

const renderWorkArea = ({ client, policy, activeAction }) => {
  const panel = document.createElement("div");
  panel.className = "panel-card panel-card--stack work-panel";
  const isPolicyView = Boolean(policy);
  const headerTitle = activeAction;
  const subheader = isPolicyView
    ? `${policy.ref} • ${policyTypeLabels[policy.type] || policy.type} • ${client.name}`
    : `${client.name}${client.email ? ` • ${client.email}` : ""}`;

  let content = renderBentoGrid();
  if (!isPolicyView && activeAction === "Summary") {
    content = renderClientSummary(client);
  }
  if (isPolicyView && activeAction === "Risk") {
    content = renderPolicyRisk(client, policy);
  }
  
  panel.innerHTML = `
    <div class="work-area">
      <div class="work-header">
        <div>
          <h1>${headerTitle}</h1>
          <p class="work-subheader">${subheader}</p>
        </div>
      </div>
      <div class="work-area__body">
        ${content}
      </div>
    </div>
  `;
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
      client,
      selectedPolicyId: tab.selectedPolicyId,
      onSelectPolicy: (policyId) => selectPolicyForTab(tab.id, policyId),
      isPolicyView: Boolean(selectedPolicy),
      onBack: () => clearPolicySelection(tab.id)
    })
  );

  if (selectedPolicy) {
    container.appendChild(
      renderActionPanel({
        title: "Policy actions",
        actions: policyActions,
        activeAction: tab.activePolicyAction,
        onSelect: (action) => setPolicyAction(tab.id, action)
      })
    );

    container.appendChild(
      renderWorkArea({
        client,
        policy: selectedPolicy,
        activeAction: tab.activePolicyAction
      })
    );
  } else {
    container.appendChild(
      renderActionPanel({
        title: "Client actions",
        actions: clientActions,
        activeAction: tab.activeClientAction,
        onSelect: (action) => setClientAction(tab.id, action)
      })
    );

    container.appendChild(
      renderWorkArea({
        client,
        policy: null,
        activeAction: tab.activeClientAction
      })
    );
  }
  
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
};

let overlaySearchUI = null;
let overlayIsOpen = false;

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
  overlayIsOpen = true;
  searchOverlay.classList.add("is-open");
  searchOverlay.setAttribute("aria-hidden", "false");
  if (!overlaySearchUI) {
    overlaySearchUI = initSearchInterface(searchOverlay, {
      mode: "overlay",
      onClose: closeSearchOverlay
    });
  } else {
    overlaySearchUI.input?.focus();
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
};

const handleDocumentClick = (event) => {
  if (!overlayIsOpen) return;
  const searchShell = searchOverlay?.querySelector(".search-shell");
  if (searchShell?.contains(event.target) || searchToggle?.contains(event.target)) {
    return;
  }
  closeSearchOverlay();
};

const handleDocumentKeydown = (event) => {
  if (event.key === "Escape" && overlayIsOpen) {
    closeSearchOverlay();
  }
};

restoreTabs();
renderTabs();
renderActiveView();

searchToggle?.addEventListener("click", () => {
  if (overlayIsOpen) {
    closeSearchOverlay();
  } else {
    openSearchOverlay();
  }
});
document.addEventListener("click", handleDocumentClick);
document.addEventListener("keydown", handleDocumentKeydown);
