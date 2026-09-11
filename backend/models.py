Pydantic data models used by the backend API.

Defines request/response schemas and domain models such as users,
products, carts, orders, and reviews.


from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# -------------------------------------------User Models------------------------------------------- 
#Schema for user registration input.
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

#Schema for user login input.
class UserLogin(BaseModel):
    email: EmailStr
    password: str

#Representation of a user stored in the application.
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))



# -------------------------------------------Product Models------------------------------------------- 
#Representation of a product available for purchase.
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str 
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

#Schema for creating a new product.
class ProductCreate(BaseModel):
    id: str 
    name: str
    description: str
    category: str
    brand: str
    price: float
    discount_price: Optional[float] = None
    image: str
    stock: int = 0


# -------------------------------------------Category and Brand Models-------------------------------------------
#Category metadata for grouping products.
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    type: str  # mobile or laptop

#Brand metadata for products.
class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo: str
    type: str  # mobile or laptop



# -------------------------------------------CartModels------------------------------------------- 
#Single cart line item referencing a product and quantity.
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

#Shopping cart belonging to a user, containing cart items.
class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))



# -------------------------------------------Wishlist Models------------------------------------------- 

#Single wishlist entry referencing a product.
class WishlistItem(BaseModel):
    product_id: str

#User wishlist containing product IDs.
class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[str] = []  # product IDs
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))



# -------------------------------------------Order Models-------------------------------------------
#Line item included in an order.
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

#Order record storing items, totals, and payment/shipping info.
class Order(BaseModel):
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

#Schema used to create a new order.
class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: dict

#A product review submitted by a user.
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int  # 1-5
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

#Schema for submitting a new review.
class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str



# -------------------------------------------Blog Models-------------------------------------------
#A blog post entry for informational content.
class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: str
    image: str
    author: str = "Super Commerce Team"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

#Schema for creating a blog post.
class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    image: str