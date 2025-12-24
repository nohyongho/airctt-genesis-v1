
'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden">
            <div className="h-40 sm:h-48 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-indigo-500/20 flex items-center justify-center">
              <Ticket className="w-16 h-16 text-primary" />
            </div>
            <CardContent className="p-4 sm:p-6">
              <Badge className="mb-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                특별 할인
              </Badge>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">쿠폰 상세</h1>
              <p className="text-sm text-muted-foreground mb-4">
                쿠폰 ID: {params.id}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">유효기간: 2024.12.31까지</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">전 매장 사용 가능</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Button className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600">
            쿠폰 사용하기
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
