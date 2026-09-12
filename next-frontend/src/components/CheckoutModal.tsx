"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Loader2, Package } from "lucide-react";
import {
  useCart,
  OrderItem,
  ShippingAddress,
  OrderCreatePayload,
} from "@/context/CartContext"; // Adjust import path as needed

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
}: CheckoutModalProps) {
  const router = useRouter();
  const { createOrder } = useCart();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: OrderCreatePayload = {
      items,
      total_amount: totalAmount,
      shipping_address: address,
    };

    try {
      await createOrder(payload);
      onClose();
      router.push("/orders");
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary (Pre-populated) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-white rounded-md border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {item.name || `Product ID: ${item.product_id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{(item.price || 0) * item.quantity}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 px-1">
              <span className="text-base font-semibold text-gray-700">
                Total Amount:
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* Shipping Address Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Shipping Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  name="full_name"
                  value={address.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Address Line 1 *
                </label>
                <input
                  required
                  type="text"
                  name="address_line1"
                  value={address.address_line1}
                  onChange={handleChange}
                  placeholder="House/Flat No., Street, Area"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={address.address_line2}
                  onChange={handleChange}
                  placeholder="Landmark, Apartment, Suite"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  City *
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  State *
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Postal Code *
                </label>
                <input
                  required
                  type="text"
                  name="postal_code"
                  value={address.postal_code}
                  onChange={handleChange}
                  placeholder="560001"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Country *
                </label>
                <input
                  required
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Place Order (₹{totalAmount})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
