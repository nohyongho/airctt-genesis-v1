'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPostgrestClient } from '@/lib/postgrest';
import { ArrowLeft, Store, Star } from 'lucide-react';
import { Database } from '@/lib/database.types';

type StoreType = Database['public']['Tables']['stores']['Row'];

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const category = params.category as string;
    const [stores, setStores] = useState<StoreType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            const client = createPostgrestClient();

            // Map URL category to DB Category Enum if needed
            // For now, assume simplified exact match or query text
            const { data, error } = await client
                .from('stores')
                .select('*')
                .eq('category', category.toUpperCase()); // Mocking assumption on Enum

            if (data) setStores(data);
            setLoading(false);
        };

        if (category) fetchStores();
    }, [category]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 safe-area-top">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b px-4 h-14 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg capitalize">{category}</h1>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : stores.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>No stores found in {category}</p>
                        <p className="text-xs mt-2">Try 'Food' or 'Fashion'</p>
                    </div>
                ) : (
                    stores.map(store => (
                        <div key={store.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4" onClick={() => router.push(`/consumer/stores/${store.id}`)}>
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <Store className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="font-bold">{store.name}</h3>
                                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{store.description}</div>
                                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-orange-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>4.8</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
