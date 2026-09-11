"use client";

import React from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext"; // Adjust import path to your useCart location

interface ProductActionsProps {
  product: any;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleBuyNow = () => {
    addToCart(product);
    // Add redirect logic to checkout if needed (e.g., router.push('/checkout'))
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <button
        onClick={handleAddToCart}
        className="flex-1 bg-white hover:bg-orange-50 text-orange-500 border-2 border-orange-500 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>

      <button
        onClick={handleBuyNow}
        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
      >
        <Zap className="w-5 h-5 fill-current" />
        Buy Now
      </button>
    </div>
  );
}
