
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  MoreVertical,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  RefreshCw,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  address?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: '김민수',
    customerPhone: '010-1234-5678',
    items: [
      { name: '아메리카노', quantity: 2, price: 4500 },
      { name: '카페라떼', quantity: 1, price: 5000 },
    ],
    totalAmount: 14000,
    status: 'PENDING',
    paymentMethod: '카드',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: '이영희',
    customerPhone: '010-9876-5432',
    items: [
      { name: '바닐라라떼', quantity: 1, price: 5500 },
      { name: '치즈케이크', quantity: 1, price: 6000 },
    ],
    totalAmount: 11500,
    status: 'PREPARING',
    paymentMethod: '카카오페이',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: '박철수',
    customerPhone: '010-5555-1234',
    items: [
      { name: '에스프레소', quantity: 3, price: 3500 },
    ],
    totalAmount: 10500,
    status: 'READY',
    paymentMethod: '현금',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: '최지은',
    customerPhone: '010-7777-8888',
    items: [
      { name: '카푸치노', quantity: 2, price: 5000 },
      { name: '크로와상', quantity: 2, price: 4000 },
    ],
    totalAmount: 18000,
    status: 'COMPLETED',
    paymentMethod: '네이버페이',
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
];

export default function MerchantOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && order.status === 'PENDING';
    if (activeTab === 'preparing') return matchesSearch && (order.status === 'CONFIRMED' || order.status === 'PREPARING');
    if (activeTab === 'completed') return matchesSearch && (order.status === 'READY' || order.status === 'COMPLETED');
    
    return matchesSearch;
  });

  const stats = [
    {
      label: '대기중',
      value: orders.filter(o => o.status === 'PENDING').length,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: '준비중',
      value: orders.filter(o => o.status === 'PREPARING').length,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: '완료',
      value: orders.filter(o => o.status === 'COMPLETED').length,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            확인됨
          </Badge>
        );
      case 'PREPARING':
        return (
          <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
            <Package className="w-3 h-3 mr-1" />
            준비중
          </Badge>
        );
      case 'READY':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
            <Truck className="w-3 h-3 mr-1" />
            준비완료
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            완료
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
            <XCircle className="w-3 h-3 mr-1" />
            취소
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success('주문 상태가 업데이트되었습니다');
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
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
              <h1 className="text-white font-bold text-lg">주문 관리</h1>
              <p className="text-white/70 text-xs">실시간 주문 현황</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              {orders.filter(o => o.status === 'PENDING').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-bounce">
                  {orders.filter(o => o.status === 'PENDING').length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-3 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="주문번호 또는 고객명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 glass-card">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="pending">대기</TabsTrigger>
              <TabsTrigger value="preparing">준비</TabsTrigger>
              <TabsTrigger value="completed">완료</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`glass-card hover-lift overflow-hidden cursor-pointer ${
                    order.status === 'PENDING' ? 'border-amber-500/50' : ''
                  }`}
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDetailOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{order.orderNumber}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {getTimeAgo(order.createdAt)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.status === 'PENDING' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'CONFIRMED');
                            }}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              주문 확인
                            </DropdownMenuItem>
                          )}
                          {(order.status === 'CONFIRMED' || order.status === 'PENDING') && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'PREPARING');
                            }}>
                              <Package className="w-4 h-4 mr-2" />
                              준비 시작
                            </DropdownMenuItem>
                          )}
                          {order.status === 'PREPARING' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'READY');
                            }}>
                              <Truck className="w-4 h-4 mr-2" />
                              준비 완료
                            </DropdownMenuItem>
                          )}
                          {order.status === 'READY' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'COMPLETED');
                            }}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              픽업 완료
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'CANCELLED');
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            주문 취소
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} x {item.quantity}
                          </span>
                          <span>{(item.price * item.quantity).toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3 bg-white/10" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CreditCard className="w-3 h-3" />
                        {order.paymentMethod}
                      </div>
                      <div className="text-lg font-bold gradient-text">
                        {order.totalAmount.toLocaleString()}원
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-muted-foreground">
                  {searchQuery ? '검색 결과가 없습니다' : '주문이 없습니다'}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="glass-card max-w-md">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                </DialogTitle>
                <DialogDescription>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">고객 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">이름:</span>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">주문 내역</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">총 결제금액</span>
                  <span className="text-xl font-bold gradient-text">
                    {selectedOrder.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
              
              <DialogFooter className="flex-col gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'CONFIRMED');
                      setIsDetailOpen(false);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    주문 확인
                  </Button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'READY');
                      setIsDetailOpen(false);
                    }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    준비 완료
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsDetailOpen(false)}
                >
                  닫기
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
