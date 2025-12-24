
'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/contexts/I18nContext';

export default function OrdersPage() {
  const { t } = useI18n();

  const onlineOrders = [
    {
      id: '1',
      storeName: '스타벅스 강남점',
      date: '2024-03-15',
      amount: 12500,
      status: 'completed',
    },
    {
      id: '2',
      storeName: '올리브영 역삼점',
      date: '2024-03-14',
      amount: 35000,
      status: 'completed',
    },
  ];

  const offlineVisits = [
    {
      id: '1',
      storeName: '무신사 스탠다드',
      date: '2024-03-13',
      stamps: 3,
    },
    {
      id: '2',
      storeName: '나이키 강남',
      date: '2024-03-12',
      stamps: 1,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('orders.title')}</h1>
      </motion.div>

      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="online" className="text-xs sm:text-sm">
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t('orders.online')}
          </TabsTrigger>
          <TabsTrigger value="offline" className="text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t('orders.offline')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="space-y-3 sm:space-y-4 mt-4">
          {onlineOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{order.storeName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{order.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm sm:text-base">{order.amount.toLocaleString()}원</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        완료
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="offline" className="space-y-3 sm:space-y-4 mt-4">
          {offlineVisits.map((visit, index) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{visit.storeName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{visit.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                        {t('orders.visitStamp')} x{visit.stamps}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
