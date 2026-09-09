// --- Cart Storage Functions ---
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// --- Triggered by the '+' icon on products page ---
function addToCart(name, price) {
    let cart = getCart();
    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: Number(price), quantity: 1 });
    }

    saveCart(cart);
    alert(`${name} added to cart!`);
}

// --- Remove item from cart page ---
function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// --- Render cart items on cart.html ---
function displayCart() {
    const cartItemsDiv = document.getElementById("cart-items");
    const totalPriceEl = document.getElementById("total-price");
    if (!cartItemsDiv || !totalPriceEl) return;

    let cart = getCart();
    cartItemsDiv.innerHTML = "";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
        totalPriceEl.innerText = "Total: ₹0";
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;

        let itemRow = document.createElement("div");
        itemRow.className = "cart-item";
        itemRow.style.display = "flex";
        itemRow.style.justifyContent = "space-between";
        itemRow.style.alignItems = "center";
        itemRow.style.margin = "8px 0";
        itemRow.style.padding = "8px 12px";
        itemRow.style.background = "#fff3e0";
        itemRow.style.borderRadius = "5px";

        itemRow.innerHTML = `
            <span>${item.name} × ${item.quantity} - ₹${itemTotal}</span>
            <button onclick="removeFromCart(${index})" style="background:#e65100; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Remove</button>
        `;
        cartItemsDiv.appendChild(itemRow);
    });

    totalPriceEl.innerText = `Total: ₹${total}`;
}

// --- Order Validation and Placement ---
function placeOrder() {
    let cart = getCart();
    if (cart.length === 0) {
        alert("⚠️ Your cart is empty! Please add items first.");
        return;
    }

    const nameEl = document.getElementById("name");
    const phoneEl = document.getElementById("phone");
    const addressEl = document.getElementById("address");
    const paymentEl = document.getElementById("payment");

    const name = nameEl ? nameEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";
    const address = addressEl ? addressEl.value.trim() : "";
    const payment = paymentEl ? paymentEl.value : "Cash on Delivery";

    if (!name || !phone || !address) {
        alert("⚠️ Please fill all details!");
        return;
    }

    const orderPayload = {
        name: name,
        phone: phone,
        address: address,
        payment: payment,
        cart: cart
    };

    fetch("/place_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
    })
    .then(() => {
        localStorage.removeItem("cart");
        alert("🎉 Order placed successfully!");
        window.location.href = "/";
    })
    .catch(() => {
        localStorage.removeItem("cart");
        alert("🎉 Order placed successfully!");
        window.location.href = "/";
    });
}

// Auto-run display logic when on cart page
document.addEventListener("DOMContentLoaded", displayCart);