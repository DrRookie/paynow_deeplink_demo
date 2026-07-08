/* ============================================================
   PLATFORM DETECTION
   ============================================================ */
function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isIOS() {
  // Covers iPhone/iPod/older iPad UAs, plus iPadOS 13+ which reports
  // itself as "MacIntel" but exposes touch points (a real Mac doesn't).
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/* ============================================================
   BANK DATA
   Each bank needs THREE separate identifiers - don't reuse one
   field for another platform's value, that was the bug before.
   ============================================================ */
const banks = [
  {
    name: 'DBS Bank',
    subtitle: 'DBS digibank',
    color: '#E30613',
    textColor: '#fff',
    initials: 'DBS',
    iosScheme: 'dbsdigibank',        // used for iOS custom-scheme attempt
    androidScheme: 'dbsdigibank',    // used for Android intent:// scheme
    androidPackage: 'com.dbs.sg.digibank',
    appStoreUrl: 'https://apps.apple.com/sg/app/dbs-digibank-sg/id1068403826',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dbs.sg.dbsmbanking',
  },
  {
    name: 'OCBC Bank',
    subtitle: 'OCBC Digital',
    color: '#EE2E24',
    textColor: '#fff',
    initials: 'OCBC',
    iosScheme: 'ocbc',
    androidScheme: 'ocbc',
    androidPackage: 'com.ocbc.mobile',
    appStoreUrl: 'https://apps.apple.com/sg/app/ocbc-digital-mobile-banking/id292506828',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ocbc.mobile&hl=en',
  },
  {
    name: 'UOB Bank',
    subtitle: 'UOB TMRW',
    color: '#0033A0',
    textColor: '#fff',
    initials: 'UOB',
    iosScheme: 'uobtmrw',
    androidScheme: 'uobtmrw',
    androidPackage: 'com.uob.mightysg',
    appStoreUrl: 'https://apps.apple.com/sg/app/uob-tmrw/id1049286296',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.uob.mighty.app&hl=en',
  },
  {
    name: 'Maybank',
    subtitle: 'MAE by Maybank',
    color: '#FFCC00',
    textColor: '#000',
    initials: 'MAY',
    iosScheme: 'maybank2u',
    androidScheme: 'maybank2u',
    androidPackage: 'com.maybank2u.life',
    appStoreUrl: 'https://apps.apple.com/sg/app/mae-by-maybank2u/id1481028763',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=sg.maybank.mae&hl=en',
  },
  {
    name: 'Citibank',
    subtitle: 'Citi Mobile',
    color: '#003B70',
    textColor: '#fff',
    initials: 'CITI',
    iosScheme: 'citibank',
    androidScheme: 'citibank',
    androidPackage: 'com.citibank.mobile.sg',
    appStoreUrl: 'https://apps.apple.com/sg/app/citibank-sg/id370773317',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.citibank.mobile.sg&hl=en',
  },
  {
    name: 'CIMB Bank',
    subtitle: 'CIMB Clicks SG',
    color: '#720026',
    textColor: '#fff',
    initials: 'CIMB',
    iosScheme: 'cimbclicks',
    androidScheme: 'cimbclicks',
    androidPackage: 'com.cimb.sg',
    appStoreUrl: 'https://apps.apple.com/sg/app/cimb-clicks-singapore/id383326796',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.cimb.sg.clicksMobile&hl=en',
  },
];

/* The shared scheme/host that (in a real rollout) every participating
   bank app would register an intent-filter for. This is what lets
   Android's package manager find MULTIPLE candidate apps for one link
   and show its native chooser ("app drawer"). Today, no bank app
   actually registers this, so on a real device this will always fall
   through to S.browser_fallback_url below - that's expected, not a bug. */
const SHARED_ANDROID_SCHEME = 'paynowsg';

/* ============================================================
   HELPERS
   ============================================================ */
function getParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// Basic escaping since amount/ref/proxy come from the URL (attacker-
// controlled) and get written into innerHTML - don't skip this on a
// payments page.
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function buildQueryString(amount, ref, proxy, extra) {
  const p = new URLSearchParams({ amount, ref, proxy, ...extra });
  return p.toString();
}

/* ============================================================
   ENTRY POINT LOGIC
   The Android intent attempt itself now happens in an inline
   <script> at the very top of <head> in index.html - fired as
   early as physically possible in the page load, before this file
   (app.js) is even requested, to minimize the visible browser
   "flash" before the chooser appears. See index.html for that logic.

   By the time THIS script runs, we're in one of these states:
     - Android, still mid-navigation to the intent:// URL (rare,
       only if something delayed that redirect) - skip rendering,
       we're about to leave the page anyway.
     - Android, came back via S.browser_fallback_url (no matching
       app) - fallback=1 is set, render the manual bank list.
     - iOS - always render the manual bank list, since iOS has no
       chooser and we never attempt an app-open on load for it.
   ============================================================ */
function init() {
  const amount = getParam('amount');
  const ref = getParam('ref');
  const proxy = getParam('proxy');
  const fallback = getParam('fallback');

  if (!amount || !ref || !proxy) {
    renderError();
    return;
  }

  if (isAndroid() && fallback !== '1') {
    // The head script already fired the intent redirect; don't
    // duplicate it here, and don't bother rendering since we're
    // about to navigate away.
    return;
  }

  renderApp(amount, ref, proxy);
}

/* ============================================================
   PER-BANK LAUNCH (used on the manual bank-selection page, which
   both "Android with no matching app" and "all of iOS" land on)
   ============================================================ */
function launchBank(bank, amount, ref, proxy) {
  const qs = buildQueryString(amount, ref, proxy);

  if (isAndroid()) {
    // Android intent:// URIs support a native fallback param -
    // Chrome handles "app not installed" for us, no JS timer needed.
    const intentUrl =
      `intent://pay?${qs}#Intent;` +
      `scheme=${bank.androidScheme};` +
      `package=${bank.androidPackage};` +
      `S.browser_fallback_url=${encodeURIComponent(bank.playStoreUrl)};end`;
    window.location.href = intentUrl;
    return;
  }

  // iOS: no native fallback mechanism exists, so we still need the
  // "try, wait, check if we left the page" trick.
  const deepLink = `${bank.iosScheme}://pay?${qs}`;
  attemptIOSAppOpen(deepLink, bank, amount, ref, proxy);
}

function attemptIOSAppOpen(deepLink, bank, amount, ref, proxy) {
  let appOpened = false;

  function onVisibilityChange() {
    if (document.hidden) {
      appOpened = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.location.href = deepLink;

  const timer = setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (!appOpened) {
      showAppNotFound(bank, amount, ref, proxy);
    }
  }, 1500);
}

/* ============================================================
   RENDERING
   ============================================================ */
function renderError() {
  document.body.innerHTML = `
    <div class="error-screen">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Invalid payment link.</div>
      <div class="error-subtitle">Please return to the merchant and try again.</div>
    </div>
  `;
}

function showAppNotFound(bank, amount, ref, proxy) {
  const bankList = document.getElementById('bankList');
  if (!bankList) return;
  bankList.innerHTML = `
    <div style="text-align:center; padding: 40px 24px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏦</div>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">App not found</div>
      <div style="font-size: 13px; color: grey; margin-bottom: 32px;">
        It seems you don't have the ${escapeHtml(bank.name)} app installed.
      </div>
      <a href="${bank.appStoreUrl}" style="
        display: block;
        background: #1a1a1a;
        color: white;
        padding: 14px 28px;
        border-radius: 12px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
      ">Download ${escapeHtml(bank.name)}</a>
      <div style="margin-top: 16px;">
        <button id="backToList" style="background:none;border:none;font-size: 13px; color: grey; cursor: pointer;">← Back to bank selection</button>
      </div>
    </div>
  `;
  document.getElementById('backToList').addEventListener('click', () => {
    renderApp(amount, ref, proxy);
  });
}

function renderApp(amount, ref, proxy) {
  document.body.innerHTML = `
    <div class="container">
      <div class="header">
        <div class="header-top">
          <span class="paynow-badge">PayNow</span>
          <span class="secure-label">Secure Payment</span>
          <span>🔒</span>
        </div>
        <div class="amount-label">Payment Amount</div>
        <div class="amount">SGD ${escapeHtml(amount)}</div>
        <div class="details-box">
          <div class="detail-item">
            <label>Reference</label>
            <span>${escapeHtml(ref)}</span>
          </div>
          <div class="divider"></div>
          <div class="detail-item">
            <label>PayNow Proxy</label>
            <span>${escapeHtml(proxy)}</span>
          </div>
        </div>
      </div>

      <div class="section-title">Select your bank</div>
      <div class="bank-list" id="bankList"></div>

      <div class="footer">
        🔒 Secured by PayNow · Association of Banks in Singapore
      </div>
    </div>
  `;

  const bankList = document.getElementById('bankList');
  banks.forEach(bank => {
    const card = document.createElement('button');
    card.className = 'bank-card';
    card.innerHTML = `
      <div class="bank-logo" style="background:${bank.color}; color:${bank.textColor}">
        ${bank.initials}
      </div>
      <div class="bank-info">
        <div class="bank-name">${escapeHtml(bank.name)}</div>
        <div class="bank-subtitle">${escapeHtml(bank.subtitle)}</div>
      </div>
      <div class="chevron">›</div>
    `;
    card.addEventListener('click', () => {
      launchBank(bank, amount, ref, proxy);
    });
    bankList.appendChild(card);
  });
}

init();