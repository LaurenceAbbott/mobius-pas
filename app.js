const actionsList = document.querySelector("#actionsList");
const toggleButtons = document.querySelectorAll(".toggle-button");

const actionItems = {
  product: [
    "Property package",
    "Commercial combined",
    "Motor fleet",
    "Professional indemnity",
    "Cyber liability",
  ],
  cover: [
    "Buildings and contents",
    "Business interruption",
    "Public liability",
    "Employers liability",
    "Directors and officers",
  ],
};

const renderActions = (type) => {
  if (!actionsList) return;
  actionsList.innerHTML = "";
  actionItems[type].forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    actionsList.appendChild(listItem);
  });
};

const setActiveToggle = (button) => {
  toggleButtons.forEach((toggle) => {
    toggle.classList.toggle("is-active", toggle === button);
  });
};

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { actionsType } = button.dataset;
    if (!actionsType || !actionItems[actionsType]) return;
    setActiveToggle(button);
    renderActions(actionsType);
  });
});

renderActions("product");
