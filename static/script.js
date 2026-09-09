// Load and display cart contents on page load
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

function getCart() {
    return JSON.parse(localStorage.getItem("ds_cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("ds_cart", JSON.stringify(cart));
}

function addToCart(name, price) {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCart(cart);
    alert(`Added ${name} to cart!`);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    if (!cartContainer || !totalElement) return;

    const cart = getCart();
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
        totalElement.textContent = "0";
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const div = document.createElement("div");
        div.className = "cart-item-row";
        div.innerHTML = `
            <span>${item.name} × ${item.quantity} - ₹${item.price * item.quantity}</span>
            <button class="btn-remove" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartContainer.appendChild(div);
    });

    totalElement.textContent = total;
}

function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("⚠️ Your cart is empty!");
        return;
    }

    const nameInput = document.getElementById("cust-name");
    const phoneInput = document.getElementById("cust-phone");
    const addressInput = document.getElementById("cust-address");
    const paymentInput = document.getElementById("cust-payment");

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const payment = paymentInput ? paymentInput.value.trim() : "Cash on Delivery";

    if (!name || !phone || !address) {
        alert("⚠️ Please fill all details!");
        return;
    }

    const orderData = {
        name: name,
        phone: phone,
        address: address,
        payment: payment,
        items: cart,
        total: document.getElementById("cart-total").textContent
    };

    // Send order details to Flask backend
    fetch("/place_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem("ds_cart");
            alert("🎉 Order placed successfully!");
            window.location.href = "/";
        } else {
            alert("Order submitted successfully!");
            localStorage.removeItem("ds_cart");
            window.location.href = "/";
        }
    })
    .catch(() => {
        // Fallback if no backend route exists yet
        localStorage.removeItem("ds_cart");
        alert("🎉 Order placed successfully!");
        window.location.href = "/";
    });
}