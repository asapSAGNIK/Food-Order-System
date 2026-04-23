'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
}

interface RestaurantDetail {
  id: number;
  name: string;
  cuisine: string;
  country: string;
  menuItems: MenuItem[];
}

interface Order {
  id: number;
  status: string;
  restaurantId: number;
}

interface OrderWithItems extends Order {
  items: Array<{ id: number; menuItemId: number; quantity: number; unitPrice: string }>;
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get<RestaurantDetail>(`/restaurants/${resolvedParams.id}`)
      .then(res => setRestaurant(res.data))
      .catch((err: AxiosError) => {
        if (err.response?.status === 404) {
          router.push('/restaurants');
        }
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id, router]);

  const handleAddToCart = async (menuItemId: number) => {
    setAddingId(menuItemId);
    try {
      // 1. Find or Create DRAFT Order for this restaurant
      const ordersRes = await api.get<OrderWithItems[]>('/orders');
      let order: Order | undefined = ordersRes.data.find(
        (o) => o.status === 'DRAFT' && o.restaurantId === Number(resolvedParams.id)
      );

      if (!order) {
        const createRes = await api.post<Order>('/orders', { restaurantId: Number(resolvedParams.id) });
        order = createRes.data;
      }

      // 2. Add Item to Order
      await api.post(`/orders/${order.id}/items`, { menuItemId, quantity: 1 });
      alert('Item added to cart!');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      alert(axiosErr.response?.data?.message || 'Error adding item');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!restaurant) return null;

  return (
    <div>
      <div className="mb-8 bg-card p-8 rounded-xl shadow-sm">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">{restaurant.name}</h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-accent-light text-primary">
            {restaurant.country}
          </span>
          <span className="text-gray-600 font-medium">{restaurant.cuisine}</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Menu Items</h2>

      <div className="bg-card shadow-md overflow-hidden sm:rounded-xl border-0">
        <ul className="divide-y divide-gray-100">
          {restaurant.menuItems?.map((item) => (
            <li key={item.id} className="hover:bg-opacity-50 hover:bg-gray-50 transition-colors">
              <div className="px-6 py-6 flex items-center">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="pr-4">
                    <h3 className="text-lg font-bold text-foreground truncate">{item.name}</h3>
                    {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                    <p className="inline-block mt-2 text-xs font-semibold text-primary bg-accent-light bg-opacity-30 px-2 py-1 rounded">{item.category}</p>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex items-center justify-end w-full sm:w-auto">
                    <span className="text-xl font-black text-foreground mr-6">${Number(item.price).toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      disabled={addingId === item.id}
                      className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none disabled:opacity-50 transition-colors duration-200 transform active:scale-95"
                    >
                      {addingId === item.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {(!restaurant.menuItems || restaurant.menuItems.length === 0) && (
            <li className="px-6 py-12 text-center text-gray-500 font-medium">No menu items available</li>
          )}
        </ul>
      </div>
    </div>
  );
}
