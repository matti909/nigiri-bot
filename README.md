# 🍣 Nigiri Bot - AI Sushi Ordering Assistant

Bot conversacional con IA para tomar pedidos de sushi del restaurante "Arigato!". Construido con Claude 3.5 Haiku, LangGraph y React.

## 📋 Características

- 🤖 **Chatbot inteligente** con Claude 3.5 Haiku que entiende lenguaje natural
- 💬 **Conversación persistente** - historial guardado por 24 horas
- 📝 **Gestión de pedidos** - el bot toma, confirma y guarda pedidos automáticamente
- 📊 **Historial de pedidos** - consulta pedidos anteriores
- 💰 **Cálculo de totales** - muestra precios y subtotales en tiempo real
- 🔄 **Actualización automática** - la lista de pedidos se actualiza sin recargar
- 🎯 **Patrón ReAct** - el agente decide cuándo usar herramientas (tools)

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Node.js + Express + TypeScript
- LangChain + LangGraph (state machine)
- Claude 3.5 Haiku (Anthropic API)
- MongoDB + Mongoose (Docker)
- 3 tools conectados a la base de datos:
  - `create_order` - Persiste pedidos confirmados
  - `get_order_history` - Consulta historial
  - `calculate_total` - Calcula totales

**Frontend:**
- React 18 + TypeScript + Vite
- Redux Toolkit (gestión de estado)
- Tailwind CSS
- localStorage (persistencia de 24h)

### Flujo del Bot

```
Usuario → Frontend (React)
    ↓ POST /completion {text, sessionId}
Backend (Express) → LangGraph State Machine
    ↓
┌─────────────────────────────────────┐
│  Agent (Claude 3.5 Haiku)           │
│  - Recibe mensaje del usuario       │
│  - Decide: responder o usar tools   │
└─────────────────────────────────────┘
    ↓                           ↓
Responde                    Usa Tools
directamente            (create_order, etc.)
    ↓                           ↓
    └───────────┬───────────────┘
                ↓
        Respuesta al usuario
                ↓
Frontend actualiza chat + lista de pedidos
```

## 🚀 Ejecución Local

### Prerequisitos

- **Node.js** v18+ ([descargar](https://nodejs.org/))
- **pnpm** ([instalar](https://pnpm.io/installation)): `npm install -g pnpm`
- **Docker** + **Docker Compose** ([instalar](https://docs.docker.com/get-docker/))
- **API Key de Anthropic** ([obtener gratis](https://console.anthropic.com/))

### 1. Clonar el Repositorio

```bash
git clone https://github.com/matti909/nigiri-bot.git
cd nigiri-bot
```

### 2. Configurar Backend

```bash
cd server

# Instalar dependencias
pnpm install

# Crear archivo .env
cp .env.example .env
```

Editar `server/.env`:
```env
PORT=4000
ANTHROPIC_API_KEY=tu_api_key_aqui  # Obtener en console.anthropic.com
```

**Iniciar MongoDB con Docker:**
```bash
docker-compose up -d
```

**Iniciar servidor:**
```bash
pnpm run dev
```

✅ Backend corriendo en `http://localhost:4000`

### 3. Configurar Frontend

Abrir **nueva terminal**:

```bash
cd client

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

✅ Frontend corriendo en `http://localhost:5173`

### 4. Probar el Bot

1. Abrir navegador en `http://localhost:5173`
2. Escribir: **"Hola"**
3. El bot responde y muestra el menú
4. Pedir algo: **"Quiero 2 California Roll y 1 Sake"**
5. Confirmar: **"Sí, confirma el pedido"**
6. Ver pedido guardado en "Pedidos pendientes"

## 📁 Estructura del Proyecto

```
nigiri-bot/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Conversation, Orders, ChatInput
│   │   ├── hooks/            # useChatBot (lógica principal)
│   │   ├── store/            # Redux Toolkit
│   │   └── utils/            # extractOrder, sanitizeMessage
│   └── package.json
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── llm/
│   │   │   └── chain.ts      # LangGraph: Agent + Tools
│   │   ├── controllers/      # HTTP handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # Mongoose schemas
│   │   └── data/
│   │       └── menu.txt      # Menú del restaurante
│   ├── docker-compose.yml    # MongoDB container
│   └── package.json
│
├── CLAUDE.md                  # Documentación para Claude Code
└── README.md                  # Este archivo
```

## 🔧 API Endpoints

### `POST /completion`
Procesa mensajes del usuario y ejecuta el agente LangGraph.

**Request:**
```json
{
  "text": "Quiero 2 California Roll",
  "sessionId": "session_1234567890_abc123"
}
```

**Response:** Stream de mensajes del agente

### `POST /orders`
Crea un nuevo pedido manualmente (no usado por el bot).

### `GET /orders/getorders`
Obtiene todos los pedidos de la base de datos.

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "pending",
    "items": [
      {
        "id": "uuid",
        "details": { "name": "California Roll", "price": 150 },
        "quantity": 2
      }
    ],
    "createdAt": "2025-01-27T..."
  }
]
```

## 💡 Cómo Funciona el Bot

### System Prompt

El bot tiene instrucciones claras:
- Identidad: "Sushi Bot" del restaurante "Arigato!"
- Menú siempre disponible (sin RAG innecesario)
- Debe confirmar pedidos antes de crearlos
- Solo usa `create_order` cuando el cliente confirma explícitamente
- Tono amable y profesional en español

### Memoria Conversacional

- **sessionId persistente**: Generado al cargar la página, guardado en localStorage
- **Backend MemorySaver**: Usa sessionId como thread_id para mantener contexto
- **TTL de 24 horas**: Historial se limpia automáticamente después de 1 día

### Tools (Herramientas)

El agente decide autónomamente cuándo usar estas herramientas:

| Tool | Cuándo se usa | Ejemplo |
|------|---------------|---------|
| `calculate_total` | Usuario pregunta "¿cuánto costaría?" | "2 California Roll y 1 Sake" → $400 |
| `create_order` | Usuario confirma explícitamente | "Sí, confirma" → Guarda en MongoDB |
| `get_order_history` | Usuario pide ver pedidos anteriores | "Muéstrame mis pedidos" |

## 🧪 Scripts Disponibles

### Backend
```bash
pnpm run dev      # Inicia servidor con hot-reload
```

### Frontend
```bash
pnpm run dev      # Inicia Vite dev server
pnpm run build    # Build para producción
pnpm run preview  # Preview del build
pnpm run lint     # Ejecuta ESLint
```

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY is not defined"
- Verifica que `server/.env` existe y tiene tu API key
- Reinicia el servidor después de crear el `.env`

### Error: "Cannot connect to MongoDB"
- Verifica que Docker está corriendo: `docker ps`
- Inicia MongoDB: `cd server && docker-compose up -d`
- Verifica logs: `docker-compose logs mongo`

### Error: "Port 4000 already in use"
- Mata el proceso: `lsof -ti:4000 | xargs kill -9`
- O cambia el puerto en `server/.env`: `PORT=4001`

### Frontend no actualiza lista de pedidos
- Abre DevTools → Application → localStorage
- Verifica que `chatbot_timestamp` existe
- Limpia localStorage si hay problemas: `localStorage.clear()`

## 📝 Notas de Desarrollo

- **Costos**: Claude 3.5 Haiku es muy económico (~$0.25/1M tokens input)
- **Sin RAG**: El menú es pequeño (9 items), va directo en el system prompt
- **Límite de contexto**: Últimos 24 mensajes para optimizar latencia
- **Naming quirk**: El Redux store usa key `employeeKey` pero maneja orders (legacy)

## 🔮 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Editar/cancelar pedidos
- [ ] Notificaciones en tiempo real
- [ ] Panel de administración para el restaurante
- [ ] Deploy a producción (Vercel + Railway/Render)
- [ ] Tests (Vitest + Playwright)

## 📄 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo y modificarlo.

## 🤝 Contribuciones

Pull requests bienvenidos! Para cambios grandes, abre un issue primero para discutir qué te gustaría cambiar.

---

**Desarrollado con ❤️ usando Claude 3.5 Haiku**
