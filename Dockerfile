# Dockerfile para el Frontend (Next.js)
FROM node:20-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
RUN npm ci

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED 1

# Pasar variables de entorno necesarias para el build
# ARG permite pasar variables durante docker build
ARG NEXT_PUBLIC_API_BASE_URL=http://backend:5000
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Construir la aplicación
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos standalone de Next.js
# Nota: Next.js standalone ya incluye el directorio public en .next/standalone/public
# Por lo tanto, no necesitamos copiar public por separado
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar código fuente de las rutas API y middleware (necesario para rutas dinámicas en standalone)
COPY --from=builder --chown=nextjs:nodejs /app/src/app/api ./src/app/api
COPY --from=builder --chown=nextjs:nodejs /app/middleware.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Usar servidor proxy que intercepta /api/* antes de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/server-proxy.js ./server-proxy.js

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Usar servidor proxy que intercepta /api/* antes de Next.js
CMD ["node", "server-proxy.js"]

