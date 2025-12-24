
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Store, Coins, LogOut, Shield, ChevronDown, Radio, ShoppingBag, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    toast.success('로그아웃되었습니다.');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
    { href: '/merchants', label: '가맹점', icon: Store },
    { href: '/points', label: '포인트', icon: Coins },
  ];

  const aircttMenuItems = [
    { href: '/consumer', label: '소비자 앱', icon: ShoppingBag, badge: 'HOT' },
    { href: '/merchant', label: '사업자 앱', icon: Store, badge: 'PRO' },
    { href: '/consumer/wallet', label: '디지털 지갑', icon: Wallet, badge: 'NEW' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AIRCTT
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={pathname?.startsWith('/consumer') || pathname?.startsWith('/merchant') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Radio className="h-4 w-4" />
                  AIRCTT 플랫폼
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {aircttMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem 
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="cursor-pointer"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-2 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={pathname?.startsWith('/crm') ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  CRM 관리
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/crm/admin')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  관리자 대시보드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/crm/admin/connections')}>
                  <Store className="h-4 w-4 mr-2" />
                  연결 관리
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/crm/admin/news')}>
                  <Users className="h-4 w-4 mr-2" />
                  최신 소식
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      <nav className="md:hidden border-t">
        <div className="container mx-auto flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={pathname?.startsWith('/consumer') || pathname?.startsWith('/merchant') ? 'default' : 'ghost'}
                size="sm"
                className="gap-1"
              >
                <Radio className="h-4 w-4" />
                <span className="text-xs">AIRCTT</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {aircttMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem 
                    key={item.href}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge && (
                      <Badge className="ml-auto text-xs">{item.badge}</Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/crm/admin">
            <Button
              variant={pathname?.startsWith('/crm') ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs">CRM</span>
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
