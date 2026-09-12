"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import axios from "axios";
import ProductActions from "./ProductActions";
import CheckoutModal from "@/components/CheckoutModal";
import { OrderItem } from "@/context/CartContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount_price: number;
  image: string;
  rating: number;
  reviews_count: number;
  stock: number;
  description: string;
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${id}`);
        setProduct(response.data as ProductDetail);
      } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
      }
    };

    void loadProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm font-semibold text-gray-600">
          Loading product...
        </div>
      </div>
    );
  }

  const discountPercentage = Math.round(
    ((product.price - product.discount_price) / product.price) * 100,
  );

  const checkoutItems: OrderItem[] = [
    {
      product_id: product.id,
      name: product.name,
      price: product.discount_price ?? product.price,
      quantity: 1,
      image_url: product.image,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CheckoutModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={checkoutItems}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div>
                <ProductActions
                  product={product}
                  onBuyNow={() => setModalOpen(true)}
                />

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
