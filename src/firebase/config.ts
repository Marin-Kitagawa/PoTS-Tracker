import { initializeApp as initializeAppClient, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  "projectId": "studio-5979032199-2e240",
  "appId": "1:860501503529:web:0773831b559271682b3638",
  "apiKey": "AIzaSyB3ui9Ew9le79F25C3M-niFvblUqcSI9_I",
  "authDomain": "studio-5979032199-2e240.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "860501503529"
};


// This is a separate initialization for server-side actions
// to avoid bundling client-side auth logic.
export function initializeFirebase() {
    if (!getApps().length) {
        const app = initializeAppClient(firebaseConfig);
        return { firestore: getFirestore(app) };
    }
    const app = getApp();
    return { firestore: getFirestore(app) };
}
