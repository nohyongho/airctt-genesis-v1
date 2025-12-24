
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Link as LinkIcon, Newspaper, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/lib/admin/store';

const menuItems = [
  { href: '/crm/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/crm/admin/profile', label: '프로필', icon: User },
  { href: '/crm/admin/connections', label: '연결하기', icon: LinkIcon },
  { href: '/crm/admin/news', label: '최신 소식', icon: Newspaper },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { currentUser } = useAdminStore();

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-73px)] flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {currentUser?.role === 'HQ' && (
        <div className="p-4 border-t">
          <Link
            href="/crm/admin/hq"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              pathname === '/crm/admin/hq'
                ? 'bg-destructive text-destructive-foreground'
                : 'hover:bg-muted border-2 border-destructive'
            )}
          >
            <Shield className="h-5 w-5" />
            <span className="font-medium">본사 Admin</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
