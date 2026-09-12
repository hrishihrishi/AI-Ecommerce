"use client";
// Cart and wishlist context: exposes cart state and helper actions.
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface Wishlist {
  items: string[];
}

interface CartContextType {
  cart: Cart;
  wishlist: Wishlist;
  cartCount: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  createOrder: (orderData: OrderCreatePayload) => Promise<void>;
}

export interface OrderItem {
  product_id: string;
  name?: string;
  price?: number;
  quantity: number;
  image_url?: string;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderCreatePayload {
  items: OrderItem[];
  total_amount: number;
  shipping_address: ShippingAddress;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// ||  'https://web-constructor-50.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

/**
 * React provider that manages cart and wishlist state and operations.
 */
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [wishlist, setWishlist] = useState<Wishlist>({ items: [] });

  const cartCount =
    cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist.items?.length || 0;

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data as Cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [token]);

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(response.data as Wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) return;

    const timeoutId = setTimeout(() => {
      void fetchCart();
      void fetchWishlist();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [user, token, fetchCart, fetchWishlist]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      await axios.post(
        `${API}/cart/add`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await axios.post(
        `${API}/cart/remove?product_id=${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post(
        `${API}/cart/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      alert("Please login to add items to wishlist");
      return;
    }
    try {
      await axios.post(
        `${API}/wishlist/add?product_id=${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchWishlist();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await axios.post(
        `${API}/wishlist/remove?product_id=${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const createOrder = async (orderData: OrderCreatePayload) => {
    if (!user) {
      alert("Please login to place an order");
      return;
    }
    try {
      // Backend expects OrderItem.product_name and explicit price/quantity fields.
      const backendPayload = {
        items: orderData.items.map((it) => ({
          product_id: it.product_id,
          product_name: it.name ?? "",
          quantity: it.quantity,
          price: it.price ?? 0,
        })),
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
      };

      const response = await axios.post(`${API}/orders/create`, backendPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh local cart state since backend clears cart after order creation
      await fetchCart();
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        wishlistCount,
        addToCart,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        fetchCart,
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
