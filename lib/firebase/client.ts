import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const app = getApps().length
  ? getApp()
  : initializeApp({
      // Fallback keeps `next build` prerendering when env is absent; real calls then fail with a clear auth error.
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'missing-firebase-api-key',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })

export const db = getFirestore(app)
export const auth = getAuth(app)
