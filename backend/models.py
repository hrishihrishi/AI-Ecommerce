"""Pydantic data models used by the backend API.

Defines request/response schemas and domain models such as users,
products, carts, orders, and reviews.
"""

from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class UserRegister(BaseModel):
    """Schema for user registration input."""
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    """Schema for user login input."""
    email: EmailStr
    password: str

class User(BaseModel):
    """Representation of a user stored in the application."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    """Representation of a product available for purchase."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    brand: str
    price: float
    discount_price: Optional[float] = None
    image: str
    stock: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    """Schema for creating a new product."""
    name: str
    description: str
    category: str
    brand: str
    price: float
    discount_price: Optional[float] = None
    image: str
    stock: int = 0

class Category(BaseModel):
    """Category metadata for grouping products."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    type: str  # mobile or laptop

class Brand(BaseModel):
    """Brand metadata for products."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: str
    type: str  # mobile or laptop

class CartItem(BaseModel):
    """Single cart line item referencing a product and quantity."""
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    """Shopping cart belonging to a user, containing cart items."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WishlistItem(BaseModel):
    """Single wishlist entry referencing a product."""
    product_id: str

class Wishlist(BaseModel):
    """User wishlist containing product IDs."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[str] = []  # product IDs
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    """Line item included in an order."""
    product_id: str
    product_name: str
    quantity: int
    price: float

class Order(BaseModel):
    """Order record storing items, totals, and payment/shipping info."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem]
    total_amount: float
    payment_id: Optional[str] = None
    payment_status: str = "pending"  # pending, success, failed
    order_status: str = "processing"  # processing, shipped, delivered, cancelled
    shipping_address: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    """Schema used to create a new order."""
    items: List[OrderItem]
    total_amount: float
    shipping_address: dict

class Review(BaseModel):
    """A product review submitted by a user."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int  # 1-5
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    """Schema for submitting a new review."""
    product_id: str
    rating: int
    comment: str

class BlogPost(BaseModel):
    """A blog post entry for informational content."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: str
    image: str
    author: str = "Sparible Team"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    """Schema for creating a blog post."""
    title: str
    content: str
    excerpt: str
    image: str