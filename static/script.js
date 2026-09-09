function getCart() {
    try { return JSON.parse(localStorage.getItem("cart")) || []; } catch(e) { return []; }
}
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}
function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (el) {
        const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
        el.innerText = count > 0 ? `(${count})` : "";
    }
}

function addToCart(name, price) {
    let cart = getCart();
    let item = cart.find(i => i.name === name);
    item ? item.quantity++ : cart.push({ name, price: Number(price), quantity: 1 });
    saveCart(cart);
    renderControls();
}

function decreaseItem(name) {
    let cart = getCart();
    let idx = cart.findIndex(i => i.name === name);
    if (idx !== -1) {
        cart[idx].quantity > 1 ? cart[idx].quantity-- : cart.splice(idx, 1);
        saveCart(cart);
        renderControls();
    }
}

function renderControls() {
    const cart = getCart();
    document.querySelectorAll("[data-product]").forEach(el => {
        const name = el.getAttribute("data-product");
        const price = el.getAttribute("data-price");
        const item = cart.find(i => i.name === name);

        if (item && item.quantity > 0) {
            el.innerHTML = `
                <div class="stepper">
                    <button onclick="decreaseItem('${name}')">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="addToCart('${name}',${price})">+</button>
                </div>`;
        } else {
            el.innerHTML = `<button class="btn-add" onclick="addToCart('${name}',${price})">ADD</button>`;
        }
    });
}

function displayCart() {
    const list = document.getElementById("cart-items");
    const totalEl = document.getElementById("total-price");
    if (!list || !totalEl) return;

    let cart = getCart();
    list.innerHTML = cart.length === 0 ? "<p style='color:#888; text-align:center;'>Your cart is empty.</p>" : "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        let div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <span><b>${item.name}</b> × ${item.quantity} - ₹${item.price * item.quantity}</span>
            <button onclick="removeItem(${index})">Remove</button>
        `;
        list.appendChild(div);
    });
    totalEl.innerText = `Total: ₹${total}`;
}

function removeItem(idx) {
    let cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    displayCart();
}

function placeOrder() {
    let cart = getCart();
    if (cart.length === 0) return alert("⚠️ Cart is empty!");

    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const payment = document.getElementById("payment")?.value || "Cash on Delivery";

    if (!name || !phone || !address) return alert("⚠️ Please fill all details!");

    fetch("/place_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, payment, cart })
    }).finally(() => {
        localStorage.removeItem("cart");
        alert("🎉 Order placed successfully!");
        window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderControls();
    displayCart();
    updateCartCount();
});