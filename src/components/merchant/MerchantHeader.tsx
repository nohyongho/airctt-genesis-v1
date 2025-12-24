
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, QrCode, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MerchantHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showQR?: boolean;
}

export default function MerchantHeader({ 
  title, 
  showBack = false, 
  showMenu = false,
  showQR = false 
}: MerchantHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
          <motion.h1 
            className="text-lg font-semibold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>
        </div>

        <div className="flex items-center gap-1">
          {showQR && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <QrCode className="w-5 h-5" />
            </Button>
          )}
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
