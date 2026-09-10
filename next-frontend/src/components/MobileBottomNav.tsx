'use client';
// Mobile bottom navigation bar for small screens.
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, ShoppingCart, User, LucideIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
}

/**
 * Renders a compact navigation bar at the bottom of the viewport on mobile.
 */
const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, wishlistCount } = useCart();

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Products', path: '/products' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', badge: wishlistCount },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: User, label: 'Account', path: '/account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'text-orange-600' : 'text-gray-600'} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
