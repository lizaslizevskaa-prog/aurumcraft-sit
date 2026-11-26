document.addEventListener("DOMContentLoaded", () => {
  // 1. Живые стрелки часов (и логотип шапки, и главный циферблат)
  function updateClocks() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const secDeg = seconds * 6;
    const minDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    document.querySelectorAll(".js-clock").forEach((clock) => {
      const center = clock.dataset.center || "32 34";
      const hourHand = clock.querySelector(".js-hand-hour");
      const minHand = clock.querySelector(".js-hand-minute");
      const secHand = clock.querySelector(".js-hand-second");

      if (hourHand)
        hourHand.setAttribute("transform", `rotate(${hourDeg} ${center})`);
      if (minHand)
        minHand.setAttribute("transform", `rotate(${minDeg} ${center})`);
      if (secHand)
        secHand.setAttribute("transform", `rotate(${secDeg} ${center})`);
    });
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // 2. Мобильное бургер-меню
  const burgerBtn = document.getElementById("burgerBtn");
  const mainNav = document.getElementById("mainNav");

  if (burgerBtn && mainNav) {
    burgerBtn.addEventListener("click", () => {
      burgerBtn.classList.toggle("is-active");
      mainNav.classList.toggle("is-open");
    });
  }

  // 3. Счётчик избранного из localStorage
  window.updateFavBadge = function () {
    const badge = document.getElementById("favCount");
    if (!badge) return;
    const saved = JSON.parse(
      localStorage.getItem("aurumcraft_favorites") || "[]",
    );
    badge.textContent = saved.length;
  };
  window.updateFavBadge();

  // 4. Бегущие цифры статистики завода при прокрутке
  const statNumbers = document.querySelectorAll(".js-counter");
  if (statNumbers.length > 0 && "IntersectionObserver" in window) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1500;
      const startTime = performance.now();

      function step(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );

    statNumbers.forEach((num) => observer.observe(num));
  }

  // 5. Интерактивная SVG-схема этапов на странице «Производство»
  const stageNodes = document.querySelectorAll(".stage-node");
  const stageDetailStep = document.getElementById("stageStep");
  const stageDetailTitle = document.getElementById("stageTitle");
  const stageDetailText = document.getElementById("stageText");
  const stageDetailSpec = document.getElementById("stageSpec");

  if (stageNodes.length > 0 && stageDetailTitle) {
    const stagesData = {
      1: {
        step: "Этап 01 · Заготовительный цикл",
        title: "Плавка и пробирный контроль сплавов",
        text: "Индукционная плавка золота 585 и 750 пробы, титана Grade 5 и нержавеющей стали 316L в защитной аргоновой среде с последующим спектральным анализом однородности металла.",
        spec: "Оборудование: вакуумные индукционные печи · Допуск чистоты: 99,95 %",
      },
      2: {
        step: "Этап 02 · Прецизионная механообработка",
        title: "Фрезеровка корпусов и мостов калибра на ЧПУ",
        text: "Многоосевая токарно-фрезерная обработка корпусов часов, ушек, заводных головок и латунных платин механизма с микронной точностью геометрии посадочных гнёзд.",
        spec: "Точность позиционирования: ±2 мкм · Станочный парк: 5-осевые автоматы продольного точения",
      },
      3: {
        step: "Этап 03 · Гальваника и ювелирный декор",
        title: "Полировка, PVD-напыление и закрепка камней",
        text: "Ручное сатинирование и зеркальная полировка граней корпуса, вакуумное ионно-плазменное золочение (PVD), нанесение горячей витражной эмали и микроскопическая закрепка вставок.",
        spec: "Толщина PVD-слоя: до 5 мкм · Контроль под 40-кратным бинокулярным микроскопом",
      },
      4: {
        step: "Этап 04 · Сборочное производство",
        title: "Сборка и регулировка часовых механизмов",
        text: "Монтаж рубиновых опор, ангренажа, спирали баланса и узла автоподзавода в чистых помещениях класса ISO 7 с последующей установкой циферблата и стрелок.",
        spec: "Условия цеха: избыточное давление, температура 21 °C, влажность 45 %",
      },
      5: {
        step: "Этап 05 · Испытательная станция",
        title: "Стендовый контроль точности и герметичности",
        text: "Каждые часы проходят проверку герметичности в барокамере (до 10 ATM) и многодневное тестирование суточного хода в пяти пространственных положениях.",
        spec: "Длительность цикла: 6 суток (кварц) и 12 суток (механика) · Сертификат ОТК",
      },
    };

    const selectStage = (node) => {
      const data = stagesData[node.dataset.stage];
      if (!data) return;

      stageNodes.forEach((n) => n.classList.remove("is-active"));
      node.classList.add("is-active");

      stageDetailStep.textContent = data.step;
      stageDetailTitle.textContent = data.title;
      stageDetailText.textContent = data.text;
      stageDetailSpec.textContent = data.spec;
    };

    stageNodes.forEach((node) => {
      node.addEventListener("click", () => selectStage(node));
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectStage(node);
        }
      });
    });
  }

  // 6. Интерактивное приближение и перетаскивание SVG-карты проезда
  const mapSvg = document.getElementById("factoryMapSvg");
  const mapViewport = document.getElementById("mapViewport");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");
  const zoomScaleText = document.getElementById("zoomScaleText");

  if (mapSvg && mapViewport) {
    const baseW = 600;
    const baseH = 320;
    let scale = 1;
    let vbX = 0;
    let vbY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    function applyViewBox() {
      const vbW = baseW / scale;
      const vbH = baseH / scale;
      vbX = Math.max(0, Math.min(baseW - vbW, vbX));
      vbY = Math.max(0, Math.min(baseH - vbH, vbY));
      mapSvg.setAttribute(
        "viewBox",
        `${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`,
      );
      if (zoomScaleText) {
        zoomScaleText.textContent = Math.round(scale * 100) + "%";
      }
    }

    function zoomTo(newScale) {
      const prevW = baseW / scale;
      const prevH = baseH / scale;
      scale = Math.max(1, Math.min(2.8, newScale));
      const nextW = baseW / scale;
      const nextH = baseH / scale;
      vbX += (prevW - nextW) / 2;
      vbY += (prevH - nextH) / 2;
      applyViewBox();
    }

    if (zoomInBtn)
      zoomInBtn.addEventListener("click", () => zoomTo(scale + 0.4));
    if (zoomOutBtn)
      zoomOutBtn.addEventListener("click", () => zoomTo(scale - 0.4));
    if (zoomResetBtn) {
      zoomResetBtn.addEventListener("click", () => {
        scale = 1;
        vbX = 0;
        vbY = 0;
        applyViewBox();
      });
    }

    mapViewport.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        zoomTo(scale + (e.deltaY < 0 ? 0.25 : -0.25));
      },
      { passive: false },
    );

    mapViewport.addEventListener("mousedown", (e) => {
      if (scale <= 1) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      mapViewport.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = mapSvg.getBoundingClientRect();
      const dx = ((e.clientX - startX) / rect.width) * (baseW / scale);
      const dy = ((e.clientY - startY) / rect.height) * (baseH / scale);
      vbX -= dx;
      vbY -= dy;
      startX = e.clientX;
      startY = e.clientY;
      applyViewBox();
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      mapViewport.classList.remove("is-dragging");
    });
  }

  // 7. Строгая живая валидация формы заявки на странице «Контакты»
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const reqName = document.getElementById("reqName");
    const reqEmail = document.getElementById("reqEmail");
    const reqPhone = document.getElementById("reqPhone");
    const reqTopic = document.getElementById("reqTopic");
    const reqMessage = document.getElementById("reqMessage");
    const formSuccess = document.getElementById("formSuccess");

    const savedDraft = localStorage.getItem("aurumcraft_calc_draft");
    if (savedDraft) {
      reqTopic.value = "corporate";
      reqMessage.value = savedDraft;
    }

    const showValidationState = (input, errorId, errorMessage) => {
      const errEl = document.getElementById(errorId);
      if (errorMessage) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        if (errEl) errEl.textContent = errorMessage;
        return false;
      }
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      if (errEl) errEl.textContent = "";
      return true;
    };

    const validateName = () => {
      const val = reqName.value.trim();
      if (val.length < 2) {
        return showValidationState(
          reqName,
          "errName",
          "Введите имя или организацию (минимум 2 символа).",
        );
      }
      return showValidationState(reqName, "errName", "");
    };

    const validateEmail = () => {
      const val = reqEmail.value.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!val) {
        return showValidationState(
          reqEmail,
          "errEmail",
          "Поле электронной почты обязательно для заполнения.",
        );
      }
      if (!emailRegex.test(val)) {
        return showValidationState(
          reqEmail,
          "errEmail",
          "Некорректный формат e-mail (пример: info@company.by).",
        );
      }
      return showValidationState(reqEmail, "errEmail", "");
    };

    const validatePhone = () => {
      const val = reqPhone.value.trim();
      if (/[a-zA-Zа-яА-ЯёЁ]/.test(val)) {
        return showValidationState(
          reqPhone,
          "errPhone",
          "Номер телефона не должен содержать буквы.",
        );
      }
      const digits = val.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) {
        return showValidationState(
          reqPhone,
          "errPhone",
          "Введите от 9 до 15 цифр (пример: +375 29 123-45-67).",
        );
      }
      return showValidationState(reqPhone, "errPhone", "");
    };

    const validateMessage = () => {
      const val = reqMessage.value.trim();
      if (val.length < 10) {
        return showValidationState(
          reqMessage,
          "errMessage",
          "Опишите запрос подробнее (минимум 10 символов).",
        );
      }
      return showValidationState(reqMessage, "errMessage", "");
    };

    // Живая проверка при выходе из поля и во время исправления
    [
      [reqName, validateName],
      [reqEmail, validateEmail],
      [reqPhone, validatePhone],
      [reqMessage, validateMessage],
    ].forEach(([field, validator]) => {
      field.addEventListener("blur", validator);
      field.addEventListener("input", () => {
        if (
          field.classList.contains("is-invalid") ||
          field.classList.contains("is-valid") ||
          field === reqPhone ||
          field === reqEmail
        ) {
          validator();
        }
      });
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      formSuccess.classList.remove("is-visible");

      const okName = validateName();
      const okEmail = validateEmail();
      const okPhone = validatePhone();
      const okMsg = validateMessage();

      if (okName && okEmail && okPhone && okMsg) {
        const orderNum = "AC-2026-" + Math.floor(1000 + Math.random() * 9000);
        formSuccess.innerHTML = `<strong>Заявка № ${orderNum} успешно сформирована!</strong><br>Данные проверены клиентской системой. Специалист отдела сбыта ОАО «АурумКрафт» свяжется с вами по адресу <em>${reqEmail.value.trim()}</em>.`;
        formSuccess.classList.add("is-visible");
        localStorage.removeItem("aurumcraft_calc_draft");
        contactForm.reset();
        [reqName, reqEmail, reqPhone, reqMessage].forEach((el) =>
          el.classList.remove("is-valid", "is-invalid"),
        );
      }
    });
  }

  // 8. Инициализация библиотеки AOS
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }

  // 9. Инициализация слайдера Swiper.js на главной странице
  if (
    typeof Swiper !== "undefined" &&
    document.querySelector(".collections-swiper")
  ) {
    new Swiper(".collections-swiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 4200,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
      },
    });
  }
});
