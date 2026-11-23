(() => {
  let deferredPrompt = null;
  const button = document.getElementById('installAppBtn');
  if (!button) return;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const showHelp = (title, body) => {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop show';
    wrap.style.zIndex = '10000';
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="نصب StudyOS"><button class="icon-btn" type="button" data-close style="float:left">×</button><h3 style="margin:0 0 12px;font-weight:900">${title}</h3><div class="prep-summary">${body}</div><div class="modal-foot"><button class="btn btn-primary" type="button" data-close>متوجه شدم</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', ev => { if (ev.target === wrap || ev.target.closest('[data-close]')) wrap.remove(); });
  };
  if (isStandalone()) {
    button.textContent = '✓ نصب‌شده';
    button.classList.add('installed');
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); deferredPrompt = event;
    button.textContent = '⇩ نصب اپ';
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null; button.textContent = '✓ نصب‌شده'; button.classList.add('installed');
  });
  button.addEventListener('click', async () => {
    if (isStandalone()) {
      showHelp('StudyOS روی دستگاهت نصب است', 'می‌توانی از آیکون StudyOS در صفحه اصلی یا منوی Start ویندوز وارد شوی.');
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      return;
    }
    if (isIOS()) {
      showHelp('نصب روی آیفون', '<b>۱.</b> این صفحه را در <b>Safari</b> باز کن.<br><br><b>۲.</b> دکمهٔ اشتراک‌گذاری (مربع با فلش رو به بالا) را بزن.<br><br><b>۳.</b> گزینهٔ <b>Add to Home Screen / افزودن به صفحهٔ اصلی</b> را انتخاب کن.<br><br><b>۴.</b> نام StudyOS را تأیید و Add را بزن.<br><br>بعد از نصب، از آیکون StudyOS وارد شو. برای نصب PWA، سایت باید با نشانی HTTPS باز شده باشد.');
    } else if (/windows/i.test(navigator.userAgent)) {
      showHelp('نصب روی ویندوز', 'در <b>Microsoft Edge</b>: منوی سه‌نقطه ← Apps ← Install this site as an app.<br><br>در <b>Google Chrome</b>: منوی سه‌نقطه ← Save and share ← Install page as app.<br><br>پس از نصب، StudyOS مثل یک برنامه مستقل از منوی Start اجرا می‌شود.');
    } else {
      showHelp('نصب StudyOS', 'از منوی مرورگر گزینهٔ Install app یا Add to Home Screen را انتخاب کن. برای نصب و اجرای آفلاین، نشانی سایت باید HTTPS باشد.');
    }
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
})();
