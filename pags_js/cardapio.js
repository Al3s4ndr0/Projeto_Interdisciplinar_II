const tabs = document.querySelectorAll(".aba-cardapio");
const items = document.querySelectorAll(".item-cardapio");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("ativa"));
    tab.classList.add("ativa");

    const filter = tab.dataset.filter;

    items.forEach(item => {
      if (filter === "all" || item.dataset.category === filter) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  });
});