# Basic API Documentation

## Overview

This project exposes two primary API layers:

1. FastAPI commerce backend: provides storefront, auth, products, cart, wishlist, orders, and admin APIs.
2. Express AI server: handles conversational product discovery and agent-based shopping assistance.

## Commerce API base

- Base URL: http://localhost:8000
- OpenAPI docs: http://localhost:8000/docs

## Authentication

### POST /api/auth/register

Creates a new user and returns a JWT token.

Request body:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "phone": "+919876543210"
}
```

Response:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "is_admin": false,
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

### POST /api/auth/login

Authenticates a user and returns a JWT.

### GET /api/auth/me

Returns the current authenticated user.

## Products

### GET /api/products

Returns product catalog entries with optional filters.

Query parameters:

- category
- brand
- search
- min_price
- max_price
- limit

Example:

```http
GET /api/products?category=smartphones&max_price=50000&limit=20
```

### GET /api/products/{product_id}

Returns one product by ID.

### POST /api/products

Creates a product; requires admin access.

### PUT /api/products/{product_id}

Updates a product; requires admin access.

### DELETE /api/products/{product_id}

Deletes a product; requires admin access.

## Catalog metadata

### GET /api/categories

Returns categories for navigation and filtering.

### GET /api/brands

Returns brands for filtering or highlighting.

## Cart and wishlist

### GET /api/cart

Returns the authenticated user’s cart.

### POST /api/cart/add

Adds an item to the cart.

### POST /api/cart/remove

Removes an item by product ID.

### POST /api/cart/clear

Clears the cart.

### GET /api/wishlist

Returns the user wishlist.

### POST /api/wishlist/add

Adds a product to the wishlist.

### POST /api/wishlist/remove

Removes a product from the wishlist.

## Orders

### GET /api/orders

Returns the current user’s order history.

### POST /api/orders/create

Creates a new order.

### DELETE /api/orders/{order_id}/cancel

Cancels a specific order.

## Payments

### POST /api/payment/create-order

Creates a Razorpay order for checkout.

### POST /api/payment/verify

Verifies the Razorpay payment signature.

## Reviews

### GET /api/reviews/{product_id}

Returns reviews for a product.

### POST /api/reviews/create

Adds a user review for a product.

## AI assistant API

Base URL: http://localhost:8005

### POST /

Health check endpoint for the AI service.

### POST /chat

Starts a new AI conversation session.

Request:

```json
{
  "message": "Find me a good gaming laptop under 80000"
}
```

Response:

```json
{
  "threadId": "1700000000000",
  "response": "Here are a few relevant products..."
}
```

### POST /chat/:threadId

Continues an existing conversation thread.

## Notes

- Authentication is done using JWT Bearer tokens.
- Product images and pricing data are stored in MongoDB.
- AI responses are generated using Gemini plus vector search over the product database.
