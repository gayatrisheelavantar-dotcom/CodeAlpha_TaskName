# Lingo: Language Learning App

Spanish, French and Japanese. Flashcards with pronunciation (browser text-to-speech), daily lesson, quizzes, progress and streaks.
Plain HTML/CSS/JS, no build step.

## Run locally
    cd lingo-app
    python3 -m http.server 8000     # or: npx serve
Open http://localhost:8000. Without Firebase, progress is saved in localStorage.

## Real-time sync (Firebase)
1. Create a project at https://console.firebase.google.com.
2. Build > Authentication > Sign-in method: enable **Google**.
3. Build > Firestore Database: create a database, then publish `firestore.rules`.
4. Project settings > Your apps > Web app: copy the config into `js/firebase-config.js`.
5. Authentication > Settings > Authorized domains: add your host (localhost is allowed by default).
6. Click **Sign in to sync**. Progress now updates live across every device signed in to the same account.

## Deploy
    npm i -g firebase-tools && firebase login && firebase init hosting   # keep public dir ".", no SPA
    firebase deploy

## Structure
    index.html          page shell
    css/style.css       styles (light and dark)
    js/app.js           lessons data, flashcards, quiz, progress
    js/sync.js          Firebase Auth + Firestore real-time sync
    js/firebase-config.js  your Firebase keys
    firestore.rules     per-user security rules

## Add content
Edit the `D` object in `js/app.js`: `[word, pronunciation, translation, optionalNote]`.
