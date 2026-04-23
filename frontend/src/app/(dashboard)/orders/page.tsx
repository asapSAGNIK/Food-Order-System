'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AxiosError } from 'axios';

interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  unitPrice: string;
}

interface Order {
  id: number;
  status: 'DRAFT' | 'PLACED' | 'CANCELLED';
  totalAmount: string;
  createdAt: string;
  restaurantId: number;
  restaurant: { id: number; name: string };
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canPlaceCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchOrders = () => {
    setLoading(true);
    api.get<Order[]>('/orders')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceOrder = async (id: number) => {
    if (!canPlaceCancel) return alert('You do not have permission to checkout & pay.');
    try {
      await api.post(`/orders/${id}/place`);
      alert('Order Placed Successfully using existing Payment Method!');
      fetchOrders();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      alert(axiosErr.response?.data?.message || 'Error placing order');
    }
  };

  const handleCancelOrder = async (id: number) => {
    if (!canPlaceCancel) return alert('You do not have permission to cancel orders.');
    try {
      await api.post(`/orders/${id}/cancel`);
      alert('Order Cancelled Successfully!');
      fetchOrders();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      alert(axiosErr.response?.data?.message || 'Error cancelling order');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center bg-card p-8 rounded-xl shadow-sm">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Orders</h1>
          <p className="mt-2 text-sm text-gray-600">View and manage your orders.</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-card p-6 rounded-xl text-center border-0 shadow-md text-gray-500 font-medium">
            No orders found.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-card shadow-md overflow-hidden sm:rounded-xl border-0">
              <div className="px-6 py-6 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl leading-6 font-bold text-foreground">
                    Order #{order.id} — <span className="text-gray-700">{order.restaurant?.name}</span>
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-gray-500">
                    Status: <span className="font-bold text-primary bg-accent-light bg-opacity-30 px-2 py-1 rounded inline-block ml-1">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-foreground">${parseFloat(order.totalAmount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="border-t border-gray-100">
                <dl>
                  <div className="bg-background px-6 py-4 sm:px-6">
                    <dt className="text-sm font-bold text-gray-600 mb-3">Order Items</dt>
                    <dd className="text-sm text-foreground">
                      <ul className="space-y-2">
                        {order.items?.map((item) => (
                          <li key={item.id} className="flex justify-between items-center max-w-md bg-card p-3 rounded-md shadow-sm border border-gray-100">
                            <span className="font-medium"><span className="text-primary font-bold">{item.quantity}x</span> Item #{item.menuItemId}</span>
                            <span className="font-bold text-gray-700">${parseFloat(item.unitPrice).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Actions */}
              <div className="bg-card px-6 py-4 flex space-x-3 justify-end border-t border-gray-100">
                {order.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePlaceOrder(order.id)}
                    className={`${canPlaceCancel ? 'bg-primary hover:bg-primary-hover active:scale-95' : 'bg-gray-300 cursor-not-allowed'} inline-flex items-center px-5 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white focus:outline-none transition-all duration-200`}
                    title={!canPlaceCancel ? 'Only Managers or Admins can checkout' : ''}
                  >
                    Place Order (Checkout)
                  </button>
                )}
                {(order.status === 'DRAFT' || order.status === 'PLACED') && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className={`${canPlaceCancel ? 'bg-white hover:bg-gray-50 border-gray-200 text-foreground active:scale-95' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'} inline-flex items-center px-4 py-2 border text-sm font-bold rounded-lg shadow-sm focus:outline-none transition-all duration-200`}
                    title={!canPlaceCancel ? 'Only Managers or Admins can cancel' : ''}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
