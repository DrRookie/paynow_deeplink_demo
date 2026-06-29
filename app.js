const banks = [
  {
    name: 'DBS Bank',
    subtitle: 'DBS digibank',
    color: '#E30613',
    textColor: '#fff',
    initials: 'DBS',
    scheme: 'dbsdigibank://',
    appStoreUrl: 'https://apps.apple.com/sg/app/dbs-digibank-sg/id1068403826',
  },
  {
    name: 'OCBC Bank',
    subtitle: 'OCBC Digital',
    color: '#EE2E24',
    textColor: '#fff',
    initials: 'OCBC',
    scheme: 'ocbc://',
    appStoreUrl: 'https://apps.apple.com/sg/app/ocbc-digital-mobile-banking/id292506828',
  },
  {
    name: 'UOB Bank',
    subtitle: 'UOB TMRW',
    color: '#0033A0',
    textColor: '#fff',
    initials: 'UOB',
    scheme: 'uobtmrw://',
    appStoreUrl: 'https://apps.apple.com/sg/app/uob-tmrw/id1049286296',
  },
  {
    name: 'Maybank',
    subtitle: 'MAE by Maybank',
    color: '#FFCC00',
    textColor: '#000',
    initials: 'MAY',
    scheme: 'maybank2u://',
    appStoreUrl: 'https://apps.apple.com/sg/app/mae-by-maybank2u/id1481028763',
  },
  {
    name: 'Citibank',
    subtitle: 'Citi Mobile',
    color: '#003B70',
    textColor: '#fff',
    initials: 'CITI',
    scheme: 'citibank://',
    appStoreUrl: 'https://apps.apple.com/sg/app/citibank-sg/id370773317',
  },
  {
    name: 'CIMB Bank',
    subtitle: 'CIMB Clicks SG',
    color: '#720026',
    textColor: '#fff',
    initials: 'CIMB',
    scheme: 'cimbclicks://',
    appStoreUrl: 'https://apps.apple.com/sg/app/cimb-clicks-singapore/id383326796',
  },
];

function getParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function launchBank(scheme, appStoreUrl, bankName, amount, ref, proxy) {
  const deepLink = `${scheme}?amount=${encodeURIComponent(amount)}&ref=${encodeURIComponent(ref)}&proxy=${encodeURIComponent(proxy)}`;

  window.location.href = deepLink;

  const bankList = document.getElementById('bankList');
  bankList.innerHTML = `
    <div style="text-align:center; padding: 40px 24px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🏦</div>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Opening ${bankName}...</div>
      <div style="font-size: 13px; color: grey; margin-bottom: 32px;">If ${bankName} did not open, tap below to download it.</div>
      <a href="${appStoreUrl}" style="
        display: inline-block;
        background: #1a1a1a;
        color: white;
        padding: 14px 28px;
        border-radius: 12px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
      ">Download ${bankName}</a>
      <div style="margin-top: 16px;">
        <a onclick="renderApp('${amount}', '${ref}', '${proxy}')" style="font-size: 13px; color: grey; cursor: pointer;">← Back to bank selection</a>
      </div>
    </div>
  `;
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
      launchBank(bank.scheme, bank.appStoreUrl, bank.name, amount, ref, proxy);
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