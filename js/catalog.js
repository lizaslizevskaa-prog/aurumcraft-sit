document.addEventListener("DOMContentLoaded", () => {
  const catalogGrid = document.getElementById("catalogGrid");
  if (!catalogGrid) return;

  const searchInput = document.getElementById("searchInput");
  const mechanismFilter = document.getElementById("mechanismFilter");
  const materialFilter = document.getElementById("materialFilter");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");
  const resultsCount = document.getElementById("resultsCount");
  const categoryTabs = document.querySelectorAll(".filter-tab");

  const modal = document.getElementById("productModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalPreview = document.getElementById("modalPreview");
  const modalArticle = document.getElementById("modalArticle");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalSpecs = document.getElementById("modalSpecs");
  const modalPrice = document.getElementById("modalPrice");
  const modalFavBtn = document.getElementById("modalFavBtn");

  let allProducts = [];
  const validCategories = ["all", "watches", "jewelry", "favorites"];

  function getCategoryFromHash() {
    const hash = window.location.hash.replace("#", "");
    return validCategories.includes(hash) ? hash : "all";
  }

  let activeCategory = getCategoryFromHash();

  function syncCategoryTabs() {
    categoryTabs.forEach((tab) => {
      tab.classList.toggle(
        "is-active",
        tab.dataset.category === activeCategory,
      );
    });
  }

  syncCategoryTabs();

  function getFavorites() {
    return JSON.parse(localStorage.getItem("aurumcraft_favorites") || "[]");
  }

  function toggleFavorite(id) {
    let favs = getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter((item) => item !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem("aurumcraft_favorites", JSON.stringify(favs));
    if (typeof window.updateFavBadge === "function") {
      window.updateFavBadge();
    }
    renderProducts();
  }

  // Векторная ровная звёздочка строго по центру круга
  function getStarSvg(isFav) {
    return `
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
           fill="${isFav ? "currentColor" : "none"}"
           stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2.5 15.09 8.76 22 9.77 17 14.64 18.18 21.5 12 18.26 5.82 21.5 7 14.64 2 9.77 8.91 8.76 12 2.5"/>
      </svg>`;
  }

  // Загрузка и парсинг XML через fetch + DOMParser
  async function loadXmlCatalog() {
    try {
      const response = await fetch("data/catalog.xml");
      if (!response.ok) throw new Error("Ошибка загрузки XML-файла");

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      if (xmlDoc.querySelector("parsererror")) {
        throw new Error("Ошибка синтаксиса XML");
      }

      const nodes = xmlDoc.querySelectorAll("product");
      allProducts = Array.from(nodes).map((node) => ({
        id: node.querySelector("id")?.textContent.trim() || "",
        article: node.querySelector("article")?.textContent.trim() || "",
        name: node.querySelector("name")?.textContent.trim() || "",
        category: node.querySelector("category")?.textContent.trim() || "",
        categoryName:
          node.querySelector("categoryName")?.textContent.trim() || "",
        mechanism: node.querySelector("mechanism")?.textContent.trim() || "",
        caliber: node.querySelector("caliber")?.textContent.trim() || "",
        material: node.querySelector("material")?.textContent.trim() || "",
        glass: node.querySelector("glass")?.textContent.trim() || "",
        waterproof: node.querySelector("waterproof")?.textContent.trim() || "",
        diameter: node.querySelector("diameter")?.textContent.trim() || "",
        price: node.querySelector("price")?.textContent.trim() || "",
        badge: node.querySelector("badge")?.textContent.trim() || "",
        image: node.querySelector("image")?.textContent.trim() || "",
        description:
          node.querySelector("description")?.textContent.trim() || "",
      }));

      renderProducts();
    } catch (error) {
      catalogGrid.innerHTML = `<div class="catalog-empty">Не удалось загрузить каталог из XML (${error.message}). Запустите проект через Live Server.</div>`;
    }
  }

  function renderProducts() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const mechVal = mechanismFilter.value;
    const matVal = materialFilter.value;
    const favs = getFavorites();

    const filtered = allProducts.filter((item) => {
      const matchCat =
        activeCategory === "all" ||
        (activeCategory === "favorites" && favs.includes(item.id)) ||
        item.category === activeCategory;

      const matchMech = mechVal === "all" || item.mechanism === mechVal;
      const matchMat = matVal === "all" || item.material === matVal;
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.article.toLowerCase().includes(query);

      return matchCat && matchMech && matchMat && matchQuery;
    });

    resultsCount.textContent = `Найдено изделий: ${filtered.length}`;
    catalogGrid.innerHTML = "";

    if (filtered.length === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "catalog-empty";
      emptyBox.textContent =
        activeCategory === "favorites"
          ? "В списке избранного пока нет моделей. Нажмите на звёздочку на любой карточке каталога."
          : "По выбранным параметрам изделия не найдены. Попробуйте сбросить фильтры.";
      catalogGrid.appendChild(emptyBox);
      return;
    }

    filtered.forEach((item) => {
      const isFav = favs.includes(item.id);
      const card = document.createElement("article");
      card.className = "product-card";

      card.innerHTML = `
        <span class="product-card__badge">${item.badge}</span>
        <button class="product-card__fav ${isFav ? "is-fav" : ""}" type="button" title="Добавить в избранное" aria-label="В избранное">
          ${getStarSvg(isFav)}
        </button>
        <div class="product-card__visual">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <span class="product-card__article">${item.article} · ${item.categoryName}</span>
        <h2 class="product-card__title">${item.name}</h2>
        <p class="product-card__specs">${item.material} · ${item.mechanism} · ${item.diameter}</p>
        <div class="product-card__footer">
          <span class="product-card__price">${item.price}</span>
          <button class="btn btn--outline js-open-modal" type="button" style="padding: 9px 16px; font-size: 0.78rem;">Подробнее</button>
        </div>
      `;

      card.querySelector(".product-card__fav").addEventListener("click", () => {
        toggleFavorite(item.id);
      });

      card.querySelector(".js-open-modal").addEventListener("click", () => {
        openModal(item);
      });

      catalogGrid.appendChild(card);
    });
  }

  function openModal(item) {
    const isFav = getFavorites().includes(item.id);
    modalPreview.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
    modalArticle.textContent = `Артикул: ${item.article} · ${item.categoryName}`;
    modalTitle.textContent = item.name;
    modalDesc.textContent = item.description;
    modalPrice.textContent = item.price;

    modalSpecs.innerHTML = `
      <tr><td>Механизм / технология</td><td>${item.mechanism}</td></tr>
      <tr><td>Калибр / исполнение</td><td>${item.caliber}</td></tr>
      <tr><td>Материал корпуса / сплав</td><td>${item.material}</td></tr>
      <tr><td>Стекло / вставка</td><td>${item.glass}</td></tr>
      <tr><td>Защита / сертификация</td><td>${item.waterproof}</td></tr>
      <tr><td>Габариты / масса</td><td>${item.diameter}</td></tr>
    `;

    modalFavBtn.textContent = isFav ? "★ В избранном" : "☆ В избранное";
    modalFavBtn.onclick = () => {
      toggleFavorite(item.id);
      const nowFav = getFavorites().includes(item.id);
      modalFavBtn.textContent = nowFav ? "★ В избранном" : "☆ В избранное";
    };

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.category;
      syncCategoryTabs();
      renderProducts();
    });
  });

  window.addEventListener("hashchange", () => {
    activeCategory = getCategoryFromHash();
    syncCategoryTabs();
    renderProducts();
  });

  searchInput.addEventListener("input", renderProducts);
  mechanismFilter.addEventListener("change", renderProducts);
  materialFilter.addEventListener("change", renderProducts);

  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    mechanismFilter.value = "all";
    materialFilter.value = "all";
    activeCategory = "all";
    syncCategoryTabs();
    renderProducts();
  });

  loadXmlCatalog();
});
