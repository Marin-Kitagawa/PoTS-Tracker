'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    console.error("Anonymous sign-in error", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Set the user's display name in Auth
      updateProfile(user, { displayName });
      // Send verification email
      sendEmailVerification(user);

      // Also create a user profile document in Firestore
      const firestore = getFirestore(authInstance.app);
      const userDocRef = doc(firestore, 'users', user.uid);
      setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        displayName: displayName,
        dateJoined: serverTimestamp(),
      });

    })
    .catch((error) => {
      console.error("Email sign-up error", error);
      // You might want to use a toast notification here to show the error to the user
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error("Email sign-in error", error);
    // You might want to use a toast notification here to show the error to the user
  });
}
