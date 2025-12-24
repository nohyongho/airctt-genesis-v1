
'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FittingItem } from '@/lib/consumer-types';
import { useI18n } from '@/contexts/I18nContext';

interface FittingItemCardProps {
  item: FittingItem;
  onTryOn: (itemId: string) => void;
  onAddToHistory: (itemId: string) => void;
}

export default function FittingItemCard({ item, onTryOn, onAddToHistory }: FittingItemCardProps) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-1">{item.name}</h3>
          {item.brand && (
            <p className="text-sm text-muted-foreground">{item.brand}</p>
          )}
          {item.price && (
            <p className="text-lg font-bold text-primary mt-1">
              ₩{item.price.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onTryOn(item.id)}
            className="flex-1"
            size="sm"
          >
            {t('ar.tryOn')}
          </Button>
          <Button
            onClick={() => onAddToHistory(item.id)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
