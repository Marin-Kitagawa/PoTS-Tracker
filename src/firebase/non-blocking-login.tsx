'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Function to create a user profile if it doesn't exist
const ensureUserProfile = (user: User) => {
  const firestore = getFirestore(user.app);
  const userDocRef = doc(firestore, 'users', user.uid);
  
  getDoc(userDocRef).then(docSnap => {
    if (!docSnap.exists()) {
      // User profile doesn't exist, so create it
      setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        dateJoined: serverTimestamp(),
      });
    }
  }).catch(error => {
    console.error("Error checking for user profile:", error);
  });
};

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

      // Create user profile in Firestore
      ensureUserProfile(user);
    })
    .catch((error) => {
      console.error("Email sign-up error", error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
        // On successful sign-in, ensure the user profile exists
        ensureUserProfile(userCredential.user);
    })
    .catch((error) => {
    console.error("Email sign-in error", error);
  });
}

/** Initiate Google Sign-In (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider)
    .then((result) => {
      // On successful sign-in, ensure the user profile exists
      ensureUserProfile(result.user);
    })
    .catch((error) => {
      console.error("Google sign-in error", error);
    });
}

/** Initiate GitHub Sign-In (non-blocking). */
export function initiateGitHubSignIn(authInstance: Auth): void {
  const provider = new GithubAuthProvider();
  signInWithPopup(authInstance, provider)
    .then((result) => {
      // On successful sign-in, ensure the user profile exists
      ensureUserProfile(result.user);
    })
    .catch((error) => {
      console.error("GitHub sign-in error", error);
    });
}
