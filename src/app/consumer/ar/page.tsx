
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Shirt, Footprints, HardHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FittingItemCard from '@/components/consumer/FittingItemCard';
import ARCamera from '@/components/consumer/ARCamera';
import { useI18n } from '@/contexts/I18nContext';
import { fittingService } from '@/lib/fitting-service';
import type { FittingItem } from '@/lib/consumer-types';
import { toast } from 'sonner';

export default function ARFittingPage() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState('clothing');
  const [items, setItems] = useState<FittingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FittingItem | null>(null);

  const categories = [
    { id: 'clothing', label: t('ar.categories.clothing'), icon: Shirt },
    { id: 'shoes', label: t('ar.categories.shoes'), icon: Footprints },
    { id: 'hats', label: t('ar.categories.hats'), icon: HardHat },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      setIsLoading(true);
      try {
        const data = await fittingService.getFittingItems(selectedCategory);
        if (isMounted) {
          setItems(data || []);
        }
      } catch (error) {
        console.error('Failed to load fitting items', error);
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const handleTryOn = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setIsCameraOpen(true);
      toast.success('AR 피팅을 시작합니다');
    }
  };

  const handleAddToHistory = (itemId: string) => {
    toast.success(t('ar.addedToHistory') || '히스토리에 추가되었습니다');
    console.log('Add to history:', itemId);
  };

  const handleStartCamera = () => {
    setSelectedItem(null);
    setIsCameraOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 flex justify-center">
      <div className="w-full max-w-3xl p-4 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2 sm:pt-4"
        >
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-primary border-purple-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            {t('ar.augmentedReality')}
          </Badge>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{t('ar.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('ar.subtitle')}</p>
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
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {t('ar.arPlaceholder')}
                  </p>
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
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="text-xs sm:text-sm"
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                {isLoading ? (
                  <p className="text-center text-sm text-muted-foreground">
                    로딩 중...
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FittingItemCard 
                          item={item} 
                          onTryOn={handleTryOn}
                          onAddToHistory={handleAddToHistory}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
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
