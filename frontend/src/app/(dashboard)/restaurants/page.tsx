'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  country: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Restaurant[]>('/restaurants')
      .then((res) => {
        setRestaurants(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading restaurants...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Restaurants</h1>
        <p className="mt-2 text-sm text-gray-600">Select a restaurant to view its menu and order.</p>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="bg-card p-6 rounded-xl text-center shadow-md">
          <p className="text-gray-600">No restaurants found in your region.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="block group">
              <div className="bg-card h-full overflow-hidden shadow-sm rounded-xl border border-transparent hover:border-accent-light hover:shadow-lg transition-all cursor-pointer transform group-hover:-translate-y-1">
                <div className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{restaurant.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-light text-primary whitespace-nowrap">
                        {restaurant.country}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{restaurant.cuisine}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
