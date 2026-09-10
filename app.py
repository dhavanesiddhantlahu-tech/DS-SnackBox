from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

reviews = [
    {"name": "Sneha", "rating": 5, "comment": "Delivered in 9 mins! Cookies were super fresh."},
    {"name": "Aman", "rating": 5, "comment": "Chocolate cake was awesome, perfect packaging."}
]

@app.route("/")
@app.route("/products")
def home():
    return render_template("index.html")

@app.route("/cart")
def cart():
    return render_template("cart.html")

@app.route("/reviews")
def reviews_page():
    return render_template("reviews.html")

@app.route("/order-success")
def success():
    return render_template("order_success.html")

@app.route("/api/reviews", methods=["GET", "POST"])
def api_reviews():
    if request.method == "POST":
        d = request.get_json()
        if d and d.get("name") and d.get("comment"):
            reviews.insert(0, {"name": d["name"], "rating": int(d.get("rating", 5)), "comment": d["comment"]})
            return jsonify({"status": "ok"}), 201
    return jsonify(reviews)

@app.route("/place_order", methods=["POST"])
def place_order():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(debug=True)