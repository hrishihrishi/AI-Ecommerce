"use client";

import React from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductActionsProps {
  product: {
    id: string;
    name?: string;
    image?: string;
    price?: number;
    discount_price?: number;
  };
  onBuyNow?: () => void;
}

export default function ProductActions({
  product,
  onBuyNow,
}: ProductActionsProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    void addToCart(product.id);
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow();
      return;
    }
    // void addToCart(product.id);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <button
        type="button"
        onClick={handleAddToCart}
        className="flex-1 bg-white hover:bg-orange-50 text-orange-500 border-2 border-orange-500 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
      >
        <Zap className="w-5 h-5 fill-current" />
        Buy Now
      </button>
    </div>
  );
}
