// Cart store directly in LocalStorage
let cart = JSON.parse(localStorage.getItem('sb_cart')) || {};
let discountAmt = 0;

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    setupFilters();
    if (window.location.pathname === '/cart') {
        renderCartPage();
    }
});

// Add item to cart
function addItem(id, name, price, unit, img) {
    if (!cart[id]) {
        cart[id] = { id, name, price, unit, img, qty: 1 };
    } else {
        cart[id].qty += 1;
    }
    saveCart();
    toast(`Added ${name}!`);
}

// Change Quantity (+1 or -1)
function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    saveCart();
}

function saveCart() {
    localStorage.setItem('sb_cart', JSON.stringify(cart));
    updateCartDisplay();
    if (window.location.pathname === '/cart') renderCartPage();
}

// Update Header Badges & Stepper Buttons
function updateCartDisplay() {
    let totalItems = 0;
    let totalPrice = 0;

    Object.values(cart).forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;
    });

    const countEl = document.getElementById('navCount');
    const totalEl = document.getElementById('navTotal');
    if (countEl) countEl.innerText = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
    if (totalEl) totalEl.innerText = `₹${totalPrice}`;

    // Update buttons on product cards
    document.querySelectorAll('[id^="btn-wrap-"]').forEach(wrap => {
        const id = wrap.id.replace('btn-wrap-', '');
        const item = cart[id];
        if (item && item.qty > 0) {
            wrap.innerHTML = `
                <div class="stepper">
                    <button onclick="changeQty(${id}, -1)">&minus;</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${id}, 1)">&plus;</button>
                </div>`;
        } else {
            // Find parent card details
            const card = wrap.closest('.card');
            const name = card.querySelector('.name').innerText;
            const price = parseInt(card.querySelector('.price').innerText.replace('₹',''));
            const unit = card.querySelector('.unit').innerText;
            const img = card.querySelector('img').src.split('/').pop();
            wrap.innerHTML = `<button class="btn-add" onclick="addItem(${id}, '${name}', ${price}, '${unit}', '${img}')">ADD +</button>`;
        }
    });
}

// Search & Category Filter
function setupFilters() {
    const search = document.getElementById('searchInput');
    const tabs = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.card');

    function filterNow() {
        const query = (search ? search.value : '').toLowerCase();
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.cat || 'all';

        cards.forEach(card => {
            const name = card.dataset.name || '';
            const cat = card.dataset.cat || '';
            const matchCategory = (activeTab === 'all' || cat === activeTab);
            const matchSearch = name.includes(query);
            card.style.display = (matchCategory && matchSearch) ? 'flex' : 'none';
        });
    }

    if (search) search.addEventListener('input', filterNow);
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterNow();
        });
    });
}

// Render Cart Page Items & Calculate Bill
function renderCartPage() {
    const list = document.getElementById('cartItems');
    const empty = document.getElementById('emptyView');
    const orderBtn = document.getElementById('orderBtn');
    if (!list) return;

    const items = Object.values(cart);

    if (items.length === 0) {
        list.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        if (orderBtn) orderBtn.disabled = true;
        calcBill(0);
        return;
    }

    if (empty) empty.classList.add('hidden');
    if (orderBtn) orderBtn.disabled = false;

    list.innerHTML = items.map(i => `
        <div class="cart-row">
            <div class="cart-left">
                <img src="/static/images/${i.img}" class="cart-thumb">
                <div>
                    <b>${i.name}</b><br>
                    <small>₹${i.price} • ${i.unit}</small>
                </div>
            </div>
            <div class="stepper">
                <button onclick="changeQty(${i.id}, -1)">&minus;</button>
                <span>${i.qty}</span>
                <button onclick="changeQty(${i.id}, 1)">&plus;</button>
            </div>
            <b>₹${i.price * i.qty}</b>
        </div>
    `).join('');

    const subTotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    calcBill(subTotal);
}

// Total Calculation & Coupon
function calcBill(subTotal) {
    const subEl = document.getElementById('subTotal');
    const delEl = document.getElementById('delFee');
    const grandEl = document.getElementById('grandTotal');
    const hiddenTotal = document.getElementById('hiddenTotal');
    const discRow = document.getElementById('discountRow');
    const discVal = document.getElementById('discountVal');

    if (!subEl) return;

    const delivery = (subTotal > 199 || subTotal === 0) ? 0 : 25;
    const packing = subTotal === 0 ? 0 : 5;
    const grand = Math.max(0, subTotal + delivery + packing - discountAmt);

    subEl.innerText = `₹${subTotal}`;
    delEl.innerText = delivery === 0 ? 'FREE' : `₹${delivery}`;

    if (discountAmt > 0 && discRow) {
        discRow.classList.remove('hidden');
        discVal.innerText = `-₹${discountAmt}`;
    } else if (discRow) {
        discRow.classList.add('hidden');
    }

    if (grandEl) grandEl.innerText = `₹${grand}`;
    if (hiddenTotal) hiddenTotal.value = grand;
}

function applyCoupon() {
    const val = document.getElementById('couponInput')?.value.trim().toUpperCase();
    const msg = document.getElementById('couponMsg');
    const subTotal = Object.values(cart).reduce((sum, i) => sum + (i.price * i.qty), 0);

    if (val === 'SNACK20' && subTotal > 0) {
        discountAmt = Math.round(subTotal * 0.20);
        if (msg) { msg.innerText = '🎉 20% discount applied!'; msg.style.color = '#0c831f'; }
        toast('Coupon Applied!');
    } else if (msg) {
        discountAmt = 0;
        msg.innerText = '❌ Invalid Coupon! Try SNACK20';
        msg.style.color = '#ef4444';
    }
    calcBill(subTotal);
}

function clearCart() {
    cart = {};
    discountAmt = 0;
    saveCart();
    toast('Basket Cleared!');
}

function toast(text) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerText = text;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}