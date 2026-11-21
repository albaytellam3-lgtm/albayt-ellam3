/**
 * Live Orders Social Proof Popup - شركة البيت اللامع بحفر الباطن
 * إشعارات الطلبات المباشرة الحية طبق الأصل لتعزيز معدل التحويل والمصداقية في إعلانات جوجل
 */

(function () {
  'use strict';

  const orders = [
    { name: 'فيصل من حي البلدية', action: 'طلب تنظيف بعد التشطيب - منذ دقيقتين', icon: '🧹' },
    { name: 'فهد الشمري من حي الخالدية', action: 'طلب صيانة وإصلاح ثلاجة إل جي - منذ 4 دقائق', icon: '❄️' },
    { name: 'أم فهد من حي الربوة', action: 'طلب غسيل سجاد ومجالس بالبخار - منذ 7 دقائق', icon: '🧼' },
    { name: 'سعد الظفيري من حي العزيزية', action: 'طلب صيانة مكيف سبليت وشحن فريون - منذ 10 دقائق', icon: '❄️' },
    { name: 'أبو عبد الله من حي المحمدية', action: 'طلب رش دفان ومكافحة نمل أبيض مع الضمان - منذ 13 دقيقة', icon: '🛡️' },
    { name: 'خالد العنزي من حي التلال', action: 'طلب صيانة غسالة اتوماتيك - منذ 16 دقيقة', icon: '🧺' },
    { name: 'أم راكان من حي الفيحاء', action: 'طلب جلي وتلميع رخام وسيراميك - منذ 21 دقيقة', icon: '✨' },
    { name: 'سلطان المطيري من حي أبو موسى', action: 'طلب تنظيف وتعقيم خزان مياه علوي - منذ 26 دقيقة', icon: '💧' },
    { name: 'أبو تركي من حي النزهة', action: 'طلب صيانة غسالة صحون بوش - منذ 31 دقيقة', icon: '🍽️' },
    { name: 'سارة الحربي من حي اليرموك', action: 'طلب مكافحة حشرات ورش مبيدات آمنة - منذ 36 دقيقة', icon: '🌿' },
    { name: 'أبو مشعل من حي الوادي', action: 'طلب صيانة أفران وبوتاجازات - منذ 42 دقيقة', icon: '🔥' },
    { name: 'أم خالد من حي السليمانية', action: 'طلب تنظيف فيلا بعد الترميم - منذ 48 دقيقة', icon: '🏡' }
  ];

  let currentIndex = 0;
  let popupEl = null;
  let intervalId = null;

  function createPopupElement() {
    if (document.getElementById('liveOrderPopup')) return;

    popupEl = document.createElement('div');
    popupEl.id = 'liveOrderPopup';
    popupEl.className = 'live-order-popup';
    popupEl.innerHTML = `
      <div class="live-order-inner">
        <button class="live-order-close" aria-label="إغلاق">&times;</button>
        <div class="live-order-content">
          <div class="live-order-pulse-dot"></div>
          <div class="live-order-text">
            <h4 class="live-order-name"></h4>
            <p class="live-order-action"></p>
          </div>
          <div class="live-order-icon-box">
            <span class="live-order-icon"></span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(popupEl);

    popupEl.querySelector('.live-order-close').addEventListener('click', function (e) {
      e.stopPropagation();
      hidePopup();
      if (intervalId) clearInterval(intervalId);
    });
  }

  function showNextOrder() {
    if (!popupEl) createPopupElement();

    const order = orders[currentIndex];
    currentIndex = (currentIndex + 1) % orders.length;

    const nameEl = popupEl.querySelector('.live-order-name');
    const actionEl = popupEl.querySelector('.live-order-action');
    const iconEl = popupEl.querySelector('.live-order-icon');

    nameEl.textContent = order.name;
    actionEl.textContent = order.action;
    iconEl.textContent = order.icon;

    popupEl.classList.remove('live-order-hide');
    popupEl.classList.add('live-order-show');

    // Stay visible for 5.5 seconds
    setTimeout(() => {
      hidePopup();
    }, 5500);
  }

  function hidePopup() {
    if (!popupEl) return;
    popupEl.classList.remove('live-order-show');
    popupEl.classList.add('live-order-hide');
  }

  // Start after 2.5 seconds on page load
  window.addEventListener('DOMContentLoaded', () => {
    createPopupElement();
    setTimeout(() => {
      showNextOrder();
      // Rotate every 9 seconds
      intervalId = setInterval(showNextOrder, 9000);
    }, 2500);
  });
})();
