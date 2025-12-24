
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ARCamera from '@/components/consumer/ARCamera';
import { fittingService } from '@/lib/fitting-service';
import type { FittingItem } from '@/lib/consumer-types';

export default function ARStorePage() {
  const params = useParams();
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [storeItems, setStoreItems] = useState<FittingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FittingItem | null>(null);

  useEffect(() => {
    const loadStoreItems = async () => {
      try {
        const items = await fittingService.getFittingItems();
        setStoreItems(items);
      } catch (error) {
        console.error('Failed to load store items:', error);
      }
    };

    loadStoreItems();
  }, []);

  const handleStartCamera = () => {
    setIsCameraOpen(true);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2 sm:pt-4"
        >
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-primary border-purple-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            매장 AR 체험
          </Badge>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">AR 피팅룸</h1>
          <p className="text-sm text-muted-foreground">매장 상품을 가상으로 체험해보세요</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[4/3] sm:aspect-video bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-indigo-500/20 flex items-center justify-center relative">
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                  >
                    <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  <p className="text-sm sm:text-base text-muted-foreground">AR 피팅 영역</p>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <Button 
                    onClick={handleStartCamera}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm sm:text-base"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    카메라 시작
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            매장으로 돌아가기
          </Button>
        </motion.div>
      </div>

      <ARCamera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        overlayImageUrl={selectedItem?.imageUrl}
        itemName={selectedItem?.name}
      />
    </div>
  );
}
