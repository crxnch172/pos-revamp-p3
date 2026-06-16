const products = [
  {id:1,name:"Batchoy",price:70},
  {id:2,name:"Extra Noodles",price:10},
  {id:3,name:"Extra Eggs",price:12},
  {id:4,name:"Ham&Cheese Empanada",price:15},
  {id:5,name:"Tuna&Cheese Empanada",price:15},
  {id:6,name:"Lumpiang Gulay",price:10},
  {id:7,name:"Tokneneng",price:15},
  {id:8,name:"Coke",price:22},
  {id:9,name:"Sprite",price:22},
  {id:10,name:"Mtn-Dew",price:22},
  {id:11,name:"Juicy Lemon",price:15},
  {id:12,name:"Orange Soda",price:15},
  {id:13,name:"RC Cola",price:15},
];

let currentTotal = 0;
let currentMethod = "";
let cart = {};
let orders = JSON.parse(localStorage.getItem("orders")) || {};

// DATE
document.getElementById("date").innerText = new Date().toLocaleString();

/* ================= PAGE SWITCH ================= */
function show(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
}

/* ================= RECEIPT ================= */

function showReceipt(order) {
 document.getElementById("receiptBody").innerHTML =
  `<div>
    <b>Customer:</b> ${order.customerName}<br>
    <b>Address:</b> ${order.customerAddress}
  </div><br>`;

  document.getElementById("receiptBody").innerHTML = "";

  order.items.forEach(i => {
    document.getElementById("receiptBody").innerHTML += `
      <div>
        ${i.name} x${i.qty} - ₱${i.price * i.qty}
      </div>
    `;
  });

  document.getElementById("receiptTotal").innerText = order.total;
  document.getElementById("receiptMethod").innerText = order.method;
  document.getElementById("receiptDate").innerText = order.time;

  document.getElementById("receiptModal").style.display = "flex";
}

function closeReceipt() {
  document.getElementById("receiptModal").style.display = "none";
}

/* ================= PRODUCTS ================= */
const grid = document.getElementById("grid");

products.forEach(p=>{
  grid.innerHTML += `
    <div class="product">
      <h4>${p.name}</h4>
      <p>₱${p.price}</p>
      <button class="add" onclick="add(${p.id})">Add</button>
    </div>
  `;
});

function add(id){
  const item = products.find(p=>p.id===id);
  if(!cart[id]) cart[id] = {...item, qty:1};
  else cart[id].qty++;
  renderCart();
}

function minus(id){
  cart[id].qty--;
  if(cart[id].qty<=0) delete cart[id];
  renderCart();
}

function plus(id){
  cart[id].qty++;
  renderCart();
}

/* ================= CART ================= */
function renderCart(){
  const cartDiv = document.getElementById("cart");
  const totalEl = document.getElementById("total");

  cartDiv.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach(i=>{
    total += i.price * i.qty;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <div>${i.name}<br>₱${i.price}</div>
        <div>
          <button class="qty-btn" onclick="minus(${i.id})">-</button>
          ${i.qty}
          <button class="qty-btn" onclick="plus(${i.id})">+</button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = total;
}

function clearCart() {
  if (Object.keys(cart).length === 0) {
    alert("Cart is already empty!");
    return;
  }

  if (!confirm("Delete all items in cart?")) return;

  cart = {};
  renderCart();
}

/* ================= CHECKOUT ================= */
function checkout(){
  if(Object.keys(cart).length === 0) {
    alert("Cart is empty!");
    return;
  }

  document.getElementById("modal").style.display = "flex";
  document.getElementById("cashSection").style.display = "none";
}

function selectCash(){
  currentMethod = "Cash";
  currentTotal = Object.values(cart).reduce((a,b)=>a+b.price*b.qty,0);

  document.getElementById("cashSection").style.display = "block";
}

function selectOnline(){
  pay("Online");
}

document.getElementById("cashInput").addEventListener("input", function(){
  const cash = Number(this.value);
  const change = cash - currentTotal;

  document.getElementById("change").innerText = change >= 0 ? change : 0;
});

function confirmCashPay(){
  const cash = Number(document.getElementById("cashInput").value);

  if(cash < currentTotal){
    alert("Insufficient cash!");
    return;
  }

  processPayment("Cash");
}

function closeModal(){
  document.getElementById("modal").style.display="none";
}

function processPayment(method){
  const date = new Date().toLocaleDateString();

 const order = {
  items: Object.values(cart),
  total: currentTotal,
  method,
 customerName: document.getElementById("custName")?.value?.trim() || "Walk-in",
 customerAddress: document.getElementById("custAddress")?.value?.trim() || "N/A",
  cash: method === "Cash"
    ? Number(document.getElementById("cashInput").value)
    : null,
  change: method === "Cash"
    ? Number(document.getElementById("cashInput").value) - currentTotal
    : 0,
  time: new Date().toLocaleString()
};

  cart = {};
  renderCart();

  document.getElementById("modal").style.display = "none";
  document.getElementById("cashSection").style.display = "none";
  document.getElementById("cashInput").value = "";

  updateOrders();
  updateDashboard();

  showReceipt(order);
}

function downloadReceipt() {
  const receipt = document.getElementById("receipt");

  html2canvas(receipt).then(canvas => {
    const link = document.createElement("a");
    link.download = "receipt.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

/* ================= RECENT ORDERS ================= */
function updateOrders(){
  const list = document.getElementById("orderList");
  list.innerHTML = "";

  Object.keys(orders).forEach(date=>{
    list.innerHTML += `
      <div class="order-group">
      ${orders[date].map(o => `
  <div style="margin-bottom:8px;">
    <b>${o.customerName ?? "Walk-in"}</b>
    (${o.customerAddress ?? "N/A"})<br>
    ₱${o.total ?? 0} - ${o.method ?? "Unknown"}<br>
    <small>${o.time ?? ""}</small>
  </div>
`).join("")}
      </div>
    `;
  });
}

/* ================= DASHBOARD ================= */
function updateDashboard(){
  let sales = 0;
  let orderCount = 0;
  let itemCount = 0;

  Object.values(orders).forEach(arr=>{
    arr.forEach(o=>{
      sales += o.total;
      orderCount++;
      o.items.forEach(i=>itemCount += i.qty);
    });
  });

  document.getElementById("sales").innerText = sales;
  document.getElementById("orderCount").innerText = orderCount;
  document.getElementById("itemCount").innerText = itemCount;
}

/* INIT */
updateOrders();
updateDashboard();
renderCart();