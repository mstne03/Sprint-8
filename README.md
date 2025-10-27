# 🏎️ Grid Fans Club Application

Una aplicación completa de **F1 Fantasy** que permite a los usuarios crear equipos virtuales, gestionar pilotos, competir en ligas privadas y seguir el rendimiento en tiempo real basado en datos oficiales de Formula 1.

## 🎯 ¿Qué es Grid Fans Club?

Grid Fans Club es un juego de gestión deportiva donde los usuarios:
- **Crean equipos virtuales** seleccionando pilotos reales de Formula 1
- **Gestionan presupuestos** comprando y vendiendo pilotos según precios dinámicos
- **Compiten en ligas** privadas con amigos o públicas con otros usuarios
- **Ganan puntos** basados en el rendimiento real de sus pilotos en las carreras
- **Siguen estadísticas** detalladas de rendimiento y clasificaciones en tiempo real

## 🚧 Estado Actual de Implementación

### ✅ **Funcionalidades Implementadas**
- **🏆 Gestión de Ligas**
  - ✅ Creación de ligas privadas con códigos únicos
  - ✅ Unión a ligas existentes mediante código de invitación
  - ✅ Visualización de miembros de la liga

- **💰 Mercado de Pilotos (Parcial)**
  - ✅ Listado de pilotos disponibles con precios
  - ✅ Visualización de elementos identificativos de cada piloto con actualización automática (equipo al que pertenecen actualmente a prueba de cambio de equipos intratemporada, logo del equipo y fotografía de cada piloto acorde a estos datos).
  - 🔄 Visualización de estadísticas básicas de pilotos (pendiente de refinamiento)
  - 🔄 Sistema de precios dinámicos (base implementada, pendiente de refinamiento)
  - 🔄 Compra/venta de pilotos (en desarrollo)

- **📊 Datos reales de F1**
  - ✅ Integración con FastF1 para datos oficiales
  - ✅ Actualización automática de resultados de carreras
  - ✅ Cacheo de datos para optimización

### 🔄 **En Desarrollo**
- **👤 Gestión de Equipos de Usuario**
  - Formación de equipos con presupuesto limitado
  - Transferencias sólo disponibles entre carreras
  - Buyouts a precio de cláusula de rescisión

- **🏁 Sistema de Puntuación**
  - Cálculo automático de puntos para cada equipo de usuario por carrera
  - Clasificaciones en tiempo real dentro de las ligas
  - Historial de rendimiento de cada piloto
  - Estadísticas más completas

- **🔐 Autenticación Completa**
  - 🔄 Perfiles completos de usuario (en desarrollo)
  - 🔄 Recuperación de contraseña (pendiente)

### 🎯 **Próximas Funcionalidades**
- Sistema de notificaciones
- Análisis avanzados y estadísticas
- Poder ver resultados de temporadas anteriores, garantizar la continuidad entre temporadas
- API pública para desarrolladores

## 🚀 Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Architecture
![DDD](https://img.shields.io/badge/Domain_Driven_Design-FF6B6B?style=for-the-badge&logo=architecture&logoColor=white)
![TDD](https://img.shields.io/badge/Test_Driven_Development-4ECDC4?style=for-the-badge&logo=checkmarx&logoColor=white)

## 📋 Índice

- [¿Qué es Grid Fans Club?](#-qué-es-grid-fans-club)
- [Estado Actual de Implementación](#-estado-actual-de-implementación)
- [Tech Stack](#-tech-stack)
- [Estructura de la Aplicación](#️-estructura-de-la-aplicación)
- [Tecnologías y Dependencias](#️-tecnologías-y-dependencias)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Arquitectura](#️-arquitectura)
- [Sobre el Proyecto](#-sobre-el-proyecto)

## 🏗️ Estructura de la Aplicación

### 📁 **Estructura Actual (main branch - En Funcionamiento)**

```
Sprint 8/
├── f1_api/                     # Backend (FastAPI + Python)
│   ├── __pycache__/           # Cache de Python
│   ├── config/                # Configuración de base de datos
│   │   ├── sql_connect.py     # Conexiones SQLite
│   │   └── sql_init.py        # Inicialización de tablas
│   ├── controllers/           # Controladores legacy (MVC tradicional)
│   │   ├── driver_controller.py
│   │   ├── league_controller.py
│   │   └── user_controller.py
│   ├── models/                # Modelos de datos (SQLAlchemy)
│   │   └── f1_models.py       # Definición de tablas
│   ├── routers/               # Rutas FastAPI
│   │   ├── driver_routes.py
│   │   ├── league_routes.py
│   │   └── user_routes.py
│   ├── season/                # Scripts de actualización de datos
│   │   ├── update_db.py       # Actualización manual de BD
│   │   ├── drivers/           # Datos de pilotos
│   │   ├── events/            # Datos de eventos
│   │   ├── sessions/          # Datos de sesiones
│   │   └── teams/             # Datos de equipos
│   ├── ff1_cache/             # Cache de FastF1
│   ├── app.py                 # Configuración de aplicación
│   └── main.py                # Punto de entrada
│
├── frontend/                  # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas de la aplicación
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # Context providers
│   │   ├── utils/             # Utilidades
│   │   └── types/             # Tipos TypeScript
│   ├── public/                # Archivos estáticos
│   └── package.json           # Dependencias del frontend
│
└── README.md                  # Este archivo
```

### 🎯 **Estructura Objetivo (refactor/phase-1-foundation - En Migración)**

```
Sprint 8/
├── f1_api/                     # Backend (FastAPI + DDD)
│   ├── features/               # 🆕 Bounded Contexts (DDD)
│   │   ├── market/            # Contexto de mercado de pilotos
│   │   │   ├── domain/        # Lógica de negocio pura
│   │   │   │   ├── entities/  # Entidades (UserTeam, Driver)
│   │   │   │   ├── value_objects/ # VOs (Money, FantasyPrice)
│   │   │   │   ├── services/  # Servicios de dominio
│   │   │   │   └── repositories/ # Interfaces de repositorio
│   │   │   ├── application/   # Casos de uso
│   │   │   │   ├── use_cases/ # Comprar piloto, crear equipo
│   │   │   │   └── dtos/      # Data Transfer Objects
│   │   │   ├── infrastructure/ # Implementaciones técnicas
│   │   │   │   ├── repositories/ # Implementación de repos
│   │   │   │   ├── services/  # Servicios externos
│   │   │   │   └── mappers/   # Mapeo entre capas
│   │   │   └── api/           # Endpoints FastAPI
│   │   │       ├── routes.py  # Definición de rutas
│   │   │       └── schemas.py # Esquemas Pydantic
│   │   ├── f1_data/           # Contexto de datos de F1
│   │   │   ├── domain/        # Entidades: Race, Session, Result
│   │   │   ├── application/   # Casos de uso de F1
│   │   │   ├── infrastructure/ # FastF1 integration
│   │   │   └── api/           # F1 data endpoints
│   │   ├── scoring/           # Contexto de puntuación
│   │   │   ├── domain/        # FantasyPoints, Scoring rules
│   │   │   ├── application/   # Calcular puntos
│   │   │   ├── infrastructure/ # Persistence
│   │   │   └── api/           # Scoring endpoints
│   │   └── league/            # Contexto de ligas
│   │       ├── domain/        # League, Membership
│   │       ├── application/   # Crear liga, unirse
│   │       ├── infrastructure/ # League persistence
│   │       └── api/           # League endpoints
│   ├── shared/                # 🆕 Código compartido entre contextos
│   │   ├── domain/            # Value Objects base (Money, UserId)
│   │   │   ├── value_objects/ # VOs compartidos
│   │   │   ├── exceptions/    # Excepciones de dominio
│   │   │   └── interfaces/    # Interfaces base
│   │   └── infrastructure/    # Utilidades técnicas
│   │       ├── database/      # Configuración BD
│   │       ├── logging/       # Logging
│   │       └── cache/         # Sistema de cache
│   ├── legacy/                # 🔄 Código legacy (en transición)
│   │   ├── controllers/       # Controladores MVC originales
│   │   ├── models/            # Modelos SQLAlchemy legacy
│   │   └── routers/           # Rutas legacy
│   ├── tests/                 # 🆕 Tests organizados por contexto
│   │   ├── unit/              # Tests unitarios
│   │   ├── integration/       # Tests de integración
│   │   └── e2e/               # Tests end-to-end
│   ├── config/                # Configuración
│   ├── ff1_cache/             # Cache de FastF1
│   └── main.py                # Punto de entrada
│
├── frontend/                  # Frontend (sin cambios mayores)
└── docs/                      # 🆕 Documentación de arquitectura
    ├── architecture/          # Diagramas y decisiones
    ├── ddd/                   # Guías de DDD
    └── migration/             # Plan de migración
```

### 🔄 **Estado de Migración**

| Componente | Estado Actual | Estado Objetivo | Progreso |
|------------|---------------|-----------------|----------|
| **Controladores** | ✅ MVC tradicional | 🔄 Use Cases + API Layer | En migración |
| **Modelos** | ✅ SQLAlchemy directo | 🔄 Entities + Value Objects | Planificado |
| **Base de datos** | ✅ SQLite | 🔄 PostgreSQL (Supabase) | En progreso |
| **Tests** | ❌ Escasos | 🔄 TDD con cobertura completa | Iniciando |
| **Arquitectura** | ✅ MVC monolítico | 🔄 DDD con Bounded Contexts | Fase 1 activa |

### 📋 **Plan de Migración por Fases**

- :arrows_counterclockwise: Plan provisional y en mejora continua

#### **Fase 1: Foundation (Actual - refactor/phase-1-foundation)**
- ✅ Configurar estructura de carpetas DDD
- 🔄 Migrar Value Objects básicos (Money, UserId)
- 🔄 Implementar interfaces base (Repository, UnitOfWork)
- 🔄 Configurar testing framework con TDD

#### **Fase 2: Market Context**
- 🎯 Migrar lógica de mercado de pilotos
- 🎯 Implementar agregados (UserTeam)
- 🎯 Use Cases de compra/venta

#### **Fase 3: F1 Data Context**
- 🎯 Migrar integración FastF1
- 🎯 Optimizar sistema de cache
- 🎯 APIs de datos de F1

#### **Fase 4: Scoring & League**
- 🎯 Sistema de puntuación
- 🎯 Gestión de ligas
- 🎯 Eliminación del código legacy

## 🛠️ Tecnologías y Dependencias

### Backend (f1_api/)

**Framework Principal:**
- ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) **FastAPI** - Framework web moderno y rápido para Python
- ![SQLModel](https://img.shields.io/badge/SQLModel-FCA121?style=flat&logo=python&logoColor=white) **SQLModel** - ORM basado en SQLAlchemy con soporte para Pydantic
- ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat&logo=python&logoColor=white) **Pydantic** - Validación de datos, serialización JSON y esquemas de API (DTOs, request/response models)

**Base de Datos y Backend as a Service:**
- ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) **Supabase** - Backend as a Service con autenticación, base de datos PostgreSQL y APIs en tiempo real
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) **PostgreSQL** - Base de datos relacional (a través de Supabase)
- ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=python&logoColor=white) **SQLAlchemy** - ORM y manejo de migraciones

**Datos de F1:**
- ![Python](https://img.shields.io/badge/FastF1-3776AB?style=flat&logo=python&logoColor=white) **FastF1** - Librería para obtener datos oficiales de Formula 1

**Testing:**
- ![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=flat&logo=pytest&logoColor=white) **Pytest** - Framework de testing
- ![Coverage](https://img.shields.io/badge/Coverage-4c1?style=flat&logo=python&logoColor=white) **Pytest-cov** - Coverage de tests

**Arquitectura:**
- ![DDD](https://img.shields.io/badge/DDD-FF6B6B?style=flat&logo=architecture&logoColor=white) **Domain-Driven Design (DDD)** - Patrón arquitectónico
- ![TDD](https://img.shields.io/badge/TDD-4ECDC4?style=flat&logo=checkmarx&logoColor=white) **Test-Driven Development (TDD)** - Metodología de desarrollo

### Frontend (frontend/)

**Framework Principal:**
- ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) **React 18** - Librería de UI
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) **TypeScript** - Tipado estático para JavaScript
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) **Vite** - Build tool y dev server

**Styling:**
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) **Tailwind CSS** - Framework CSS utility-first
- ![CSS3](https://img.shields.io/badge/CSS_Modules-1572B6?style=flat&logo=css3&logoColor=white) **CSS Modules** - CSS con scope local

**Estado y Routing:**
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=reactrouter&logoColor=white) **React Router** - Enrutado del lado del cliente
- ![React](https://img.shields.io/badge/React_Context-61DAFB?style=flat&logo=react&logoColor=black) **React Context** - Manejo de estado global
- ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat&logo=reactquery&logoColor=white) **React Query/TanStack Query** - Manejo de estado del servidor

**Autenticación:**
- ![Supabase](https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=flat&logo=supabase&logoColor=white) **Supabase Auth** - Sistema de autenticación con OAuth y JWT

**Development:**
- ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) **ESLint** - Linter para JavaScript/TypeScript

## 🚀 Instalación

### Prerrequisitos

- **Python 3.12.7+**
- **Node.js 18+**
- **npm**
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/mstne03/Sprint-8.git
cd Sprint-8
```

### 2. Setup del Backend

```bash
# Navegar al directorio del backend
cd f1_api

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Instalar dependencias específicas de Supabase (si no están en requirements.txt)
pip install supabase python-dotenv psycopg2-binary

# Crear directorio de cache para FastF1
mkdir ff1_cache

# Configurar base de datos (ver sección Configuración)
```

### 3. Setup del Frontend

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Instalar Supabase client (si no está en package.json)
npm install @supabase/supabase-js

# O si prefieres yarn:
yarn install
yarn add @supabase/supabase-js
```

## ⚙️ Configuración

### Backend Configuration

1. **Variables de entorno** - Crear `.env` en `f1_api/`:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# FastF1 Cache
FASTF1_CACHE_DIR=./ff1_cache

# API Configuration
API_HOST=localhost
API_PORT=8000
DEBUG=true

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

2. **Configurar Supabase:**

   - Crea un proyecto en [Supabase](https://supabase.com/)
   - Ve a Settings > API para obtener las URLs y keys
   - Copia tu Project URL y anon key a las variables de entorno
   - Opcionalmente, configura las tablas y políticas RLS (Row Level Security)

3. **Crear directorio de cache para FastF1:**

```bash
# Navegar al directorio del backend (si no estás ahí)
cd f1_api

# Crear directorio de cache para FastF1
mkdir ff1_cache

# Verificar que se creó correctamente
# Windows:
dir ff1_cache
# macOS/Linux:
ls -la ff1_cache
```

> **📝 Nota:** FastF1 requiere un directorio de cache para almacenar datos descargados de F1. Sin esto, cada consulta tardaría 30+ segundos descargando desde internet. Con cache, las consultas posteriores son casi instantáneas (~1 segundo).

4. **Inicializar base de datos:**

```bash
cd f1_api
python -c "from config.sql_init import init_database; init_database()"
```

### Frontend Configuration

1. **Variables de entorno** - Crear `.env` en `frontend/`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎮 Uso

### Desarrollo

**Iniciar Backend:**

```bash
cd f1_api
# Activar entorno virtual si no está activo
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Iniciar servidor de desarrollo
uvicorn main:app --reload --host localhost --port 8000
```

**Iniciar Frontend:**

```bash
cd frontend
npm run dev
# O: yarn dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

### Testing

**Backend Tests:**

```bash
cd f1_api
pytest                          # Todos los tests
pytest -m unit                  # Solo tests unitarios
pytest --cov=features          # Con coverage
```

**Frontend Tests:**

```bash
cd frontend
npm test                        # Tests con Jest
npm run test:coverage          # Con coverage
```

### Build para Producción

**Backend:**

```bash
cd f1_api
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**

```bash
cd frontend
npm run build                   # Genera dist/
npm run preview                 # Preview del build
```

## 🏛️ Arquitectura

### Patrón Domain-Driven Design (DDD)

La aplicación sigue los principios de DDD con:

- **Bounded Contexts:** Separación clara entre dominios (Market, F1 Data, Scoring, League)
- **Aggregates:** Entidades agrupadas con fronteras transaccionales
- **Value Objects:** Objetos inmutables sin identidad (Money, FantasyPrice)
- **Domain Services:** Lógica de negocio que no pertenece a entidades
- **Use Cases:** Casos de uso de aplicación (comprar piloto, crear liga)

### Flujo de Datos

```
Frontend (React) 
    ↓ HTTP Requests
FastAPI Routers 
    ↓ Dependency Injection
Use Cases (Application Layer)
    ↓ Domain Logic
Domain Services & Aggregates
    ↓ Persistence
Repositories (Infrastructure)
    ↓ ORM
Database (SQLite/PostgreSQL)
```

### Bounded Contexts

1. **Market:** Gestión del mercado de pilotos, precios, transacciones
2. **F1 Data:** Obtención y procesamiento de datos oficiales de F1
3. **Scoring:** Cálculo de puntos fantasy y rankings
4. **League:** Gestión de ligas privadas y membresías

---

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Sobre el Proyecto

### 🎓 **Contexto Académico**
Este proyecto se desarrolla como parte de **Sprint 8** en el contexto de formación técnica. Es un proyecto educativo que implementa conceptos avanzados de desarrollo full-stack y arquitectura de software.

### 🔧 **Estado de Desarrollo**
- **Fase:** Desarrollo activo (MVP en construcción)
- **Propósito:** Proyecto académico y de aprendizaje
- **Arquitectura:** Implementación progresiva de Domain-Driven Design (DDD)

### ⚖️ **Licencia y Uso**
Este es un proyecto educativo sin licencia comercial específica. El código está disponible para:
- ✅ Propósitos educativos y de aprendizaje
- ✅ Referencia técnica y estudio de arquitecturas
- ✅ Contribuciones y mejoras (con fines académicos)

**Nota:** Los datos de Formula 1 son propiedad de sus respectivos dueños. Este proyecto utiliza APIs públicas y librerías como FastF1 bajo sus propios términos de uso.

### 🤝 **Contribuciones**
Las contribuciones son bienvenidas, especialmente de estudiantes y desarrolladores que quieran aprender sobre:
- Domain-Driven Design (DDD)
- Test-Driven Development (TDD)
- Arquitecturas full-stack modernas
- Integración de APIs deportivas