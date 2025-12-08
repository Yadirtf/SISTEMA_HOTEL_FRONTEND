import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Validar que todas las variables de entorno estén configuradas
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verificar que todas las variables requeridas estén presentes
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0 && typeof window === 'undefined') {
  console.warn(
    `⚠️ Variables de entorno de Firebase faltantes: ${missingVars.join(', ')}. ` +
    `Asegúrate de configurar estas variables en .env.local`
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || '',
  authDomain: requiredEnvVars.authDomain || '',
  projectId: requiredEnvVars.projectId || '',
  storageBucket: requiredEnvVars.storageBucket || '',
  messagingSenderId: requiredEnvVars.messagingSenderId || '',
  appId: requiredEnvVars.appId || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase solo si no está ya inicializado y si tenemos las configuraciones necesarias
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  if (getApps().length === 0) {
    // Solo inicializar si tenemos al menos la API key
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApps()[0];
  }

  // Inicializar Auth solo si la app está inicializada
  if (app) {
    auth = getAuth(app);
    
    // Configurar proveedor de Google
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
}

// Exportar con validación - solo si están inicializados
export { auth, googleProvider };
export default app;

// Función helper para verificar si Firebase está configurado
export const isFirebaseConfigured = (): boolean => {
  return !!(auth && googleProvider && app);
};

