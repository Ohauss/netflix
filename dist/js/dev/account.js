import "./popup.min.js";
import "./watcher.min.js";
import "./common.min.js";
const tabButtons = document.querySelectorAll("[data-tab]");
const tabBodies = document.querySelectorAll("[data-tab-body]");
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.remove("--active"));
    btn.classList.add("--active");
    tabBodies.forEach((body) => {
      body.classList.remove("active");
      if (body.dataset.tabBody === tabId) {
        body.classList.add("active");
      }
    });
  });
});
document.querySelector('[data-tab="info"]').click();
