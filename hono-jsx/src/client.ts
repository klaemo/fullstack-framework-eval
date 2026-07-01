import './styles/input.css';

const menuButton = document.querySelector("[data-menu-toggle]");
const menuPanel = document.querySelector("[data-menu-panel]");

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuPanel?.classList.toggle("hidden", expanded);
});

document.querySelectorAll("[data-save-story]").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.textContent?.trim() === "Saved";
    button.textContent = saved ? "Save" : "Saved";
  });
});

document.querySelector("[data-newsletter]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("[data-newsletter-status]");
  if (status) status.textContent = "Briefing queued.";
});
