from flask import Flask, render_template, Response, request

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

@app.route("/robots.txt")
def robots():
    base = request.url_root.rstrip("/")
    text = f"""User-agent: *
Allow: /

Sitemap: {base}/sitemap.xml
"""
    return Response(text, mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap():
    base = request.url_root.rstrip("/")
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{base}/</loc></url>
  <url><loc>{base}/products</loc></url>
  <url><loc>{base}/cart</loc></url>
</urlset>"""
    return Response(xml, mimetype="application/xml")

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
