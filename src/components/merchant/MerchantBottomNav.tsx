
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Ticket,
  ShoppingBag,
  BarChart3,
  Settings,
  Sparkles,
  Bot
} from 'lucide-react';

const navItems = [
  { href: '/merchant', icon: Home, label: '홈' },
  { href: '/merchant/coupons', icon: Ticket, label: '쿠폰' },
  { href: '/merchant/orders', icon: ShoppingBag, label: '주문' },
  { href: '/merchant/stats', icon: BarChart3, label: '통계' },
  { href: '/merchant/ai-assistant', icon: Bot, label: 'AI비서' },
  { href: '/merchant/settings', icon: Settings, label: '설정' },
];

export default function MerchantBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-14 sm:h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/merchant' && pathname.startsWith(item.href));

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center justify-center w-12 sm:w-16 h-full touch-manipulation"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-8 sm:w-12 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`relative p-1 sm:p-1.5 rounded-lg sm:rounded-xl ${isActive
                  ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20'
                  : ''
                  }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive
                    ? 'text-white'
                    : 'text-white/50'
                    }`}
                />
                {isActive && (
                  <Sparkles className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 text-amber-400" />
                )}
              </motion.div>

              <span
                className={`text-[9px] sm:text-[10px] mt-0.5 font-medium ${isActive
                  ? 'text-white'
                  : 'text-white/50'
                  }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
