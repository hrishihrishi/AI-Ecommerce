"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Package,
  X,
  Check,
} from "lucide-react";

interface Product {
  _id?: string;
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discount_price: number;
  image: string;
  stock: number;
  rating: number;
  reviews_count: number;
  created_at?: string;
}

interface Category {
  _id?: string;
  name: string;
}

interface Brand {
  _id?: string;
  name: string;
}

interface Filters {
  category: string;
  brand: string;
  search: string;
  min_price: string;
  max_price: string;
}

// Add this near the top of your component or in a central axios config file
axios.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// || 'https://web-constructor-50.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

export default function AdminProductsPage() {
  const router = useRouter();

  // State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    category: "",
    brand: "",
    search: "",
    min_price: "",
    max_price: "",
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    id: "",
    name: "",
    description: "",
    category: "",
    brand: "",
    price: 0,
    discount_price: 0,
    image: "",
    stock: 0,
    rating: 0,
    reviews_count: 0,
  });

  // Fetch Methods
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data as Category[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data as Brand[]);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      (Object.entries(filters) as [string, string][]).forEach(
        ([key, value]) => {
          if (value) params.append(key, value);
        },
      );
      const response = await axios.get(`${API}/products?${params.toString()}`);
      setAllProducts(response.data as Product[]);
      setProducts(response.data as Product[]);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, []);

  // Sorting
  const applySorting = () => {
    const sorted = [...allProducts];
    switch (sortBy) {
      case "price_asc":
        sorted.sort(
          (a, b) =>
            (a.discount_price ?? a.price) - (b.discount_price ?? b.price),
        );
        break;
      case "price_desc":
        sorted.sort(
          (a, b) =>
            (b.discount_price ?? b.price) - (a.discount_price ?? a.price),
        );
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        );
        break;
      default:
        break;
    }
    setProducts(sorted);
  };

  useEffect(() => {
    applySorting();
  }, [sortBy]);

  // Filters
  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    (Object.entries(newFilters) as [string, string][]).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/admin/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      search: "",
      min_price: "",
      max_price: "",
    });
    router.push("/admin/products");
    fetchProducts();
  };

  // CRUD Actions
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        id: `prod-${Date.now().toString().slice(-4)}`,
        name: "",
        description: "",
        category: categories[0]?.name || "",
        brand: brands[0]?.name || "",
        price: 0,
        discount_price: 0,
        image:
          "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500",
        stock: 0,
        rating: 4.5,
        reviews_count: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, formData);
      } else {
        await axios.post(`${API}/products`, formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(`Are you sure you want to delete product "${id}"?`)) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-500" /> Admin Product
            Management
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage inventory, add items, and update store catalog.
          </p>
        </div>

        {/* Add Product Button (Green) */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-orange-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-orange-500"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id || b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-orange-500"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>

        <button
          onClick={clearFilters}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Stock Available</th>
                <th className="py-4 px-6">Brand Name</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-neutral-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-neutral-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-orange-400 text-xs">
                      {p.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-white max-w-xs truncate">
                      {p.name}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.stock > 5
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : p.stock > 0
                              ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                              : "bg-red-950/80 text-red-400 border border-red-800"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-300">{p.brand}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {/* Update Button (Yellow) */}
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold p-2 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                        title="Edit Product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete Button (Red) */}
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold p-2 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-orange-500">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </span>
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discount_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
