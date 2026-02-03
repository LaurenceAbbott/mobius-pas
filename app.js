import { clients } from "./clients.js";

const tabBar = document.querySelector("#tabBar");
const workspaceContent = document.querySelector("#workspaceContent");
const clientSearch = document.querySelector("#clientSearch");
const searchResults = document.querySelector("#searchResults");

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
  Notes: "fa-sharp fa-light fa-note-sticky",
  Checklist: "fa-sharp fa-light fa-list-check",
  Attachments: "fa-sharp fa-light fa-paperclip",
  History: "fa-sharp fa-light fa-clock-rotate-left",
  Tasks: "fa-sharp fa-light fa-list",
  Transactions: "fa-sharp fa-light fa-money-bill-transfer",
  Documents: "fa-sharp fa-light fa-folder-open",
  Claims: "fa-sharp fa-light fa-file-circle-exclamation"
};

const formatAddress = (address) => {
  if (!address) return "";
  const parts = [address.line1, address.line2, address.city, address.country].filter(Boolean);
  const strongPostcode = address.postcode
    ? `<strong>${address.postcode}</strong>`
    : "";
  return `${parts.join(", ")}${parts.length ? " " : ""}${strongPostcode}`.trim();
};

const getClientByCustomerId = (customerId) => clientIndex[customerId];

const getPolicyById = (client, policyId) =>
  client?.policies?.find((policy) => policy.id === policyId);

const createTabId = (type, customerId, policyId) => {
  if (type === "policy") {
    return `${type}-${customerId}-${policyId}`;
  }
  return `${type}-${customerId}`;
};

const buildTabModel = ({ type, customerId, policyId }) => {
  const client = getClientByCustomerId(customerId);
  if (!client) return null;

  if (type === "policy") {
    const policy = getPolicyById(client, policyId);
    if (!policy) return null;

    return {
      id: createTabId(type, customerId, policyId),
      type,
      title: policy.ref,
      subtitle: `${policyTypeLabels[policy.type] || "Policy"} • ${client.name}`,
      pinned: false,
      dataRef: { customerId, policyId }
    };
  }

  return {
    id: createTabId(type, customerId),
    type,
    title: client.name,
    subtitle: client.email,
    pinned: false,
    dataRef: { customerId }
  };
};

const persistTabs = () => {
  localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs));
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId || "");
  localStorage.setItem(RECENT_TAB_STORAGE_KEY, JSON.stringify(recentTabs));
};

const restoreTabs = () => {
  const storedTabs = localStorage.getItem(TAB_STORAGE_KEY);
  const storedActive = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  const storedRecent = localStorage.getItem(RECENT_TAB_STORAGE_KEY);

  if (storedTabs) {
    try {
      tabs = JSON.parse(storedTabs) || [];
    } catch (error) {
      tabs = [];
    }
  }

  if (storedRecent) {
    try {
      recentTabs = JSON.parse(storedRecent) || [];
    } catch (error) {
      recentTabs = [];
    }
  }

  activeTabId = storedActive || (tabs[0] ? tabs[0].id : null);
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

const openTab = ({ type, customerId, policyId }) => {
  const existingTab = tabs.find(
    (tab) =>
      tab.type === type &&
      tab.dataRef.customerId === customerId &&
      tab.dataRef.policyId === policyId
  );
  
  if (existingTab) {
    setActiveTab(existingTab.id);
    return;
  }

 const newTab = buildTabModel({ type, customerId, policyId });
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
    const placeholder = document.createElement("div");
    placeholder.className = "tab tab--active";
    placeholder.innerHTML = `
      <span class="tab__meta">
        <span class="tab__title">Workspace</span>
        <span class="tab__subtitle">No active tabs</span>
      </span>
    `;
    tabBar.appendChild(placeholder);
    return;
  }

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
    meta.innerHTML = `
      <span class="tab__title">${tab.title}</span>
      ${tab.subtitle ? `<span class="tab__subtitle">${tab.subtitle}</span>` : ""}
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

    tabElement.addEventListener("click", () => setActiveTab(tab.id));
    tabElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveTab(tab.id);
      }
    });

    tabElement.append(meta, pinButton, closeButton);
    tabBar.appendChild(tabElement);
  });
};

    const renderEmptyState = () => {
  if (!workspaceContent) return;
  workspaceContent.innerHTML = "";

      const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  emptyState.innerHTML = `
    <div class="empty-state__title">Start your work</div>
    <div class="empty-state__hint">Search for a client or open a recent tab</div>
    <div class="empty-state__recent" data-recent-list></div>
  `;
      
      const recentList = emptyState.querySelector("[data-recent-list]");
  const recentItems = recentTabs.slice(0, 3);

  if (recentItems.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "panel-subtitle";
    emptyMessage.textContent = "No recent tabs yet.";
    recentList.appendChild(emptyMessage);
  } else {
    recentItems.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recent-item";
      button.innerHTML = `
        <span class="recent-item__meta">
          <span class="recent-item__title">${item.title}</span>
          ${item.subtitle ? `<span class="recent-item__subtitle">${item.subtitle}</span>` : ""}
        </span>
        <span class="policy-pill">${item.type === "client" ? "Client" : "Policy"}</span>
      `;

       button.addEventListener("click", () =>
        openTab({
          type: item.type,
          customerId: item.dataRef.customerId,
          policyId: item.dataRef.policyId
        })
      );

       recentList.appendChild(button);
    });
    }

  workspaceContent.appendChild(emptyState);
};

const renderClientView = (tab) => {
  const client = getClientByCustomerId(tab.dataRef.customerId);
  if (!client) return;

    const container = document.createElement("div");
  container.className = "right-panel";
  container.innerHTML = `
    <div class="right-panel__header panel-card">
      <div class="customer-card">
        <div class="customer-card__identity">
          <div class="customer-card__avatar">
            <i class="fa-sharp fa-light fa-user" aria-hidden="true"></i>
          </div>
          <div class="customer-card__identity-text">
            <h2 class="customer-card__name">${client.name}</h2>
            <span class="customer-card__email">${client.email}</span>
          </div>
        </div>
        <div class="customer-card__actions">
          <button class="customer-card__link" type="button">
            <i class="fa-sharp fa-light fa-headset" aria-hidden="true"></i>
            Client support
          </button>
          <button class="customer-card__link" type="button">
            <i class="fa-sharp fa-light fa-plus" aria-hidden="true"></i>
            Add quote
          </button>
          <button class="customer-card__call" type="button">
            <i class="fa-sharp fa-light fa-phone" aria-hidden="true"></i>
            Call now
          </button>
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
      <div class="customer-card__tags">
        <span class="customer-tag">Client since: ${client.personal?.clientSince || ""}</span>
        <span class="customer-tag">${client.personal?.isMainDriver ? "Is main driver" : "Not main driver"}</span>
      </div>
    </div>
    <div class="right-panel__body">
      <div class="panel-card panel-card--actions">
        <div class="actions-panel">
          <div class="menu-section">
            <p class="menu-title">Policies</p>
            <div class="policy-list" data-policy-list></div>
          </div>
        </div>
      </div>
      <div class="panel-card panel-card--work">
        <p class="panel-title">Work area</p>
        <div class="work-area">
          <div class="work-area__content">Select a policy to open its risk view.</div>
        </div>
      </div>
    </div>
  `;

  const list = container.querySelector("[data-policy-list]");
  client.policies?.forEach((policy) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "policy-card";
    button.innerHTML = `
      <div class="policy-card__title">
        <i class="${policyIconClasses[policy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
        ${policy.ref}
        <span class="policy-pill">${policyTypeLabels[policy.type] || "Policy"}</span>
      </div>
      <div class="policy-card__meta">${policy.internalRef}</div>
    `;

    button.addEventListener("click", () => {
      openTab({
        type: "policy",
        customerId: client.id,
        policyId: policy.id
      });
    });

    list.appendChild(button);
  });

  workspaceContent.appendChild(container);
};

const renderPolicyView = (tab) => {
  const client = getClientByCustomerId(tab.dataRef.customerId);
  if (!client) return;
  const policy = getPolicyById(client, tab.dataRef.policyId);
  if (!policy) return;

  const container = document.createElement("div");
  container.className = "right-panel";
  container.innerHTML = `
    <div class="right-panel__header panel-card">
      <div class="customer-card">
        <div class="customer-card__identity">
          <div class="customer-card__avatar">
            <i class="${policyIconClasses[policy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>
          </div>
          <div class="customer-card__identity-text">
            <h2 class="customer-card__name">${policy.ref}</h2>
            <span class="customer-card__email">${policyTypeLabels[policy.type] || "Policy"} • ${client.name}</span>
          </div>
        </div>
        <div class="customer-card__actions">
          <span class="policy-pill">${policy.status}</span>
          <span class="policy-pill">Renewal ${policy.renewalDate}</span>
        </div>
      </div>
      <div class="customer-card__details">
        <div class="customer-card__detail">
          <span class="detail-icon"><i class="fa-sharp fa-light fa-shield" aria-hidden="true"></i></span>
          <span class="detail-text">${policy.productPath}</span>
        </div>
      </div>
    </div>
    <div class="right-panel__body">
      <div class="panel-card panel-card--actions">
        <div class="actions-panel">
          <div class="menu-section" data-policy-nav>
            <p class="menu-title">Policy</p>
            <ul class="menu-list"></ul>
          </div>
        </div>
      </div>
      <div class="panel-card panel-card--work">
        <p class="panel-title">Work area</p>
        <div class="work-area">
          <div class="work-area__content" data-policy-content>Viewing: Risk</div>
        </div>
      </div>
    </div>
  `;

  const menuList = container.querySelector(".menu-list");
  const content = container.querySelector("[data-policy-content]");
  const navItems = policy.policyNav || ["Risk", "Notes", "Checklist", "Attachments", "History", "Tasks"];

  navItems.forEach((label, index) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-link";
    if (index === 0) {
      button.classList.add("is-active");
    }
    const iconClass = policyNavIcons[label] || "fa-sharp fa-light fa-file";
    button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>${label}`;

    button.addEventListener("click", () => {
      container.querySelectorAll(".menu-link").forEach((item) =>
        item.classList.toggle("is-active", item === button)
      );
      content.textContent = `Viewing: ${label}`;
    });

    listItem.appendChild(button);
    menuList.appendChild(listItem);
  });

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

  if (activeTab.type === "client") {
    renderClientView(activeTab);
    return;
  }

  renderPolicyView(activeTab);
};

const renderSearchResults = (results) => {
  if (!searchResults) return;
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.classList.remove("is-visible");
    return;
  }

  results.forEach((client) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.innerHTML = `
      <span class="search-result__name">${client.name}</span>
      <span class="search-result__meta">${client.email}</span>
    `;
    button.addEventListener("click", () => {
      openTab({ type: "client", customerId: client.id });
      clientSearch.value = "";
      searchResults.classList.remove("is-visible");
      searchResults.innerHTML = "";
    });
    searchResults.appendChild(button);
  });

searchResults.classList.add("is-visible");
};

const handleSearchInput = () => {
  const query = clientSearch.value.trim().toLowerCase();
  if (!query) {
    searchResults.classList.remove("is-visible");
    searchResults.innerHTML = "";
    return;
  }

  const results = clientList.filter((client) =>
    [client.name, client.email].some((field) =>
      field?.toLowerCase().includes(query)
    )
  );

  renderSearchResults(results);
};

const handleDocumentClick = (event) => {
  if (!searchResults || !clientSearch) return;
  if (
    event.target === clientSearch ||
    searchResults.contains(event.target) ||
    clientSearch.contains(event.target)
  ) {
    return;
  }
  searchResults.classList.remove("is-visible");
};

restoreTabs();
renderTabs();
renderActiveView();

clientSearch?.addEventListener("input", handleSearchInput);
clientSearch?.addEventListener("focus", handleSearchInput);
document.addEventListener("click", handleDocumentClick);

if (tabs.length === 0) {
  renderEmptyState();
}
