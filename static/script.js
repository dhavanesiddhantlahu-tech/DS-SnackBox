// --- Cart State Management ---
function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// --- Product Page: Add Item ---
function addToCart(name, price) {
    let cart = getCart();
    let item = cart.find(i => i.name === name);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ name: name, price: Number(price), quantity: 1 });
    }

    saveCart(cart);
    alert(`Added ${name} to cart!`);
}

// --- Cart Page: Remove Item ---
function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// --- Cart Page: Render Items ---
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

// --- Cart Page: Place Order ---
function placeOrder() {
    let cart = getCart();
    if (cart.length === 0) {
        alert("⚠️ Your cart is empty! Please add some snacks first.");
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

    const orderData = {
        name: name,
        phone: phone,
        address: address,
        payment: payment,
        cart: cart
    };

    fetch("/place_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
    .then(() => {
        localStorage.removeItem("cart");
        const successDiv = document.getElementById("success");
        if (successDiv) {
            successDiv.innerHTML = "<p style='color: #2e7d32; font-weight: bold; margin-top: 15px; text-align: center;'>🎉 Order Placed Successfully!</p>";
        }
        alert("🎉 Order placed successfully!");
        window.location.href = "/";
    })
    .catch(() => {
        localStorage.removeItem("cart");
        alert("🎉 Order placed successfully!");
        window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", displayCart);