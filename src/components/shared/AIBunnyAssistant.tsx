
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIBunnyAssistantProps {
  userType: 'consumer' | 'merchant' | 'employee' | 'admin';
}

export default function AIBunnyAssistant({ userType }: AIBunnyAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState('');

  const messages = {
    consumer: [
      '안녕하세요! 🐰 쿠폰을 찾아드릴까요?',
      'AR 피팅을 도와드릴게요! ✨',
      '주변 매장을 추천해드릴까요? 📍',
      '포인트 사용법을 알려드릴게요! 💰',
    ],
    merchant: [
      '안녕하세요! 🐰 쿠폰 발급을 도와드릴까요?',
      'AI 정산 분석을 시작할까요? 📊',
      '재고 관리를 도와드릴게요! 📦',
      '매출 통계를 확인해드릴까요? 💹',
    ],
    employee: [
      '안녕하세요! 🐰 쿠폰 확인을 도와드릴까요?',
      '주문 처리를 도와드릴게요! 🛍️',
      '고객 응대를 도와드릴까요? 👥',
      '재고 확인을 도와드릴게요! 📋',
    ],
    admin: [
      '안녕하세요! 🐰 시스템 관리를 도와드릴까요?',
      '전체 통계를 확인해드릴게요! 📈',
      '사용자 관리를 도와드릴까요? 👨‍💼',
      '설정을 도와드릴게요! ⚙️',
    ],
  };

  useEffect(() => {
    const randomMessage = messages[userType][Math.floor(Math.random() * messages[userType].length)];
    setMessage(randomMessage);
  }, [userType]);

  const handleOpen = () => {
    setIsVisible(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const getQuickActions = () => {
    switch (userType) {
      case 'consumer':
        return [
          { label: '쿠폰 찾기', icon: '🎫' },
          { label: 'AR 피팅', icon: '👗' },
          { label: '매장 찾기', icon: '🏪' },
          { label: '포인트 충전', icon: '💰' },
        ];
      case 'merchant':
        return [
          { label: 'AI 쿠폰 발급', icon: '🎫' },
          { label: 'AI 정산 분석', icon: '💰' },
          { label: 'AI 재고 관리', icon: '📦' },
          { label: 'AI 마케팅', icon: '📊' },
        ];
      case 'employee':
        return [
          { label: '쿠폰 확인', icon: '🔍' },
          { label: '주문 처리', icon: '📝' },
          { label: '재고 확인', icon: '📋' },
          { label: '고객 응대', icon: '💬' },
        ];
      case 'admin':
        return [
          { label: '시스템 관리', icon: '⚙️' },
          { label: '통계 분석', icon: '📈' },
          { label: '사용자 관리', icon: '👥' },
          { label: '설정', icon: '🔧' },
        ];
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-20 sm:bottom-24 right-2 sm:right-4 z-50"
          >
            <Card className="glass-card w-72 sm:w-80 max-w-[calc(100vw-1rem)] shadow-2xl border-2 border-purple-500/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div
                      animate={isAnimating ? {
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1],
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-lg">
                        <span className="text-2xl sm:text-3xl">🐰</span>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"
                      />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-lg gradient-text">AIRCTT 버니</h3>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 text-[10px] sm:text-xs">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        AI 도우미
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-6 w-6 sm:h-8 sm:w-8"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-500/20"
                >
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-medium">{message}</p>
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1.5 sm:mb-2">빠른 실행</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {getQuickActions().map((action, index) => (
                      <motion.div
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full h-auto py-2 sm:py-3 flex flex-col items-center gap-0.5 sm:gap-1 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all text-xs"
                        >
                          <span className="text-lg sm:text-2xl">{action.icon}</span>
                          <span className="text-[10px] sm:text-xs font-medium">{action.label}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10"
                >
                  <Button
                    onClick={() => {
                      if (userType === 'merchant') {
                        // Dynamically imported router for navigation
                        window.location.href = '/merchant/ai-assistant';
                      } else {
                        alert('아직 준비 중인 기능입니다! (상점주 전용)');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    AI 채팅 시작하기
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleOpen}
          size="icon"
          className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full shadow-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 relative overflow-hidden group touch-manipulation"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
          />
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-xl sm:text-2xl md:text-3xl relative z-10"
          >
            🐰
          </motion.span>
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-purple-500"
          />
        </Button>
      </motion.div>
    </>
  );
}
