let cart = JSON.parse(localStorage.getItem("cart")) || [];

function save() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addCart(btn, name, price) {
    let item = cart.find(x => x.name == name);
    if (item) item.qty++;
    else cart.push({name:name, price:price, qty:1});
    save();
    showQty(btn, name, price);
}

function showQty(btn, name, price) {
    let item = cart.find(x => x.name == name);
    btn.outerHTML = `<div class="quantity">
        <button onclick="changeQty(this,-1,'${name}',${price})">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(this,1,'${name}',${price})">+</button>
    </div>`;
}

function changeQty(btn, num, name, price) {
    let item = cart.find(x => x.name == name);
    item.qty += num;

    if (item.qty <= 0) {
        cart = cart.filter(x => x.name != name);
        btn.parentElement.outerHTML =
        `<div class="add" onclick="addCart(this,'${name}',${price})">+</div>`;
    } else {
        btn.parentElement.querySelector("span").innerText = item.qty;
    }
    save();
}

function showCart() {
    let box = document.getElementById("cartItems");
    if (!box) return;

    let total = 0;
    box.innerHTML = cart.map((x,i) => {
        total += x.price * x.qty;
        return `<div class="cartItem">
            ${x.name} × ${x.qty} - ₹${x.price*x.qty}
            <button onclick="removeCart(${i})">Remove</button>
        </div>`;
    }).join("") || "Your cart is empty.";

    document.getElementById("total").innerText = total;
}

function removeCart(i) {
    cart.splice(i,1);
    save();
    showCart();
}

function placeOrder() {
    if (!cart.length) return alert("🛒 Your cart is empty!");

    if (!name.value || !mobile.value || !address.value)
        return alert("⚠️ Please fill all details!");

    success.innerHTML = "🎉 Order Placed Successfully! ❤️";
    cart = [];
    localStorage.removeItem("cart");
    showCart();
}

showCart();
