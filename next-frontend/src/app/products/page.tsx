'use client';
// Products listing page: filters, sorting and product grid.
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import ProductCard, { Product } from '@/components/ProductCard';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL
  // || 'https://web-constructor-50.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
  type?: string;
}

interface Filters {
  category: string;
  brand: string;
  search: string;
  min_price: string;
  max_price: string;
}

/**
 * Displays product search results with filtering and sorting controls.
 */
const Products: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  });



  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data as Brand[]);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      (Object.entries(filters) as [string, string][]).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axios.get(`${API}/products?${params.toString()}`);
      setAllProducts(response.data as Product[]);
      setProducts(response.data as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySorting = () => {
    const sorted = [...allProducts];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
        break;
      default:
        break;
    }
    setProducts(sorted);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    (Object.entries(newFilters) as [string, string][]).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ category: '', brand: '', search: '', min_price: '', max_price: '' });
    router.push('/products');
  };


    useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    applySorting();
  }, [sortBy, allProducts]);

  const activeFiltersCount = Object.values(filters).filter((v) => v).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0" data-testid="products-page">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Filter size={20} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block fixed lg:static inset-0 lg:inset-auto z-50 lg:z-auto w-full lg:w-72 bg-white lg:rounded-lg p-6 lg:h-fit lg:sticky lg:top-24 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Filters
              </h2>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Clear All
                  </button>
                )}
                <button onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold mb-3">Category</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="category"
                      value={cat.name}
                      checked={filters.category === cat.name}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold mb-3">Brand</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="brand"
                      value={brand.name}
                      checked={filters.brand === brand.name}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden w-full bg-orange-600 text-white py-3 rounded-lg font-semibold"
            >
              Apply Filters
            </button>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort & Results Bar */}
            <div className="bg-white rounded-lg p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{products.length}</span>{' '}
                of <span className="font-semibold">{allProducts.length}</span> products
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className="text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  data-testid="sort-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="bg-white rounded-lg p-3 mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">Active Filters:</span>
                {filters.category && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {filters.category}
                    <button onClick={() => handleFilterChange('category', '')}><X size={14} /></button>
                  </span>
                )}
                {filters.brand && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {filters.brand}
                    <button onClick={() => handleFilterChange('brand', '')}><X size={14} /></button>
                  </span>
                )}
                {filters.search && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Search: {filters.search}
                    <button onClick={() => handleFilterChange('search', '')}><X size={14} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">No products found matching your filters.</p>
                <button onClick={clearFilters} className="text-orange-600 hover:text-orange-700 font-semibold">
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
