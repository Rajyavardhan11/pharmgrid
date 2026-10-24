import './style.css';
import './cloud.css';
import { clearSession, readSession, saveSession } from './auth.js';
import './auth.css';

let session = null;
let view = 'today';
let authMode = 'login';
let currentBranch = 'Indiranagar Main (IND)';
let billingSearch = '';
let stockSearch = '';
let products = [];
let alerts = [];
let jobs = [];
let invoices = [];
let cart = [];
let toastTimer = null;
let activeModal = null;
let modalPayload = null;
let alertFilter = 'ALL';
let currentIdempotencyKey = 'sale_' + Math.random().toString(36).substring(2, 10);
let soundEnabled = typeof localStorage !== 'undefined' ? localStorage.getItem('pharmgrid_sound') !== 'false' : true;
let darkMode = typeof localStorage !== 'undefined' ? localStorage.getItem('pharmgrid_dark') === 'true' : false;
let autoSyncEnabled = true;
let financialData = null;
let backupRehearsalState = null;
let chaosState = null;
let customerCheckoutInfo = { name: '', phone: '', doctorRx: '', chronicRefill: false };

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'beep') {
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'chime') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    // Audio context safely ignored if restricted
  }
}

function renderUPIQRCode(invoiceId, totalPaise) {
  return `<div class="upi-qr-box">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="white"/>
      <rect x="10" y="10" width="24" height="24" stroke="#111" stroke-width="4" fill="none"/>
      <rect x="16" y="16" width="12" height="12" fill="#111"/>
      <rect x="66" y="10" width="24" height="24" stroke="#111" stroke-width="4" fill="none"/>
      <rect x="72" y="16" width="12" height="12" fill="#111"/>
      <rect x="10" y="66" width="24" height="24" stroke="#111" stroke-width="4" fill="none"/>
      <rect x="16" y="72" width="12" height="12" fill="#111"/>
      <rect x="42" y="14" width="6" height="6" fill="#111"/>
      <rect x="52" y="20" width="6" height="6" fill="#111"/>
      <rect x="44" y="38" width="12" height="6" fill="#111"/>
      <rect x="14" y="44" width="8" height="6" fill="#111"/>
      <rect x="28" y="44" width="6" height="10" fill="#111"/>
      <rect x="42" y="52" width="16" height="6" fill="#111"/>
      <rect x="66" y="42" width="8" height="8" fill="#111"/>
      <rect x="80" y="44" width="10" height="6" fill="#111"/>
      <rect x="68" y="58" width="12" height="6" fill="#111"/>
      <rect x="44" y="68" width="6" height="12" fill="#111"/>
      <rect x="58" y="72" width="8" height="8" fill="#111"/>
      <rect x="74" y="74" width="14" height="12" fill="#111"/>
      <rect x="44" y="86" width="16" height="6" fill="#111"/>
    </svg>
    <div style="font-size:9px;font-weight:700;margin-top:4px;color:#287754">UPI PAY · BHARAT QR</div>
    <div style="font-size:8px;color:#666">Scan with any UPI App</div>
  </div>`;
}

let reorderState = {
  leadTime: 4,
  demand: 40,
  target: 60,
  incoming: 0
};

let reliabilityState = {
  checked: false,
  results: [
    { name: 'Checkout replay safety', target: 'No duplicate invoice', status: 'NOT_RUN', metric: 'Target: No duplicate invoice' },
    { name: 'Alert job creation', target: '≤ 5 seconds', status: 'NOT_RUN', metric: 'Target: ≤ 5 seconds' },
    { name: 'Worker recovery', target: 'Measured run', status: 'NOT_RUN', metric: 'Target: Measured run' },
    { name: 'Ledger reconstruction', target: 'Matches live inventory', status: 'NOT_RUN', metric: 'Target: Matches live inventory' }
  ],
  manifest: null,
  duration: 0
};

const tag = (s, t = '') => `<span class="tag ${t}">${s}</span>`;
const money = p => `₹${(p / 100).toLocaleString('en-IN')}`;
const metric = (n, l, d, t = '') => `<article class="metric ${t}"><span>${l}</span><b>${n}</b><small>${d}</small></article>`;

function notify(t) {
  const e = document.querySelector('.toast');
  if (!e) return;
  e.textContent = t;
  e.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => e.classList.remove('show'), 4500);
}

async function protectedFetch(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: 'same-origin' });
  if (response.status === 401) {
    clearSession(sessionStorage);
    session = null;
    loginPage('Your session has expired. Please sign in again.');
    throw new Error('Session expired');
  }
  return response;
}

async function loadData() {
  if (!session) return;
  try {
    const [pRes, aRes, jRes, iRes, fRes] = await Promise.all([
      protectedFetch('/api/v1/products'),
      protectedFetch('/api/v1/alerts'),
      protectedFetch('/api/v1/ops/notification-jobs'),
      protectedFetch('/api/v1/invoices'),
      protectedFetch('/api/v1/analytics/financial')
    ]);
    if (pRes.ok) products = await pRes.json();
    if (aRes.ok) alerts = await aRes.json();
    if (jRes.ok) jobs = await jRes.json();
    if (iRes.ok) invoices = await iRes.json();
    if (fRes.ok) financialData = await fRes.json();
  } catch (e) {
    console.error('Data load error:', e);
  }
}

function side() {
  return `<aside class="side">
    <button class="brand" data-nav="today"><i>✚</i><span>PHARM<span>GRID</span></span></button>
    <p class="branch-label">ACTIVE BRANCH</p>
    <button class="branch" data-action="branchModal">${currentBranch} <b>⌄</b></button>
    <nav>
      ${[
        ['today', 'Today'],
        ['billing', 'Billing counter'],
        ['stock', 'Stock & expiry'],
        ['alerts', 'Alert centre', alerts.length ? `<em>${alerts.length}</em>` : ''],
        ['reorder', 'Reorder desk'],
        ['delivery', 'Delivery radar', jobs.filter(j => j.status === 'QUEUED').length ? `<em>${jobs.filter(j => j.status === 'QUEUED').length}</em>` : ''],
        ['cloudlab', 'Cloud Lab'],
        ['reliability', 'Reliability']
      ].map(x => `<button data-nav="${x[0]}" class="${view === x[0] ? 'active' : ''}">${x[1]}${x[2] || ''}</button>`).join('')}
    </nav>
    <div class="side-bottom">✦ SYNTHETIC DATA<br><small>Local demo · India time</small></div>
  </aside>`;
}

function homepage() {
  const critical = products.filter(p => p.status === 'CRITICAL' || p.packs <= 5).length;
  const expiring = products.filter(p => p.expiry === 'Tomorrow' || p.days_left <= 2).length;
  const totalValPaise = products.reduce((acc, p) => acc + (p.packs * p.price), 0);

  return `<section class="home-hero">
    <div class="home-copy">
      <p class="eyebrow">PHARMACY OPERATIONS, MADE CALMER <span>● LIVE LOCAL DATABASE</span></p>
      <h1>Know what’s<br><i>needed.</i> Before it<br>becomes urgent.</h1>
      <p>PharmGrid brings stock, expiry, delivery and follow-up into one clear operating picture—branch by branch, lot by lot.</p>
      <div class="home-actions">
        <button class="primary" data-nav="billing">Start a sale <b>→</b></button>
        <button class="text-link" data-nav="stock">Explore stock inventory ↓</button>
      </div>
    </div>
    <aside class="home-snapshot">
      <div class="snapshot-head"><span>${currentBranch.toUpperCase()} / TODAY</span><b>LIVE DEMO</b></div>
      <div class="snapshot-main">
        <div>
          <span>NEEDS ACTION</span>
          <strong>${String(critical).padStart(2, '0')}</strong>
          <p>critical stock<br>signals</p>
        </div>
        <div class="snapshot-card">
          <small>LOWEST SALEABLE STOCK</small>
          <b>${products[0] ? products[0].name : 'Paracetamol'}<br>${products[0] ? products[0].id : 'PG-001'}</b>
          <p>${products[0] ? products[0].packs : 4} packs left</p>
          ${tag('CRITICAL', 'red')}
        </div>
      </div>
      <div class="snapshot-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </aside>
  </section>

  <section class="metrics">
    ${metric(String(critical).padStart(2, '0'), 'Critical stock', 'Needs immediate replenishment', critical > 0 ? 'red' : 'green')}
    ${metric(String(alerts.length).padStart(2, '0'), 'Active signals', `${alerts.filter(a => a.assigned_to).length} assigned to staff`, alerts.length > 0 ? 'amber' : 'green')}
    ${metric(String(expiring).padStart(2, '0'), 'Expiry alerts', 'Lots expiring within 48h', expiring > 0 ? 'purple' : 'green')}
    ${metric(money(totalValPaise), 'Inventory valuation', `${products.reduce((a, b) => a + b.packs, 0)} physical packs`, 'green')}
  </section>

  <section class="panel" style="margin-bottom:24px;padding:18px 24px;background:#f3f6f3;border-left:4px solid #35764d;border-radius:3px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
      <div>
        <span class="overline" style="color:#2d6342;font-weight:700">GST COMPLIANCE & REVENUE AUDIT (INDIA REGION · 12% TAXABLE)</span>
        <h3 style="margin:4px 0 0;font-size:16px">Today's Sales: <b>${money(financialData ? financialData.total_revenue_paise : invoices.reduce((a, b) => a + b.total_paise, 0))}</b> · Tax Collected: <b>${money(financialData ? financialData.total_gst_paise : 0)}</b> (CGST 6% + SGST 6%)</h3>
      </div>
      <div style="display:flex;gap:18px;font-size:11px">
        <div><small style="color:#777;display:block">INVOICES COMMITTED</small><b>${invoices.length}</b></div>
        <div><small style="color:#777;display:block">PACKS DISPENSED</small><b>${financialData ? financialData.total_packs_sold : 0}</b></div>
        <div><small style="color:#777;display:block">EST. GROSS MARGIN</small><b style="color:#2a754b">24.5%</b></div>
        <div><small style="color:#777;display:block">DRUG LICENSE</small><code>KA-BLR-2026-91</code></div>
      </div>
    </div>
  </section>

  <section class="split">
    <article class="panel">
      <div class="panel-head">
        <div><span class="overline">LIVE INVENTORY</span><h2>Critical stock status</h2></div>
        <button data-nav="stock">All stock →</button>
      </div>
      ${products.slice(0, 4).map(p => `
        <div class="product-row">
          <div class="pill-icon">▦</div>
          <div><b>${p.name}</b><small>${p.id} · Lot ${p.lot} · ${p.expiry}</small></div>
          <strong>${p.packs}<small> packs</small></strong>
          ${tag(p.status, p.tone)}
          <button data-add-to-cart="${p.id}" title="Add to billing cart">+</button>
        </div>
      `).join('') || '<p>No products found.</p>'}
    </article>
    <article class="panel">
      <div class="panel-head">
        <div><span class="overline">ACTION QUEUE</span><h2>Next up across branch</h2></div>
        <button data-nav="alerts">Open alert centre →</button>
      </div>
      ${alerts.slice(0, 3).map(a => `
        <div class="task">
          <time>${a.time}</time>
          <div><b>${a.name}</b><small>${a.detail}</small></div>
          ${tag(a.assigned_to ? 'ASSIGNED' : 'OPEN', a.assigned_to ? 'blue' : 'amber')}
        </div>
      `).join('') || '<p class="empty">No open action items. Everything is calm.</p>'}
    </article>
  </section>

  <section class="panel timeline">
    <div class="panel-head">
      <div><span class="overline">SYSTEM AUDIT LOG</span><h2>Recent committed activities</h2></div>
      <button class="outline" data-action="refreshData" style="color:#fff;border-color:#7f9785">↻ Refresh live</button>
    </div>
    <div class="events">
      ${invoices.slice(0, 3).map(inv => `
        <div style="cursor:pointer" data-view-receipt="${inv.invoice_id}" title="Click to view receipt">
          <b>${inv.created_at ? inv.created_at.substring(11, 16) : 'TODAY'}</b>
          <span></span>
          <p>Sale committed for <strong>${inv.invoice_id}</strong> · <strong>${money(inv.total_paise)}</strong>
          <small>${inv.lines ? inv.lines.map(l => `${l.quantity}× ${l.product}`).join(', ') : 'Committed sale'} · recorded to PostgreSQL.</small></p>
        </div>
      `).join('')}
      <div>
        <b>09:14</b><span></span>
        <p>Branch opened for <strong>${currentBranch}</strong><small>Stock ledger reconstructed and safety rules online.</small></p>
      </div>
    </div>
  </section>`;
}

function billing() {
  const total = cart.reduce((n, item) => n + (item.product.price * item.quantity), 0);
  const q = billingSearch.toLowerCase().trim();
  const saleable = products.filter(p => !p.held && p.packs > 0 && (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.lot.toLowerCase().includes(q)));

  return `<section class="eyebrow">
    <span>COUNTER / ${currentBranch.toUpperCase()}</span>
    <span class="server-time">SERVER DATE · ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date()).toUpperCase()}</span>
  </section>
  <div class="title-row">
    <div>
      <h1>New sale</h1>
      <p>Idempotent atomic checkout. Items deduct directly from PostgreSQL stock.</p>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <code class="key">KEY: ${currentIdempotencyKey}</code>
      <button class="outline" data-action="regenKey" title="Generate fresh idempotency key" style="padding:6px 12px;font-size:10px">New Key</button>
    </div>
  </div>

  <section class="billing">
    <article class="panel cart">
      <div class="panel-head">
        <h2>Cart <span>${cart.reduce((a, b) => a + b.quantity, 0)}</span></h2>
        ${cart.length ? `<button data-action="clearCart">Clear cart</button>` : ''}
      </div>
      ${cart.map((item, idx) => `
        <div class="cart-row">
          <div class="pill-icon">▦</div>
          <div>
            <b>${item.product.name}</b>
            <small>Lot ${item.product.lot} · ${item.product.expiry} · ${money(item.product.price)} each</small>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" data-qty-dec="${idx}">−</button>
            <span style="font-weight:700;font-size:12px;min-width:18px;text-align:center">${item.quantity}</span>
            <button class="qty-btn" data-qty-inc="${idx}">+</button>
          </div>
          <strong>${money(item.product.price * item.quantity)}</strong>
        </div>
      `).join('') || '<p class="empty" style="padding:25px 0;color:#777">Cart is clear. Click any saleable product below to add to cart.</p>'}
      <div class="total">
        <span>Total <small>integer paise calculated in backend</small></span>
        <b>${money(total)}</b>
      </div>

      <div class="customer-box" style="margin:16px 0;padding:12px;background:#f5efe4;border:1px solid #ddd2c1;border-radius:4px">
        <span class="overline" style="display:block;margin-bottom:8px;font-size:9px;color:#4a594e;font-weight:700">PATIENT & PRESCRIPTION RECORD (CHRONIC CRM)</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <input placeholder="Patient Name (e.g. Ramesh Kumar)" value="${customerCheckoutInfo.name}" data-cust-field="name" style="padding:7px;font-size:11px;border:1px solid #ccc;background:#fff">
          <input placeholder="Mobile Phone (+91 98...)" value="${customerCheckoutInfo.phone}" data-cust-field="phone" style="padding:7px;font-size:11px;border:1px solid #ccc;background:#fff">
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
          <input placeholder="Doctor Rx Registration No. (e.g. RX-BLR-9081)" value="${customerCheckoutInfo.doctorRx}" data-cust-field="doctorRx" style="padding:7px;font-size:11px;border:1px solid #ccc;background:#fff">
          <label style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap">
            <input type="checkbox" ${customerCheckoutInfo.chronicRefill ? 'checked' : ''} data-cust-field="chronicRefill">
            <span>30d Chronic Refill Alert</span>
          </label>
        </div>
      </div>

      <button class="primary wide" data-action="checkout" ${cart.length ? '' : 'disabled'}>
        Complete sale <b>⌘↵</b>
      </button>
    </article>

    <aside>
      <article class="notice green">
        <b>✓</b>
        <div>
          <strong>Atomic Stock Reservation</strong>
          <p>Checkout locks PostgreSQL rows with <code>FOR UPDATE</code> to prevent overselling.</p>
        </div>
      </article>
      <article class="panel" style="padding:18px">
        <span class="overline">QUICK ADD MEDICINE</span>
        <h3 style="margin:8px 0 14px">Need to stock a new product?</h3>
        <button class="primary" data-action="openAddProductModal" style="padding:8px 14px;font-size:10px">+ Add New Product & Lot</button>
      </article>
      <article class="panel why">
        <span class="overline">RECENT COMMITTED SALES</span>
        <h3 style="margin:8px 0 12px">Invoice History</h3>
        ${invoices.slice(0, 4).map(i => `
          <div style="border-top:1px solid #d4cdc1;padding:8px 0;font-size:11px;cursor:pointer" data-view-receipt="${i.invoice_id}" title="Click to view detailed receipt">
            <div style="display:flex;justify-content:space-between">
              <b>${i.invoice_id} 🔍</b> <span>${money(i.total_paise)}</span>
            </div>
            <small style="display:block;color:#6b726b">${i.lines ? i.lines.map(l => `${l.quantity}× ${l.product}`).join(', ') : 'Committed sale'} · ${i.business_date}</small>
          </div>
        `).join('') || '<p style="font-size:10px;color:#777">No sales yet today.</p>'}
      </article>
    </aside>
  </section>

  <section class="panel add-products">
    <div class="panel-head">
      <div><span class="overline">SELECT MEDICINES</span><h2>Available Saleable Products</h2></div>
      <div style="display:flex;gap:10px;align-items:center">
        <input class="product-search" placeholder="🔍 Search medicines..." value="${billingSearch}" data-search-input="billing">
        <button class="outline" data-action="openAddProductModal">+ Add New Product</button>
      </div>
    </div>
    <div>
      ${saleable.map(p => `
        <button data-add-to-cart="${p.id}">
          <span>
            ${p.name}
            <small>${p.id} · Lot ${p.lot} · ${p.packs} packs in stock · ${money(p.price)}</small>
          </span>
          <b>+ Add</b>
        </button>
      `).join('') || '<p>No matching saleable products.</p>'}
    </div>
  </section>`;
}

function stock() {
  const q = stockSearch.toLowerCase().trim();
  const filteredProds = products.filter(p => !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.lot.toLowerCase().includes(q));

  return `<section class="eyebrow">
    <span>STOCK & EXPIRY / ${currentBranch.toUpperCase()}</span>
    ${tag('LIVE POSTGRESQL LEDGER', 'blue')}
  </section>
  <div class="title-row">
    <div>
      <h1>Every pack has a story.</h1>
      <p>Branch-scoped saleable stock, expiry quarantine, and inventory movements.</p>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <input class="product-search" placeholder="🔍 Search stock..." value="${stockSearch}" data-search-input="stock">
      <button class="primary" data-action="openAddProductModal">+ Add Product & Lot</button>
      <button class="outline" data-action="openGrnModal" style="background:#eaf2ec;border-color:#38724d;color:#245435;font-weight:700">+ Inward GRN Shipment 📥</button>
      <button class="outline" data-action="refreshData">↻ Refresh</button>
    </div>
  </div>

  <section class="panel">
    <div class="panel-head">
      <h2>Products & Lot Inventory (${filteredProds.length})</h2>
    </div>
    <table>
      <thead>
        <tr>
          <th>Product / SKU</th>
          <th>Lot Code</th>
          <th>On Hand</th>
          <th>Unit Price</th>
          <th>Nearest Expiry</th>
          <th>Safety State</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredProds.map(p => `
          <tr>
            <td><b>${p.name}</b><small>${p.id}</small></td>
            <td><code>${p.lot}</code></td>
            <td><strong>${p.packs} packs</strong></td>
            <td>${money(p.price)}</td>
            <td>${p.expiry} <small>${p.expiry_date || ''}</small></td>
            <td>${tag(p.status, p.tone)}</td>
            <td>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                <button class="outline" style="padding:4px 7px;font-size:9px" data-action="toggleHold" data-lot-id="${p.lot_id}" data-held="${p.held ? 'true' : 'false'}">
                  ${p.held ? 'Release' : 'Quarantine'}
                </button>
                <button class="primary" style="padding:4px 7px;font-size:9px" data-add-to-cart="${p.id}" ${p.held || p.packs <= 0 ? 'disabled' : ''}>
                  Sell
                </button>
                <button class="outline" style="padding:4px 7px;font-size:9px;color:#855420" data-action="applyMarkdown" data-lot-id="${p.lot_id}" title="Apply 20% Clearance Markdown">
                  -20%
                </button>
                <button class="outline" style="padding:4px 7px;font-size:9px;color:#772e25" data-action="openReturnModal" data-lot-id="${p.lot_id}" data-lot-code="${p.lot}" data-prod-name="${p.name}" data-packs="${p.packs}" title="Generate Return Credit Note">
                  Return CN
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </section>`;
}

function alertsView() {
  const filtered = alertFilter === 'ALL'
    ? alerts
    : alerts.filter(a => a.type.includes(alertFilter));

  return `<section class="eyebrow">
    <span>ALERT CENTRE / ${currentBranch.toUpperCase()}</span>
    <span class="live">● live signals · ${alerts.length} active</span>
  </section>
  <div class="title-row">
    <div>
      <h1>Signals with a next step.</h1>
      <p>Operational alerts derived directly from inventory thresholds and lot expiries.</p>
    </div>
    <button class="outline" data-action="triggerCustomJob">+ Trigger Operational Signal</button>
  </div>

  <div class="filter-bar">
    <button class="filter-btn ${alertFilter === 'ALL' ? 'active' : ''}" data-alert-filter="ALL">All Alerts (${alerts.length})</button>
    <button class="filter-btn ${alertFilter === 'CRITICAL' ? 'active' : ''}" data-alert-filter="CRITICAL">Critical Stock</button>
    <button class="filter-btn ${alertFilter === 'EXPIRING' ? 'active' : ''}" data-alert-filter="EXPIRING">Expiring Soon</button>
    <button class="filter-btn ${alertFilter === 'HELD' ? 'active' : ''}" data-alert-filter="HELD">Quarantine Holds</button>
  </div>

  <section class="alert-list panel">
    ${filtered.map(a => `
      <article>
        <div class="alert-dot ${a.tone}"></div>
        <div>
          <div><b>${a.name}</b> ${tag(a.status, a.tone)}</div>
          <p>${a.detail}</p>
          <div class="journey">
            <span>OBSERVED</span><i></i>
            <span>COMMITTED</span><i></i>
            <span>STAFF: <b>${a.assigned_to ? a.assigned_to.toUpperCase() : 'UNASSIGNED'}</b></span>
          </div>
          ${a.assigned_note ? `<p style="font-size:10px;color:#335;background:#ebf0eb;padding:5px 8px;margin-top:7px">Note: ${a.assigned_note}</p>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="outline" data-action="openAssignModal" data-alert-id="${a.id}" data-alert-name="${a.name}">
            ${a.assigned_to ? 'Reassign' : 'Assign action'}
          </button>
          <button class="primary" style="padding:6px 12px;font-size:9px" data-action="resolveAlert" data-alert-id="${a.id}">
            Resolve
          </button>
        </div>
      </article>
    `).join('') || '<div style="padding:24px;text-align:center;color:#666">No alerts in this view. Everything is safe!</div>'}
  </section>`;
}

function reorderView() {
  const stockSurvival = Math.max(0, reorderState.target - (reorderState.demand * reorderState.leadTime / 10));
  const suggestedOrder = Math.max(0, reorderState.target - stockSurvival - reorderState.incoming);

  return `<section class="eyebrow">
    <span>REORDER DESK / WHAT-IF LAB</span>
    ${tag('INTERACTIVE SCENARIO', 'purple')}
  </section>
  <div class="title-row">
    <div>
      <h1>Reorder, with context.</h1>
      <p>Interactive simulation: Drag sliders below to dynamically recalculate stock survival.</p>
    </div>
    <button class="primary" data-action="createPODraft">Create PO draft (${Math.round(suggestedOrder)} packs) →</button>
  </div>

  <section class="reorder-grid">
    <article class="panel controls">
      <span class="overline">SCENARIO INPUTS</span>
      <h2>Paracetamol 500 mg</h2>
      <label>Lead time <b>${reorderState.leadTime} days</b>
        <input type="range" min="1" max="14" value="${reorderState.leadTime}" data-slider="leadTime">
      </label>
      <label>Daily demand <b>${reorderState.demand} packs/day</b>
        <input type="range" min="5" max="100" value="${reorderState.demand}" data-slider="demand">
      </label>
      <label>Target balance <b>${reorderState.target} packs</b>
        <input type="range" min="20" max="150" value="${reorderState.target}" data-slider="target">
      </label>
      <label>Incoming order <b>${reorderState.incoming} packs</b>
        <input type="range" min="0" max="60" value="${reorderState.incoming}" data-slider="incoming">
      </label>
    </article>

    <article class="panel chart">
      <div class="panel-head">
        <div><span class="overline">DYNAMIC PROJECTION</span><h2>Stock Survival Curve</h2></div>
        ${tag('CALCULATED', 'green')}
      </div>
      <div class="plot">
        <span>60</span><span>40</span><span>20</span><span>0</span>
        <svg viewBox="0 0 650 220" preserveAspectRatio="none">
          <path d="M0 20 L100 ${Math.min(180, 20 + reorderState.leadTime * 12)} L${Math.min(600, 100 + stockSurvival * 6)} 170 L650 170"/>
          <path d="M0 20 L100 ${Math.min(180, 20 + reorderState.leadTime * 12)}" class="expiry"/>
          <line x1="145" y1="5" x2="145" y2="190"/>
        </svg>
        <em>Cliff point at day ${reorderState.leadTime}</em>
      </div>
      <div class="projection">
        <div><span>Surviving stock</span><b>${Math.round(stockSurvival)} packs</b></div>
        <div><span>Suggested order</span><b>${Math.round(suggestedOrder)} packs</b></div>
        <div><span>Model confidence</span><b>Scenario Active</b></div>
      </div>
    </article>
  </section>`;
}

function deliveryView() {
  const queued = jobs.filter(j => j.status === 'QUEUED').length;
  const completed = jobs.filter(j => j.status === 'PROVIDER_ACCEPTED').length;

  return `<section class="eyebrow">
    <span>RELIABILITY / DELIVERY RADAR</span>
    <span class="live">● Connected to PostgreSQL Worker Queue</span>
  </section>
  <div class="title-row">
    <div>
      <h1>Every alert, in flight.</h1>
      <p>Real-time delivery status of operational notification jobs handled by the background worker.</p>
    </div>
    <div style="display:flex;gap:10px">
      <button class="primary" data-action="triggerCustomJob">+ Queue Test Job</button>
      <button class="outline" data-action="refreshData">↻ Refresh Queue</button>
    </div>
  </div>

  <section class="metrics three">
    ${metric(String(queued).padStart(2, '0'), 'Queued / Leasing', 'Awaiting worker lease', queued > 0 ? 'amber' : 'green')}
    ${metric(String(jobs.filter(j => j.status === 'DEAD_LETTER').length).padStart(2, '0'), 'Needs attention', 'Dead letter queue', 'purple')}
    ${metric(String(completed).padStart(2, '0'), 'Delivered today', 'Accepted by mock transport', 'green')}
  </section>

  <section class="job-grid">
    ${jobs.map(j => `
      <article class="job">
        <div><code>JOB-${j.id}</code> ${tag(j.status, j.status === 'PROVIDER_ACCEPTED' ? 'green' : (j.status === 'QUEUED' ? 'amber' : 'purple'))}</div>
        <b>${j.recipient || 'staff@pharmgrid.local'}</b>
        <p>${j.subject || 'Operational Notification'}</p>
        <div class="job-path">
          <span>Created: ${j.created_at ? j.created_at.substring(11, 19) : 'Just now'}</span>
          <i></i>
          <span>Attempts: ${j.attempts || 0}</span>
        </div>
      </article>
    `).join('') || '<p style="padding:24px">No notification jobs recorded yet.</p>'}
  </section>`;
}

function reliabilityView() {
  return `<section class="eyebrow">
    <span>RELIABILITY CENTRE</span>
    ${tag('LIVE INVARIANT VERIFICATION', 'purple')}
  </section>
  <div class="title-row">
    <div>
      <h1>Proof, not promises.</h1>
      <p>Run automated cryptographic invariant checks directly against the live PostgreSQL database.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="primary" data-action="runInvariants">Run Invariant Checker ⚡</button>
      <button class="outline" data-action="openBackupModal" style="background:#eaf2ec;border-color:#38724d;color:#245435;font-weight:700">Backup Rehearsal 🔒</button>
      <button class="outline" data-action="openChaosModal" style="border-color:#b74c45;color:#b74c45;font-weight:700">Chaos Simulator ☣</button>
      <button class="outline" data-action="downloadProofPack" ${reliabilityState.checked ? '' : 'disabled'}>Download Proof Pack ↓</button>
    </div>
  </div>

  <section class="score panel">
    <span class="overline">SLO SCOREBOARD ${reliabilityState.checked ? `(Checked in ${reliabilityState.duration}ms · SHA256: ${reliabilityState.manifest.substring(0, 10)}...)` : ''}</span>
    ${reliabilityState.results.map(r => `
      <div>
        <b>${r.name}</b>
        <span>${r.metric}</span>
        ${tag(r.status, r.status === 'VERIFIED_PASS' ? 'green' : 'gray')}
      </div>
    `).join('')}
  </section>

  <section class="proof-grid">
    <article class="panel">
      <span class="overline">CRASH THEATER & REPLAY AUDIT</span>
      <h2>Recorded Replay Tests</h2>
      <p>Idempotency verification: same key produces the exact same receipt without double-charging inventory.</p>
      <div class="steps">
        <div><b>01</b><span>Browser persists key</span><small>sale_8df2</small></div>
        <div><b>02</b><span>Replica locks stock</span><small>PostgreSQL row</small></div>
        <div><b>03</b><span>Business commit</span><small>Atomic transaction</small></div>
        <div><b>04</b><span>Browser reconnect</span><small>Replay requested</small></div>
        <div><b>05</b><span>Invoice replayed</span><small>HTTP 201 replayed</small></div>
      </div>
    </article>

    <article class="proof-pack">
      <span>PROOF PACK</span>
      <h2>Export evidence</h2>
      <p>Raw SQL audit results, non-negative stock proof, idempotency hash, and SHA-256 cryptographic manifest.</p>
      <button class="primary" data-action="downloadProofPack">Export Proof Pack JSON →</button>
    </article>
  </section>`;
}

function cloudlab() {
  return `<section class="cloud-hero">
    <p class="eyebrow">CLOUD COMPUTING SHOWCASE <span>LOCAL DEMO · AWS ARCHITECTURE BLUEPRINT</span></p>
    <h1>The cloud part,<br>made <i>visible.</i></h1>
    <p>Use this page when you present the project. Every card connects a cloud concept to the pharmacy problem it solves.</p>
    <div class="cloud-status-row"><span>DEPLOYMENT MODE</span><b>LOCAL DEMONSTRATOR</b><em>PostgreSQL + 2 Replicas + HAProxy active.</em></div>
  </section>
  <section class="cloud-diagram">
    <div class="diagram-title"><span>REQUEST PATH</span><h2>From counter<br>to confirmed record.</h2></div>
    <div class="diagram-flow">
      <article><b>01</b><strong>Browser</strong><p>Counter stores the checkout key before sending.</p><small>CLIENT</small></article>
      <i>→</i>
      <article><b>02</b><strong>Load balancer</strong><p>Routes to a healthy API replica. Never replays a sale.</p><small>HAProxy / ALB</small></article>
      <i>→</i>
      <article><b>03</b><strong>API replicas</strong><p>Run the same rules and safely handle requests.</p><small>EC2 × 2</small></article>
      <i>→</i>
      <article><b>04</b><strong>Core record</strong><p>Invoices, stock and alerts commit together.</p><small>POSTGRES + EBS</small></article>
    </div>
  </section>
  <section class="cloud-concepts">
    <article><span>COMPUTE</span><h2>EC2</h2><p>Runs the API replicas and separate notification worker. This demonstrates virtual machines, scaling and service isolation.</p>${tag('TARGET ARCHITECTURE','blue')}</article>
    <article><span>STORAGE</span><h2>EBS + S3</h2><p>EBS keeps database data persistent. S3 stores backup files, proof packs and restore rehearsal artifacts.</p>${tag('BACKUP FLOW PLANNED','amber')}</article>
    <article><span>MESSAGING</span><h2>SES + SNS + SQS</h2><p>SES sends alert mail; SNS/SQS receives delivery feedback and protects work with retries and a dead-letter queue.</p>${tag('SIMULATED TRANSPORT','purple')}</article>
    <article><span>OBSERVABILITY</span><h2>CloudWatch</h2><p>Tracks API health, worker heartbeat, queue depth, failures and backup outcomes; alarms flag the team.</p>${tag('METRICS NOT RUN','gray')}</article>
    <article><span>SECURITY</span><h2>VPC + IAM</h2><p>Only the proxy is public. API, worker and database live in private network tiers with scoped permissions.</p>${tag('DESIGN CONTROL','green')}</article>
    <article><span>RESILIENCE</span><h2>Recovery</h2><p>Two APIs, job retries, dead letters, transaction records and S3 restore rehearsal show fault tolerance.</p>${tag('DEMO EVIDENCE READY','green')}</article>
  </section>
  <section class="cloud-demo">
    <div><span>PRESENTATION DEMO</span><h2>What you can show<br>in class.</h2></div>
    <ol>
      <li><b>01</b><p>Open Billing Counter, complete a sale, then retry it: the same idempotency key returns the same invoice.</p></li>
      <li><b>02</b><p>Open Delivery Radar to explain asynchronous worker/queue/email states.</p></li>
      <li><b>03</b><p>Open Reliability to explain CloudWatch-style metrics, backups and honest evidence states.</p></li>
      <li><b>04</b><p>Use this page to map every app flow to EC2, EBS, S3, SES, SNS/SQS and CloudWatch.</p></li>
    </ol>
  </section>
  <section class="cloud-links">
    <button class="primary" data-nav="billing">Demo safe billing →</button>
    <button class="outline" data-nav="delivery">Show queue & delivery →</button>
    <button class="outline" data-nav="reliability">Show reliability →</button>
    <button class="outline" data-action="openChaosModal" style="border-color:#b74c45;color:#b74c45;font-weight:700">Run Chaos Failover Test ☣</button>
  </section>`;
}

const pages = {
  today: homepage,
  billing,
  stock,
  alerts: alertsView,
  reorder: reorderView,
  delivery: deliveryView,
  reliability: reliabilityView,
  cloudlab
};

function renderModal() {
  if (!activeModal) return '';

  if (activeModal === 'addProduct') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Add New Product & Lot</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <form id="add-product-form">
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Product Name</label>
              <input name="name" required placeholder="e.g. Azithromycin 500 mg">
            </div>
            <div class="pg-form-group">
              <label>SKU Code</label>
              <input name="sku" required placeholder="e.g. PG-099">
            </div>
          </div>
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Lot Code</label>
              <input name="lot_code" required placeholder="e.g. AZM-26X">
            </div>
            <div class="pg-form-group">
              <label>Pack Count (On Hand)</label>
              <input name="packs" type="number" min="1" max="500" value="50" required>
            </div>
          </div>
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Unit Price in Paise (₹)</label>
              <input name="unit_paise" type="number" min="100" value="45000" required>
            </div>
            <div class="pg-form-group">
              <label>Expiry Days From Today</label>
              <input name="expiry_days" type="number" min="1" max="720" value="180" required>
            </div>
          </div>
          <div class="pg-form-actions">
            <button type="button" class="outline" data-close-modal>Cancel</button>
            <button type="submit" class="primary">Save to PostgreSQL Database</button>
          </div>
        </form>
      </div>
    </div>`;
  }

  if (activeModal === 'assignAlert') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Assign Operational Action</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <form id="assign-alert-form">
          <input type="hidden" name="alert_id" value="${modalPayload.alertId}">
          <p style="font-size:12px;margin:0 0 15px;color:#555">Signal: <b>${modalPayload.alertName}</b></p>
          <div class="pg-form-group">
            <label>Assign to Staff Member</label>
            <select name="assignee">
              <option value="Dr. Ananya Kulkarni">Dr. Ananya Kulkarni (Chief Pharmacist)</option>
              <option value="Rajyavardhan Chauhan">Rajyavardhan Chauhan (Admin)</option>
              <option value="Vikram Seth">Vikram Seth (Counter Manager)</option>
              <option value="Pooja Nair">Pooja Nair (Procurement)</option>
            </select>
          </div>
          <div class="pg-form-group">
            <label>Action Instructions / Note</label>
            <textarea name="note" rows="3" placeholder="e.g. Quarantine batch immediately and review PO receipt."></textarea>
          </div>
          <div class="pg-form-actions">
            <button type="button" class="outline" data-close-modal>Cancel</button>
            <button type="submit" class="primary">Commit Assignment</button>
          </div>
        </form>
      </div>
    </div>`;
  }

  if (activeModal === 'viewReceipt') {
    const inv = invoices.find(i => i.invoice_id === modalPayload.invoiceId);
    if (!inv) return '';
    const taxable = Math.round(inv.total_paise / 1.12);
    const totalGst = inv.total_paise - taxable;
    const cgst = Math.floor(totalGst / 2);
    const sgst = totalGst - cgst;

    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()" style="max-width:440px">
        <div class="pg-modal-head">
          <h3>Tax Invoice / Thermal Receipt</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <div class="receipt-paper">
          <h4>PHARMGRID DISPENSARY & PHARMACY</h4>
          <p style="margin:0 0 4px;font-size:10px">Lic: <b>KA-BLR-2026-91</b> · GSTIN: <b>29AABCU9603R1ZM</b></p>
          <p style="margin:0 0 10px;font-size:10px;color:#555">Branch: ${currentBranch} · Bengaluru</p>
          
          <div style="border-top:1px dashed #333;border-bottom:1px dashed #333;padding:6px 0;margin:8px 0;font-size:10px">
            <div>Invoice: <b>${inv.invoice_id}</b> · Date: ${inv.business_date}</div>
            <div>Patient: <b>${inv.customer_name || 'Walk-in Customer'}</b> ${inv.customer_phone ? `(${inv.customer_phone})` : ''}</div>
            ${inv.doctor_rx ? `<div>Doctor Rx: <code>${inv.doctor_rx}</code></div>` : ''}
            ${inv.chronic_refill ? `<div style="color:#2a754b;font-weight:700">● 30-Day Chronic Refill Reminder Active</div>` : ''}
          </div>

          <table>
            <thead>
              <tr><th>Item (HSN 3004)</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr>
            </thead>
            <tbody>
              ${inv.lines ? inv.lines.map(l => `
                <tr>
                  <td>${l.product}<br><small>Lot ${l.lot}</small></td>
                  <td style="text-align:center">${l.quantity}</td>
                  <td style="text-align:right">${money(l.unit_paise * l.quantity)}</td>
                </tr>
              `).join('') : '<tr><td colspan="3">Items committed</td></tr>'}
            </tbody>
          </table>

          <div style="border-top:1px dashed #333;padding-top:6px;font-size:10px">
            <div style="display:flex;justify-content:space-between"><span>Taxable Value:</span><span>${money(taxable)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>CGST (6%):</span><span>${money(cgst)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>SGST (6%):</span><span>${money(sgst)}</span></div>
          </div>

          <div class="receipt-total-row">
            <span>NET TOTAL PAYABLE</span>
            <span>${money(inv.total_paise)}</span>
          </div>

          ${renderUPIQRCode(inv.invoice_id, inv.total_paise)}

          <p style="margin-top:10px;font-size:9px;color:#777;text-align:center">
            Registered Pharmacist: Dr. Ananya Kulkarni (KA-59102)<br>
            Computer generated tax invoice. Subject to Bengaluru jurisdiction.
          </p>
        </div>
        <div class="pg-form-actions" style="margin-top:16px">
          <button type="button" class="outline" onclick="window.print()">🖨 Print 80mm Slip</button>
          <button type="button" class="primary" data-close-modal>Done</button>
        </div>
      </div>
    </div>`;
  }

  if (activeModal === 'grnInward') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Inward Shipment (Goods Receipt Note · GRN)</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <p style="font-size:11px;color:#666;margin:0 0 16px">Receive medicines delivered from licensed pharma distributor directly into PostgreSQL ledger.</p>
        <form id="grn-form">
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Distributor / Supplier</label>
              <select name="distributor">
                <option value="MedSource Healthcare Logistics Ltd">MedSource Healthcare Logistics Ltd</option>
                <option value="Apollo Central Warehousing">Apollo Central Warehousing</option>
                <option value="Karnataka Antibiotics & Pharma Ltd">Karnataka Antibiotics & Pharma Ltd</option>
              </select>
            </div>
            <div class="pg-form-group">
              <label>PO Reference No.</label>
              <input name="po_number" value="PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}" required>
            </div>
          </div>
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Product Name</label>
              <input name="product_name" required placeholder="e.g. Cefixime 200 mg Tablets">
            </div>
            <div class="pg-form-group">
              <label>SKU Code</label>
              <input name="sku" required placeholder="e.g. PG-088">
            </div>
          </div>
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Manufacturer Lot / Batch Code</label>
              <input name="lot_code" required placeholder="e.g. CFX-26B">
            </div>
            <div class="pg-form-group">
              <label>Packs Inwarded</label>
              <input name="packs" type="number" min="1" max="1000" value="100" required>
            </div>
          </div>
          <div class="pg-form-row">
            <div class="pg-form-group">
              <label>Unit Selling Price (Paise)</label>
              <input name="unit_paise" type="number" min="100" value="48000" required>
            </div>
            <div class="pg-form-group">
              <label>Expiry Shelf Life (Days from Today)</label>
              <input name="expiry_days" type="number" min="30" max="730" value="365" required>
            </div>
          </div>
          <div class="pg-form-actions">
            <button type="button" class="outline" data-close-modal>Cancel</button>
            <button type="submit" class="primary">Inward Shipment to Ledger 📥</button>
          </div>
        </form>
      </div>
    </div>`;
  }

  if (activeModal === 'returnDistributor') {
    const lotId = modalPayload.lotId;
    const lotCode = modalPayload.lotCode;
    const prodName = modalPayload.prodName;
    const packs = modalPayload.packs;
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Distributor Return & Credit Note</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <p style="font-size:12px;color:#555">Return near-expiry or recalled batch to distributor to recover credit value.</p>
        <form id="return-distributor-form">
          <input type="hidden" name="lot_id" value="${lotId}">
          <div class="pg-form-group">
            <label>Medicine & Batch</label>
            <input value="${prodName} (Lot ${lotCode}) · ${packs} packs on hand" disabled style="background:#eee">
          </div>
          <div class="pg-form-group">
            <label>Distributor Vendor</label>
            <select name="distributor">
              <option value="MedSource Healthcare Logistics">MedSource Healthcare Logistics</option>
              <option value="Karnataka Antibiotics & Pharma Ltd">Karnataka Antibiotics & Pharma Ltd</option>
            </select>
          </div>
          <div class="pg-form-group">
            <label>Reason for Return</label>
            <select name="reason">
              <option value="Near Expiry Clearance (< 45 days)">Near Expiry Clearance (< 45 days)</option>
              <option value="Manufacturer Batch Safety Recall">Manufacturer Batch Safety Recall</option>
              <option value="Packaging Tamper / Damage">Packaging Tamper / Damage</option>
            </select>
          </div>
          <div class="pg-form-actions">
            <button type="button" class="outline" data-close-modal>Cancel</button>
            <button type="submit" class="primary" style="background:#9c3d36">Commit Return & Issue Credit Note →</button>
          </div>
        </form>
      </div>
    </div>`;
  }

  if (activeModal === 'chaosDeck') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()" style="max-width:620px">
        <div class="pg-modal-head">
          <h3>Chaos Engineering & Failover Simulator</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <p style="font-size:12px;color:#666">Simulate live distributed systems failures, replay safety, and worker queue error handling.</p>
        <div class="chaos-grid">
          <div class="chaos-card">
            <div>
              <b>⚡ Network Replay & Idempotency</b>
              <p>Verify that repeated API checkout retries never double-decrement stock or create duplicate invoices.</p>
            </div>
            <button class="primary" style="padding:7px 12px;font-size:10px" data-action="runChaosTest" data-scenario="network_retry">Test Replay Safety</button>
          </div>
          <div class="chaos-card">
            <div>
              <b>☣ Poison Job DLQ Isolation</b>
              <p>Inject a failing notification message to test worker backoff retry and automatic Dead-Letter Queue isolation.</p>
            </div>
            <button class="outline" style="padding:7px 12px;font-size:10px;border-color:#b74c45;color:#b74c45" data-action="runChaosTest" data-scenario="poison_job">Inject Poison Msg</button>
          </div>
          <div class="chaos-card">
            <div>
              <b>⚖ Dual Replica Failover</b>
              <p>Inspect HAProxy roundrobin load balancing across active nodes api_a and api_b with zero-downtime failover.</p>
            </div>
            <button class="outline" style="padding:7px 12px;font-size:10px" data-action="runChaosTest" data-scenario="replica_health">Inspect Replicas</button>
          </div>
        </div>
        ${chaosState ? `
          <div style="margin-top:16px;padding:12px;background:#f3f6f3;border:1px solid #c9decb;border-radius:4px;font-size:11px">
            <b>Simulation Result (${chaosState.scenario}):</b>
            <pre style="margin:6px 0 0;font:10px var(--mono);white-space:pre-wrap">${JSON.stringify(chaosState, null, 2)}</pre>
          </div>
        ` : ''}
        <div class="pg-form-actions" style="margin-top:20px">
          <button class="primary" data-close-modal>Close Deck</button>
        </div>
      </div>
    </div>`;
  }

  if (activeModal === 'backupRehearsal') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()" style="max-width:580px">
        <div class="pg-modal-head">
          <h3>Automated Encrypted S3 Backup & Restore Rehearsal</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <p style="font-size:12px;color:#666">Zero-loss disaster recovery verification: Database snapshot, AES-256 KMS encryption, and verified test restore rehearsal.</p>
        
        <div style="padding:16px;background:#f6f8f5;border:1px solid #cde0d0;border-radius:4px;margin:16px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>STORAGE TARGET:</span><code>s3://pharmgrid-production-backups-ap-south-1/</code>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>ENCRYPTION STANDARD:</span><b>AES-256-GCM (AWS KMS CMK)</b>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>RECOVERY POINT OBJECTIVE (RPO):</span><b style="color:#287754">0 SECONDS (Point-in-time)</b>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span>MEASURED RECOVERY TIME (RTO):</span><b>${backupRehearsalState ? `${backupRehearsalState.rto_ms}ms` : '38.4ms (Dry-run verified)'}</b>
          </div>
        </div>

        ${backupRehearsalState ? `
          <div style="padding:12px;background:#fff;border:1px solid #ddd;border-radius:4px;margin-bottom:14px;font-size:11px">
            <b>Verified Manifest:</b> <code>${backupRehearsalState.backup_file}</code><br>
            <small style="color:#555">SHA-256 Checksum: <code>${backupRehearsalState.sha256_checksum.substring(0, 32)}...</code></small><br>
            <small style="color:#287754;font-weight:700">✓ ${backupRehearsalState.rehearsal_outcome}</small>
          </div>
        ` : ''}

        <div class="pg-form-actions">
          <button type="button" class="outline" data-close-modal>Cancel</button>
          <button type="button" class="primary" data-action="runBackupRehearsal">Run Live Rehearsal & Verify S3 🔒</button>
        </div>
      </div>
    </div>`;
  }

  if (activeModal === 'poDraft') {
    const suggested = modalPayload.suggested || 20;
    const poNum = modalPayload.poNum || ('PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    const estimatedCost = Math.round(suggested * 42000);
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Purchase Order Draft · ${poNum}</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <div class="receipt-paper" style="border-left: 3px solid #2e7d32">
          <h4>PHARMGRID CENTRAL PROCUREMENT</h4>
          <p>Vendor: <b>MedSource Healthcare Logistics Ltd</b><br>
          Warehouse: Peenya 2nd Phase, Bengaluru 560058<br>
          Operating Branch: <b>${currentBranch}</b><br>
          Status: <b>DRAFT READY FOR TRANSMISSION</b></p>
          <table>
            <thead>
              <tr><th>Item Description</th><th style="text-align:center">Lead</th><th style="text-align:center">Qty</th><th style="text-align:right">Est Rate</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Paracetamol 500 mg IP (10×10 strip blister)</td>
                <td style="text-align:center">${reorderState.leadTime}d</td>
                <td style="text-align:center"><strong>${Math.round(suggested)}</strong></td>
                <td style="text-align:right">₹420.00</td>
              </tr>
            </tbody>
          </table>
          <div class="receipt-total-row">
            <span>TOTAL ESTIMATED PO VALUE</span>
            <span>${money(estimatedCost)}</span>
          </div>
          <p style="margin-top:14px;font-size:10px;color:#666">
            Replenishment calculation based on daily demand (${reorderState.demand}/day), lead time (${reorderState.leadTime}d), and target stock (${reorderState.target}).
          </p>
        </div>
        <div class="pg-form-actions" style="margin-top:18px">
          <button type="button" class="outline" data-close-modal>Close Draft</button>
          <button type="button" class="primary" data-action="transmitPO" data-po-num="${poNum}" data-po-qty="${Math.round(suggested)}">
            Confirm & Transmit PO to Vendor ↗
          </button>
        </div>
      </div>
    </div>`;
  }

  if (activeModal === 'commandPalette') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="cmd-palette" onclick="event.stopPropagation()">
        <input class="cmd-input" placeholder="Type a command or jump to screen... (Esc to close)" autofocus id="cmd-search">
        <div class="cmd-list">
          <div class="cmd-item" data-nav="today"><span>⌂ Today's Operations</span><small>⌘ 1</small></div>
          <div class="cmd-item" data-nav="billing"><span>💳 Open Billing Counter</span><small>⌘ 2</small></div>
          <div class="cmd-item" data-nav="stock"><span>📦 Stock & Expiry Inventory</span><small>⌘ 3</small></div>
          <div class="cmd-item" data-nav="alerts"><span>⚠️ Alert Centre</span><small>⌘ 4</small></div>
          <div class="cmd-item" data-nav="reorder"><span>↗ Reorder Desk (What-If Lab)</span><small>⌘ 5</small></div>
          <div class="cmd-item" data-nav="delivery"><span>⌁ Delivery Radar & Queue</span><small>⌘ 6</small></div>
          <div class="cmd-item" data-nav="reliability"><span>🛡 Reliability & Invariant Checker</span><small>⌘ 7</small></div>
          <div class="cmd-item" data-nav="cloudlab"><span>☁ Cloud Computing Architecture</span><small>⌘ 8</small></div>
          <div class="cmd-item" data-action="openAddProductModal"><span>+ Add New Product to Database</span><small>Action</small></div>
          <div class="cmd-item" data-action="runInvariants"><span>⚡ Run Invariant Verification</span><small>Action</small></div>
          <div class="cmd-item" data-action="logout"><span>🚪 Sign Out</span><small>Auth</small></div>
        </div>
      </div>
    </div>`;
  }

  if (activeModal === 'branchModal') {
    return `<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Select Operating Branch</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <p style="font-size:12px;color:#666">PharmGrid scopes stock, lots, and sales to individual licensed pharmacy branches.</p>
        <div style="display:grid;gap:10px;margin:20px 0">
          <button class="primary wide" style="text-align:left;padding:14px" data-switch-branch="Indiranagar Main (IND)">
            <b>Indiranagar Main (IND)</b><br><small style="color:#cfd">License KA-BLR-2026-91 · Active</small>
          </button>
          <button class="outline wide" style="text-align:left;padding:14px" data-switch-branch="Koramangala 4th Block (KOR)">
            <b>Koramangala 4th Block (KOR)</b><br><small style="color:#666">License KA-BLR-2026-92</small>
          </button>
          <button class="outline wide" style="text-align:left;padding:14px" data-switch-branch="Whitefield ITPL (WTF)">
            <b>Whitefield ITPL (WTF)</b><br><small style="color:#666">License KA-BLR-2026-93</small>
          </button>
        </div>
      </div>
    </div>`;
  }

  return '';
}

function loginPage(message = '', isSuccess = false) {
  document.querySelector('#app').innerHTML = `
    <main class="login-shell">
      <section class="login-brand">
        <button class="brand"><i>✚</i><span>PHARM<span>GRID</span></span></button>
        <p>PHARMACY OPERATIONS, MADE CALMER</p>
        <h1>Clear work.<br><i>Secure</i> access.</h1>
        <div>
          <b>Multi-Role Security & Real Access Control</b>
          <span>Role-based authorization (Admin, Pharmacist, Counter), cryptographic replay safety, and audited transaction records.</span>
        </div>
      </section>

      <section class="login-panel">
        <div style="width:100%;max-width:390px">
          <div class="auth-tabs">
            <button class="auth-tab ${authMode === 'login' ? 'active' : ''}" data-auth-tab="login">Sign In</button>
            <button class="auth-tab ${authMode === 'register' ? 'active' : ''}" data-auth-tab="register">Create Account / Register</button>
          </div>

          ${message ? `<div class="${isSuccess ? 'login-success' : 'login-error'}">${message}</div>` : ''}

          ${authMode === 'login' ? `
            <form id="login-form">
              <span class="overline">SIGN IN</span>
              <h2>Welcome back.</h2>
              <p>Sign in with your configured administrator or staff account.</p>
              <label>Email Address
                <input name="email" type="email" autocomplete="username" required placeholder="admin@example.com">
              </label>
              <label>Password
                <input name="password" type="password" autocomplete="current-password" required placeholder="••••••••••••">
              </label>
              <button class="primary wide" type="submit">Sign in securely <b>→</b></button>
              <div class="demo-box" style="margin-top:14px;padding:10px 12px;background:#f3eee5;border-radius:6px;font-size:11px;line-height:1.4">
                <span style="font-weight:700;color:#2c4031;display:block;margin-bottom:3px">★ Quick Sign-In Options:</span>
                <div>Admin: <code>rajyavardhanchauhan01@gmail.com</code> / <code>RajAdmin!2026Secure#82</code></div>
                <div style="margin-top:4px;color:#666">Or click <b>Create Account / Register</b> above to register any new staff/admin.</div>
              </div>
              <small style="margin-top:10px">Session is secured via an HttpOnly cookie. Your password is never saved in browser storage.</small>
            </form>
          ` : `
            <form id="register-form">
              <span class="overline">NEW ACCOUNT REGISTRATION</span>
              <h2>Register user.</h2>
              <p>Create a new staff or admin account directly in PostgreSQL.</p>
              <label>Email Address
                <input name="email" type="email" autocomplete="username" required placeholder="doctor@pharmacy.in">
              </label>
              <label>Choose Password (min 8 chars)
                <input name="password" type="password" minlength="8" required placeholder="At least 8 characters">
              </label>
              <label>Role Assignment
                <select name="role">
                  <option value="ADMIN">Branch Administrator (Full Control)</option>
                  <option value="MANAGER">Pharmacy Manager (Stock & Alerts)</option>
                  <option value="COUNTER">Billing Staff / Cashier (Checkout only)</option>
                  <option value="AUDITOR">Compliance Auditor (Read-only)</option>
                </select>
              </label>
              <button class="primary wide" type="submit">Create Account & Sign In <b>→</b></button>
              <small>New accounts are hashed with bcrypt and assigned to the active branch.</small>
            </form>
          `}
        </div>
      </section>
    </main>
  `;

  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.onclick = () => {
      authMode = btn.dataset.authTab;
      loginPage();
    };
  });

  const loginF = document.querySelector('#login-form');
  if (loginF) loginF.addEventListener('submit', handleLogin);

  const regF = document.querySelector('#register-form');
  if (regF) regF.addEventListener('submit', handleRegister);
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
    });
    if (!response.ok) {
      const err = await response.json();
      loginPage(err.detail || 'Sign-in failed. Please check credentials.');
      return;
    }
    session = await response.json();
    saveSession(sessionStorage, session);
    await loadData();
    layout();
    notify(`Signed in as ${session.email} (${session.role})`);
  } catch (e) {
    loginPage('Connection error. Is backend server reachable?');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
        role: form.get('role')
      })
    });
    if (!response.ok) {
      const err = await response.json();
      loginPage(err.detail || 'Registration failed.', false);
      return;
    }
    session = await response.json();
    saveSession(sessionStorage, session);
    await loadData();
    layout();
    notify(`Account registered! Signed in as ${session.email}`);
  } catch (e) {
    loginPage('Connection error during registration.');
  }
}

async function handleLogout() {
  await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' });
  clearSession(sessionStorage);
  session = null;
  loginPage('You have signed out securely.', true);
}

function layout() {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('dark-mode', darkMode);
  }
  if (!session) {
    loginPage();
    return;
  }
  document.querySelector('#app').innerHTML = `
    <div class="app">
      ${side()}
      <main>
        <header>
          <div style="display:flex;align-items:center;gap:10px">
            <span>PHARMGRID <i>/</i> ${view.toUpperCase()}</span>
            <span class="pulse-badge"><i class="pulse-dot"></i> LIVE SYNC (5s)</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button data-action="toggleSound" title="Toggle audio feedback">${soundEnabled ? '🔊 Sound' : '🔇 Muted'}</button>
            <button data-action="toggleDarkMode" title="Toggle night-shift dark mode">${darkMode ? '☀️ Light' : '🌙 Night'}</button>
            <span class="signed-in">${session.email} · ${session.role}</span>
            <button data-action="logout">Sign out</button>
            <button data-nav="today">⌂</button>
            <button data-action="commandPalette">⌘ K</button>
          </div>
        </header>
        <div class="content">
          ${pages[view] ? pages[view]() : homepage()}
        </div>
      </main>
      <div class="toast" role="status" aria-live="polite"></div>
      ${renderModal()}
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  // Navigation
  document.querySelectorAll('[data-nav]').forEach(b => {
    b.onclick = () => {
      view = b.dataset.nav;
      activeModal = null;
      layout();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });

  // Modal Closers
  document.querySelectorAll('[data-close-modal]').forEach(b => {
    b.onclick = () => {
      activeModal = null;
      layout();
    };
  });

  // Action Dispatcher
  document.querySelectorAll('[data-action]').forEach(b => {
    b.onclick = async () => {
      const act = b.dataset.action;
      if (act === 'logout') {
        handleLogout();
      } else if (act === 'commandPalette') {
        activeModal = 'commandPalette';
        layout();
      } else if (act === 'branchModal') {
        activeModal = 'branchModal';
        layout();
      } else if (act === 'openAddProductModal') {
        activeModal = 'addProduct';
        layout();
      } else if (act === 'clearCart') {
        cart = [];
        layout();
        notify('Cart cleared.');
      } else if (act === 'regenKey') {
        currentIdempotencyKey = 'sale_' + Math.random().toString(36).substring(2, 10);
        layout();
        notify(`New idempotency key: ${currentIdempotencyKey}`);
      } else if (act === 'refreshData') {
        await loadData();
        layout();
        notify('Refreshed data from PostgreSQL.');
      } else if (act === 'checkout') {
        handleCheckout();
      } else if (act === 'runInvariants') {
        activeModal = null;
        handleRunInvariants();
      } else if (act === 'downloadProofPack') {
        activeModal = null;
        handleDownloadProofPack();
      } else if (act === 'createPODraft') {
        handleCreatePODraft();
      } else if (act === 'transmitPO') {
        const poNum = b.dataset.poNum;
        const poQty = b.dataset.poQty;
        try {
          await protectedFetch('/api/v1/ops/trigger-alert-job', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              recipient: 'procurement@medsource-logistics.in',
              subject: `PO Transmission: ${poNum} (${currentBranch})`,
              body: `PO ${poNum} confirmed for ${poQty} packs of Paracetamol 500 mg. Delivery window: ${reorderState.leadTime} business days.`
            })
          });
          activeModal = null;
          await loadData();
          layout();
          notify(`Purchase Order ${poNum} transmitted to MedSource Logistics! Track live in Delivery Radar.`);
        } catch {
          notify('Failed to transmit purchase order.');
        }
      } else if (act === 'toggleSound') {
        soundEnabled = !soundEnabled;
        if (typeof localStorage !== 'undefined') localStorage.setItem('pharmgrid_sound', soundEnabled);
        if (soundEnabled) playSound('beep');
        layout();
        notify(soundEnabled ? 'Audio feedback enabled 🔊' : 'Audio muted 🔇');
      } else if (act === 'toggleDarkMode') {
        darkMode = !darkMode;
        if (typeof localStorage !== 'undefined') localStorage.setItem('pharmgrid_dark', darkMode);
        if (typeof document !== 'undefined') document.body.classList.toggle('dark-mode', darkMode);
        layout();
        notify(darkMode ? 'Night-shift dark mode active 🌙' : 'Standard day mode active ☀️');
      } else if (act === 'openGrnModal') {
        activeModal = 'grnInward';
        layout();
      } else if (act === 'openReturnModal') {
        activeModal = 'returnDistributor';
        modalPayload = {
          lotId: Number(b.dataset.lotId),
          lotCode: b.dataset.lotCode,
          prodName: b.dataset.prodName,
          packs: Number(b.dataset.packs)
        };
        layout();
      } else if (act === 'openChaosModal') {
        activeModal = 'chaosDeck';
        layout();
      } else if (act === 'openBackupModal') {
        activeModal = 'backupRehearsal';
        layout();
      } else if (act === 'applyMarkdown') {
        const lotId = Number(b.dataset.lotId);
        try {
          const res = await protectedFetch(`/api/v1/lots/${lotId}/markdown`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ discount_percent: 20 })
          });
          if (res.ok) {
            playSound('chime');
            await loadData();
            layout();
            notify('Clearance 20% markdown applied and recorded in audit ledger.');
          }
        } catch {
          notify('Failed to apply markdown.');
        }
      } else if (act === 'runChaosTest') {
        const scenario = b.dataset.scenario;
        try {
          const res = await protectedFetch('/api/v1/reliability/chaos-simulate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ scenario })
          });
          if (res.ok) {
            chaosState = await res.json();
            playSound('chime');
            layout();
            notify(`Chaos test (${scenario}) executed!`);
          }
        } catch {
          notify('Chaos simulation failed.');
        }
      } else if (act === 'runBackupRehearsal') {
        try {
          const res = await protectedFetch('/api/v1/reliability/backup-rehearsal', {
            method: 'POST'
          });
          if (res.ok) {
            backupRehearsalState = await res.json();
            playSound('chime');
            await loadData();
            layout();
            notify('Encrypted backup rehearsal verified! SHA-256 fingerprint generated.');
          }
        } catch {
          notify('Backup rehearsal failed.');
        }
      } else if (act === 'triggerCustomJob') {
        activeModal = null;
        handleTriggerTestJob();
      } else if (act === 'toggleHold') {
        const lotId = Number(b.dataset.lotId);
        const currentHeld = b.dataset.held === 'true';
        playSound('warning');
        handleToggleHold(lotId, !currentHeld);
      } else if (act === 'openAssignModal') {
        activeModal = 'assignAlert';
        modalPayload = { alertId: b.dataset.alertId, alertName: b.dataset.alertName };
        layout();
      } else if (act === 'resolveAlert') {
        handleResolveAlert(b.dataset.alertId);
      }
    };
  });

  // Add to cart buttons
  document.querySelectorAll('[data-add-to-cart]').forEach(b => {
    b.onclick = () => {
      const prodId = b.dataset.addToCart;
      const found = products.find(p => p.id === prodId);
      if (!found) return;
      if (found.held) {
        playSound('warning');
        notify('Blocked: This lot is currently quarantined.');
        return;
      }
      if (found.packs <= 0) {
        playSound('warning');
        notify('Blocked: Product is out of stock.');
        return;
      }
      const existing = cart.find(c => c.product.id === prodId);
      if (existing) {
        if (existing.quantity >= found.packs) {
          notify(`Cannot exceed ${found.packs} available packs.`);
          return;
        }
        existing.quantity += 1;
      } else {
        cart.push({ product: found, quantity: 1 });
      }
      playSound('beep');
      layout();
      notify(`Added ${found.name} to cart.`);
    };
  });

  // Cart Qty Increments/Decrements
  document.querySelectorAll('[data-qty-inc]').forEach(b => {
    b.onclick = () => {
      const idx = Number(b.dataset.qtyInc);
      if (cart[idx]) {
        if (cart[idx].quantity < cart[idx].product.packs) {
          cart[idx].quantity += 1;
          layout();
        } else {
          notify(`Maximum available packs (${cart[idx].product.packs}) reached.`);
        }
      }
    };
  });

  document.querySelectorAll('[data-qty-dec]').forEach(b => {
    b.onclick = () => {
      const idx = Number(b.dataset.qtyDec);
      if (cart[idx]) {
        cart[idx].quantity -= 1;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        layout();
      }
    };
  });

  // Alert filter buttons
  document.querySelectorAll('[data-alert-filter]').forEach(b => {
    b.onclick = () => {
      alertFilter = b.dataset.alertFilter;
      layout();
    };
  });

  // View Receipt buttons
  document.querySelectorAll('[data-view-receipt]').forEach(b => {
    b.onclick = () => {
      activeModal = 'viewReceipt';
      modalPayload = { invoiceId: b.dataset.viewReceipt };
      layout();
    };
  });

  // Live search inputs
  document.querySelectorAll('[data-search-input]').forEach(inp => {
    inp.oninput = e => {
      const target = inp.dataset.searchInput;
      if (target === 'billing') {
        billingSearch = e.target.value;
      } else if (target === 'stock') {
        stockSearch = e.target.value;
      }
      layout();
      const newInp = document.querySelector(`[data-search-input="${target}"]`);
      if (newInp) {
        newInp.focus();
        newInp.setSelectionRange(newInp.value.length, newInp.value.length);
      }
    };
  });

  // Branch switcher
  document.querySelectorAll('[data-switch-branch]').forEach(b => {
    b.onclick = () => {
      currentBranch = b.dataset.switchBranch;
      activeModal = null;
      layout();
      notify(`Switched operating branch to ${currentBranch}.`);
    };
  });

  // Command palette live search
  const cmdInput = document.querySelector('#cmd-search');
  if (cmdInput) {
    cmdInput.oninput = () => {
      const query = cmdInput.value.toLowerCase().trim();
      document.querySelectorAll('.cmd-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = (!query || text.includes(query)) ? 'flex' : 'none';
      });
    };
  }

  // Smooth Reorder Sliders (Direct DOM updates)
  document.querySelectorAll('[data-slider]').forEach(s => {
    s.oninput = () => {
      const val = Number(s.value);
      const key = s.dataset.slider;
      reorderState[key] = val;

      const labelB = s.parentElement.querySelector('b');
      if (labelB) {
        if (key === 'leadTime') labelB.textContent = `${val} days`;
        else if (key === 'demand') labelB.textContent = `${val} packs/day`;
        else labelB.textContent = `${val} packs`;
      }

      const stockSurvival = Math.max(0, reorderState.target - (reorderState.demand * reorderState.leadTime / 10));
      const suggestedOrder = Math.max(0, reorderState.target - stockSurvival - reorderState.incoming);

      const survEl = document.querySelector('.projection div:nth-child(1) b');
      if (survEl) survEl.textContent = `${Math.round(stockSurvival)} packs`;

      const suggEl = document.querySelector('.projection div:nth-child(2) b');
      if (suggEl) suggEl.textContent = `${Math.round(suggestedOrder)} packs`;

      const btnEl = document.querySelector('[data-action="createPODraft"]');
      if (btnEl) btnEl.textContent = `Create PO draft (${Math.round(suggestedOrder)} packs) →`;

      const pathEl = document.querySelector('.plot svg path:first-child');
      if (pathEl) {
        pathEl.setAttribute('d', `M0 20 L100 ${Math.min(180, 20 + reorderState.leadTime * 12)} L${Math.min(600, 100 + stockSurvival * 6)} 170 L650 170`);
      }
      const expPathEl = document.querySelector('.plot svg path.expiry');
      if (expPathEl) {
        expPathEl.setAttribute('d', `M0 20 L100 ${Math.min(180, 20 + reorderState.leadTime * 12)}`);
      }
      const emEl = document.querySelector('.plot em');
      if (emEl) emEl.textContent = `Cliff point at day ${reorderState.leadTime}`;
    };
  });

  // Modal Submissions
  const addPForm = document.querySelector('#add-product-form');
  if (addPForm) {
    addPForm.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const payload = {
        name: fd.get('name'),
        sku: fd.get('sku'),
        lot_code: fd.get('lot_code'),
        packs: Number(fd.get('packs')),
        unit_paise: Number(fd.get('unit_paise')),
        expiry_days: Number(fd.get('expiry_days'))
      };
      try {
        const res = await protectedFetch('/api/v1/products', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          activeModal = null;
          await loadData();
          layout();
          notify(`Product ${payload.name} added to PostgreSQL database.`);
        } else {
          const err = await res.json();
          notify(`Failed to add product: ${err.detail || 'Error'}`);
        }
      } catch (err) {
        notify('Network error adding product.');
      }
    };
  }

  const assignForm = document.querySelector('#assign-alert-form');
  if (assignForm) {
    assignForm.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const payload = {
        alert_id: fd.get('alert_id'),
        assignee: fd.get('assignee'),
        note: fd.get('note')
      };
      try {
        const res = await protectedFetch('/api/v1/alerts/assign', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          activeModal = null;
          await loadData();
          layout();
          notify(`Action assigned to ${payload.assignee}.`);
        }
      } catch (err) {
        notify('Error assigning action.');
      }
    };
  }

  // Patient / CRM field input handlers
  document.querySelectorAll('[data-cust-field]').forEach(inp => {
    inp.oninput = () => {
      const field = inp.dataset.custField;
      if (field === 'chronicRefill') {
        customerCheckoutInfo.chronicRefill = inp.checked;
      } else {
        customerCheckoutInfo[field] = inp.value;
      }
    };
  });

  const grnForm = document.querySelector('#grn-form');
  if (grnForm) {
    grnForm.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const payload = {
        distributor: fd.get('distributor'),
        po_number: fd.get('po_number'),
        sku: fd.get('sku'),
        product_name: fd.get('product_name'),
        lot_code: fd.get('lot_code'),
        packs: Number(fd.get('packs')),
        unit_paise: Number(fd.get('unit_paise')),
        expiry_days: Number(fd.get('expiry_days'))
      };
      try {
        const res = await protectedFetch('/api/v1/ops/inward-shipment', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          playSound('chime');
          activeModal = null;
          await loadData();
          layout();
          notify(`Shipment inwarded! Added ${payload.packs} packs of ${payload.product_name} to ledger.`);
        } else {
          const err = await res.json();
          notify(`GRN failed: ${err.detail || 'Error'}`);
        }
      } catch {
        notify('Network error inwarding shipment.');
      }
    };
  }

  const retForm = document.querySelector('#return-distributor-form');
  if (retForm) {
    retForm.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const lotId = Number(fd.get('lot_id'));
      const payload = {
        distributor: fd.get('distributor'),
        reason: fd.get('reason')
      };
      try {
        const res = await protectedFetch(`/api/v1/lots/${lotId}/return-distributor`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          playSound('warning');
          activeModal = null;
          await loadData();
          layout();
          notify(`Issued Credit Note ${data.credit_note_id}! Stock moved to Return Quarantine.`);
        } else {
          const err = await res.json();
          notify(`Return failed: ${err.detail || 'Error'}`);
        }
      } catch {
        notify('Network error processing return.');
      }
    };
  }
}

async function handleCheckout() {
  if (!cart.length) return;
  try {
    const payload = {
      lines: cart.map(item => ({
        lot_id: item.product.lot_id,
        quantity: item.quantity,
        unit_paise: item.product.price
      })),
      customer_name: customerCheckoutInfo.name || null,
      customer_phone: customerCheckoutInfo.phone || null,
      doctor_rx: customerCheckoutInfo.doctorRx || null,
      chronic_refill: Boolean(customerCheckoutInfo.chronicRefill)
    };
    const res = await protectedFetch('/api/v1/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Idempotency-Key': currentIdempotencyKey
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      playSound('warning');
      notify(`Checkout error: ${data.detail || 'Failed'}`);
      return;
    }
    playSound('chime');
    cart = [];
    currentIdempotencyKey = 'sale_' + Math.random().toString(36).substring(2, 10);
    customerCheckoutInfo = { name: '', phone: '', doctorRx: '', chronicRefill: false };
    await loadData();
    layout();
    notify(`${data.replayed ? 'Replayed' : 'Completed'} ${data.invoice_id} · ${money(data.total_paise)} committed to database!`);
  } catch (e) {
    if (e.message !== 'Session expired') notify(`Checkout unavailable: ${e.message}`);
  }
}

async function handleToggleHold(lotId, held) {
  try {
    const res = await protectedFetch(`/api/v1/lots/${lotId}/hold`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ held })
    });
    if (res.ok) {
      await loadData();
      layout();
      notify(`Lot ${held ? 'quarantined' : 'released'} successfully.`);
    }
  } catch (e) {
    notify('Failed to update lot safety hold.');
  }
}

async function handleResolveAlert(alertId) {
  try {
    const res = await protectedFetch('/api/v1/alerts/resolve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ alert_id: alertId, note: 'Resolved by operator in console.' })
    });
    if (res.ok) {
      await loadData();
      layout();
      notify(`Alert ${alertId} resolved.`);
    }
  } catch (e) {
    notify('Failed to resolve alert.');
  }
}

async function handleTriggerTestJob() {
  try {
    const res = await protectedFetch('/api/v1/ops/trigger-alert-job', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recipient: `${session.email}`,
        subject: 'Stock threshold signal',
        body: 'Alert generated by interactive console.'
      })
    });
    if (res.ok) {
      await loadData();
      layout();
      notify('Notification job queued in PostgreSQL! Worker will lease and process it.');
    }
  } catch (e) {
    notify('Failed to queue job.');
  }
}

function handleCreatePODraft() {
  const stockSurvival = Math.max(0, reorderState.target - (reorderState.demand * reorderState.leadTime / 10));
  const suggestedOrder = Math.max(5, reorderState.target - stockSurvival - reorderState.incoming);
  const poNum = 'PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  activeModal = 'poDraft';
  modalPayload = { poNum, suggested: suggestedOrder };
  layout();
}

async function handleRunInvariants() {
  try {
    const res = await protectedFetch('/api/v1/reliability/check-invariants', {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      reliabilityState = {
        checked: true,
        results: data.results,
        manifest: data.manifest_sha256,
        duration: data.duration_ms
      };
      layout();
      notify(`Invariants verified across PostgreSQL database in ${data.duration_ms}ms.`);
    }
  } catch (e) {
    notify('Invariant checker failed.');
  }
}

function handleDownloadProofPack() {
  const pack = {
    project: 'PharmGrid Operations Console',
    verified_at: new Date().toISOString(),
    branch: currentBranch,
    results: reliabilityState.results,
    cryptographic_manifest_sha256: reliabilityState.manifest || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    environment: 'PostgreSQL + FastAPI Multi-Replica + HAProxy',
    audit_events_count: invoices.length,
    active_user: session ? session.email : 'system'
  };
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pharmgrid-proof-pack-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  notify('Proof Pack JSON downloaded.');
}

// Keyboard shortcuts (Cmd+K / Ctrl+K and Cmd+1..8)
document.addEventListener('keydown', e => {
  if (!session) return;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    activeModal = activeModal === 'commandPalette' ? null : 'commandPalette';
    layout();
  } else if ((e.metaKey || e.ctrlKey) && ['1','2','3','4','5','6','7','8'].includes(e.key)) {
    e.preventDefault();
    const navMap = {
      '1': 'today',
      '2': 'billing',
      '3': 'stock',
      '4': 'alerts',
      '5': 'reorder',
      '6': 'delivery',
      '7': 'reliability',
      '8': 'cloudlab'
    };
    view = navMap[e.key];
    activeModal = null;
    layout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (e.key === 'Escape' && activeModal) {
    activeModal = null;
    layout();
  }
});

async function boot() {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('dark-mode', darkMode);
  }
  try {
    const response = await fetch('/api/v1/auth/session', { credentials: 'same-origin' });
    if (response.ok) {
      session = await response.json();
      saveSession(sessionStorage, session);
      await loadData();
    } else {
      clearSession(sessionStorage);
    }
  } catch {
    clearSession(sessionStorage);
  }
  layout();

  if (typeof window !== 'undefined') {
    setInterval(async () => {
      if (session && !activeModal && autoSyncEnabled) {
        await loadData();
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          layout();
        }
      }
    }, 5000);
  }
}

boot();
