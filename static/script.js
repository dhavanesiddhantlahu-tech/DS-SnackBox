const getC = () => JSON.parse(localStorage.getItem("c") || "[]");
const setC = (c) => { localStorage.setItem("c", JSON.stringify(c)); sync(); };

function sync() {
    const c = getC(), b = document.getElementById("cart-count");
    if (b) b.innerText = c.length ? `(${c.reduce((s, i) => s + i.q, 0)})` : "";
    document.querySelectorAll("[data-p]").forEach(el => {
        const name = el.getAttribute("data-p"), price = +el.getAttribute("data-pr");
        const item = c.find(i => i.n === name);
        el.innerHTML = item ? `<div class="stepper"><button onclick="mod('${name}',-1)">-</button><span>${item.q}</span><button onclick="mod('${name}',1)">+</button></div>`
            : `<button class="btn-add" onclick="mod('${name}',1,${price})">ADD</button>`;
    });
}

function mod(n, d, pr) {
    let c = getC(), i = c.find(x => x.n === n);
    if (!i && d > 0) c.push({ n, p: pr, q: 1 });
    else if (i) { i.q += d; if (i.q <= 0) c = c.filter(x => x.n !== n); }
    setC(c);
}

function displayCart() {
    const list = document.getElementById("cart-items"), tot = document.getElementById("total-price");
    if (!list) return;
    const c = getC();
    let sum = 0;
    list.innerHTML = c.length ? c.map((i, idx) => {
        sum += i.p * i.q;
        return `<div class="cart-item"><span><b>${i.n}</b> × ${i.q} - ₹${i.p * i.q}</span><button onclick="del(${idx})">×</button></div>`;
    }).join("") : "<p style='color:#888;text-align:center;'>Your cart is empty.</p>";
    if (tot) tot.innerText = `Total: ₹${sum}`;
}

const del = (idx) => { let c = getC(); c.splice(idx, 1); setC(c); displayCart(); };

function placeOrder() {
    const c = getC(), n = document.getElementById("name")?.value.trim(), a = document.getElementById("address")?.value.trim();
    if (!c.length || !n || !a) return alert("Fill all details & add items!");
    const rec = { id: "DS-" + Math.floor(100000 + Math.random() * 900000), n, a, items: c, tot: c.reduce((s, i) => s + i.p * i.q, 0) };
    sessionStorage.setItem("rec", JSON.stringify(rec));
    localStorage.removeItem("c");
    location.href = "/order-success";
}

function loadReceipt() {
    const b = document.getElementById("receipt-details"), r = JSON.parse(sessionStorage.getItem("rec") || "null");
    if (!b || !r) return;
    b.innerHTML = `<div><b>Order ID:</b> ${r.id}</div><div><b>Name:</b> ${r.n}</div><div><b>Address:</b> ${r.a}</div><hr style='margin:8px 0'>` +
        r.items.map(i => `<div>• ${i.n} × ${i.q} (₹${i.p * i.q})</div>`).join("") +
        `<hr style='margin:8px 0'><b style='color:#ff3366;font-size:1.1rem'>Paid: ₹${r.tot}</b>`;
}

function fetchRev() {
    const l = document.getElementById("rev-list");
    if (l) fetch("/api/reviews").then(r => r.json()).then(d => {
        l.innerHTML = d.map(x => `<div class="rev"><b>${x.name}</b> ${"⭐".repeat(x.rating)}<p>${x.comment}</p></div>`).join("");
    });
}

function addRev() {
    const name = document.getElementById("r-name")?.value.trim(), comment = document.getElementById("r-com")?.value.trim(), rating = document.getElementById("r-rat")?.value || 5;
    if (!name || !comment) return alert("Fill all fields!");
    fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, comment, rating }) })
        .then(() => { document.getElementById("r-name").value = ""; document.getElementById("r-com").value = ""; fetchRev(); });
}

document.addEventListener("DOMContentLoaded", () => { sync(); displayCart(); loadReceipt(); fetchRev(); });