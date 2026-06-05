import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBoFlw5Nv4Q72rGzhgI8Df_s1ITszuuf6o',
  authDomain: 'ecommerce-firebase12.firebaseapp.com',
  projectId: 'ecommerce-firebase12',
  storageBucket: 'ecommerce-firebase12.firebasestorage.app',
  messagingSenderId: '81233586320',
  appId: '1:81233586320:web:8c9b3dd3bf1725009f9015',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<string> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user.getIdToken()
}
