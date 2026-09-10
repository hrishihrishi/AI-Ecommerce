'use client';
// Wishlist page: shows products the user saved for later.
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import ProductCard, { Product } from '@/components/ProductCard';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL
  // || 'https://web-constructor-50.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

/**
 * Displays the current user's wishlist and allows navigation to products.
 */
const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { wishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWishlistProducts = async () => {
    if (!wishlist.items || wishlist.items.length === 0) {
      setLoading(false);
      setProducts([]);
      return;
    }

    try {
      const productPromises = wishlist.items.map((productId) =>
        axios.get(`${API}/products/${productId}`),
      );
      const responses = await Promise.all(productPromises);
      setProducts(responses.map((res) => res.data as Product));
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchWishlistProducts();
  }, [wishlist, user]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8" data-testid="wishlist-page">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">My Wishlist</h1>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Heart className="mx-auto mb-4 text-gray-400" size={64} />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save products you like to buy them later!</p>
            <Link
              href="/products"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4">{products.length} items in your wishlist</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
