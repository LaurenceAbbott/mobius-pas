const menuLinks = document.querySelectorAll(".menu-link");
const workAreaContent = document.querySelector("#workAreaContent");

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

if (menuLinks.length > 0) {
  updateWorkArea(menuLinks[0]);
}
