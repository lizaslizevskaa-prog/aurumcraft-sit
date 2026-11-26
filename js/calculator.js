document.addEventListener("DOMContentLoaded", () => {
  const calcForm = document.getElementById("corporateCalc");
  if (!calcForm) return;

  const modelSelect = document.getElementById("calcModel");
  const qtyRange = document.getElementById("qtyRange");
  const qtyInput = document.getElementById("qtyInput");
  const optEngraving = document.getElementById("optEngraving");
  const optPadPrint = document.getElementById("optPadPrint");
  const optBox = document.getElementById("optBox");

  const resQty = document.getElementById("resQty");
  const resDiscount = document.getElementById("resDiscount");
  const resUnitPrice = document.getElementById("resUnitPrice");
  const resDays = document.getElementById("resDays");
  const resTotal = document.getElementById("resTotal");
  const applyCalcBtn = document.getElementById("applyCalcBtn");

  function formatMoney(num) {
    return Math.round(num).toLocaleString("ru-RU") + " BYN";
  }

  function calculateBatch() {
    const basePrice = parseFloat(modelSelect.value) || 890;
    let qty = parseInt(qtyInput.value, 10) || 20;
    qty = Math.max(20, Math.min(500, qty));

    let extraPerUnit = 0;
    if (optEngraving.checked) extraPerUnit += 35;
    if (optPadPrint.checked) extraPerUnit += 45;
    if (optBox.checked) extraPerUnit += 60;

    // Расчёт оптовой скидки от объёма тиража
    let discountPercent = 0;
    if (qty >= 200) {
      discountPercent = 15;
    } else if (qty >= 100) {
      discountPercent = 10;
    } else if (qty >= 50) {
      discountPercent = 5;
    }

    const rawUnit = basePrice + extraPerUnit;
    const finalUnit = rawUnit * (1 - discountPercent / 100);
    const totalSum = finalUnit * qty;

    // Ориентировочный срок производства (рабочих дней)
    const days = 12 + Math.ceil(qty / 40) * 2 + (optPadPrint.checked ? 3 : 0);

    resQty.textContent = `${qty} шт.`;
    resDiscount.textContent = `${discountPercent}%`;
    resUnitPrice.textContent = formatMoney(finalUnit);
    resDays.textContent = `${days} раб. дней`;
    resTotal.textContent = formatMoney(totalSum);
  }

  qtyRange.addEventListener("input", () => {
    qtyInput.value = qtyRange.value;
    calculateBatch();
  });

  qtyInput.addEventListener("input", () => {
    const val = Math.max(20, Math.min(500, parseInt(qtyInput.value, 10) || 20));
    qtyRange.value = val;
    calculateBatch();
  });

  [modelSelect, optEngraving, optPadPrint, optBox].forEach((el) => {
    el.addEventListener("change", calculateBatch);
  });

  // Передача расчёта в форму заявки через localStorage
  if (applyCalcBtn) {
    applyCalcBtn.addEventListener("click", () => {
      const modelName = modelSelect.options[modelSelect.selectedIndex].text;
      const options = [];
      if (optEngraving.checked) options.push("лазерная гравировка");
      if (optPadPrint.checked) options.push("тампопечать на циферблате");
      if (optBox.checked) options.push("подарочный футляр");

      const draft = `Корпоративный заказ: ${modelName}, тираж ${resQty.textContent}, опции: ${
        options.length ? options.join(", ") : "без доп. опций"
      }. Ориентировочный расчёт: ${resTotal.textContent} (срок ${resDays.textContent}).`;

      localStorage.setItem("aurumcraft_calc_draft", draft);
      window.location.href = "contacts.html#request";
    });
  }

  calculateBatch();
});
