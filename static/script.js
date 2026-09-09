function getCart() {
    try { return JSON.parse(localStorage.getItem("cart")) || []; } catch (e) { return []; }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const badge = document.getElementById("cart-count");
    if (badge) {
        const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = count > 0 ? `(${count})` : "";
    }
}

// Zepto Style Add / Increment
function addToCart(name, price) {
    let cart = getCart();
    let item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ name, price: Number(price), quantity: 1 });
    }
    saveCart(cart);
    renderControls();
}

// Zepto Style Decrement
function decreaseItem(name) {
    let cart = getCart();
    let index = cart.findIndex(i => i.name === name);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        saveCart(cart);
        renderControls();
    }
}

// Render ADD or - Qty + on the Products page
function renderControls() {
    const cart = getCart();
    document.querySelectorAll("[data-product]").forEach(el => {
        const name = el.getAttribute("data-product");
        const price = el.getAttribute("data-price");
        const item = cart.find(i => i.name === name);

        if (item && item.quantity > 0) {
            el.innerHTML = `
                <div class="qty-btn">
                    <button onclick="decreaseItem('${name}')">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="addToCart('${name}',${price})">+</button>
                </div>
            `;
        } else {
            el.innerHTML = `<button class="add-btn-zepto" onclick="addToCart('${name}',${price})">ADD</button>`;
        }
    });
}

// Cart Page: Remove Item
function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// Cart Page: Display Items
function displayCart() {
    const cartItemsDiv = document.getElementById("cart-items");
    const totalPriceEl = document.getElementById("total-price");
    if (!cartItemsDiv || !totalPriceEl) return;

    let cart = getCart();
    cartItemsDiv.innerHTML = "";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p style='color:#777; padding: 10px 0;'>Your cart is empty.</p>";
        totalPriceEl.innerText = "Total: ₹0";
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;
        let row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <span><strong>${item.name}</strong> × ${item.quantity} - ₹${itemTotal}</span>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsDiv.appendChild(row);
    });
    totalPriceEl.innerText = `Total: ₹${total}`;
}

// Cart Page: Place Order
function placeOrder() {
    let cart = getCart();
    if (cart.length === 0) {
        alert("⚠️ Your cart is empty! Please add snacks first.");
        return;
    }

    const name = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
    const phone = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "";
    const address = document.getElementById("address") ? document.getElementById("address").value.trim() : "";
    const payment = document.getElementById("payment") ? document.getElementById("payment").value : "Cash on Delivery";

    if (!name || !phone || !address) {
        alert("⚠️ Please fill all details!");
        return;
    }

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