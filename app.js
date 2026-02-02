import { clients } from "./clients.js";

const menuLinks = document.querySelectorAll(".menu-link");
const workAreaContent = document.querySelector("#workAreaContent");
const actionSections = document.querySelectorAll(".menu-section");
const toggleButtons = document.querySelectorAll(".toggle-button");
const clientButtons = document.querySelectorAll(".client-list__button");

const formatAddress = (address) => {
  if (!address) return "";
  const parts = [address.line1, address.line2, address.city, address.country].filter(Boolean);
  const strongPostcode = address.postcode
    ? `<strong>${address.postcode}</strong>`
    : "";
  return `${parts.join(", ")}${parts.length ? " " : ""}${strongPostcode}`.trim();
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

const setActiveClientButton = (activeButton) => {
  if (!activeButton) return;
  clientButtons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
};

const setActiveClient = (clientKey, button) => {
  const activeClient = clients?.[clientKey];
  if (!activeClient) return;
  populateCustomerPanel(activeClient);
  if (button) {
    setActiveClientButton(button);
  }
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
  toggleButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.actionsType === actionsType);
    button.setAttribute(
      "aria-pressed",
      button.dataset.actionsType === actionsType ? "true" : "false"
    );
  });
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

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActionsView(button.dataset.actionsType);
  });
});

if (toggleButtons.length > 0) {
  const activeToggle = document.querySelector(".toggle-button.is-active");
  setActionsView(activeToggle?.dataset.actionsType || toggleButtons[0].dataset.actionsType);
} else if (menuLinks.length > 0) {
  updateWorkArea(menuLinks[0]);
}

clientButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveClient(button.dataset.clientKey, button);
  });
});

const initialClientButton =
  document.querySelector(".client-list__button.is-active") || clientButtons[0];
setActiveClient(initialClientButton?.dataset.clientKey || "clientA", initialClientButton);
