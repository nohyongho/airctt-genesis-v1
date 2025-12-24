
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminStoreProvider, useAdminStore } from '@/lib/admin/store';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/crm/admin/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStoreProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminStoreProvider>
  );
}
