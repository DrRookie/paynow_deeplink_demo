function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

const banks = [
  {
    name: 'DBS Bank',
    subtitle: 'DBS digibank',
    color: '#E30613',
    textColor: '#fff',
    initials: 'DBS',
    iosScheme: 'dbsdigibank://',
    androidIntent: 'intent://paynow#Intent;scheme=dbsdigibank;package=com.dbs.sg.digibank;end',
    appStoreUrl: 'https://apps.apple.com/sg/app/dbs-digibank-sg/id1068403826',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dbs.sg.dbsmbanking&hl=en',
  },
  {
    name: 'OCBC Bank',
    subtitle: 'OCBC Digital',
    color: '#EE2E24',
    textColor: '#fff',
    initials: 'OCBC',
    iosScheme: 'ocbc://',
    androidIntent: 'intent://paynow#Intent;scheme=ocbc;package=com.ocbc.mobile;end',
    appStoreUrl: 'https://apps.apple.com/sg/app/ocbc-digital-mobile-banking/id292506828',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ocbc.mobile&hl=en',
  },
  {
    name: 'UOB Bank',
    subtitle: 'UOB TMRW',
    color: '#0033A0',
    textColor: '#fff',
    initials: 'UOB',
    iosScheme: 'uobtmrw://',
    androidIntent: 'intent://paynow#Intent;scheme=uobtmrw;package=com.uob.mightysg;end',
    appStoreUrl: 'https://apps.apple.com/sg/app/uob-tmrw/id1049286296',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.uob.mighty.app&hl=en',
  },
  {
    name: 'Maybank',
    subtitle: 'MAE by Maybank',
    color: '#FFCC00',
    textColor: '#000',
    initials: 'MAY',
    iosScheme: 'maybank2u://',
    androidIntent: 'intent://paynow#Intent;scheme=maybank2u;package=com.maybank2u.life;end',
    appStoreUrl: 'https://apps.apple.com/sg/app/mae-by-maybank2u/id1481028763',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=sg.maybank.mae&hl=en',
  },
  {
    name: 'Citibank',
    subtitle: 'Citi Mobile',
    color: '#003B70',
    textColor: '#fff',
    initials: 'CITI',
    iosScheme: 'citibank://',
    androidIntent: 'intent://paynow#Intent;scheme=citibank;package=com.citibank.mobile.sg;end',
    appStoreUrl: 'https://apps.apple.com/sg/app/citibank-sg/id370773317',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.citibank.mobile.sg&hl=en',
  },
  {
    name: 'CIMB Bank',
    subtitle: 'CIMB Clicks SG',
    color: '#720026',
    textColor: '#fff',
    initials: 'CIMB',
    iosScheme: 'cimbclicks://',
    androidIntent: 'intent://paynow#Intent;scheme=cimbclicks;package=com.cimb.sg;end',
    appStoreUrl: 'https://apps.apple.com/sg/app/cimb-clicks-singapore/id383326796',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.cimb.sg.clicksMobile&hl=en',
  },
];

function getParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function launchBank(bank, amount, ref, proxy) {
  if (isAndroid()) {
    
    const intentUrl = `intent://paynow?amount=${encodeURIComponent(amount)}&ref=${encodeURIComponent(ref)}&proxy=${encodeURIComponent(proxy)}#Intent;scheme=${bank.iosScheme.replace('://', '')};package=${bank.androidIntent.match(/package=([^;]+)/)[1]};end`;
    window.location.href = intentUrl;
  } else {
    
    const deepLink = `${bank.iosScheme}?amount=${encodeURIComponent(amount)}&ref=${encodeURIComponent(ref)}&proxy=${encodeURIComponent(proxy)}`;
    const storeUrl = bank.appStoreUrl;
    const bankName = bank.name;

    window.location.href = deepLink;

    let appOpened = false;

    function onVisibilityChange() {
      if (document.hidden) {
        appOpened = true;
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    }

    const timer = setTimeout(() => {
      if (!appOpened) {
        const bankList = document.getElementById('bankList');
        if (bankList) {
          bankList.innerHTML = `
            <div style="text-align:center; padding: 40px 24px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🏦</div>
              <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">App not found</div>
              <div style="font-size: 13px; color: grey; margin-bottom: 32px;">It seems you don't have the ${bankName} app installed.</div>
              <a href="${storeUrl}" style="
                display: block;
                background: #1a1a1a;
                color: white;
                padding: 14px 28px;
                border-radius: 12px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 12px;
              ">Download ${bankName}</a>
              <div style="margin-top: 16px;">
                <a onclick="renderApp('${amount}', '${ref}', '${proxy}')" style="font-size: 13px; color: grey; cursor: pointer;">← Back to bank selection</a>
              </div>
            </div>
          `;
        }
      }
    }, 1400);

    document.addEventListener('visibilitychange', onVisibilityChange);
  }
}

function renderError() {
  document.body.innerHTML = `
    <div class="error-screen">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Invalid payment link.</div>
      <div class="error-subtitle">Please return to the merchant and try again.</div>
    </div>
  `;
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
        <div class="amount">SGD ${amount}</div>
        <div class="details-box">
          <div class="detail-item">
            <label>Reference</label>
            <span>${ref}</span>
          </div>
          <div class="divider"></div>
          <div class="detail-item">
            <label>PayNow Proxy</label>
            <span>${proxy}</span>
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
        <div class="bank-name">${bank.name}</div>
        <div class="bank-subtitle">${bank.subtitle}</div>
      </div>
      <div class="chevron">›</div>
    `;
    card.addEventListener('click', () => {
      launchBank(bank, amount, ref, proxy);
    });
    bankList.appendChild(card);
  });
}

const amount = getParam('amount');
const ref = getParam('ref');
const proxy = getParam('proxy');

if (amount && ref && proxy) {
  renderApp(amount, ref, proxy);
} else {
  renderError();
}