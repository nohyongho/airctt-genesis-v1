'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, Trophy, Coins } from 'lucide-react';
import { walletService } from '@/lib/wallet-service';

interface CouponItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  size: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  caught: boolean;
}

interface CouponGameWindowProps {
  onCouponAcquired: (amount: number, name: string) => void;
  onClose?: () => void;
  lang: 'ko' | 'en';
}

const RARITY_COLORS = {
  common: { bg: 'from-gray-400 to-gray-500', glow: 'rgba(156,163,175,0.5)', label: 'COMMON' },
  rare: { bg: 'from-blue-400 to-blue-600', glow: 'rgba(59,130,246,0.5)', label: 'RARE' },
  epic: { bg: 'from-purple-400 to-purple-600', glow: 'rgba(168,85,247,0.5)', label: 'EPIC' },
  legendary: { bg: 'from-yellow-400 to-orange-500', glow: 'rgba(251,191,36,0.7)', label: 'LEGENDARY' },
};

const COUPON_EMOJIS = ['🎫', '🎟️', '💎', '🎁', '🏷️', '💰', '🌟', '🎪', '🎯', '🍀'];

function createCoupon(id: number, containerWidth: number): CouponItem {
  const rand = Math.random();
  let rarity: CouponItem['rarity'];
  let points: number;
  let speed: number;
  let size: number;

  if (rand < 0.5) {
    rarity = 'common'; points = 10; speed = 1.5 + Math.random(); size = 40;
  } else if (rand < 0.8) {
    rarity = 'rare'; points = 30; speed = 2 + Math.random(); size = 45;
  } else if (rand < 0.95) {
    rarity = 'epic'; points = 80; speed = 2.5 + Math.random(); size = 50;
  } else {
    rarity = 'legendary'; points = 200; speed = 3 + Math.random(); size = 55;
  }

  return {
    id,
    x: Math.random() * (containerWidth - 60) + 30,
    y: -60 - Math.random() * 200,
    emoji: COUPON_EMOJIS[Math.floor(Math.random() * COUPON_EMOJIS.length)],
    speed,
    size,
    rarity,
    points,
    caught: false,
  };
}

// Weighted coupon draw (same logic as original)
function drawCouponReward(): number | null {
  const rand = Math.floor(Math.random() * 400);
  if (rand < 300) return null;
  const winRand = rand - 300;
  if (winRand < 20) return 10;
  if (winRand < 30) return 20;
  if (winRand < 45) return 30;
  if (winRand < 55) return 40;
  if (winRand < 65) return 50;
  if (winRand < 75) return 60;
  if (winRand < 83) return 70;
  if (winRand < 90) return 80;
  if (winRand < 96) return 90;
  return 100;
}

export default function CouponGameWindow({ onCouponAcquired, onClose, lang }: CouponGameWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [score, setScore] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [showReward, setShowReward] = useState(false);
  const [rewardInfo, setRewardInfo] = useState({ percent: 0, tier: '' });
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const nextIdRef = useRef(0);
  const frameRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const t = {
    title: lang === 'ko' ? '쿠폰 잡기' : 'COUPON CATCH',
    desc: lang === 'ko' ? '떨어지는 쿠폰을 터치하세요!' : 'Tap the falling coupons!',
    start: lang === 'ko' ? '게임 시작' : 'START GAME',
    score: lang === 'ko' ? '점수' : 'Score',
    time: lang === 'ko' ? '시간' : 'Time',
    caught: lang === 'ko' ? '획득' : 'Caught',
    gameOver: lang === 'ko' ? '게임 종료!' : 'GAME OVER!',
    reward: lang === 'ko' ? '보상 획득!' : 'REWARD!',
    close: lang === 'ko' ? '닫기' : 'CLOSE',
    playAgain: lang === 'ko' ? '다시하기' : 'PLAY AGAIN',
    totalScore: lang === 'ko' ? '총 점수' : 'Total Score',
    couponsWon: lang === 'ko' ? '획득 쿠폰' : 'Coupons Won',
  };

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCaughtCount(0);
    setTimeLeft(30);
    setCoupons([]);
    setCombo(0);
    nextIdRef.current = 0;
    lastSpawnRef.current = 0;
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const containerWidth = containerRef.current?.clientWidth || 360;
    const containerHeight = containerRef.current?.clientHeight || 640;

    const gameLoop = (timestamp: number) => {
      // Spawn new coupons
      if (timestamp - lastSpawnRef.current > 400) {
        lastSpawnRef.current = timestamp;
        const newCoupon = createCoupon(nextIdRef.current++, containerWidth);
        setCoupons(prev => [...prev.filter(c => !c.caught && c.y < containerHeight + 100), newCoupon]);
      }

      // Move coupons
      setCoupons(prev => prev.map(c => ({
        ...c,
        y: c.caught ? c.y : c.y + c.speed,
      })));

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  // End game reward
  useEffect(() => {
    if (gameState !== 'ended') return;

    const winPercent = drawCouponReward();
    if (winPercent !== null && caughtCount >= 3) {
      setRewardInfo({
        percent: winPercent,
        tier: winPercent >= 80 ? 'LEGENDARY' : winPercent >= 50 ? 'EPIC' : winPercent >= 30 ? 'RARE' : 'COMMON',
      });
      setShowReward(true);
      onCouponAcquired(winPercent * 10, `${winPercent}% 할인 쿠폰`);

      walletService.addCoupon({
        title: `${winPercent}% Discount Coupon`,
        description: `게임 보상: ${winPercent}% OFF`,
        brand: 'AIRCTT',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200',
        discountRate: winPercent,
        issuerInfo: {
          name: '(주)발로레',
          brand: 'AIRCTT',
          mobile: '010-2187-8890',
          email: 'zeus1404@gmail.com',
          regNo: '277-87-01333',
          corpName: '주식회사 발로레',
          ceo: '오현실',
          corpRegNo: '110111-60614',
          address: '서울특별시 서초구 반포대로94길 71, 716호'
        }
      });

      // API integration
      (async () => {
        try {
          const startRes = await fetch('/api/game/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consumer_id: 'current_user', game_type: 'COUPON_CATCH_V2' })
          });
          const startData = await startRes.json();
          if (startData.session_id) {
            const finishRes = await fetch('/api/game/finish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: startData.session_id,
                steps_cleared: caughtCount,
                success: true,
                client_info: { win_percent: winPercent, score }
              })
            });
            const finishData = await finishRes.json();
            if (finishData.reward_id) {
              await fetch('/api/rewards/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reward_id: finishData.reward_id })
              });
            }
          }
        } catch (e) {
          console.error('Game API Error:', e);
        }
      })();
    }
  }, [gameState, caughtCount, score, onCouponAcquired]);

  const handleCatch = useCallback((id: number) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id && !c.caught) {
        setScore(s => s + c.points * (combo > 2 ? 2 : 1));
        setCaughtCount(n => n + 1);
        setCombo(n => {
          const next = n + 1;
          if (next >= 3) {
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 800);
          }
          return next;
        });
        return { ...c, caught: true };
      }
      return c;
    }));
  }, [combo]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* Close Button */}
      {onClose && (
        <button onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-md border border-white/20 rounded-full p-2 active:scale-95 transition-transform"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

      {/* HUD */}
      {gameState !== 'ready' && (
        <div className="absolute top-4 left-4 right-16 z-40 flex gap-2">
          <div className="bg-black/40 backdrop-blur-md border border-cyan-400/30 rounded-xl px-3 py-2 flex-1 text-center">
            <div className="text-[10px] text-cyan-300 font-bold uppercase">{t.score}</div>
            <div className="text-lg font-black text-white font-mono">{score.toLocaleString()}</div>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-yellow-400/30 rounded-xl px-3 py-2 flex-1 text-center">
            <div className="text-[10px] text-yellow-300 font-bold uppercase">{t.caught}</div>
            <div className="text-lg font-black text-yellow-400 font-mono">{caughtCount}</div>
          </div>
          <div className={`bg-black/40 backdrop-blur-md border rounded-xl px-3 py-2 flex-1 text-center ${timeLeft <= 5 ? 'border-red-500/50 animate-pulse' : 'border-white/20'}`}>
            <div className="text-[10px] text-white/70 font-bold uppercase">{t.time}</div>
            <div className={`text-lg font-black font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</div>
          </div>
        </div>
      )}

      {/* Combo indicator */}
      <AnimatePresence>
        {showCombo && combo >= 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-2xl px-6 py-2 rounded-full shadow-lg shadow-orange-500/50">
              {combo}x COMBO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-7xl mb-4">🎫</div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
              {t.title}
            </h1>
            <p className="text-white/70 text-sm mb-8">{t.desc}</p>

            <div className="grid grid-cols-4 gap-3 mb-8 max-w-xs mx-auto">
              {Object.entries(RARITY_COLORS).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${val.bg} flex items-center justify-center text-lg shadow-lg`}>
                    {key === 'common' ? '🎫' : key === 'rare' ? '💎' : key === 'epic' ? '🌟' : '🏆'}
                  </div>
                  <div className="text-[9px] text-white/50 mt-1 font-bold">{val.label}</div>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-black text-xl px-10 py-4 rounded-2xl shadow-lg shadow-purple-500/40 active:shadow-none transition-shadow"
            >
              {t.start}
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Falling Coupons */}
      {gameState === 'playing' && coupons.map(coupon => (
        !coupon.caught && (
          <motion.div
            key={coupon.id}
            className="absolute cursor-pointer active:scale-90 transition-transform"
            style={{
              left: coupon.x - coupon.size / 2,
              top: coupon.y,
              width: coupon.size,
              height: coupon.size,
            }}
            onClick={() => handleCatch(coupon.id)}
            onTouchStart={() => handleCatch(coupon.id)}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${RARITY_COLORS[coupon.rarity].bg} flex items-center justify-center shadow-lg`}
              style={{ boxShadow: `0 0 15px ${RARITY_COLORS[coupon.rarity].glow}` }}
            >
              <span className="text-2xl">{coupon.emoji}</span>
            </div>
          </motion.div>
        )
      ))}

      {/* Caught animation particles */}
      {gameState === 'playing' && coupons.filter(c => c.caught).map(coupon => (
        <motion.div
          key={`caught-${coupon.id}`}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute pointer-events-none text-3xl"
          style={{ left: coupon.x - 15, top: coupon.y }}
        >
          +{coupon.points}
        </motion.div>
      ))}

      {/* Game Over Screen */}
      {gameState === 'ended' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-black text-white mb-6">{t.gameOver}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-3">
                <Coins className="w-6 h-6 mx-auto mb-1 text-cyan-400" />
                <div className="text-2xl font-black text-white">{score.toLocaleString()}</div>
                <div className="text-xs text-white/50">{t.totalScore}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <Gift className="w-6 h-6 mx-auto mb-1 text-purple-400" />
                <div className="text-2xl font-black text-white">{caughtCount}</div>
                <div className="text-xs text-white/50">{t.couponsWon}</div>
              </div>
            </div>

            {/* Reward */}
            {showReward && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6 p-4 rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-orange-500/10"
              >
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-lg font-black text-yellow-400">{t.reward}</div>
                <div className="text-3xl font-black text-white mt-1">{rewardInfo.percent}% OFF</div>
                <div className="text-xs text-yellow-400/70 mt-1">{rewardInfo.tier}</div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-3 rounded-xl"
              >
                {t.playAgain}
              </motion.button>
              {onClose && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl border border-white/20"
                >
                  {t.close}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
