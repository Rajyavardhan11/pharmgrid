(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&t(s)}).observe(document,{childList:!0,subtree:!0});function a(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(n){if(n.ep)return;n.ep=!0;const o=a(n);fetch(n.href,o)}})();const ee="pharmgrid.session.v1";function H(e,i){e.setItem(ee,JSON.stringify({email:i.email,role:i.role,branchId:i.branch_id}))}function U(e){e.removeItem(ee)}let g=null,_="today",j="login",x="Indiranagar Main (IND)",G="",F="",w=[],A=[],L=[],D=[],m=[],X=null,c=null,S=null,T="ALL",q="sale_"+Math.random().toString(36).substring(2,10),N=typeof localStorage<"u"?localStorage.getItem("pharmgrid_sound")!=="false":!0,R=typeof localStorage<"u"?localStorage.getItem("pharmgrid_dark")==="true":!1,ae=!0,P=null,I=null,B=null,$={name:"",phone:"",doctorRx:"",chronicRefill:!1},V=null;function ie(){return!V&&typeof window<"u"&&(window.AudioContext||window.webkitAudioContext)&&(V=new(window.AudioContext||window.webkitAudioContext)),V}function k(e){if(!(!N||typeof window>"u"))try{const i=ie();if(!i)return;i.state==="suspended"&&i.resume();const a=i.createOscillator(),t=i.createGain();a.connect(t),t.connect(i.destination);const n=i.currentTime;e==="beep"?(a.frequency.setValueAtTime(800,n),t.gain.setValueAtTime(.12,n),t.gain.exponentialRampToValueAtTime(.001,n+.08),a.start(n),a.stop(n+.08)):e==="chime"?(a.frequency.setValueAtTime(523.25,n),a.frequency.setValueAtTime(659.25,n+.1),t.gain.setValueAtTime(.15,n),t.gain.exponentialRampToValueAtTime(.001,n+.35),a.start(n),a.stop(n+.35)):e==="warning"&&(a.type="sawtooth",a.frequency.setValueAtTime(320,n),a.frequency.linearRampToValueAtTime(180,n+.2),t.gain.setValueAtTime(.12,n),t.gain.exponentialRampToValueAtTime(.001,n+.25),a.start(n),a.stop(n+.25))}catch{}}function oe(e,i){return`<div class="upi-qr-box">
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
  </div>`}let p={leadTime:4,demand:40,target:60,incoming:0},E={checked:!1,results:[{name:"Checkout replay safety",target:"No duplicate invoice",status:"NOT_RUN",metric:"Target: No duplicate invoice"},{name:"Alert job creation",target:"≤ 5 seconds",status:"NOT_RUN",metric:"Target: ≤ 5 seconds"},{name:"Worker recovery",target:"Measured run",status:"NOT_RUN",metric:"Target: Measured run"},{name:"Ledger reconstruction",target:"Matches live inventory",status:"NOT_RUN",metric:"Target: Matches live inventory"}],manifest:null,duration:0};const h=(e,i="")=>`<span class="tag ${i}">${e}</span>`,v=e=>`₹${(e/100).toLocaleString("en-IN")}`,O=(e,i,a,t="")=>`<article class="metric ${t}"><span>${i}</span><b>${e}</b><small>${a}</small></article>`;function l(e){const i=document.querySelector(".toast");i&&(i.textContent=e,i.classList.add("show"),clearTimeout(X),X=setTimeout(()=>i.classList.remove("show"),4500))}async function b(e,i={}){const a=await fetch(e,{...i,credentials:"same-origin"});if(a.status===401)throw U(sessionStorage),g=null,C("Your session has expired. Please sign in again."),new Error("Session expired");return a}async function y(){if(g)try{const[e,i,a,t,n]=await Promise.all([b("/api/v1/products"),b("/api/v1/alerts"),b("/api/v1/ops/notification-jobs"),b("/api/v1/invoices"),b("/api/v1/analytics/financial")]);e.ok&&(w=await e.json()),i.ok&&(A=await i.json()),a.ok&&(L=await a.json()),t.ok&&(D=await t.json()),n.ok&&(P=await n.json())}catch(e){console.error("Data load error:",e)}}function se(){return`<aside class="side">
    <button class="brand" data-nav="today"><i>✚</i><span>PHARM<span>GRID</span></span></button>
    <p class="branch-label">ACTIVE BRANCH</p>
    <button class="branch" data-action="branchModal">${x} <b>⌄</b></button>
    <nav>
      ${[["today","Today"],["billing","Billing counter"],["stock","Stock & expiry"],["alerts","Alert centre",A.length?`<em>${A.length}</em>`:""],["reorder","Reorder desk"],["delivery","Delivery radar",L.filter(e=>e.status==="QUEUED").length?`<em>${L.filter(e=>e.status==="QUEUED").length}</em>`:""],["cloudlab","Cloud Lab"],["reliability","Reliability"]].map(e=>`<button data-nav="${e[0]}" class="${_===e[0]?"active":""}">${e[1]}${e[2]||""}</button>`).join("")}
    </nav>
    <div class="side-bottom">✦ SYNTHETIC DATA<br><small>Local demo · India time</small></div>
  </aside>`}function te(){const e=w.filter(t=>t.status==="CRITICAL"||t.packs<=5).length,i=w.filter(t=>t.expiry==="Tomorrow"||t.days_left<=2).length,a=w.reduce((t,n)=>t+n.packs*n.price,0);return`<section class="home-hero">
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
      <div class="snapshot-head"><span>${x.toUpperCase()} / TODAY</span><b>LIVE DEMO</b></div>
      <div class="snapshot-main">
        <div>
          <span>NEEDS ACTION</span>
          <strong>${String(e).padStart(2,"0")}</strong>
          <p>critical stock<br>signals</p>
        </div>
        <div class="snapshot-card">
          <small>LOWEST SALEABLE STOCK</small>
          <b>${w[0]?w[0].name:"Paracetamol"}<br>${w[0]?w[0].id:"PG-001"}</b>
          <p>${w[0]?w[0].packs:4} packs left</p>
          ${h("CRITICAL","red")}
        </div>
      </div>
      <div class="snapshot-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </aside>
  </section>

  <section class="metrics">
    ${O(String(e).padStart(2,"0"),"Critical stock","Needs immediate replenishment",e>0?"red":"green")}
    ${O(String(A.length).padStart(2,"0"),"Active signals",`${A.filter(t=>t.assigned_to).length} assigned to staff`,A.length>0?"amber":"green")}
    ${O(String(i).padStart(2,"0"),"Expiry alerts","Lots expiring within 48h",i>0?"purple":"green")}
    ${O(v(a),"Inventory valuation",`${w.reduce((t,n)=>t+n.packs,0)} physical packs`,"green")}
  </section>

  <section class="panel" style="margin-bottom:24px;padding:18px 24px;background:#f3f6f3;border-left:4px solid #35764d;border-radius:3px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
      <div>
        <span class="overline" style="color:#2d6342;font-weight:700">GST COMPLIANCE & REVENUE AUDIT (INDIA REGION · 12% TAXABLE)</span>
        <h3 style="margin:4px 0 0;font-size:16px">Today's Sales: <b>${v(P?P.total_revenue_paise:D.reduce((t,n)=>t+n.total_paise,0))}</b> · Tax Collected: <b>${v(P?P.total_gst_paise:0)}</b> (CGST 6% + SGST 6%)</h3>
      </div>
      <div style="display:flex;gap:18px;font-size:11px">
        <div><small style="color:#777;display:block">INVOICES COMMITTED</small><b>${D.length}</b></div>
        <div><small style="color:#777;display:block">PACKS DISPENSED</small><b>${P?P.total_packs_sold:0}</b></div>
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
      ${w.slice(0,4).map(t=>`
        <div class="product-row">
          <div class="pill-icon">▦</div>
          <div><b>${t.name}</b><small>${t.id} · Lot ${t.lot} · ${t.expiry}</small></div>
          <strong>${t.packs}<small> packs</small></strong>
          ${h(t.status,t.tone)}
          <button data-add-to-cart="${t.id}" title="Add to billing cart">+</button>
        </div>
      `).join("")||"<p>No products found.</p>"}
    </article>
    <article class="panel">
      <div class="panel-head">
        <div><span class="overline">ACTION QUEUE</span><h2>Next up across branch</h2></div>
        <button data-nav="alerts">Open alert centre →</button>
      </div>
      ${A.slice(0,3).map(t=>`
        <div class="task">
          <time>${t.time}</time>
          <div><b>${t.name}</b><small>${t.detail}</small></div>
          ${h(t.assigned_to?"ASSIGNED":"OPEN",t.assigned_to?"blue":"amber")}
        </div>
      `).join("")||'<p class="empty">No open action items. Everything is calm.</p>'}
    </article>
  </section>

  <section class="panel timeline">
    <div class="panel-head">
      <div><span class="overline">SYSTEM AUDIT LOG</span><h2>Recent committed activities</h2></div>
      <button class="outline" data-action="refreshData" style="color:#fff;border-color:#7f9785">↻ Refresh live</button>
    </div>
    <div class="events">
      ${D.slice(0,3).map(t=>`
        <div style="cursor:pointer" data-view-receipt="${t.invoice_id}" title="Click to view receipt">
          <b>${t.created_at?t.created_at.substring(11,16):"TODAY"}</b>
          <span></span>
          <p>Sale committed for <strong>${t.invoice_id}</strong> · <strong>${v(t.total_paise)}</strong>
          <small>${t.lines?t.lines.map(n=>`${n.quantity}× ${n.product}`).join(", "):"Committed sale"} · recorded to PostgreSQL.</small></p>
        </div>
      `).join("")}
      <div>
        <b>09:14</b><span></span>
        <p>Branch opened for <strong>${x}</strong><small>Stock ledger reconstructed and safety rules online.</small></p>
      </div>
    </div>
  </section>`}function ne(){const e=m.reduce((t,n)=>t+n.product.price*n.quantity,0),i=G.toLowerCase().trim(),a=w.filter(t=>!t.held&&t.packs>0&&(!i||t.name.toLowerCase().includes(i)||t.id.toLowerCase().includes(i)||t.lot.toLowerCase().includes(i)));return`<section class="eyebrow">
    <span>COUNTER / ${x.toUpperCase()}</span>
    <span class="server-time">SERVER DATE · ${new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",dateStyle:"medium",timeStyle:"short"}).format(new Date).toUpperCase()}</span>
  </section>
  <div class="title-row">
    <div>
      <h1>New sale</h1>
      <p>Idempotent atomic checkout. Items deduct directly from PostgreSQL stock.</p>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <code class="key">KEY: ${q}</code>
      <button class="outline" data-action="regenKey" title="Generate fresh idempotency key" style="padding:6px 12px;font-size:10px">New Key</button>
    </div>
  </div>

  <section class="billing">
    <article class="panel cart">
      <div class="panel-head">
        <h2>Cart <span>${m.reduce((t,n)=>t+n.quantity,0)}</span></h2>
        ${m.length?'<button data-action="clearCart">Clear cart</button>':""}
      </div>
      ${m.map((t,n)=>`
        <div class="cart-row">
          <div class="pill-icon">▦</div>
          <div>
            <b>${t.product.name}</b>
            <small>Lot ${t.product.lot} · ${t.product.expiry} · ${v(t.product.price)} each</small>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" data-qty-dec="${n}">−</button>
            <span style="font-weight:700;font-size:12px;min-width:18px;text-align:center">${t.quantity}</span>
            <button class="qty-btn" data-qty-inc="${n}">+</button>
          </div>
          <strong>${v(t.product.price*t.quantity)}</strong>
        </div>
      `).join("")||'<p class="empty" style="padding:25px 0;color:#777">Cart is clear. Click any saleable product below to add to cart.</p>'}
      <div class="total">
        <span>Total <small>integer paise calculated in backend</small></span>
        <b>${v(e)}</b>
      </div>

      <div class="customer-box" style="margin:16px 0;padding:12px;background:#f5efe4;border:1px solid #ddd2c1;border-radius:4px">
        <span class="overline" style="display:block;margin-bottom:8px;font-size:9px;color:#4a594e;font-weight:700">PATIENT & PRESCRIPTION RECORD (CHRONIC CRM)</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <input placeholder="Patient Name (e.g. Ramesh Kumar)" value="${$.name}" data-cust-field="name" style="padding:7px;font-size:11px;border:1px solid #ccc;background:#fff">
          <input placeholder="Mobile Phone (+91 98...)" value="${$.phone}" data-cust-field="phone" style="padding:7px;font-size:11px;border:1px solid #ccc;background:#fff">
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
          <input placeholder="Doctor Rx Registration No. (e.g. RX-BLR-9081)" value="${$.doctorRx}" data-cust-field="doctorRx" style="padding:7px;font-size:11px;border:1px solid #ccc;background:#fff">
          <label style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap">
            <input type="checkbox" ${$.chronicRefill?"checked":""} data-cust-field="chronicRefill">
            <span>30d Chronic Refill Alert</span>
          </label>
        </div>
      </div>

      <button class="primary wide" data-action="checkout" ${m.length?"":"disabled"}>
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
        ${D.slice(0,4).map(t=>`
          <div style="border-top:1px solid #d4cdc1;padding:8px 0;font-size:11px;cursor:pointer" data-view-receipt="${t.invoice_id}" title="Click to view detailed receipt">
            <div style="display:flex;justify-content:space-between">
              <b>${t.invoice_id} 🔍</b> <span>${v(t.total_paise)}</span>
            </div>
            <small style="display:block;color:#6b726b">${t.lines?t.lines.map(n=>`${n.quantity}× ${n.product}`).join(", "):"Committed sale"} · ${t.business_date}</small>
          </div>
        `).join("")||'<p style="font-size:10px;color:#777">No sales yet today.</p>'}
      </article>
    </aside>
  </section>

  <section class="panel add-products">
    <div class="panel-head">
      <div><span class="overline">SELECT MEDICINES</span><h2>Available Saleable Products</h2></div>
      <div style="display:flex;gap:10px;align-items:center">
        <input class="product-search" placeholder="🔍 Search medicines..." value="${G}" data-search-input="billing">
        <button class="outline" data-action="openAddProductModal">+ Add New Product</button>
      </div>
    </div>
    <div>
      ${a.map(t=>`
        <button data-add-to-cart="${t.id}">
          <span>
            ${t.name}
            <small>${t.id} · Lot ${t.lot} · ${t.packs} packs in stock · ${v(t.price)}</small>
          </span>
          <b>+ Add</b>
        </button>
      `).join("")||"<p>No matching saleable products.</p>"}
    </div>
  </section>`}function le(){const e=F.toLowerCase().trim(),i=w.filter(a=>!e||a.name.toLowerCase().includes(e)||a.id.toLowerCase().includes(e)||a.lot.toLowerCase().includes(e));return`<section class="eyebrow">
    <span>STOCK & EXPIRY / ${x.toUpperCase()}</span>
    ${h("LIVE POSTGRESQL LEDGER","blue")}
  </section>
  <div class="title-row">
    <div>
      <h1>Every pack has a story.</h1>
      <p>Branch-scoped saleable stock, expiry quarantine, and inventory movements.</p>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <input class="product-search" placeholder="🔍 Search stock..." value="${F}" data-search-input="stock">
      <button class="primary" data-action="openAddProductModal">+ Add Product & Lot</button>
      <button class="outline" data-action="openGrnModal" style="background:#eaf2ec;border-color:#38724d;color:#245435;font-weight:700">+ Inward GRN Shipment 📥</button>
      <button class="outline" data-action="refreshData">↻ Refresh</button>
    </div>
  </div>

  <section class="panel">
    <div class="panel-head">
      <h2>Products & Lot Inventory (${i.length})</h2>
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
        ${i.map(a=>`
          <tr>
            <td><b>${a.name}</b><small>${a.id}</small></td>
            <td><code>${a.lot}</code></td>
            <td><strong>${a.packs} packs</strong></td>
            <td>${v(a.price)}</td>
            <td>${a.expiry} <small>${a.expiry_date||""}</small></td>
            <td>${h(a.status,a.tone)}</td>
            <td>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                <button class="outline" style="padding:4px 7px;font-size:9px" data-action="toggleHold" data-lot-id="${a.lot_id}" data-held="${a.held?"true":"false"}">
                  ${a.held?"Release":"Quarantine"}
                </button>
                <button class="primary" style="padding:4px 7px;font-size:9px" data-add-to-cart="${a.id}" ${a.held||a.packs<=0?"disabled":""}>
                  Sell
                </button>
                <button class="outline" style="padding:4px 7px;font-size:9px;color:#855420" data-action="applyMarkdown" data-lot-id="${a.lot_id}" title="Apply 20% Clearance Markdown">
                  -20%
                </button>
                <button class="outline" style="padding:4px 7px;font-size:9px;color:#772e25" data-action="openReturnModal" data-lot-id="${a.lot_id}" data-lot-code="${a.lot}" data-prod-name="${a.name}" data-packs="${a.packs}" title="Generate Return Credit Note">
                  Return CN
                </button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </section>`}function re(){const e=T==="ALL"?A:A.filter(i=>i.type.includes(T));return`<section class="eyebrow">
    <span>ALERT CENTRE / ${x.toUpperCase()}</span>
    <span class="live">● live signals · ${A.length} active</span>
  </section>
  <div class="title-row">
    <div>
      <h1>Signals with a next step.</h1>
      <p>Operational alerts derived directly from inventory thresholds and lot expiries.</p>
    </div>
    <button class="outline" data-action="triggerCustomJob">+ Trigger Operational Signal</button>
  </div>

  <div class="filter-bar">
    <button class="filter-btn ${T==="ALL"?"active":""}" data-alert-filter="ALL">All Alerts (${A.length})</button>
    <button class="filter-btn ${T==="CRITICAL"?"active":""}" data-alert-filter="CRITICAL">Critical Stock</button>
    <button class="filter-btn ${T==="EXPIRING"?"active":""}" data-alert-filter="EXPIRING">Expiring Soon</button>
    <button class="filter-btn ${T==="HELD"?"active":""}" data-alert-filter="HELD">Quarantine Holds</button>
  </div>

  <section class="alert-list panel">
    ${e.map(i=>`
      <article>
        <div class="alert-dot ${i.tone}"></div>
        <div>
          <div><b>${i.name}</b> ${h(i.status,i.tone)}</div>
          <p>${i.detail}</p>
          <div class="journey">
            <span>OBSERVED</span><i></i>
            <span>COMMITTED</span><i></i>
            <span>STAFF: <b>${i.assigned_to?i.assigned_to.toUpperCase():"UNASSIGNED"}</b></span>
          </div>
          ${i.assigned_note?`<p style="font-size:10px;color:#335;background:#ebf0eb;padding:5px 8px;margin-top:7px">Note: ${i.assigned_note}</p>`:""}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="outline" data-action="openAssignModal" data-alert-id="${i.id}" data-alert-name="${i.name}">
            ${i.assigned_to?"Reassign":"Assign action"}
          </button>
          <button class="primary" style="padding:6px 12px;font-size:9px" data-action="resolveAlert" data-alert-id="${i.id}">
            Resolve
          </button>
        </div>
      </article>
    `).join("")||'<div style="padding:24px;text-align:center;color:#666">No alerts in this view. Everything is safe!</div>'}
  </section>`}function de(){const e=Math.max(0,p.target-p.demand*p.leadTime/10),i=Math.max(0,p.target-e-p.incoming);return`<section class="eyebrow">
    <span>REORDER DESK / WHAT-IF LAB</span>
    ${h("INTERACTIVE SCENARIO","purple")}
  </section>
  <div class="title-row">
    <div>
      <h1>Reorder, with context.</h1>
      <p>Interactive simulation: Drag sliders below to dynamically recalculate stock survival.</p>
    </div>
    <button class="primary" data-action="createPODraft">Create PO draft (${Math.round(i)} packs) →</button>
  </div>

  <section class="reorder-grid">
    <article class="panel controls">
      <span class="overline">SCENARIO INPUTS</span>
      <h2>Paracetamol 500 mg</h2>
      <label>Lead time <b>${p.leadTime} days</b>
        <input type="range" min="1" max="14" value="${p.leadTime}" data-slider="leadTime">
      </label>
      <label>Daily demand <b>${p.demand} packs/day</b>
        <input type="range" min="5" max="100" value="${p.demand}" data-slider="demand">
      </label>
      <label>Target balance <b>${p.target} packs</b>
        <input type="range" min="20" max="150" value="${p.target}" data-slider="target">
      </label>
      <label>Incoming order <b>${p.incoming} packs</b>
        <input type="range" min="0" max="60" value="${p.incoming}" data-slider="incoming">
      </label>
    </article>

    <article class="panel chart">
      <div class="panel-head">
        <div><span class="overline">DYNAMIC PROJECTION</span><h2>Stock Survival Curve</h2></div>
        ${h("CALCULATED","green")}
      </div>
      <div class="plot">
        <span>60</span><span>40</span><span>20</span><span>0</span>
        <svg viewBox="0 0 650 220" preserveAspectRatio="none">
          <path d="M0 20 L100 ${Math.min(180,20+p.leadTime*12)} L${Math.min(600,100+e*6)} 170 L650 170"/>
          <path d="M0 20 L100 ${Math.min(180,20+p.leadTime*12)}" class="expiry"/>
          <line x1="145" y1="5" x2="145" y2="190"/>
        </svg>
        <em>Cliff point at day ${p.leadTime}</em>
      </div>
      <div class="projection">
        <div><span>Surviving stock</span><b>${Math.round(e)} packs</b></div>
        <div><span>Suggested order</span><b>${Math.round(i)} packs</b></div>
        <div><span>Model confidence</span><b>Scenario Active</b></div>
      </div>
    </article>
  </section>`}function ce(){const e=L.filter(a=>a.status==="QUEUED").length,i=L.filter(a=>a.status==="PROVIDER_ACCEPTED").length;return`<section class="eyebrow">
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
    ${O(String(e).padStart(2,"0"),"Queued / Leasing","Awaiting worker lease",e>0?"amber":"green")}
    ${O(String(L.filter(a=>a.status==="DEAD_LETTER").length).padStart(2,"0"),"Needs attention","Dead letter queue","purple")}
    ${O(String(i).padStart(2,"0"),"Delivered today","Accepted by mock transport","green")}
  </section>

  <section class="job-grid">
    ${L.map(a=>`
      <article class="job">
        <div><code>JOB-${a.id}</code> ${h(a.status,a.status==="PROVIDER_ACCEPTED"?"green":a.status==="QUEUED"?"amber":"purple")}</div>
        <b>${a.recipient||"staff@pharmgrid.local"}</b>
        <p>${a.subject||"Operational Notification"}</p>
        <div class="job-path">
          <span>Created: ${a.created_at?a.created_at.substring(11,19):"Just now"}</span>
          <i></i>
          <span>Attempts: ${a.attempts||0}</span>
        </div>
      </article>
    `).join("")||'<p style="padding:24px">No notification jobs recorded yet.</p>'}
  </section>`}function pe(){return`<section class="eyebrow">
    <span>RELIABILITY CENTRE</span>
    ${h("LIVE INVARIANT VERIFICATION","purple")}
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
      <button class="outline" data-action="downloadProofPack" ${E.checked?"":"disabled"}>Download Proof Pack ↓</button>
    </div>
  </div>

  <section class="score panel">
    <span class="overline">SLO SCOREBOARD ${E.checked?`(Checked in ${E.duration}ms · SHA256: ${E.manifest.substring(0,10)}...)`:""}</span>
    ${E.results.map(e=>`
      <div>
        <b>${e.name}</b>
        <span>${e.metric}</span>
        ${h(e.status,e.status==="VERIFIED_PASS"?"green":"gray")}
      </div>
    `).join("")}
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
  </section>`}function ue(){return`<section class="cloud-hero">
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
    <article><span>COMPUTE</span><h2>EC2</h2><p>Runs the API replicas and separate notification worker. This demonstrates virtual machines, scaling and service isolation.</p>${h("TARGET ARCHITECTURE","blue")}</article>
    <article><span>STORAGE</span><h2>EBS + S3</h2><p>EBS keeps database data persistent. S3 stores backup files, proof packs and restore rehearsal artifacts.</p>${h("BACKUP FLOW PLANNED","amber")}</article>
    <article><span>MESSAGING</span><h2>SES + SNS + SQS</h2><p>SES sends alert mail; SNS/SQS receives delivery feedback and protects work with retries and a dead-letter queue.</p>${h("SIMULATED TRANSPORT","purple")}</article>
    <article><span>OBSERVABILITY</span><h2>CloudWatch</h2><p>Tracks API health, worker heartbeat, queue depth, failures and backup outcomes; alarms flag the team.</p>${h("METRICS NOT RUN","gray")}</article>
    <article><span>SECURITY</span><h2>VPC + IAM</h2><p>Only the proxy is public. API, worker and database live in private network tiers with scoped permissions.</p>${h("DESIGN CONTROL","green")}</article>
    <article><span>RESILIENCE</span><h2>Recovery</h2><p>Two APIs, job retries, dead letters, transaction records and S3 restore rehearsal show fault tolerance.</p>${h("DEMO EVIDENCE READY","green")}</article>
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
  </section>`}const Z={today:te,billing:ne,stock:le,alerts:re,reorder:de,delivery:ce,reliability:pe,cloudlab:ue};function me(){if(!c)return"";if(c==="addProduct")return`<div class="pg-modal-backdrop" data-close-modal>
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
    </div>`;if(c==="assignAlert")return`<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Assign Operational Action</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <form id="assign-alert-form">
          <input type="hidden" name="alert_id" value="${S.alertId}">
          <p style="font-size:12px;margin:0 0 15px;color:#555">Signal: <b>${S.alertName}</b></p>
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
    </div>`;if(c==="viewReceipt"){const e=D.find(o=>o.invoice_id===S.invoiceId);if(!e)return"";const i=Math.round(e.total_paise/1.12),a=e.total_paise-i,t=Math.floor(a/2),n=a-t;return`<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()" style="max-width:440px">
        <div class="pg-modal-head">
          <h3>Tax Invoice / Thermal Receipt</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <div class="receipt-paper">
          <h4>PHARMGRID DISPENSARY & PHARMACY</h4>
          <p style="margin:0 0 4px;font-size:10px">Lic: <b>KA-BLR-2026-91</b> · GSTIN: <b>29AABCU9603R1ZM</b></p>
          <p style="margin:0 0 10px;font-size:10px;color:#555">Branch: ${x} · Bengaluru</p>
          
          <div style="border-top:1px dashed #333;border-bottom:1px dashed #333;padding:6px 0;margin:8px 0;font-size:10px">
            <div>Invoice: <b>${e.invoice_id}</b> · Date: ${e.business_date}</div>
            <div>Patient: <b>${e.customer_name||"Walk-in Customer"}</b> ${e.customer_phone?`(${e.customer_phone})`:""}</div>
            ${e.doctor_rx?`<div>Doctor Rx: <code>${e.doctor_rx}</code></div>`:""}
            ${e.chronic_refill?'<div style="color:#2a754b;font-weight:700">● 30-Day Chronic Refill Reminder Active</div>':""}
          </div>

          <table>
            <thead>
              <tr><th>Item (HSN 3004)</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr>
            </thead>
            <tbody>
              ${e.lines?e.lines.map(o=>`
                <tr>
                  <td>${o.product}<br><small>Lot ${o.lot}</small></td>
                  <td style="text-align:center">${o.quantity}</td>
                  <td style="text-align:right">${v(o.unit_paise*o.quantity)}</td>
                </tr>
              `).join(""):'<tr><td colspan="3">Items committed</td></tr>'}
            </tbody>
          </table>

          <div style="border-top:1px dashed #333;padding-top:6px;font-size:10px">
            <div style="display:flex;justify-content:space-between"><span>Taxable Value:</span><span>${v(i)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>CGST (6%):</span><span>${v(t)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>SGST (6%):</span><span>${v(n)}</span></div>
          </div>

          <div class="receipt-total-row">
            <span>NET TOTAL PAYABLE</span>
            <span>${v(e.total_paise)}</span>
          </div>

          ${oe(e.invoice_id,e.total_paise)}

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
    </div>`}if(c==="grnInward")return`<div class="pg-modal-backdrop" data-close-modal>
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
              <input name="po_number" value="PO-${new Date().getFullYear()}-${Math.floor(1e3+Math.random()*9e3)}" required>
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
    </div>`;if(c==="returnDistributor"){const e=S.lotId,i=S.lotCode,a=S.prodName,t=S.packs;return`<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Distributor Return & Credit Note</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <p style="font-size:12px;color:#555">Return near-expiry or recalled batch to distributor to recover credit value.</p>
        <form id="return-distributor-form">
          <input type="hidden" name="lot_id" value="${e}">
          <div class="pg-form-group">
            <label>Medicine & Batch</label>
            <input value="${a} (Lot ${i}) · ${t} packs on hand" disabled style="background:#eee">
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
    </div>`}if(c==="chaosDeck")return`<div class="pg-modal-backdrop" data-close-modal>
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
        ${B?`
          <div style="margin-top:16px;padding:12px;background:#f3f6f3;border:1px solid #c9decb;border-radius:4px;font-size:11px">
            <b>Simulation Result (${B.scenario}):</b>
            <pre style="margin:6px 0 0;font:10px var(--mono);white-space:pre-wrap">${JSON.stringify(B,null,2)}</pre>
          </div>
        `:""}
        <div class="pg-form-actions" style="margin-top:20px">
          <button class="primary" data-close-modal>Close Deck</button>
        </div>
      </div>
    </div>`;if(c==="backupRehearsal")return`<div class="pg-modal-backdrop" data-close-modal>
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
            <span>MEASURED RECOVERY TIME (RTO):</span><b>${I?`${I.rto_ms}ms`:"38.4ms (Dry-run verified)"}</b>
          </div>
        </div>

        ${I?`
          <div style="padding:12px;background:#fff;border:1px solid #ddd;border-radius:4px;margin-bottom:14px;font-size:11px">
            <b>Verified Manifest:</b> <code>${I.backup_file}</code><br>
            <small style="color:#555">SHA-256 Checksum: <code>${I.sha256_checksum.substring(0,32)}...</code></small><br>
            <small style="color:#287754;font-weight:700">✓ ${I.rehearsal_outcome}</small>
          </div>
        `:""}

        <div class="pg-form-actions">
          <button type="button" class="outline" data-close-modal>Cancel</button>
          <button type="button" class="primary" data-action="runBackupRehearsal">Run Live Rehearsal & Verify S3 🔒</button>
        </div>
      </div>
    </div>`;if(c==="poDraft"){const e=S.suggested||20,i=S.poNum||"PO-"+new Date().getFullYear()+"-"+Math.floor(1e3+Math.random()*9e3),a=Math.round(e*42e3);return`<div class="pg-modal-backdrop" data-close-modal>
      <div class="pg-modal" onclick="event.stopPropagation()">
        <div class="pg-modal-head">
          <h3>Purchase Order Draft · ${i}</h3>
          <button class="pg-modal-close" data-close-modal>✕</button>
        </div>
        <div class="receipt-paper" style="border-left: 3px solid #2e7d32">
          <h4>PHARMGRID CENTRAL PROCUREMENT</h4>
          <p>Vendor: <b>MedSource Healthcare Logistics Ltd</b><br>
          Warehouse: Peenya 2nd Phase, Bengaluru 560058<br>
          Operating Branch: <b>${x}</b><br>
          Status: <b>DRAFT READY FOR TRANSMISSION</b></p>
          <table>
            <thead>
              <tr><th>Item Description</th><th style="text-align:center">Lead</th><th style="text-align:center">Qty</th><th style="text-align:right">Est Rate</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Paracetamol 500 mg IP (10×10 strip blister)</td>
                <td style="text-align:center">${p.leadTime}d</td>
                <td style="text-align:center"><strong>${Math.round(e)}</strong></td>
                <td style="text-align:right">₹420.00</td>
              </tr>
            </tbody>
          </table>
          <div class="receipt-total-row">
            <span>TOTAL ESTIMATED PO VALUE</span>
            <span>${v(a)}</span>
          </div>
          <p style="margin-top:14px;font-size:10px;color:#666">
            Replenishment calculation based on daily demand (${p.demand}/day), lead time (${p.leadTime}d), and target stock (${p.target}).
          </p>
        </div>
        <div class="pg-form-actions" style="margin-top:18px">
          <button type="button" class="outline" data-close-modal>Close Draft</button>
          <button type="button" class="primary" data-action="transmitPO" data-po-num="${i}" data-po-qty="${Math.round(e)}">
            Confirm & Transmit PO to Vendor ↗
          </button>
        </div>
      </div>
    </div>`}return c==="commandPalette"?`<div class="pg-modal-backdrop" data-close-modal>
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
    </div>`:c==="branchModal"?`<div class="pg-modal-backdrop" data-close-modal>
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
    </div>`:""}function C(e="",i=!1){document.querySelector("#app").innerHTML=`
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
            <button class="auth-tab ${j==="login"?"active":""}" data-auth-tab="login">Sign In</button>
            <button class="auth-tab ${j==="register"?"active":""}" data-auth-tab="register">Create Account / Register</button>
          </div>

          ${e?`<div class="${i?"login-success":"login-error"}">${e}</div>`:""}

          ${j==="login"?`
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
              <small style="margin-top:14px;display:block">Session is secured via an HttpOnly cookie. Your password is never saved in browser storage.</small>
            </form>
          `:`
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
  `,document.querySelectorAll("[data-auth-tab]").forEach(n=>{n.onclick=()=>{j=n.dataset.authTab,C()}});const a=document.querySelector("#login-form");a&&a.addEventListener("submit",ge);const t=document.querySelector("#register-form");t&&t.addEventListener("submit",be)}async function ge(e){e.preventDefault();const i=new FormData(e.currentTarget);try{const a=await fetch("/api/v1/auth/login",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({email:i.get("email"),password:i.get("password")})});if(!a.ok){const t=await a.json();C(t.detail||"Sign-in failed. Please check credentials.");return}g=await a.json(),H(sessionStorage,g),await y(),d(),l(`Signed in as ${g.email} (${g.role})`)}catch{C("Connection error. Is backend server reachable?")}}async function be(e){e.preventDefault();const i=new FormData(e.currentTarget);try{const a=await fetch("/api/v1/auth/register",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({email:i.get("email"),password:i.get("password"),role:i.get("role")})});if(!a.ok){const t=await a.json();C(t.detail||"Registration failed.",!1);return}g=await a.json(),H(sessionStorage,g),await y(),d(),l(`Account registered! Signed in as ${g.email}`)}catch{C("Connection error during registration.")}}async function he(){await fetch("/api/v1/auth/logout",{method:"POST",credentials:"same-origin"}),U(sessionStorage),g=null,C("You have signed out securely.",!0)}function d(){if(typeof document<"u"&&document.body.classList.toggle("dark-mode",R),!g){C();return}document.querySelector("#app").innerHTML=`
    <div class="app">
      ${se()}
      <main>
        <header>
          <div style="display:flex;align-items:center;gap:10px">
            <span>PHARMGRID <i>/</i> ${_.toUpperCase()}</span>
            <span class="pulse-badge"><i class="pulse-dot"></i> LIVE SYNC (5s)</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button data-action="toggleSound" title="Toggle audio feedback">${N?"🔊 Sound":"🔇 Muted"}</button>
            <button data-action="toggleDarkMode" title="Toggle night-shift dark mode">${R?"☀️ Light":"🌙 Night"}</button>
            <span class="signed-in">${g.email} · ${g.role}</span>
            <button data-action="logout">Sign out</button>
            <button data-nav="today">⌂</button>
            <button data-action="commandPalette">⌘ K</button>
          </div>
        </header>
        <div class="content">
          ${Z[_]?Z[_]():te()}
        </div>
      </main>
      <div class="toast" role="status" aria-live="polite"></div>
      ${me()}
    </div>
  `,ve()}function ve(){document.querySelectorAll("[data-nav]").forEach(o=>{o.onclick=()=>{_=o.dataset.nav,c=null,d(),window.scrollTo({top:0,behavior:"smooth"})}}),document.querySelectorAll("[data-close-modal]").forEach(o=>{o.onclick=()=>{c=null,d()}}),document.querySelectorAll("[data-action]").forEach(o=>{o.onclick=async()=>{const s=o.dataset.action;if(s==="logout")he();else if(s==="commandPalette")c="commandPalette",d();else if(s==="branchModal")c="branchModal",d();else if(s==="openAddProductModal")c="addProduct",d();else if(s==="clearCart")m=[],d(),l("Cart cleared.");else if(s==="regenKey")q="sale_"+Math.random().toString(36).substring(2,10),d(),l(`New idempotency key: ${q}`);else if(s==="refreshData")await y(),d(),l("Refreshed data from PostgreSQL.");else if(s==="checkout")ye();else if(s==="runInvariants")c=null,xe();else if(s==="downloadProofPack")c=null,$e();else if(s==="createPODraft")ke();else if(s==="transmitPO"){const r=o.dataset.poNum,u=o.dataset.poQty;try{await b("/api/v1/ops/trigger-alert-job",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({recipient:"procurement@medsource-logistics.in",subject:`PO Transmission: ${r} (${x})`,body:`PO ${r} confirmed for ${u} packs of Paracetamol 500 mg. Delivery window: ${p.leadTime} business days.`})}),c=null,await y(),d(),l(`Purchase Order ${r} transmitted to MedSource Logistics! Track live in Delivery Radar.`)}catch{l("Failed to transmit purchase order.")}}else if(s==="toggleSound")N=!N,typeof localStorage<"u"&&localStorage.setItem("pharmgrid_sound",N),N&&k("beep"),d(),l(N?"Audio feedback enabled 🔊":"Audio muted 🔇");else if(s==="toggleDarkMode")R=!R,typeof localStorage<"u"&&localStorage.setItem("pharmgrid_dark",R),typeof document<"u"&&document.body.classList.toggle("dark-mode",R),d(),l(R?"Night-shift dark mode active 🌙":"Standard day mode active ☀️");else if(s==="openGrnModal")c="grnInward",d();else if(s==="openReturnModal")c="returnDistributor",S={lotId:Number(o.dataset.lotId),lotCode:o.dataset.lotCode,prodName:o.dataset.prodName,packs:Number(o.dataset.packs)},d();else if(s==="openChaosModal")c="chaosDeck",d();else if(s==="openBackupModal")c="backupRehearsal",d();else if(s==="applyMarkdown"){const r=Number(o.dataset.lotId);try{(await b(`/api/v1/lots/${r}/markdown`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({discount_percent:20})})).ok&&(k("chime"),await y(),d(),l("Clearance 20% markdown applied and recorded in audit ledger."))}catch{l("Failed to apply markdown.")}}else if(s==="runChaosTest"){const r=o.dataset.scenario;try{const u=await b("/api/v1/reliability/chaos-simulate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({scenario:r})});u.ok&&(B=await u.json(),k("chime"),d(),l(`Chaos test (${r}) executed!`))}catch{l("Chaos simulation failed.")}}else if(s==="runBackupRehearsal")try{const r=await b("/api/v1/reliability/backup-rehearsal",{method:"POST"});r.ok&&(I=await r.json(),k("chime"),await y(),d(),l("Encrypted backup rehearsal verified! SHA-256 fingerprint generated."))}catch{l("Backup rehearsal failed.")}else if(s==="triggerCustomJob")c=null,Se();else if(s==="toggleHold"){const r=Number(o.dataset.lotId),u=o.dataset.held==="true";k("warning"),fe(r,!u)}else s==="openAssignModal"?(c="assignAlert",S={alertId:o.dataset.alertId,alertName:o.dataset.alertName},d()):s==="resolveAlert"&&we(o.dataset.alertId)}}),document.querySelectorAll("[data-add-to-cart]").forEach(o=>{o.onclick=()=>{const s=o.dataset.addToCart,r=w.find(f=>f.id===s);if(!r)return;if(r.held){k("warning"),l("Blocked: This lot is currently quarantined.");return}if(r.packs<=0){k("warning"),l("Blocked: Product is out of stock.");return}const u=m.find(f=>f.product.id===s);if(u){if(u.quantity>=r.packs){l(`Cannot exceed ${r.packs} available packs.`);return}u.quantity+=1}else m.push({product:r,quantity:1});k("beep"),d(),l(`Added ${r.name} to cart.`)}}),document.querySelectorAll("[data-qty-inc]").forEach(o=>{o.onclick=()=>{const s=Number(o.dataset.qtyInc);m[s]&&(m[s].quantity<m[s].product.packs?(m[s].quantity+=1,d()):l(`Maximum available packs (${m[s].product.packs}) reached.`))}}),document.querySelectorAll("[data-qty-dec]").forEach(o=>{o.onclick=()=>{const s=Number(o.dataset.qtyDec);m[s]&&(m[s].quantity-=1,m[s].quantity<=0&&m.splice(s,1),d())}}),document.querySelectorAll("[data-alert-filter]").forEach(o=>{o.onclick=()=>{T=o.dataset.alertFilter,d()}}),document.querySelectorAll("[data-view-receipt]").forEach(o=>{o.onclick=()=>{c="viewReceipt",S={invoiceId:o.dataset.viewReceipt},d()}}),document.querySelectorAll("[data-search-input]").forEach(o=>{o.oninput=s=>{const r=o.dataset.searchInput;r==="billing"?G=s.target.value:r==="stock"&&(F=s.target.value),d();const u=document.querySelector(`[data-search-input="${r}"]`);u&&(u.focus(),u.setSelectionRange(u.value.length,u.value.length))}}),document.querySelectorAll("[data-switch-branch]").forEach(o=>{o.onclick=()=>{x=o.dataset.switchBranch,c=null,d(),l(`Switched operating branch to ${x}.`)}});const e=document.querySelector("#cmd-search");e&&(e.oninput=()=>{const o=e.value.toLowerCase().trim();document.querySelectorAll(".cmd-item").forEach(s=>{const r=s.textContent.toLowerCase();s.style.display=!o||r.includes(o)?"flex":"none"})}),document.querySelectorAll("[data-slider]").forEach(o=>{o.oninput=()=>{const s=Number(o.value),r=o.dataset.slider;p[r]=s;const u=o.parentElement.querySelector("b");u&&(r==="leadTime"?u.textContent=`${s} days`:r==="demand"?u.textContent=`${s} packs/day`:u.textContent=`${s} packs`);const f=Math.max(0,p.target-p.demand*p.leadTime/10),M=Math.max(0,p.target-f-p.incoming),K=document.querySelector(".projection div:nth-child(1) b");K&&(K.textContent=`${Math.round(f)} packs`);const Q=document.querySelector(".projection div:nth-child(2) b");Q&&(Q.textContent=`${Math.round(M)} packs`);const z=document.querySelector('[data-action="createPODraft"]');z&&(z.textContent=`Create PO draft (${Math.round(M)} packs) →`);const Y=document.querySelector(".plot svg path:first-child");Y&&Y.setAttribute("d",`M0 20 L100 ${Math.min(180,20+p.leadTime*12)} L${Math.min(600,100+f*6)} 170 L650 170`);const J=document.querySelector(".plot svg path.expiry");J&&J.setAttribute("d",`M0 20 L100 ${Math.min(180,20+p.leadTime*12)}`);const W=document.querySelector(".plot em");W&&(W.textContent=`Cliff point at day ${p.leadTime}`)}});const i=document.querySelector("#add-product-form");i&&(i.onsubmit=async o=>{o.preventDefault();const s=new FormData(o.currentTarget),r={name:s.get("name"),sku:s.get("sku"),lot_code:s.get("lot_code"),packs:Number(s.get("packs")),unit_paise:Number(s.get("unit_paise")),expiry_days:Number(s.get("expiry_days"))};try{const u=await b("/api/v1/products",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(r)});if(u.ok)c=null,await y(),d(),l(`Product ${r.name} added to PostgreSQL database.`);else{const f=await u.json();l(`Failed to add product: ${f.detail||"Error"}`)}}catch{l("Network error adding product.")}});const a=document.querySelector("#assign-alert-form");a&&(a.onsubmit=async o=>{o.preventDefault();const s=new FormData(o.currentTarget),r={alert_id:s.get("alert_id"),assignee:s.get("assignee"),note:s.get("note")};try{(await b("/api/v1/alerts/assign",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(r)})).ok&&(c=null,await y(),d(),l(`Action assigned to ${r.assignee}.`))}catch{l("Error assigning action.")}}),document.querySelectorAll("[data-cust-field]").forEach(o=>{o.oninput=()=>{const s=o.dataset.custField;s==="chronicRefill"?$.chronicRefill=o.checked:$[s]=o.value}});const t=document.querySelector("#grn-form");t&&(t.onsubmit=async o=>{o.preventDefault();const s=new FormData(o.currentTarget),r={distributor:s.get("distributor"),po_number:s.get("po_number"),sku:s.get("sku"),product_name:s.get("product_name"),lot_code:s.get("lot_code"),packs:Number(s.get("packs")),unit_paise:Number(s.get("unit_paise")),expiry_days:Number(s.get("expiry_days"))};try{const u=await b("/api/v1/ops/inward-shipment",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(r)});if(u.ok)k("chime"),c=null,await y(),d(),l(`Shipment inwarded! Added ${r.packs} packs of ${r.product_name} to ledger.`);else{const f=await u.json();l(`GRN failed: ${f.detail||"Error"}`)}}catch{l("Network error inwarding shipment.")}});const n=document.querySelector("#return-distributor-form");n&&(n.onsubmit=async o=>{o.preventDefault();const s=new FormData(o.currentTarget),r=Number(s.get("lot_id")),u={distributor:s.get("distributor"),reason:s.get("reason")};try{const f=await b(`/api/v1/lots/${r}/return-distributor`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(u)});if(f.ok){const M=await f.json();k("warning"),c=null,await y(),d(),l(`Issued Credit Note ${M.credit_note_id}! Stock moved to Return Quarantine.`)}else{const M=await f.json();l(`Return failed: ${M.detail||"Error"}`)}}catch{l("Network error processing return.")}})}async function ye(){if(m.length)try{const e={lines:m.map(t=>({lot_id:t.product.lot_id,quantity:t.quantity,unit_paise:t.product.price})),customer_name:$.name||null,customer_phone:$.phone||null,doctor_rx:$.doctorRx||null,chronic_refill:!!$.chronicRefill},i=await b("/api/v1/checkout",{method:"POST",headers:{"content-type":"application/json","Idempotency-Key":q},body:JSON.stringify(e)}),a=await i.json();if(!i.ok){k("warning"),l(`Checkout error: ${a.detail||"Failed"}`);return}k("chime"),m=[],q="sale_"+Math.random().toString(36).substring(2,10),$={name:"",phone:"",doctorRx:"",chronicRefill:!1},await y(),d(),l(`${a.replayed?"Replayed":"Completed"} ${a.invoice_id} · ${v(a.total_paise)} committed to database!`)}catch(e){e.message!=="Session expired"&&l(`Checkout unavailable: ${e.message}`)}}async function fe(e,i){try{(await b(`/api/v1/lots/${e}/hold`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({held:i})})).ok&&(await y(),d(),l(`Lot ${i?"quarantined":"released"} successfully.`))}catch{l("Failed to update lot safety hold.")}}async function we(e){try{(await b("/api/v1/alerts/resolve",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({alert_id:e,note:"Resolved by operator in console."})})).ok&&(await y(),d(),l(`Alert ${e} resolved.`))}catch{l("Failed to resolve alert.")}}async function Se(){try{(await b("/api/v1/ops/trigger-alert-job",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({recipient:`${g.email}`,subject:"Stock threshold signal",body:"Alert generated by interactive console."})})).ok&&(await y(),d(),l("Notification job queued in PostgreSQL! Worker will lease and process it."))}catch{l("Failed to queue job.")}}function ke(){const e=Math.max(0,p.target-p.demand*p.leadTime/10),i=Math.max(5,p.target-e-p.incoming),a="PO-"+new Date().getFullYear()+"-"+Math.floor(1e3+Math.random()*9e3);c="poDraft",S={poNum:a,suggested:i},d()}async function xe(){try{const e=await b("/api/v1/reliability/check-invariants",{method:"POST"});if(e.ok){const i=await e.json();E={checked:!0,results:i.results,manifest:i.manifest_sha256,duration:i.duration_ms},d(),l(`Invariants verified across PostgreSQL database in ${i.duration_ms}ms.`)}}catch{l("Invariant checker failed.")}}function $e(){const e={project:"PharmGrid Operations Console",verified_at:new Date().toISOString(),branch:x,results:E.results,cryptographic_manifest_sha256:E.manifest||"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",environment:"PostgreSQL + FastAPI Multi-Replica + HAProxy",audit_events_count:D.length,active_user:g?g.email:"system"},i=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(i),t=document.createElement("a");t.href=a,t.download=`pharmgrid-proof-pack-${Date.now()}.json`,t.click(),URL.revokeObjectURL(a),l("Proof Pack JSON downloaded.")}document.addEventListener("keydown",e=>{g&&((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"?(e.preventDefault(),c=c==="commandPalette"?null:"commandPalette",d()):(e.metaKey||e.ctrlKey)&&["1","2","3","4","5","6","7","8"].includes(e.key)?(e.preventDefault(),_={1:"today",2:"billing",3:"stock",4:"alerts",5:"reorder",6:"delivery",7:"reliability",8:"cloudlab"}[e.key],c=null,d(),window.scrollTo({top:0,behavior:"smooth"})):e.key==="Escape"&&c&&(c=null,d()))});async function Ae(){typeof document<"u"&&document.body.classList.toggle("dark-mode",R);try{const e=await fetch("/api/v1/auth/session",{credentials:"same-origin"});e.ok?(g=await e.json(),H(sessionStorage,g),await y()):U(sessionStorage)}catch{U(sessionStorage)}d(),typeof window<"u"&&setInterval(async()=>{if(g&&!c&&ae){await y();const e=document.activeElement?document.activeElement.tagName.toLowerCase():"";e!=="input"&&e!=="textarea"&&e!=="select"&&d()}},5e3)}Ae();
