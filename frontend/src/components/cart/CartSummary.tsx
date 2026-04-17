'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { Cart } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface CartSummaryProps {
  cart: Cart;
  showCheckoutButton?: boolean;
}

export default function CartSummary({ cart, showCheckoutButton = true }: CartSummaryProps) {
  const subtotal = cart.subtotal || 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h2>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="input flex-1 py-2"
          />
          <Button variant="outline" size="sm">
            Apply
          </Button>
        </div>
      </div>

      {/* Summary Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Subtotal ({cart.itemCount} items)
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Estimated Tax</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(tax)}
          </span>
        </div>

        {shipping > 0 && (
          <div className="flex items-center gap-2 text-sm text-primary-600 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
            <Tag className="w-4 h-4" />
            <span>Add {formatPrice(100 - subtotal)} more for free shipping!</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Link href="/checkout" className="block mt-6">
          <Button className="w-full" size="lg">
            Proceed to Checkout
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      )}

      {/* Continue Shopping */}
      <Link
        href="/products"
        className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
      >
        <ShoppingBag className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  );
}