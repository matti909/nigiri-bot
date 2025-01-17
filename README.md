# Sushi Ordering Bot

Un sistema para gestionar pedidos de un restaurante de sushi, que incluye un frontend y un backend desplegables localmente o en la nube.

## Requerimientos

- Node.js
- Docker
- Docker Compose
- PNPM
- Vercel CLI (para desplegar el frontend)

## Descripción

Este proyecto consta de dos partes principales:

1. **Frontend**: Una aplicación React que permite a los usuarios interactuar con el sistema de pedidos, visualizar el menú y enviar sus solicitudes.
2. **Backend**: Un servidor basado en Node.js y Express, que gestiona los pedidos y los almacena en una base de datos.

El frontend consume el backend para ofrecer una experiencia fluida al usuario.

## Despliegue local

### Frontend

1. Clona el repositorio y accede al directorio del frontend:

   ```bash
   git clone https://github.com/matti909/nigiri-bot.git
   cd sushi-ordering-bot/frontend
   ```

2. Instala las dependencias:

   ```bash
   pnpm i
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   pnpm run dev
   ```

4. Accede a la aplicación en tu navegador en [http://localhost:3000](http://localhost:3000).

### Backend

1. Clona el repositorio y accede al directorio del backend:

   ```bash
   cd sushi-ordering-bot/backend
   ```

2. Instala las dependencias:

   ```bash
   pnpm i
   ```

3. Construye y ejecuta los contenedores:

   ```bash
   docker-compose up --build
   ```

4. Inicia el servidor:

   ```bash
   pnpm run dev
   ```

5. El backend estará disponible en [http://localhost:4000](http://localhost:4000).

6. Endpoints disponibles:

   [POST] [http://localhost:4000/completions](http://localhost:4000).

   [POST] [http://localhost:4000/orders](http://localhost:4000).

   [GET] [http://localhost:4000/orders/getorders](http://localhost:4000).

## Despliegue en la nube

### Frontend

1. Instala la CLI de Vercel si no la tienes:

   ```bash
   pnpm add -g vercel
   ```

2. Accede al directorio del frontend:

   ```bash
   cd sushi-ordering-bot/frontend
   ```

3. Despliega el frontend con Vercel:
   ```bash
   vercel deploy
   ```

### Backend

#### Comming soon...

## Notas adicionales

- Asegúrate de configurar las variables de entorno tanto para el frontend como para el backend, según se detalla en sus respectivos archivos `.env.example`.
- Para el despliegue en producción, asegúrate de usar configuraciones seguras para las claves y conexiones.
- Si necesitas soporte, revisa la documentación en el repositorio o contacta al equipo de desarrollo.
