'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, MoreVertical } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface OrdersTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, status: string) => void;
}

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
            <th className="pb-3 font-medium">Order ID</th>
            <th className="pb-3 font-medium">Customer</th>
            <th className="pb-3 font-medium">Items</th>
            <th className="pb-3 font-medium">Total</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Payment</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <tr key={order._id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-4 font-medium text-gray-900 dark:text-white">
                {order.orderNumber}
              </td>
              <td className="py-4">
                <div>
                  <p className="text-gray-900 dark:text-white">
                    {typeof order.user === 'object' ? order.user.name : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {typeof order.user === 'object' ? order.user.email : ''}
                  </p>
                </div>
              </td>
              <td className="py-4 text-gray-600 dark:text-gray-400">
                {order.items.length} items
              </td>
              <td className="py-4 font-medium text-gray-900 dark:text-white">
                {formatPrice(order.totalPrice)}
              </td>
              <td className="py-4 text-gray-600 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </td>
              <td className="py-4">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange?.(order._id, e.target.value)}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(order.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="py-4">
                <Badge variant={order.isPaid ? 'success' : 'warning'}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </td>
              <td className="py-4">
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg inline-flex"
                >
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No orders found
        </div>
      )}
    </div>
  );
}