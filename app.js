const app = document.getElementById('app');
const userArea = document.getElementById('user-area');
const navHistory = document.getElementById('nav-history');

const PRODUCTS = [
  {id:'h1',type:'Health',title:'Basic Health Plan',price:2000000,desc:'Annual coverage with standard benefits.'},
  {id:'h2',type:'Health',title:'Family Health Plus',price:3000000,desc:'Covers family members with maternity add-on.'},
  {id:'h3',type:'Health',title:'Senior Care',price:4500000,desc:'Extended benefits for seniors.'},

  {id:'c1',type:'Car',title:'Compact Car Protection',price:1500000,desc:'Suitable for small cars.'},
  {id:'c2',type:'Car',title:'Sedan Secure',price:2500000,desc:'Comprehensive for sedans.'},
  {id:'c3',type:'Car',title:'Premium Auto Guard',price:4000000,desc:'High-end car protection.'},

  {id:'l1',type:'Life',title:'Life Starter',price:120000,desc:'Basic life insurance.'},
  {id:'l2',type:'Life',title:'Life Growth',price:220000,desc:'Higher coverage options.'},
  {id:'l3',type:'Life',title:'Life Elite',price:420000,desc:'Top-tier life product.'}
];

function readDB(){ return JSON.parse(localStorage.getItem('insure_db')||'{}'); }
function writeDB(db){ localStorage.setItem('insure_db',JSON.stringify(db)); }
function ensureDB(){
  const db = readDB();
  if(!db.users) db.users=[];
  if(!db.session) db.session=null;
  if(!db.purchases) db.purchases=[];
  writeDB(db);
}
ensureDB();

// Routing
function navigate(){
  const db = readDB();
  const hash = location.hash || '#/';

  let path = "";
  let id = null;
  let query = {};

  if(hash.startsWith("#/")){
    const [fullPath, queryString] = hash.slice(2).split("?");
    [path, id] = fullPath.split("/");
    if(queryString){
      query = Object.fromEntries(new URLSearchParams(queryString));
    }
  }

  // Jika Belum Login, Paksa ke Login Kecuali Signup
  if(!db.session && path!=="login" && path!=="signup"){
    location.hash = "#/login";
    return;
  }

  renderRoute(path||'', id, query);
  renderUserArea();
}
window.addEventListener('hashchange',navigate);
window.addEventListener('load',navigate);

function renderUserArea(){
  const db = readDB();
  if(db.session){
    userArea.innerHTML = `<span class="small">Hi, ${db.session.name}</span> <a href="#/profile" class="btn ghost" id="logoutBtn">Logout</a>`;
    document.getElementById('logoutBtn').addEventListener('click',()=>{
      const db2 = readDB(); db2.session=null; writeDB(db2); navigate();
    });
    navHistory.style.display = 'inline';
  }else{
    userArea.innerHTML = `<a href="#/login" class="btn">Login</a> <a href="#/signup" class="btn ghost">Sign Up</a>`;
    navHistory.style.display = 'none';
  }
}

function renderRoute(path,id,query={}){
  switch(path){
    case 'login': renderLogin(); break;
    case 'signup': renderSignUp(); break;
    case 'products': renderProducts(query.type); break;
    case 'product': renderProductDetail(id); break;
    case 'buy-car': renderBuyCar(id); break;
    case 'buy-health': renderBuyHealth(id); break;
    case 'buy-life': renderBuyLife(id); break;
    case 'checkout': renderCheckout(); break;
    case 'history': renderHistory(); break;
    case 'profile': renderProfile(); break;
    default: renderHome();
  }
}

// Login Page
function renderLogin(){
  const db = readDB();
  if(db.session){ location.hash = '#/'; return; }
  app.innerHTML = `
  <section class="card">
    <h3>Login</h3>
    <form id="loginForm">
      <label>Email<input type="email" id="li-email" class="input"></label>
      <label>Password<input type="password" id="li-password" class="input"></label>
      <div style="margin-top:12px">
        <button class="btn" type="submit">Login</button>
        <a href="#/signup" class="btn ghost">Sign Up</a>
      </div>
      <div id="li-msg"></div>
    </form>
  </section>`;

  document.getElementById('loginForm').addEventListener('submit',function(e){
    e.preventDefault();
    const email=document.getElementById('li-email').value.trim();
    const pw=document.getElementById('li-password').value;
    const msg=document.getElementById('li-msg'); msg.innerHTML='';

    const errors=[];
    if(!email) errors.push('Email is required');
    else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Invalid email format');
    if(!pw) errors.push('Password is required');

    if(errors.length){ msg.innerHTML=`<div class="error">${errors.join('<br>')}</div>`; return; }
    const u=db.users.find(x=>x.email===email && x.password===pw);
    if(!u){ msg.innerHTML=`<div class="error">Incorrect email or password</div>`; return; }
    db.session={email:u.email,name:u.name}; writeDB(db);
    msg.innerHTML=`<div class="success">Login successful</div>`;
    setTimeout(()=>{location.hash='#/';},800);
  });
}

// Sign Up Page
function renderSignUp(){
  const db=readDB(); if(db.session){location.hash='#/';return;}
  app.innerHTML=`
  <section class="card">
    <h3>Sign Up</h3>
    <form id="signupForm">
      <label>Email<input type="email" id="su-email" class="input"></label>
      <label>Password<input type="password" id="su-password" class="input"></label>
      <label>Confirm Password<input type="password" id="su-password2" class="input"></label>
      <label>Full Name<input type="text" id="su-name" class="input"></label>
      <label>Phone Number<input type="text" id="su-phone" class="input" placeholder="08..."></label>
      <div style="margin-top:12px">
        <button class="btn" type="submit">Create Account</button>
        <a href="#/" class="btn ghost">Home</a>
        <a href="#/login" class="btn ghost">Login</a>
      </div>
      <div id="su-msg"></div>
    </form>
  </section>`;

  document.getElementById('signupForm').addEventListener('submit',function(e){
    e.preventDefault();
    const email=document.getElementById('su-email').value.trim();
    const pw=document.getElementById('su-password').value;
    const pw2=document.getElementById('su-password2').value;
    const name=document.getElementById('su-name').value.trim();
    const phone=document.getElementById('su-phone').value.trim();
    const msg=document.getElementById('su-msg'); msg.innerHTML='';

    const errors=[];
    if(!email) errors.push('Email is required');
    else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Invalid email format');
    if(!pw) errors.push('Password is required');
    else if(pw.length<8) errors.push('Password min 8 chars');
    if(pw!==pw2) errors.push('Password and confirmation must match');
    if(!name) errors.push('Name required');
    else if(name.length<3||name.length>32) errors.push('Name 3-32 chars');
    else if(/\d/.test(name)) errors.push('Name cannot contain numbers');
    if(!phone) errors.push('Phone required');
    else if(!/^08\d{8,14}$/.test(phone)) errors.push('Phone must start with 08 and 10-16 digits');

    if(errors.length){ msg.innerHTML=`<div class="error">${errors.join('<br>')}</div>`; return; }
    if(db.users.some(u=>u.email===email)){ msg.innerHTML=`<div class="error">Email already used</div>`; return; }
    db.users.push({email,password:pw,name,phone}); writeDB(db);
    msg.innerHTML=`<div class="success">Account created. <a href="#/login">Login now</a></div>`;
    document.getElementById('signupForm').reset();
  });
}

// Home
function renderHome(){
  app.innerHTML = `
    <section class="card">
      <h3>Welcome to Coverfy</h3>
      <p>Pilih jenis asuransi yang kamu butuhkan:</p>
      
      <!-- Kategori -->
      <div class="category-grid">
        <a href="#/products?type=Car" class="category-card">
          <i class="fa-solid fa-car fa-2x"></i>
          <span>Mobil</span>
        </a>
        <a href="#/products?type=Health" class="category-card">
          <i class="fa-solid fa-heart-pulse fa-2x"></i>
          <span>Kesehatan</span>
        </a>
        <a href="#/products?type=Life" class="category-card">
          <i class="fa-solid fa-user-shield fa-2x"></i>
          <span>Jiwa</span>
        </a>
      </div>
    </section>
  `;
}

// Helpers
function formatCurrency(n){return n.toLocaleString('id-ID');}
function calcAge(dobStr){const dob=new Date(dobStr);const diff=new Date()-dob;return Math.floor(diff/(365.25*24*3600*1000));}

// Seed Demo User
(function seed(){ const db=readDB(); if(!db.users.some(u=>u.email==='student@example.com')){ db.users.push({email:'student@example.com',password:'password123',name:'Student Tester',phone:'081234567890'}); writeDB(db);} })();

// Render Products
function renderProducts(typeFilter=null){
  let list = PRODUCTS;
  if(typeFilter){
    list = PRODUCTS.filter(p => p.type.toLowerCase() === typeFilter.toLowerCase());
  }

  app.innerHTML = `
    <section class="card">
      <h3>${typeFilter ? typeFilter + ' Insurance' : 'All Products'}</h3>
      <div class="grid">
        ${list.length ? list.map(p => `
          <div class="product-card">
            <div class="product-type">${p.type}</div>
            <h4>${p.title}</h4>
            <p class="small">${p.desc}</p>
            <p class="kv"><strong>Base price</strong><span>Rp ${formatCurrency(p.price)}</span></p>
            <div style="margin-top:8px"><a href="#/product/${p.id}" class="btn">View</a></div>
          </div>
        `).join('') : `<p>No products found for this category.</p>`}
      </div>
      <div style="margin-top:12px">
  <a href="#/" class="btn ghost">Back to Home</a>
</div>
    </section>
  `;
}

// Product Detail
function renderProductDetail(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p){ app.innerHTML = `<section class="card"><p>Product not found</p></section>`; return; }
  let buyLink = '#/';
  if(p.type==='Car') buyLink = `#/buy-car/${p.id}`;
  if(p.type==='Health') buyLink = `#/buy-health/${p.id}`;
  if(p.type==='Life') buyLink = `#/buy-life/${p.id}`;

  app.innerHTML = `
    <section class="card">
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div style="flex:1">
          <h2>${p.title}</h2>
          <div class="small product-type">${p.type}</div>
          <p class="small">${p.desc} (sample details inspired by market competitors.)</p>
          <p class="kv"><strong>Price (base)</strong><span>Rp ${formatCurrency(p.price)}</span></p>
          <div style="margin-top:12px">
            <a href="${buyLink}" class="btn">Buy</a>
            <a href="#/products" class="btn ghost">Back to Products</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Profile
function renderProfile(){
  const db = readDB(); if(!db.session){ location.hash = '#/login'; return; }
  app.innerHTML = `
    <section class="card">
      <h3>Profile</h3>
      <p><strong>Name:</strong> ${db.session.name}</p>
      <p><strong>Email:</strong> ${db.session.email}</p>
      <p><strong>Phone:</strong> ${db.users.find(u=>u.email===db.session.email)?.phone || '-'}</p>
      <div style="margin-top:12px">
        <button class="btn" id="btn-clear">Sign out & Clear local data</button>
      </div>
    </section>
  `;
  document.getElementById('btn-clear').addEventListener('click', ()=>{
    if(confirm('This will clear all local data (insure_db). Continue?')){
      localStorage.removeItem('insure_db');
      ensureDB();
      location.hash = '#/login';
      location.reload();
    }
  });
}

// Buy Car
function renderBuyCar(productId){
  const db = readDB(); if(!db.session){ location.hash = '#/login'; return; }
  const p = PRODUCTS.find(x=>x.id===productId);
  app.innerHTML = `
    <section class="card">
      <h3>Buy Car Insurance ${p? '- ' + p.title : ''}</h3>
      <form id="carForm">
        <label>Merk Mobil<input class="input" id="car-merk" required></label>
        <label>Jenis Mobil<input class="input" id="car-jenis" required></label>
        <div class="form-row">
          <label>Tahun Pembuatan<input class="input" id="car-year" type="number" required></label>
          <label>Harga Mobil (Rp)<input class="input" id="car-price" type="number" required></label>
        </div>
        <label>Nomor Plat<input class="input" id="car-plat" required></label>
        <label>Nomor Mesin<input class="input" id="car-engine" required></label>
        <label>Nomor Rangka<input class="input" id="car-chassis" required></label>
        <label>Nama Pemilik<input class="input" id="car-owner" required></label>
        <label>Foto (front, back, left, right, dashboard, engine) <input class="input" id="car-photos" type="file" multiple accept="image/*" required></label>
        <div style="margin-top:12px">
          <button class="btn" type="submit">Calculate Premium</button>
          <a href="#/products" class="btn ghost">Cancel</a>
        </div>
      </form>
      <div id="car-result"></div>
    </section>
  `;

  document.getElementById('carForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const merk = document.getElementById('car-merk').value.trim();
    const jenis = document.getElementById('car-jenis').value.trim();
    const year = parseInt(document.getElementById('car-year').value);
    const price = parseFloat(document.getElementById('car-price').value);
    const plat = document.getElementById('car-plat').value.trim();
    const engine = document.getElementById('car-engine').value.trim();
    const chassis = document.getElementById('car-chassis').value.trim();
    const owner = document.getElementById('car-owner').value.trim();
    const photos = document.getElementById('car-photos').files;
    const res = document.getElementById('car-result'); res.innerHTML='';

    const errors = [];
    if(!merk||!jenis||!year||!price||!plat||!engine||!chassis||!owner) errors.push('All fields must be filled');
    if(!photos || photos.length < 6) errors.push('Please upload 6 photos (front, back, left, right, dashboard, engine)');
    if(errors.length){ res.innerHTML = `<div class="error">${errors.join('<br>')}</div>`; return; }

    const age = new Date().getFullYear() - year;
    let premium = 0;
    if(age >=0 && age <=3) premium = 0.025 * price;
    else if(age >3 && age <=5){
      premium = (price < 200000000) ? 0.04 * price : 0.03 * price;
    } else if(age > 5) {
      premium = 0.05 * price;
    }
    premium = Math.round(premium);

    const db2 = readDB();
    db2.pending = {
      type: 'Car',
      productId,
      productTitle: p ? p.title : 'Car Insurance',
      details: { merk, jenis, year, price, plat, engine, chassis, owner, photosCount: photos.length },
      premium,
      date: new Date().toISOString()
    };
    writeDB(db2);

    res.innerHTML = `<div class="success">Estimated annual premium: Rp ${formatCurrency(premium)} (age: ${age} years)</div>
      <div style="margin-top:10px"><a href="#/checkout" class="btn">Go to Checkout</a></div>`;
  });
}

// Buy Health
function renderBuyHealth(productId){
  const db = readDB(); if(!db.session){ location.hash = '#/login'; return; }
  const p = PRODUCTS.find(x=>x.id===productId);
  app.innerHTML = `
    <section class="card">
      <h3>Buy Health Insurance ${p? '- ' + p.title : ''}</h3>
      <form id="healthForm">
        <label>Nama Lengkap (KTP)<input class="input" id="h-name" required></label>
        <label>Tanggal Lahir<input class="input" id="h-dob" type="date" required></label>
        <label>Pekerjaan<input class="input" id="h-job" required></label>
        <label>Merokok?<select id="h-smoke" class="input"><option value="0">Tidak</option><option value="1">Ya</option></select></label>
        <label>Riwayat Hipertensi?<select id="h-hyper" class="input"><option value="0">Tidak</option><option value="1">Ya</option></select></label>
        <label>Diabetes?<select id="h-diabetes" class="input"><option value="0">Tidak</option><option value="1">Ya</option></select></label>
        <div style="margin-top:12px">
          <button class="btn" type="submit">Calculate Premium</button>
          <a href="#/products" class="btn ghost">Cancel</a>
        </div>
      </form>
      <div id="health-result"></div>
    </section>
  `;

  document.getElementById('healthForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('h-name').value.trim();
    const dob = document.getElementById('h-dob').value;
    const job = document.getElementById('h-job').value.trim();
    const smoke = parseInt(document.getElementById('h-smoke').value);
    const hyper = parseInt(document.getElementById('h-hyper').value);
    const diabetes = parseInt(document.getElementById('h-diabetes').value);
    const res = document.getElementById('health-result'); res.innerHTML='';

    const errors = [];
    if(!name||!dob||!job) errors.push('All fields must be filled');
    if(errors.length){ res.innerHTML = `<div class="error">${errors.join('<br>')}</div>`; return; }

    const age = calcAge(dob);
    const P = 2000000;
    let m = 0;
    if(age <= 20) m = 0.1;
    else if(age <= 35) m = 0.2;
    else if(age <= 50) m = 0.25;
    else m = 0.4;

    const premi = Math.round(P + (m * P) + (smoke * 0.5 * P) + (hyper * 0.4 * P) + (diabetes * 0.5 * P));

    const db2 = readDB();
    db2.pending = {
      type: 'Health',
      productId,
      productTitle: p ? p.title : 'Health Insurance',
      details: { name, dob, job, smoke, hyper, diabetes },
      premium: premi,
      date: new Date().toISOString()
    };
    writeDB(db2);

    res.innerHTML = `<div class="success">Estimated annual premium: Rp ${formatCurrency(premi)} (age ${age})</div>
      <div style="margin-top:10px"><a href="#/checkout" class="btn">Go to Checkout</a></div>`;
  });
}

// Buy Life
function renderBuyLife(productId){
  const db = readDB(); if(!db.session){ location.hash = '#/login'; return; }
  const p = PRODUCTS.find(x=>x.id===productId);
  app.innerHTML = `
    <section class="card">
      <h3>Buy Life Insurance ${p? '- ' + p.title : ''}</h3>
      <form id="lifeForm">
        <label>Nama Lengkap (KTP)<input class="input" id="l-name" required></label>
        <label>Tanggal Lahir<input class="input" id="l-dob" type="date" required></label>
        <label>Besar Pertanggungan
          <select id="l-amount" class="input">
            <option value="1000000000">Rp1,000,000,000</option>
            <option value="2000000000">Rp2,000,000,000</option>
            <option value="3500000000">Rp3,500,000,000</option>
            <option value="5000000000">Rp5,000,000,000</option>
            <option value="10000000000">Rp10,000,000,000</option>
          </select>
        </label>
        <div style="margin-top:12px">
          <button class="btn" type="submit">Calculate Monthly Premium</button>
          <a href="#/products" class="btn ghost">Cancel</a>
        </div>
      </form>
      <div id="life-result"></div>
    </section>
  `;

  document.getElementById('lifeForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('l-name').value.trim();
    const dob = document.getElementById('l-dob').value;
    const amount = parseFloat(document.getElementById('l-amount').value);
    const res = document.getElementById('life-result'); res.innerHTML='';

    const errors = [];
    if(!name||!dob||!amount) errors.push('All fields must be filled');
    if(errors.length){ res.innerHTML = `<div class="error">${errors.join('<br>')}</div>`; return; }

    const age = calcAge(dob);
    let m = 0;
    if(age <= 30) m = 0.002;
    else if(age <= 50) m = 0.004;
    else m = 0.01;

    const monthly = Math.round(m * amount);
    const db2 = readDB();
    db2.pending = {
      type: 'Life',
      productId,
      productTitle: p ? p.title : 'Life Insurance',
      details: { name, dob, coverage: amount },
      premiumMonthly: monthly,
      date: new Date().toISOString()
    };
    writeDB(db2);

    res.innerHTML = `<div class="success">Estimated monthly premium: Rp ${formatCurrency(monthly)} (age ${age})</div>
      <div style="margin-top:10px"><a href="#/checkout" class="btn">Go to Checkout</a></div>`;
  });
}

// Checkout
function renderCheckout(){
  const db = readDB(); if(!db.session){ location.hash = '#/login'; return; }
  const pending = db.pending;
  if(!pending){ app.innerHTML = `<section class="card"><p>No pending purchase. Choose a product first.</p><a href="#/products" class="btn">Browse Products</a></section>`; return; }

  const priceDisplay = pending.premium || pending.premiumMonthly || 0;
  const priceLabel = pending.premium ? 'Rp ' + formatCurrency(pending.premium) + ' / year' : 'Rp ' + formatCurrency(pending.premiumMonthly) + ' / month';

  app.innerHTML = `
    <section class="card">
      <h3>Checkout</h3>
      <p><strong>Product:</strong> ${pending.productTitle || pending.type}</p>
      <p><strong>Type:</strong> ${pending.type}</p>
      <p><strong>Price:</strong> ${priceLabel}</p>
      <label>Payment method
        <select id="pay-method" class="input">
          <option value="bank">Bank Transfer</option>
          <option value="card">Credit Card</option>
          <option value="ewallet">E-Wallet</option>
        </select>
      </label>
      <div style="margin-top:12px">
        <button id="payBtn" class="btn">Pay</button>
        <a href="#/products" class="btn ghost">Cancel</a>
      </div>
      <div id="payMsg"></div>
    </section>
  `;

  document.getElementById('payBtn').addEventListener('click', ()=>{
    const db2 = readDB();
    const user = db2.session.email;
    const tx = {
      id: 'tx' + Date.now(),
      user,
      productTitle: pending.productTitle || pending.type,
      productType: pending.type,
      productId: pending.productId || null,
      details: pending.details || {},
      price: pending.premium || pending.premiumMonthly || 0,
      priceLabel,
      status: 'Paid',
      date: new Date().toISOString()
    };
    db2.purchases.push(tx);
    delete db2.pending;
    writeDB(db2);
    document.getElementById('payMsg').innerHTML = `<div class="success">Payment successful. Redirecting to history...</div>`;
    setTimeout(()=>{ location.hash = '#/history'; },800);
  });
}

// History
function renderHistory(){
  const db = readDB(); if(!db.session){ location.hash = '#/login'; return; }
  const list = db.purchases.filter(p => p.user === db.session.email);
  app.innerHTML = `
    <section class="card">
      <h3>Purchase History</h3>
      ${list.length ? `<table class="table"><thead><tr><th>Product</th><th>Type</th><th>Date</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>
          ${list.map(x => `<tr>
            <td>${x.productTitle || x.productId}</td>
            <td>${x.productType}</td>
            <td>${(new Date(x.date)).toLocaleString()}</td>
            <td>Rp ${formatCurrency(x.price)}</td>
            <td>${x.status}</td>
          </tr>`).join('')}
        </tbody></table>` : `<p>No purchase history yet.</p>`}
      <div style="margin-top:12px"><a href="#/products" class="btn">Browse Products</a></div>
    </section>
  `;
}
