'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KitchenOrder {
  id: string;
  store_id: string;
  session_id: string;
  table_name: string;
  order_number: number;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    options?: any;
    special_request?: string;
  }[];
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: number;
  received_at: string;
  started_at?: string;
  ready_at?: string;
  served_at?: string;
}

const STATUS_CONFIG = {
  new: { label: '신규', color: 'bg-red-500', textColor: 'text-red-500' },
  preparing: { label: '조리중', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  ready: { label: '완료', color: 'bg-green-500', textColor: 'text-green-500' },
  served: { label: '서빙완료', color: 'bg-gray-400', textColor: 'text-gray-400' },
  cancelled: { label: '취소', color: 'bg-gray-300', textColor: 'text-gray-300' },
};

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);

  // 주문 목록 조회
  const loadOrders = useCallback(async () => {
    try {
      // TODO: store_id는 실제로는 세션/인증에서 가져와야 함
      const storeId = localStorage.getItem('current_store_id');
      if (!storeId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/merchant/kitchen?store_id=${storeId}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // 5초마다 새로고침
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // 주문 상태 변경
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/merchant/kitchen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        loadOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  // 경과 시간 계산
  const getElapsedTime = (receivedAt: string) => {
    const diff = Date.now() - new Date(receivedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}분`;
    return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
  };

  // 필터링된 주문
  const filteredOrders = filter === 'active'
    ? orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status))
    : orders;

  // 상태별 분류
  const newOrders = filteredOrders.filter(o => o.status === 'new');
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-xl">주문 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">👨‍🍳</span>
            주방 디스플레이
          </h1>
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-400">실시간</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-700 rounded-lg p-1 flex">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'active' ? 'bg-orange-500 text-white' : 'text-gray-400'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all' ? 'bg-orange-500 text-white' : 'text-gray-400'
              }`}
            >
              전체
            </button>
          </div>

          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* 상태 요약 */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-center">
          <div className="text-4xl font-bold text-red-400">{newOrders.length}</div>
          <div className="text-red-300">신규 주문</div>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-4 text-center">
          <div className="text-4xl font-bold text-yellow-400">{preparingOrders.length}</div>
          <div className="text-yellow-300">조리 중</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-4 text-center">
          <div className="text-4xl font-bold text-green-400">{readyOrders.length}</div>
          <div className="text-green-300">서빙 대기</div>
        </div>
      </div>

      {/* 주문 카드 그리드 */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-2xl overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${
                order.status === 'new'
                  ? 'bg-red-900/50 border-2 border-red-500'
                  : order.status === 'preparing'
                  ? 'bg-yellow-900/50 border-2 border-yellow-500'
                  : order.status === 'ready'
                  ? 'bg-green-900/50 border-2 border-green-500'
                  : 'bg-gray-800 border border-gray-700'
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              {/* 주문 헤더 */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">#{order.order_number}</div>
                  <div className="text-lg opacity-75">{order.table_name}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[order.status].color}`}>
                  {STATUS_CONFIG[order.status].label}
                </div>
              </div>

              {/* 메뉴 목록 */}
              <div className="px-4 pb-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-t border-white/10">
                    <span className="text-lg">{item.product_name}</span>
                    <span className="text-2xl font-bold">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* 특별 요청 */}
              {order.items.some(item => item.special_request) && (
                <div className="mx-4 mb-4 p-3 bg-yellow-500/20 rounded-lg">
                  <div className="text-sm text-yellow-300 font-medium mb-1">특별 요청</div>
                  {order.items
                    .filter(item => item.special_request)
                    .map((item, idx) => (
                      <div key={idx} className="text-yellow-100 text-sm">
                        {item.product_name}: {item.special_request}
                      </div>
                    ))}
                </div>
              )}

              {/* 경과 시간 */}
              <div className="px-4 pb-4 flex items-center justify-between text-sm">
                <span className="opacity-50">
                  {new Date(order.received_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className={`font-medium ${
                  parseInt(getElapsedTime(order.received_at)) > 15 ? 'text-red-400' : 'opacity-75'
                }`}>
                  {getElapsedTime(order.received_at)} 경과
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-400 text-xl">대기 중인 주문이 없습니다</p>
          </div>
        )}
      </div>

      {/* 주문 상세 모달 */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <div
                className="bg-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-4xl font-bold">#{selectedOrder.order_number}</div>
                    <div className="text-xl text-gray-400">{selectedOrder.table_name}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-lg font-medium ${STATUS_CONFIG[selectedOrder.status].color}`}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xl font-medium">{item.product_name}</div>
                        {item.special_request && (
                          <div className="text-yellow-400 text-sm mt-1">
                            📝 {item.special_request}
                          </div>
                        )}
                      </div>
                      <div className="text-3xl font-bold">×{item.quantity}</div>
                    </div>
                  ))}
                </div>

                {/* 상태 변경 버튼 */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedOrder.status === 'new' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                        className="py-4 bg-yellow-500 text-black rounded-xl font-bold text-lg"
                      >
                        🍳 조리 시작
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        className="py-4 bg-gray-600 text-white rounded-xl font-bold text-lg"
                      >
                        취소
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                        className="py-4 bg-green-500 text-white rounded-xl font-bold text-lg col-span-2"
                      >
                        ✅ 조리 완료
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'ready' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'served')}
                        className="py-4 bg-blue-500 text-white rounded-xl font-bold text-lg col-span-2"
                      >
                        🍽️ 서빙 완료
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full mt-3 py-3 bg-gray-700 text-gray-300 rounded-xl"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
