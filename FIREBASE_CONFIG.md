# Configuración de Firebase para Frontend

## Pasos para configurar

1. **Crear archivo `.env.local`** en la raíz del proyecto `SISTEMA_HOTEL_FRONTEND`

2. **Agregar las siguientes variables de entorno:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCym4qg8Usf2ZkqxrMQ__RzMdsgBfnXQ7k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hotelsesion.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hotelsesion
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hotelsesion.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=115348730814
NEXT_PUBLIC_FIREBASE_APP_ID=1:115348730814:web:448c5526370c9ae690ffef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K3XDG0Y1FC
```

3. **Reiniciar el servidor de desarrollo:**

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
npm run dev
```

## Nota importante

- El archivo `.env.local` debe estar en la raíz del proyecto `SISTEMA_HOTEL_FRONTEND`
- Las variables deben comenzar con `NEXT_PUBLIC_` para que estén disponibles en el cliente
- Después de crear o modificar `.env.local`, es necesario reiniciar el servidor de desarrollo

## Verificación

Si Firebase está configurado correctamente, deberías poder:
- Ver el botón "Continuar con Google" en la página de login
- Ver el botón "Registrarse con Google" en la página de registro
- No deberías ver errores en la consola relacionados con Firebase

