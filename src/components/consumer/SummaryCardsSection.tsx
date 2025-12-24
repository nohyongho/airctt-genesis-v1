
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Coins, Gift } from 'lucide-react';
import { consumerAuthService } from '@/lib/consumer-auth';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

interface SummaryData {
  couponCount: number;
  pointsSum: number;
  benefitsCount?: number;
}

export default function SummaryCardsSection() {
  const [data, setData] = useState<SummaryData>({
    couponCount: 0,
    pointsSum: 0,
    benefitsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = consumerAuthService.getUser();
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const result = await api.get<SummaryData>('/consumer_summary', { id: user.id });
        setData({
          couponCount: result?.couponCount || 0,
          pointsSum: result?.pointsSum || 0,
          benefitsCount: result?.benefitsCount || 0,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`요약 정보를 불러오지 못했습니다: ${error.message}`);
        } else {
          toast.error('알 수 없는 오류가 발생했습니다');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const cards = [
    {
      icon: Ticket,
      label: '쿠폰',
      value: loading ? '...' : String(data?.couponCount || 0),
      accent: 'from-primary/20 to-primary/10',
    },
    {
      icon: Coins,
      label: '포인트',
      value: loading ? '...' : (data?.pointsSum || 0).toLocaleString(),
      accent: 'from-violet-500/20 to-violet-500/10',
    },
    {
      icon: Gift,
      label: '이번 달 혜택',
      value: loading ? '...' : String(data?.benefitsCount || 3),
      accent: 'from-pink-500/20 to-pink-500/10',
    },
  ];

  return (
    <section aria-label="summary" className="w-full">
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex items-stretch gap-4 snap-x snap-mandatory">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div key={idx} className="snap-start min-w-[240px]">
                <Card className={`bg-gradient-to-br ${c.accent} border-primary/20`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="text-2xl font-bold">{c.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
