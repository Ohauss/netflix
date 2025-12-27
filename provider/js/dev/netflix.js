import "./popup.min.js";
import "./watcher.min.js";
import "./faq.min2.js";
import "./common.min.js";
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".pricing__tab");
  const bodies = document.querySelectorAll(".tabs__body");
  console.log("Таби знайдені:", tabs.length);
  console.log("Тіла знайдені:", bodies.length);
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      console.log("Клік по табу:", tab.dataset.tab);
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      bodies.forEach((b) => {
        b.classList.remove("active");
        if (b.dataset.tabBody === id) {
          console.log("Активував таб:", id);
          b.classList.add("active");
        }
      });
    });
  });
});
