// "use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, AuthSyncHandler } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import BackToTop from "@/components/BackToTop";
import ToastProvider from "@/components/Toast";
import ChatWidget from "@/components/ChatWidget";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Commerce – Mobile & Laptop Spare Parts",
  description:
    "Your trusted source for high-quality mobile and laptop spare parts. Fast delivery, genuine products, premium quality.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <AuthProvider>
            <AuthSyncHandler />
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <ChatWidget />
              <Footer />
              <MobileBottomNav />
              <BackToTop />
              <ToastProvider />
            </CartProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
