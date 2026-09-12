"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Package, Trash2, Loader2, AlertCircle } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://web-constructor-50.preview.emergentagent.com";
const API = `${BACKEND_URL}/api`;

interface OrderItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  original_price?: number;
  quantity: number;
  image_url?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  order_status?: string;
  total_amount: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      // Normalize backend `order_status` -> `status` to avoid undefined property errors
      const normalized: Order[] = (data || []).map((o: any) => ({
        ...o,
        status: o.status ?? o.order_status ?? "Unknown",
      }));
      setOrders(normalized);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingId(orderId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/orders/${orderId}/cancel`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.log("Error response during order cancellation:", await res.text());
        console.log(res);
        throw new Error("Failed to cancel order");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order,
        ),
      );
    } catch (err: any) {
      alert(err.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-black tracking-tight mb-8">
          My Orders
        </h1>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm space-y-3">
            <Package className="w-12 h-12 mx-auto text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800">
              No orders found
            </h2>
            <p className="text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
          </div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div>
                <p className="text-xs text-gray-500">ORDER ID</p>
                <p className="text-sm font-semibold text-gray-800">
                  #{order.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">DATE</p>
                <p className="text-sm text-gray-700">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">STATUS</p>
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    order.status.toLowerCase() === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              {order.status.toLowerCase() !== "cancelled" && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={cancellingId === order.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition disabled:opacity-50"
                >
                  {cancellingId === order.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Cancel Order
                </button>
              )}
            </div>

            {/* Order Items */}
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {item.name}
                      </h3>
                      {item.brand && (
                        <p className="text-sm text-gray-400 mt-0.5">
                          {item.brand}
                        </p>
                      )}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-gray-900 text-base">
                          ₹{item.price}
                        </span>
                        {item.original_price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{item.original_price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Qty</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
