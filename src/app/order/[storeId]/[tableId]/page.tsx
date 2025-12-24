'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  category_id: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  options: any;
  special_request: string;
  products: Product;
}

interface Session {
  id: string;
  session_code: string;
  status: string;
  stores: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  store_tables: {
    id: string;
    name: string;
    zone: string;
  };
  cart_items: CartItem[];
  total_amount: number;
  discount_amount: number;
  final_amount: number;
}

export default function TableOrderPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const tableId = params.tableId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ order_number: number } | null>(null);

  // 세션 생성 또는 조회
  const initSession = useCallback(async () => {
    try {
      const res = await fetch('/api/order/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          table_id: tableId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      // 세션 상세 조회
      const sessionRes = await fetch(`/api/order/session?session_id=${data.data.session_id}`);
      const sessionData = await sessionRes.json();

      if (sessionData.success) {
        setSession(sessionData.data);
      }
    } catch (err: any) {
      setError(err.message || '세션 생성에 실패했습니다.');
    }
  }, [storeId, tableId]);

  // 상품 목록 조회
  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/stores/${storeId}/products`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.products || []);
        setCategories(data.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }, [storeId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([initSession(), loadProducts()]);
      setLoading(false);
    };
    init();
  }, [initSession, loadProducts]);

  // 장바구니에 추가
  const addToCart = async (product: Product) => {
    if (!session) return;

    try {
      const res = await fetch('/api/order/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          product_id: product.id,
          quantity: 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // 세션 새로고침
        const sessionRes = await fetch(`/api/order/session?session_id=${session.id}`);
        const sessionData = await sessionRes.json();
        if (sessionData.success) {
          setSession(sessionData.data);
        }
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // 수량 변경
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch('/api/order/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity,
        }),
      });

      const data = await res.json();
      if (data.success && session) {
        const sessionRes = await fetch(`/api/order/session?session_id=${session.id}`);
        const sessionData = await sessionRes.json();
        if (sessionData.success) {
          setSession(sessionData.data);
        }
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  // 주문 제출
  const submitOrder = async () => {
    if (!session) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/order/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess({ order_number: data.data.order_number });
        setShowCart(false);
        // 세션 새로고침
        const sessionRes = await fetch(`/api/order/session?session_id=${session.id}`);
        const sessionData = await sessionRes.json();
        if (sessionData.success) {
          setSession(sessionData.data);
        }
      } else {
        alert(data.error || '주문에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products.filter(p => p.is_active)
    : products.filter(p => p.is_active && p.category_id === selectedCategory);

  const pendingCartItems = session?.cart_items?.filter(item => item.status === 'pending') || [];
  const cartTotal = pendingCartItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const cartCount = pendingCartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">메뉴를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {session?.stores?.name || '매장'}
              </h1>
              <p className="text-sm text-gray-500">
                {session?.store_tables?.name || '테이블'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                {session?.session_code}
              </span>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex overflow-x-auto px-4 pb-3 gap-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="p-4 grid gap-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            등록된 메뉴가 없습니다.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="flex">
                {product.image_url && (
                  <div className="w-28 h-28 bg-gray-100 flex-shrink-0">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-orange-500">
                      {product.base_price.toLocaleString()}원
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold hover:bg-orange-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 장바구니 버튼 */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent"
        >
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3"
          >
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {cartCount}
            </span>
            <span>장바구니 보기</span>
            <span>{cartTotal.toLocaleString()}원</span>
          </button>
        </motion.div>
      )}

      {/* 장바구니 시트 */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">장바구니</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {pendingCartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.products?.name}</h3>
                      <p className="text-orange-500">
                        {item.unit_price.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 border rounded-full flex items-center justify-center text-gray-500"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 border rounded-full flex items-center justify-center text-gray-500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">총 주문금액</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {cartTotal.toLocaleString()}원
                  </span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={submitting}
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50"
                >
                  {submitting ? '주문 처리 중...' : '주문하기'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 주문 성공 모달 */}
      <AnimatePresence>
        {orderSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  주문 완료!
                </h2>
                <p className="text-gray-600 mb-6">
                  주문번호 <span className="font-bold text-orange-500 text-xl">#{orderSuccess.order_number}</span>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  조리가 완료되면 알려드릴게요.
                </p>
                <button
                  onClick={() => setOrderSuccess(null)}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
