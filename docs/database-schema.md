# Database Schema

The project uses MongoDB collections for both the main commerce data and AI retrieval data.

## Core collections

### users

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "phone": "string | null",
  "is_admin": "boolean",
  "password": "string (hashed)",
  "created_at": "ISO datetime"
}
```

Purpose:

- user authentication and profile data
- admin flag for product and order management access

### products

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "brand": "string",
  "price": "number",
  "discount_price": "number | null",
  "image": "string",
  "stock": "number",
  "rating": "number",
  "reviews_count": "number",
  "created_at": "ISO datetime"
}
```

Purpose:

- catalog master data
- supports category filters, price filtering, and search

### categories

```json
{
  "id": "string",
  "name": "string",
  "icon": "string",
  "type": "string"
}
```

Purpose:

- navigation and product grouping

### brands

```json
{
  "id": "string",
  "name": "string",
  "logo": "string",
  "type": "string"
}
```

Purpose:

- brand-based catalog filters

### carts

```json
{
  "id": "string",
  "user_id": "string",
  "items": [
    {
      "product_id": "string",
      "quantity": "number"
    }
  ],
  "updated_at": "ISO datetime"
}
```

Purpose:

- stores each user’s cart state

### wishlists

```json
{
  "id": "string",
  "user_id": "string",
  "items": ["string"],
  "updated_at": "ISO datetime"
}
```

Purpose:

- stores product IDs saved by the user

### orders

```json
{
  "id": "string",
  "user_id": "string",
  "items": [
    {
      "product_id": "string",
      "product_name": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "total_amount": "number",
  "payment_id": "string | null",
  "payment_status": "pending | success | failed",
  "order_status": "processing | shipped | delivered | cancelled",
  "shipping_address": "object",
  "created_at": "ISO datetime"
}
```

Purpose:

- order history and fulfilment tracking

### reviews

```json
{
  "id": "string",
  "product_id": "string",
  "user_id": "string",
  "user_name": "string",
  "rating": "number",
  "comment": "string",
  "created_at": "ISO datetime"
}
```

Purpose:

- product ratings and review content

### blogs

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "image": "string",
  "author": "string",
  "created_at": "ISO datetime"
}
```

Purpose:

- informational content and marketing blocks

## AI vector collection

The chatbot server uses a MongoDB collection named `itemsWsummary` in the `vector_database` database. The schema is designed for semantic search:

```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "embedding_text": "string",
  "embedding": "vector"
}
```

This collection is indexed for vector search and is used by the LangGraph agent to retrieve relevant products via semantic similarity and text fallback search.
