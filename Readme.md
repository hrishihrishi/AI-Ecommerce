# Super Commerce

A full-stack e-commerce application built with Next.js, React, TypeScript, Tailwind CSS, FastAPI, MongoDB, and AI-powered shopping assistance. The platform supports product browsing, filtering, searching, cart and wishlist management, checkout, and an AI shopping assistant with vector search and conversational support.

## GitHub repository

- https://github.com/hrishihrishi/AI-Ecommerce

## Live / demo URL

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- AI Assistant Server: http://localhost:8005

## Documentation

- [docs/README.md](docs/README.md)
- [docs/project-summary.md](docs/project-summary.md)
- [docs/database-schema.md](docs/database-schema.md)
- [docs/api-reference.md](docs/api-reference.md)
- [docs/system-design.md](docs/system-design.md)

## Database schema

The project uses MongoDB collections for users, products, categories, brands, carts, wishlists, orders, reviews, and AI vector search data. See [docs/database-schema.md](docs/database-schema.md) for the full schema.

## Basic API documentation

The application exposes a FastAPI commerce API and a separate Express AI assistant API. See [docs/api-reference.md](docs/api-reference.md) for the main endpoints and request examples.

## One-page system design

A concise architecture overview is available in [docs/system-design.md](docs/system-design.md).

## Total time taken

- 1.5 days

## AI tools used

- Google Gemini for embeddings and generative responses
- LangChain for orchestration and tool calling
- LangGraph for conversational agent workflows
- MongoDB Atlas vector search for semantic product discovery

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Clerk for authentication and Google sign-in
- Radix UI components and shadcn-style UI primitives
- React Toast / Hot Toast notifications

### Backend API

- FastAPI
- Python
- MongoDB via Motor
- JWT-based authentication
- Password hashing with bcrypt / passlib
- Razorpay-ready payment integration

### AI Server

- Express.js + TypeScript
- LangChain
- LangGraph
- MongoDB vector search / vector DB integration
- Google Gemini embeddings and Gemini API

### Database

- MongoDB Atlas / MongoDB
- Vector search support for semantic product retrieval

## Key Features

- JWT auth with login, logout, and registration
- Google OAuth / social login via Clerk
- User profile and admin support
- Product catalog with search, sort, and filters
- Add to cart and remove from cart
- Wishlist management
- Order placement flow
- Toast notifications for user actions
- AI shopping assistant with:
  - vector search
  - text search
  - normal conversational interaction
- MongoDB-backed storage for products, users, orders, cart, wishlist, and AI-related data
- Gemini-powered embeddings and AI search experience

## Application Overview

This project combines an e-commerce storefront and an AI assistant for product discovery and shopping guidance. The frontend provides the storefront experience, the FastAPI backend handles app logic and authentication, and the Node/Express AI service processes product and chat workflows with LangGraph and vector retrieval.

## Project Structure

```bash
AI-ecommerce/
├── backend/                 # FastAPI backend
│   ├── auth.py
│   ├── models.py
│   ├── server.py
│   ├── seed_db.py
│   ├── requirements.txt
│   └── .env
├── next-frontend/           # Next.js storefront
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── server/                  # AI assistant server (LangChain / LangGraph)
│   ├── index.ts
│   ├── agent.ts
│   ├── seed-database.ts
│   ├── package.json
│   └── README.md
├── start-backend.sh         # Starts FastAPI backend
├── Readme.md                # Project documentation
└── package-lock.json
```

## Requirements

- Node.js and npm
- Python 3.10+
- MongoDB Atlas or local MongoDB instance
- Google Gemini API key
- Clerk frontend keys for Google auth

## Environment Setup

### Backend

Create a `.env` file inside the `backend` directory with the required MongoDB and auth variables. Example:

```bash
MONGO_URL="your_mongodb_connection_string"
DB_NAME="your_database_name"
JWT_SECRET="your_jwt_secret"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
GOOGLE_API_KEY="your_gemini_api_key"
CORS_ORIGINS="http://localhost:3000"
```

### Frontend

Set up the required public environment variables in the `next-frontend` app, for example:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Clerk API keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Chat Server URL
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:8005
MONGODB_URI="your_mongodb_connection_string"
```

### AI Server

Create a `.env` file inside the `server` directory with your MongoDB and Gemini configuration:

```bash
MONGODB_ATLAS_URI="your_mongodb_connection_string"
GOOGLE_API_KEY="your_google_gemini_key"
```

## Run the Project

### 1) Start the backend

```bash
./start-backend.sh
```

This starts the FastAPI backend on http://localhotst:8000.

### 2) Start the frontend

```bash
cd next-frontend
npm run dev
```

This starts the Next.js frontend, usually on http://localhotst:3000.

### 3) Start the AI server

```bash
cd server
npm run dev
```

This starts the LangChain / LangGraph AI service used for assistant and retrieval workflows on http://localhotst:8005 .

## Frontend Features

The frontend includes:

- Home page and landing experience
- Product listing pages
- Search, filter, and sort capabilities
- Category pills and product navigation
- Cart, wishlist, and order flows
- Authentication pages for login and registration
- Responsive layout and mobile navigation
- Toast notifications for actions like add-to-cart and wishlist updates

## Backend Features

The FastAPI backend provides:

- user registration and login
- JWT issuance and validation
- protected routes for carts, orders, and wishlist
- product retrieval and filtering
- MongoDB-backed persistence for ecommerce entities
- admin-related endpoints

## AI Assistant Features

The AI server supports:

- product conversation with the assistant
- vector search for similar items
- text-based retrieval
- natural conversation flow with LangGraph orchestration
- Gemini-based semantic enrichment and embeddings

## Notes

- The storefront is primarily powered by the Next.js app in `next-frontend`.
- The AI assistant is separate from the main ecommerce API and is served from the `server` folder.
- MongoDB is used for both standard transactional data and vector-based retrieval workflows.

## License

This project is for learning and demo purposes.
