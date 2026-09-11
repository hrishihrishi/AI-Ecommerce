import React from "react";
import Image from "next/image";
// import { notFound } from "next/navigation";
import { MongoClient } from "mongodb";
import {
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import ProductActions from "./ProductActions";

// MongoDB Client Setup (Ensure MONGODB_URI is defined in your .env.local file)
const uri = process.env.MONGODB_URI;
let client: MongoClient;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// || 'https://web-constructor-50.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

async function getProductById(id: string) {
  try {
    // Queries API endpoint: /products/prod-6 or /products?id=prod-6
    const response = await axios.get(`${API}/products/${id}`);

    // Assign product from API response data
    const product = response.data;

    if (!product) {
      console.error(`NOTFOUND: Product with id ${id} not found.`);
      return null;
    }

    return product;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  //   if (!product) {
  //     notFound();
  //   }

  const discountPercentage = Math.round(
    ((product.price - product.discount_price) / product.price) * 100,
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header / Navbar representation matching Super Commerce UI */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 text-white font-bold text-xl px-3 py-1 rounded-md">
              S
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Super Commerce
            </span>
          </div>

          <div className="flex-1 max-w-2xl mx-4">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side: Product Image Display */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                {product.discount_price < product.price && (
                  <span className="absolute top-4 left-4 bg-pink-600 text-white font-semibold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                    {discountPercentage}% OFF
                  </span>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>

            {/* Right Side: Product Details & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  {product.brand} • {product.category}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>

                {/* Rating & Stock Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    <span>{product.rating}</span>
                    <Star className="w-3 h-3 ml-1 fill-current" />
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviews_count} Reviews)
                  </span>
                  <span className="text-gray-300">|</span>
                  <span
                    className={`text-xs font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {product.stock > 0
                      ? `In Stock (${product.stock} left)`
                      : "Out of Stock"}
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 my-6 pb-6 border-b border-gray-100">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{product.discount_price}
                  </span>
                  {product.price > product.discount_price && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.price}
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="text-sm font-semibold text-orange-500">
                      Save {discountPercentage}%
                    </span>
                  )}
                </div>

                {/* Product Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Purchase Actions & Trust Badges */}
              <div>
                {/* <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button className="flex-1 bg-white hover:bg-orange-50 text-orange-500 border-2 border-orange-500 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all">
                    <Zap className="w-5 h-5 fill-current" />
                    Buy Now
                  </button>
                </div> */}
                <ProductActions product={product} />

                {/* Features / Guarantees */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    <span>100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-5 h-5 text-orange-500" />
                    <span>Easy Replacement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
