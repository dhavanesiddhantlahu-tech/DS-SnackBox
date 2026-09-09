from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/products")
def products():
    return render_template("products.html")

@app.route("/cart")
def cart():
    return render_template("cart.html")

@app.route("/place_order", methods=["POST"])
def place_order():
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    app.run(debug=True)