
'use client';

import { Building2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLanguageToggle from './AdminLanguageToggle';
import { useAdminStore } from '@/lib/admin/store';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const { currentUser, logout } = useAdminStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/crm/admin');
  };

  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CTT CRM</h1>
          </div>
          <AdminLanguageToggle />
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              <div className="text-sm">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-muted-foreground">{currentUser.email}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
