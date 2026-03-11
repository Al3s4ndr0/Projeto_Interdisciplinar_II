const tabs = document.querySelectorAll(".tab");
const items = document.querySelectorAll(".menu-card");

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    // remove active de todas
    tabs.forEach(t => t.classList.remove("active"));

    // ativa clicada
    tab.classList.add("active");

    const filter = tab.dataset.filter;

    items.forEach(item => {

      if (filter === "all") {
        item.style.display = "block";
      }
      else if (item.dataset.category === filter) {
        item.style.display = "block";
      }
      else {
        item.style.display = "none";
      }

    });

  });

});