# DS SnackBox — Render Ready

## Deploy on Render
1. Create/push this project to a GitHub repository.
2. In Render, choose **New → Web Service**.
3. Connect the GitHub repository.
4. Runtime: **Python**.
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `gunicorn app:app`
7. Choose the **Free** plan and deploy.

The app uses Flask and already includes `requirements.txt`, `Procfile`, and `render.yaml`.
After deployment, Render gives you an `https://...onrender.com` URL.

## Google
The site has `/robots.txt` and `/sitemap.xml`. After deployment, submit the sitemap in Google Search Console. Google indexing is not instant and cannot be guaranteed.
