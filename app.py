import os, sqlite3, time
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'snackbox.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Database Auto-Setup & Auto-Fix
def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Reviews Table
        conn.execute('''CREATE TABLE IF NOT EXISTS reviews 
                        (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rating INT, comment TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        # Check if old table exists without 'name' column and auto-fix
        cursor.execute("PRAGMA table_info(orders)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and 'name' not in cols:
            conn.execute("DROP TABLE orders")
            
        # Fresh Orders Table
        conn.execute('''CREATE TABLE IF NOT EXISTS orders 
                        (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, name TEXT, phone TEXT, address TEXT, pay_mode TEXT, total REAL, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
        
        # Default reviews
        if conn.execute('SELECT COUNT(*) FROM reviews').fetchone()[0] == 0:
            conn.executemany('INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)', [
                ("Sneha K.", 5, "Delivered within 10 minutes! Fresh and hot."),
                ("Aman Verma", 5, "Chocolate cake packaging was super premium!"),
                ("Pooja Nair", 4, "Cold beverages arrived chilled with ice packs.")
            ])
        conn.commit()

init_db()

# Product catalog
PRODUCTS = [
    {"id": 1, "name": "Cadbury Dairy Milk Silk", "category": "sweets", "price": 100, "mrp": 125, "unit": "150g", "img": "dairy_milk.png"},
    {"id": 2, "name": "Authentic Gulab Jamun", "category": "sweets", "price": 50, "mrp": 70, "unit": "2 pcs", "img": "gulab_jamun.png"},
    {"id": 3, "name": "Soft Bengali Rasgulla", "category": "sweets", "price": 50, "mrp": 65, "unit": "2 pcs", "img": "rasgulla.png"},
    {"id": 4, "name": "Vanilla Bean Ice Cream", "category": "sweets", "price": 40, "mrp": 55, "unit": "100ml", "img": "ice_cream.png"},
    {"id": 5, "name": "Dutch Chocolate Cake", "category": "bakery", "price": 450, "mrp": 550, "unit": "500g", "img": "cake.png"},
    {"id": 6, "name": "Choco Fudge Cupcake", "category": "bakery", "price": 60, "mrp": 80, "unit": "1 pc", "img": "cupcake.png"},
    {"id": 7, "name": "Dark Chocolate Cookies", "category": "bakery", "price": 120, "mrp": 150, "unit": "200g", "img": "cookies.png"},
    {"id": 8, "name": "Cashew Butter Biscuits", "category": "bakery", "price": 80, "mrp": 99, "unit": "150g", "img": "biscuits.png"},
    {"id": 9, "name": "Crispy Veg Puff", "category": "snacks", "price": 25, "mrp": 35, "unit": "1 pc", "img": "puff.png"},
    {"id": 10, "name": "Kurkure Masala Munch", "category": "snacks", "price": 20, "mrp": 20, "unit": "85g", "img": "kurkure.png"},
    {"id": 11, "name": "Salted Potato Wafers", "category": "snacks", "price": 30, "mrp": 35, "unit": "100g", "img": "chips.png"},
    {"id": 12, "name": "Doritos Cheese Supreme", "category": "snacks", "price": 50, "mrp": 60, "unit": "130g", "img": "doritos.png"},
    {"id": 13, "name": "Butter Caramel Popcorn", "category": "snacks", "price": 40, "mrp": 50, "unit": "60g", "img": "pop_corn.png"},
    {"id": 14, "name": "Coca Cola Chilled Can", "category": "beverages", "price": 40, "mrp": 45, "unit": "300ml", "img": "coca_cola.png"},
    {"id": 15, "name": "Pepsi Chill Can", "category": "beverages", "price": 40, "mrp": 45, "unit": "300ml", "img": "pepsi.png"}
]

@app.route('/')
def index():
    with get_db() as conn:
        revs = conn.execute('SELECT * FROM reviews ORDER BY id DESC LIMIT 3').fetchall()
    return render_template('index.html', products=PRODUCTS, reviews=revs)

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/checkout', methods=['POST'])
def checkout():
    order_id = f"DS-{int(time.time())}"
    d = request.form
    name = d.get('name', 'Siddhant Dhavane').strip()
    phone = d.get('phone', '').strip()
    address = d.get('address', '').strip()
    pay_mode = d.get('pay_mode', 'Cash on Delivery')
    
    try:
        total = float(d.get('total', 0))
    except (ValueError, TypeError):
        total = 0.0

    with get_db() as conn:
        conn.execute(
            'INSERT INTO orders (order_id, name, phone, address, pay_mode, total) VALUES (?, ?, ?, ?, ?, ?)',
            (order_id, name, phone, address, pay_mode, total)
        )
        conn.commit()

    return redirect(url_for('order_success', order_id=order_id))

@app.route('/order-success/<order_id>')
def order_success(order_id):
    with get_db() as conn:
        order = conn.execute('SELECT * FROM orders WHERE order_id = ?', (order_id,)).fetchone()
    if not order:
        return redirect('/')
    return render_template('order_success.html', order=order)

@app.route('/reviews', methods=['GET', 'POST'])
def reviews():
    with get_db() as conn:
        if request.method == 'POST':
            name = request.form.get('name', '').strip() or 'Happy Customer'
            rating = int(request.form.get('rating', 5))
            comment = request.form.get('comment', '').strip()
            if comment:
                conn.execute('INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)', (name, rating, comment))
                conn.commit()
            return redirect(url_for('reviews'))
        all_revs = conn.execute('SELECT * FROM reviews ORDER BY id DESC').fetchall()
    return render_template('reviews.html', reviews=all_revs)

if __name__ == '__main__':
    app.run(debug=True)