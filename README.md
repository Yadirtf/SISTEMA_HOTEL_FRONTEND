# 🏨 Sistema Hotel Frontend - Documentación Completa

## 📋 Información del Proyecto

**Aplicación web frontend** desarrollada con Next.js 16, React 19, TypeScript y Chakra UI para la gestión hotelera.

### Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript 5
- **UI Library**: Chakra UI 3
- **Estado**: React Hooks (useState, useEffect)
- **Autenticación**: JWT almacenado en localStorage
- **Routing**: Next.js App Router

---

## 🚀 Instalación del Software

### Prerrequisitos del Sistema

Antes de instalar el proyecto, necesitas tener instalado el siguiente software según tu sistema operativo:

#### Windows

1. **Node.js 20+**
   - Descargar desde: https://nodejs.org/
   - Instalador recomendado: `node-v20.x.x-x64.msi`
   - Durante la instalación, asegúrate de marcar la opción "Add to PATH"
   - Verificar instalación: `node --version` y `npm --version` en PowerShell

2. **Git** (opcional, si clonas desde repositorio)
   - Descargar desde: https://git-scm.com/download/win
   - Instalador: `Git-2.x.x-64-bit.exe`
   - Verificar: `git --version` en PowerShell

#### Linux (Ubuntu/Debian)

1. **Node.js 20+**
   ```bash
   # Usando NodeSource (recomendado)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # O usando nvm (alternativa)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   
   # Verificar
   node --version
   npm --version
   ```

2. **Git**
   ```bash
   sudo apt install git -y
   git --version
   ```

#### macOS

1. **Node.js 20+**
   ```bash
   # Usando Homebrew (recomendado)
   brew install node@20
   brew link node@20
   
   # O usando nvm
   brew install nvm
   nvm install 20
   nvm use 20
   
   # Verificar
   node --version
   npm --version
   ```

2. **Git**
   ```bash
   # Ya viene instalado, pero puedes actualizarlo:
   brew install git
   git --version
   ```

### Variables de Entorno Globales

En algunos casos, puede ser necesario agregar rutas al PATH del sistema:

#### Windows
```powershell
# En PowerShell como Administrador
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\nodejs", [EnvironmentVariableTarget]::Machine)
```

#### Linux/macOS
```bash
# Agregar al ~/.bashrc o ~/.zshrc
export PATH="$PATH:/usr/local/bin:/usr/bin"
```

---

## 📦 Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd sistema_hotel_frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto (Next.js usa `.env.local` para variables de entorno en desarrollo):

```env
# URL del Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# URL del Frontend (para producción)
FRONTEND_BASE_URL=http://localhost:3000
```

**Nota:** Las variables que empiezan con `NEXT_PUBLIC_` son expuestas al cliente. Variables sin este prefijo solo están disponibles en el servidor.

### 4. Ejecutar la Aplicación

#### Desarrollo Local

**Windows (PowerShell):**
```powershell
# Modo desarrollo (con hot reload)
npm run dev
```

**Linux/macOS:**
```bash
# Modo desarrollo (con hot reload)
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

#### Producción

```bash
# Build para producción
npm run build

# Ejecutar servidor de producción
npm start
```

### 5. Verificar que Todo Funcione

1. Abrir navegador en: http://localhost:3000
2. Deberías ver la pantalla de login
3. Asegúrate de que el backend esté corriendo en http://localhost:5000

---

## 🔧 Documentación de la API Consumida

Este frontend consume la API del backend. A continuación se documentan los endpoints utilizados:

### Autenticación

#### Login
```typescript
POST /auth/login
Body: { correo: string, contrasena: string }
Response: { success: boolean, message: string, data: { token: string, user: {...} } }
```

**Implementado en:** `src/app/auth/login/page.tsx`

#### Registro
```typescript
POST /auth/register
Body: { 
  correo: string, 
  contrasena: string, 
  nombre: string, 
  apellido: string, 
  telefono: string 
}
Response: { success: boolean, message: string, data: UserResponseDto }
```

**Implementado en:** `src/app/auth/register/page.tsx`

#### Recuperación de Contraseña
```typescript
POST /auth/forgot-password
Body: { correo: string }
Response: { success: boolean, message: string, data: string }
```

**Implementado en:** `src/app/auth/forgot-password/page.tsx`

#### Restablecer Contraseña
```typescript
POST /auth/reset-password
Body: { token: string, nuevaContrasena: string, confirmarContrasena: string }
Response: { success: boolean, message: string, data: string }
```

**Implementado en:** `src/app/auth/reset-password/page.tsx`

### Administración (Solo Administradores)

#### Listar Usuarios
```typescript
GET /auth/usuarios
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Response: { success: boolean, message: string, data: User[] }
```

**Implementado en:** `src/app/panel/admin/usuarios/page.tsx`

#### Cambiar Estado de Usuario
```typescript
PATCH /auth/usuarios/:id/estado
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Body: { estado: "Activo" | "Inactivo" }
Response: { success: boolean, message: string, data: string }
```

**Implementado en:** `src/app/panel/admin/usuarios/page.tsx`

#### Cambiar Rol de Usuario
```typescript
PATCH /auth/usuarios/:id/rol
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Body: { rol: "Administrador" | "Recepcionista" }
Response: { success: boolean, message: string, data: string }
```

**Implementado en:** `src/app/panel/admin/usuarios/page.tsx`

#### Listar Acciones (Auditoría)
```typescript
GET /auth/acciones
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Response: { success: boolean, message: string, data: Accion[] }
```

**Implementado en:** `src/app/panel/admin/historial/page.tsx`

### Habitaciones

#### Listar Habitaciones
```typescript
GET /rooms
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Query params: ?type=<tipo> | ?floor=<piso>
Response: { success: boolean, message: string, data: Room[] }
```

**Implementado en:** `src/app/habitaciones/page.tsx`

#### Crear Habitación
```typescript
POST /rooms
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Body: { 
  number: string, 
  type: string, 
  floor: number, 
  price: number, 
  status: string, 
  description?: string 
}
Response: { success: boolean, message: string, data: Room }
```

**Implementado en:** `src/app/habitaciones/page.tsx`

#### Actualizar Habitación
```typescript
PUT /rooms/number/:roomNumber
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Body: { type?: string, floor?: number, price?: number, status?: string, description?: string }
Response: { success: boolean, message: string, data: Room }
```

**Implementado en:** `src/app/habitaciones/page.tsx`

#### Cambiar Estado de Habitación
```typescript
PATCH /rooms/number/:roomNumber/status
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Body: { status: string }
Response: { success: boolean, message: string, data: Room }
```

**Implementado en:** `src/app/habitaciones/page.tsx`

#### Desactivar Habitación (Soft Delete)
```typescript
DELETE /rooms/number/:roomNumber
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Response: { success: boolean, message: string, data: Room }
```

**Implementado en:** `src/app/habitaciones/page.tsx`

#### Eliminar Habitación Permanentemente (Hard Delete)
```typescript
DELETE /rooms/number/:roomNumber/permanent
Headers: { Authorization: "Bearer <JWT_TOKEN>" }
Response: { success: boolean, message: string, data: null }
```

**Implementado en:** `src/app/habitaciones/page.tsx`

### Reservas

**Nota:** Los endpoints de reservas están disponibles pero aún no están completamente implementados en el frontend.

---

## 📚 Cómo Consumir la API desde el Frontend

### Funciones de API

El proyecto incluye funciones helper en `src/lib/api.ts`:

```typescript
// GET request
const data = await apiGet<Room[]>('/rooms');

// POST request
const result = await apiPost<Room>('/rooms', {
  number: '101',
  type: 'single',
  floor: 1,
  price: 100000,
  status: 'available'
});

// PUT request
const updated = await apiPut<Room>(`/rooms/number/101`, {
  price: 150000
});

// PATCH request
const patched = await apiPatch<Room>(`/rooms/number/101/status`, {
  status: 'maintenance'
});

// DELETE request
await apiDelete(`/rooms/number/101/permanent`);
```

### Autenticación

El token JWT se almacena automáticamente en `localStorage` después del login:

```typescript
// En src/lib/api.ts, todas las peticiones incluyen automáticamente:
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Manejo de Sesión

Las funciones de sesión están en `src/lib/session.ts`:

```typescript
import { saveSession, clearSession, getSessionUser } from '@/lib/session';

// Guardar sesión después del login
saveSession(token, user);

// Obtener usuario actual
const user = getSessionUser();

// Cerrar sesión
clearSession();
```

---

## 🛠️ Comandos de Desarrollo

### Comandos Principales

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (puerto 3000)
npm run dev

# Build para producción
npm run build

# Ejecutar servidor de producción
npm start

# Linter
npm run lint
```

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con hot reload
- `npm run build`: Compila la aplicación para producción
- `npm start`: Ejecuta el servidor de producción (requiere `npm run build` primero)
- `npm run lint`: Ejecuta ESLint para verificar código

---

## 📁 Estructura del Proyecto

```
sistema_hotel_frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── auth/                 # Rutas de autenticación
│   │   │   ├── login/            # Página de login
│   │   │   ├── register/        # Página de registro
│   │   │   ├── forgot-password/  # Recuperación de contraseña
│   │   │   └── reset-password/  # Restablecer contraseña
│   │   ├── panel/               # Panel principal
│   │   │   ├── admin/           # Panel de administración
│   │   │   │   ├── historial/   # Historial de acciones
│   │   │   │   └── usuarios/    # Gestión de usuarios
│   │   │   └── page.tsx         # Dashboard principal
│   │   ├── habitaciones/        # Gestión de habitaciones
│   │   ├── reservas/            # Gestión de reservas
│   │   ├── huespedes/           # Gestión de huéspedes
│   │   ├── layout.tsx           # Layout global
│   │   ├── page.tsx             # Página inicial
│   │   ├── globals.css          # Estilos globales
│   │   └── providers.tsx        # Providers (Chakra UI)
│   ├── components/              # Componentes reutilizables
│   │   ├── dashboard/           # Componentes del dashboard
│   │   │   ├── DashboardShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── theme/               # Configuración de tema
│   │       └── ThemeProvider.tsx
│   └── lib/                     # Utilidades y helpers
│       ├── api.ts               # Funciones para consumir API
│       └── session.ts           # Manejo de sesión
├── middleware.ts                # Next.js middleware (protección de rutas)
├── next.config.ts               # Configuración de Next.js
├── .env.local                   # Variables de entorno (no versionar)
├── .gitignore                   # Archivos a ignorar en Git
├── package.json                 # Dependencias
└── README.md                    # Este archivo
```

---

## 🔒 Protección de Rutas

El proyecto utiliza Next.js Middleware para proteger rutas:

### Rutas Protegidas

Todas las rutas bajo `/panel` requieren autenticación:

```typescript
// middleware.ts
- Verifica token JWT en cookies
- Redirige a /auth/login si no hay token
```

### Rutas con Rol Específico

La ruta `/panel/admin/*` solo es accesible para administradores:

```typescript
// middleware.ts
- Verifica cookie auth_role
- Redirige a /panel si el rol no es "Administrador"
```

### Guardado de Sesión

- Token JWT: Almacenado en `localStorage` como `token`
- Rol del usuario: Almacenado en cookie `auth_role`
- Datos del usuario: Almacenados en `localStorage` como `user`

---

## 🎨 Chakra UI

El proyecto utiliza Chakra UI para los componentes de interfaz.

### Componentes Utilizados

- `Box`: Contenedor flexible
- `Button`: Botones
- `Input`: Campos de entrada
- `Textarea`: Área de texto
- `Flex`: Layout flex
- `Stack`: Stack vertical/horizontal
- `Heading`: Títulos
- `InputGroup` / `InputRightElement`: Inputs con elementos adicionales

### Tema

El tema está configurado en `src/components/theme/ThemeProvider.tsx` con modo oscuro por defecto.

---

## 🐛 Solución de Problemas

### Puerto 3000 en uso

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :3000
kill -9 <PID>
```

O cambiar el puerto:
```bash
npm run dev -- -p 3001
```

### Error de conexión con el backend

1. Verificar que el backend esté corriendo en http://localhost:5000
2. Verificar variable `NEXT_PUBLIC_API_BASE_URL` en `.env.local`
3. Verificar que el backend acepte peticiones desde el frontend (CORS)

### Error "useSearchParams() should be wrapped in a suspense boundary"

Este error aparece en páginas que usan `useSearchParams()`. Ya está resuelto en `src/app/auth/reset-password/page.tsx` usando `<Suspense>`.

### Error de hidratación (Hydration Error)

Los errores de hidratación pueden ocurrir cuando hay diferencias entre el HTML del servidor y el cliente. Soluciones:

1. Usar `useState` y `useEffect` para estado que solo existe en el cliente
2. Verificar que no haya uso directo de `window` o `localStorage` durante el render inicial
3. Usar flags de hidratación como en `src/components/dashboard/Sidebar.tsx`

### Error de compilación TypeScript

```bash
# Limpiar caché y reinstalar
rm -rf node_modules .next
npm install
npm run build
```

### El token JWT expira

Los tokens JWT expiran después de 24 horas. Si el usuario intenta usar una funcionalidad y el token expiró:

1. El backend devolverá `401 Unauthorized`
2. El frontend debe redirigir a `/auth/login`
3. El usuario debe iniciar sesión nuevamente

**Nota:** Actualmente no hay refresh token implementado, pero se puede agregar en el futuro.

---

## 🔍 Debugging

### Logs en Consola del Navegador

El proyecto no incluye un logger formal, pero puedes usar `console.log`:

```typescript
console.log('Datos recibidos:', data);
console.error('Error:', error);
```

### React DevTools

Instalar la extensión React DevTools para Chrome/Firefox:
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

### Next.js Debug Mode

Para obtener más información sobre el build:

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Luego abrir Chrome en: `chrome://inspect`

---

## 📊 Variables de Entorno

### Desarrollo (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
FRONTEND_BASE_URL=http://localhost:3000
```

### Producción

Las variables de entorno en producción deben configurarse en la plataforma de hosting (Vercel, Netlify, etc.) o en el servidor.

**Ejemplo para Vercel:**
1. Ir a Settings → Environment Variables
2. Agregar:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://api.tudominio.com`
   - `FRONTEND_BASE_URL`: `https://tudominio.com`

---

## 🚀 Despliegue a Producción

### Build para Producción

```bash
# 1. Asegurarse de tener las variables de entorno correctas
# 2. Build
npm run build

# 3. Testear localmente el build de producción
npm start
```

### Opciones de Hosting

#### Vercel (Recomendado para Next.js)

1. Instalar Vercel CLI: `npm i -g vercel`
2. Ejecutar: `vercel`
3. Seguir las instrucciones
4. Configurar variables de entorno en el dashboard

#### Netlify

1. Conectar repositorio GitHub
2. Configurar build command: `npm run build`
3. Configurar publish directory: `.next`
4. Agregar variables de entorno

#### Servidor Propio

1. Build en el servidor: `npm run build`
2. Ejecutar: `npm start` (puerto 3000 por defecto)
3. Usar PM2 o similar para mantener el proceso activo:
   ```bash
   npm install -g pm2
   pm2 start npm --name "hotel-frontend" -- start
   pm2 save
   pm2 startup
   ```

### Configuración de Proxy

El proyecto está configurado para usar un proxy en desarrollo:

```typescript
// next.config.ts
// Las peticiones a /api/* se redirigen automáticamente al backend
```

En producción, asegúrate de que `NEXT_PUBLIC_API_BASE_URL` apunte al backend en producción.

---

## 👥 Colaboración con mi grupo de trabajo

### Antes de empezar a trabajar

1. `git pull origin main`
2. `npm install`
3. Crear/actualizar `.env.local` con tus configuraciones locales
4. Asegurarse de que el backend esté corriendo
5. `npm run dev`
6. Verificar que todo funcione en http://localhost:3000

### Notas importantes

- Nunca versionar el archivo `.env.local` (ya está en `.gitignore`)
- Siempre ejecutar `npm run lint` antes de hacer commit
- Los componentes deben ser client components (`'use client'`) si usan hooks de React
- Usar TypeScript estricto para evitar errores en tiempo de ejecución

---