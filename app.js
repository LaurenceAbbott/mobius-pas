import { clients } from "./clients.js";

const menuLinks = document.querySelectorAll(".menu-link");
const workAreaContent = document.querySelector("#workAreaContent");
const actionSections = document.querySelectorAll(".menu-section");
const clientAccordion = document.querySelector("#clientAccordion");

const formatAddress = (address) => {
  if (!address) return "";
  const parts = [address.line1, address.line2, address.city, address.country].filter(Boolean);
  const strongPostcode = address.postcode
    ? `<strong>${address.postcode}</strong>`
    : "";
  return `${parts.join(", ")}${parts.length ? " " : ""}${strongPostcode}`.trim();
};

const formatShortAddress = (address) => {
  if (!address) return "";
  return [address.line1, address.line2, address.city]
    .filter(Boolean)
    .join(", ")
    .trim();
};

const setTextContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element || value == null) return;
  element.textContent = value;
};

const setHtmlContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element || value == null) return;
  element.innerHTML = value;
};

const populateCustomerPanel = (activeClient) => {
  if (!activeClient) return;
  setTextContent("[data-client-name]", activeClient.name);
  setTextContent("[data-client-email]", activeClient.email);
  setTextContent("[data-client-dob]", activeClient.personal?.dob);
  setTextContent("[data-client-phone]", activeClient.personal?.phone);
  setHtmlContent("[data-client-address]", formatAddress(activeClient.personal?.address));
  setTextContent(
    "[data-client-since]",
    activeClient.personal?.clientSince
      ? `Client since: ${activeClient.personal.clientSince}`
      : ""
  );
  setTextContent(
    "[data-client-main-driver]",
    activeClient.personal?.isMainDriver ? "Is main driver" : "Not main driver"
  );
};

const setActiveClientItem = (clientKey) => {
  if (!clientKey) return;
  document.querySelectorAll(".client-accordion__item").forEach((item) => {
    const isActive = item.dataset.clientKey === clientKey;
    item.classList.toggle("is-active", isActive);
   item.open = isActive;
  });
};

const setActiveClient = (clientKey) => {
  const activeClient = clients?.[clientKey];
  if (!activeClient) return;
  populateCustomerPanel(activeClient);
    setActiveClientItem(clientKey);
};

const updateWorkArea = (button) => {
  if (!workAreaContent) return;
  const { workClass } = button.dataset;
  if (!workClass) return;
  menuLinks.forEach((link) => {
    link.classList.toggle("is-active", link === button);
  });
  workAreaContent.className = `work-area__content work-area__content--${workClass}`;
  workAreaContent.textContent = `Viewing: ${button.textContent}`;
};

menuLinks.forEach((button) => {
  button.addEventListener("click", () => updateWorkArea(button));
});

const setActionsView = (actionsType) => {
  if (!actionsType) return;
  actionSections.forEach((section) => {
    const isActive = section.dataset.actionsType === actionsType;
    section.hidden = !isActive;
    section.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
  const activeSection = document.querySelector(
    `.menu-section[data-actions-type="${actionsType}"]`
  );
  const firstLink = activeSection?.querySelector(".menu-link");
  if (firstLink) {
    updateWorkArea(firstLink);
  }
};

const policyIconClasses = {
  motor: "fa-sharp fa-light fa-car-side",
  home: "fa-sharp fa-light fa-house",
  travel: "fa-sharp fa-light fa-plane-up"
};

const renderClientAccordion = () => {
  if (!clientAccordion) return;
  clientAccordion.innerHTML = "";
  Object.entries(clients).forEach(([clientKey, client]) => {
    const details = document.createElement("details");
    details.className = "client-accordion__item";
    details.dataset.clientKey = clientKey;

    const summary = document.createElement("summary");
    summary.className = "client-accordion__summary";

    const chevron = document.createElement("span");
    chevron.className = "client-accordion__chevron";
    chevron.innerHTML = '<i class="fa-sharp fa-light fa-chevron-right" aria-hidden="true"></i>';

    const summaryText = document.createElement("div");
    summaryText.className = "client-accordion__summary-text";
    summaryText.innerHTML = `
      <span class="client-accordion__name">${client.name}</span>
      <span class="client-accordion__meta">${formatShortAddress(client.personal?.address)}</span>
    `;

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "client-accordion__view";
    viewButton.dataset.clientKey = clientKey;
    viewButton.textContent = "View client";

    summary.append(chevron, summaryText, viewButton);

    const policies = document.createElement("div");
    policies.className = "client-accordion__policies";
    policies.setAttribute("role", "radiogroup");
    policies.setAttribute("aria-label", `Policies for ${client.name}`);

    client.policies?.forEach((policy) => {
      const policyLabel = document.createElement("label");
      policyLabel.className = "policy-option";

      const icon = document.createElement("span");
      icon.className = "policy-option__icon";
      icon.innerHTML = `<i class="${policyIconClasses[policy.type] || "fa-sharp fa-light fa-file"}" aria-hidden="true"></i>`;

      const info = document.createElement("span");
      info.className = "policy-option__info";
      info.innerHTML = `
        <span class="policy-option__name">${policy.ref}</span>
        <span class="policy-option__meta">${policy.internalRef}</span>
      `;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "policy-selection";
      radio.className = "policy-option__radio";
      radio.dataset.clientKey = clientKey;
      radio.dataset.policyId = policy.id;

      policyLabel.append(icon, info, radio);
      policies.appendChild(policyLabel);
    });

    details.append(summary, policies);
    clientAccordion.appendChild(details);
  });
};

if (clientAccordion) {
  renderClientAccordion();

  clientAccordion.addEventListener("click", (event) => {
    const viewButton = event.target.closest(".client-accordion__view");
    if (viewButton) {
      event.preventDefault();
      event.stopPropagation();
      const { clientKey } = viewButton.dataset;
      setActiveClient(clientKey);
      setActionsView("client");
    }
  });

  clientAccordion.addEventListener("change", (event) => {
    const radio = event.target.closest(".policy-option__radio");
    if (!radio) return;
    setActiveClient(radio.dataset.clientKey);
    setActionsView("policy");
  });
}

const initialClientKey = Object.keys(clients)[0];
if (initialClientKey) {
  setActiveClient(initialClientKey);
}

if (menuLinks.length > 0) {
  setActionsView("client");
}
