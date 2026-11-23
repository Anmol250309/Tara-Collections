# TARA COLLECTIONS

Premium fashion and jewellery e-commerce website built with React, Vite, Tailwind CSS and Firebase.

## Run locally

1. Install Node.js (LTS).
2. Open this project folder in a terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Create a production build:

   ```bash
   npm run build
   ```

## Firebase

The Firebase client configuration is in `src/firebase/firebase.js`.

Before deploying, review and test `firestore.rules` and `storage.rules` in your own Firebase project. Never rely on client-side checks alone for admin permissions or payment verification.

## Deploy

This project includes `firebase.json` for Firebase Hosting and related Firebase services. Build the website first, then deploy using the Firebase CLI:

```bash
npm run build
firebase deploy
```

## GitHub

Upload the **contents of this folder** to the repository root. Do not upload the ZIP file inside the repository.


## GitHub Pages deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. Push these files to the `main` branch, then open **Settings → Pages** in the GitHub repository and set **Build and deployment → Source** to **GitHub Actions**. The workflow will build the Vite app and publish the `dist` folder. Check the **Actions** tab for the deployment result.
