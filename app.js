const menuLinks = document.querySelectorAll(".menu-link");
const workAreaContent = document.querySelector("#workAreaContent");
const actionSections = document.querySelectorAll(".menu-section");
const toggleButtons = document.querySelectorAll(".toggle-button");

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
  });
  actionSections.forEach((section) => {
    section.hidden = section.dataset.actionsType !== actionsType;
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
