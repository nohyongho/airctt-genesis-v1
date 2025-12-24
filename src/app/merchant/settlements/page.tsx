
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  Search,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Banknote,
  Brain,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { merchantProfileService, initMerchantDemo } from '@/lib/merchant-service';
import { MerchantProfile } from '@/lib/merchant-types';
import { toast } from 'sonner';
import AIBunnyAssistant from '@/components/shared/AIBunnyAssistant';

interface Transaction {
  id: string;
  type: 'INCOME' | 'WITHDRAW' | 'FEE' | 'REFUND';
  amount: number;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  reference?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'INCOME',
    amount: 1250000,
    description: '6월 쿠폰 정산',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
    reference: 'SET-2024-0601',
  },
  {
    id: '2',
    type: 'WITHDRAW',
    amount: -500000,
    description: '출금 요청',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    reference: 'WD-2024-0598',
  },
  {
    id: '3',
    type: 'FEE',
    amount: -25000,
    description: '플랫폼 수수료',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    reference: 'FEE-2024-0601',
  },
  {
    id: '4',
    type: 'INCOME',
    amount: 980000,
    description: '5월 쿠폰 정산',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    reference: 'SET-2024-0501',
  },
  {
    id: '5',
    type: 'WITHDRAW',
    amount: -300000,
    description: '출금 요청',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    reference: 'WD-2024-0612',
  },
  {
    id: '6',
    type: 'REFUND',
    amount: 15000,
    description: '환불 처리',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
    reference: 'REF-2024-0125',
  },
];

export default function MerchantSettlementsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);

  useEffect(() => {
    initMerchantDemo();
    setProfile(merchantProfileService.get());
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'income') return matchesSearch && tx.type === 'INCOME';
    if (activeTab === 'withdraw') return matchesSearch && tx.type === 'WITHDRAW';
    if (activeTab === 'pending') return matchesSearch && tx.status === 'PENDING';

    return matchesSearch;
  });

  const totalIncome = transactions
    .filter((tx) => tx.type === 'INCOME' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdraw = transactions
    .filter((tx) => tx.type === 'WITHDRAW' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const pendingAmount = transactions
    .filter((tx) => tx.status === 'PENDING')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const handleAIAnalysis = async () => {
    setIsAIAnalyzing(true);
    toast.info('AI가 정산 데이터를 분석하고 있습니다...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const insights = [
      '이번 달 수입이 전월 대비 23% 증가했습니다.',
      '주말 쿠폰 사용률이 평일보다 35% 높습니다.',
      '최적 출금 시기는 매월 5일입니다.',
      '수수료 절감을 위해 월 1회 출금을 권장합니다.',
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    setIsAIAnalyzing(false);
    toast.success(`AI 분석 완료: ${randomInsight}`);
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 10000) {
      toast.error('최소 출금 금액은 10,000원입니다');
      return;
    }

    if (profile && amount > profile.balance) {
      toast.error('잔액이 부족합니다');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'WITHDRAW',
      amount: -amount,
      description: '출금 요청',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      reference: `WD-2024-${Math.floor(Math.random() * 10000)}`,
    };

    setTransactions([newTransaction, ...transactions]);
    setIsProcessing(false);
    setIsWithdrawOpen(false);
    setWithdrawAmount('');
    toast.success('출금 요청이 접수되었습니다');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownRight className="w-4 h-4 text-emerald-500" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'FEE':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'REFUND':
        return <ArrowDownRight className="w-4 h-4 text-blue-500" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            완료
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            처리중
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            실패
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-dark">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">정산 관리</h1>
              <p className="text-white/70 text-xs">거래 내역 및 출금</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden border-2 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold gradient-text">AI 정산 분석</h3>
                  <p className="text-xs text-muted-foreground">인공지능이 수익을 분석합니다</p>
                </div>
              </div>
              <Button
                onClick={handleAIAnalysis}
                disabled={isAIAnalyzing}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600"
              >
                {isAIAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    AI 정산 분석 시작
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">출금 가능 잔액</p>
                      <p className="text-3xl font-bold gradient-text">
                        {profile.balance.toLocaleString()}
                        <span className="text-lg ml-1">원</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="bg-gradient-to-r from-violet-500 to-purple-600"
                  >
                    <Banknote className="w-4 h-4 mr-1" />
                    출금
                  </Button>
                </div>

                <Separator className="my-4 bg-white/10" />

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-500">
                      {totalIncome.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">총 수입</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-500">
                      {totalWithdraw.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">총 출금</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">
                      {pendingAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">처리중</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="거래 내역 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 glass-card">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="income">수입</TabsTrigger>
              <TabsTrigger value="withdraw">출금</TabsTrigger>
              <TabsTrigger value="pending">처리중</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                거래 내역
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'INCOME' || tx.type === 'REFUND'
                            ? 'bg-emerald-500/20'
                            : tx.type === 'FEE'
                            ? 'bg-amber-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                          {tx.reference && (
                            <span className="text-xs text-muted-foreground">
                              • {tx.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString()}원
                      </p>
                      <div className="mt-1">{getStatusBadge(tx.status)}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">거래 내역이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              출금 요청
            </DialogTitle>
            <DialogDescription>
              출금할 금액을 입력하세요 (최소 10,000원)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>출금 금액</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="pr-12 text-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
              {profile && (
                <p className="text-xs text-muted-foreground mt-1">
                  출금 가능: {profile.balance.toLocaleString()}원
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[100000, 300000, 500000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(amount))}
                >
                  {amount / 10000}만
                </Button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">입금 계좌</span>
              </div>
              <p className="font-medium mt-1">신한은행 110-123-456789</p>
              <p className="text-xs text-muted-foreground">예금주: AIRCTT</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isProcessing}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  처리중...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  출금 요청
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIBunnyAssistant userType="merchant" />
    </div>
  );
}
