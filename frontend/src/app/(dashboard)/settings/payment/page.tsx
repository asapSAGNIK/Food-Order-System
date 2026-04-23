'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface PaymentMethod {
  id: number;
  country: string;
  cardholderName: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
}

interface UpdatePaymentData {
  cardholderName: FormDataEntryValue;
  cardType: FormDataEntryValue;
  lastFourDigits: FormDataEntryValue;
  expiryMonth: number;
  expiryYear: number;
}

export default function SettingsPaymentPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/restaurants');
      return;
    }

    api.get<PaymentMethod[]>('/payment-methods')
      .then(res => setMethods(res.data))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, country: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: UpdatePaymentData = {
      cardholderName: formData.get('cardholderName') ?? '',
      cardType: formData.get('cardType') ?? '',
      lastFourDigits: formData.get('lastFourDigits') ?? '',
      expiryMonth: parseInt(formData.get('expiryMonth') as string, 10),
      expiryYear: parseInt(formData.get('expiryYear') as string, 10),
    };

    try {
      await api.patch(`/payment-methods/${country}`, data);
      alert('Payment Method Updated!');
      const res = await api.get<PaymentMethod[]>('/payment-methods');
      setMethods(res.data);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      alert('Failed to update: ' + (axiosErr.response?.data?.message ?? axiosErr.message));
    }
  };

  if (loading) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 bg-card p-8 rounded-xl shadow-sm">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Payment Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Admin Only: Manage existing payment methods used by organizations to pay for food orders.
        </p>
      </div>

      <div className="space-y-8">
        {methods.map((method) => (
          <div key={method.id} className="bg-card shadow-md overflow-hidden sm:rounded-xl border-0">
            <div className="px-6 py-6 sm:px-6 bg-primary">
              <h3 className="text-xl leading-6 font-bold text-[#FFF8DE]">
                {method.country} Organization Card
              </h3>
            </div>
            <div className="border-t border-gray-100 px-6 py-6 sm:px-6">
              <form onSubmit={(e) => handleUpdate(e, method.country)}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-bold text-foreground mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardholderName"
                      defaultValue={method.cardholderName}
                      className="mt-1 block w-full px-4 py-2 sm:text-sm bg-background border border-transparent focus:border-primary focus:ring-primary rounded-lg text-foreground font-medium"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-bold text-foreground mb-1">Card Type</label>
                    <input
                      type="text"
                      name="cardType"
                      defaultValue={method.cardType}
                      className="mt-1 block w-full px-4 py-2 sm:text-sm bg-background border border-transparent focus:border-primary focus:ring-primary rounded-lg text-foreground font-medium"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-bold text-foreground mb-1">Last 4 Digits</label>
                    <input
                      type="text"
                      name="lastFourDigits"
                      maxLength={4}
                      defaultValue={method.lastFourDigits}
                      className="mt-1 block w-full px-4 py-2 sm:text-sm bg-background border border-transparent focus:border-primary focus:ring-primary rounded-lg text-foreground font-medium"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-bold text-foreground mb-1">Exp. Month (MM)</label>
                    <input
                      type="number"
                      name="expiryMonth"
                      min={1}
                      max={12}
                      defaultValue={method.expiryMonth}
                      className="mt-1 block w-full px-4 py-2 sm:text-sm bg-background border border-transparent focus:border-primary focus:ring-primary rounded-lg text-foreground font-medium"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-bold text-foreground mb-1">Exp. Year (YY)</label>
                    <input
                      type="number"
                      name="expiryYear"
                      min={24}
                      max={50}
                      defaultValue={method.expiryYear}
                      className="mt-1 block w-full px-4 py-2 sm:text-sm bg-background border border-transparent focus:border-primary focus:ring-primary rounded-lg text-foreground font-medium"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover active:scale-95 border border-transparent rounded-lg shadow-sm py-2 px-6 inline-flex justify-center text-sm font-bold text-white focus:outline-none transition-all duration-200"
                  >
                    Save {method.country} Method
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
