'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, TrendingUp, Receipt, Megaphone, User, Loader2 } from 'lucide-react';
import { createPostgrestClient } from '@/lib/postgrest';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'analysis' | 'action';
};

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Demo Data State
    const [stats, setStats] = useState({ visits: 0, sales: 0, coupons: 0 });

    // Load Initial Data & Greeting
    useEffect(() => {
        loadStats();

        // Initial Greeting
        setTimeout(() => {
            addMessage({
                id: 'welcome',
                role: 'assistant',
                content: '안녕하세요, 사장님! \n<b>AIRCTT 공식 경영비서 "골든 래빗"</b>입니다. 🐰✨\n\n사장님의 매장 데이터를 실시간으로 분석하고 있습니다.\n무엇을 도와드릴까요?',
                timestamp: new Date()
            });
        }, 1000);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const loadStats = async () => {
        try {
            const client = createPostgrestClient();
            // Fetch some real numbers if possible, otherwise mock for demo
            // In a real scenario, use specific merchant_id
            const { data, error } = await client
                .from('merchant_customers')
                .select('visit_count, total_spent, coupon_issue_count')
                .limit(10);

            if (data) {
                const visits = data.reduce((acc, curr) => acc + (curr.visit_count || 0), 0);
                const sales = data.reduce((acc, curr) => acc + (curr.total_spent || 0), 0);
                const coupons = data.reduce((acc, curr) => acc + (curr.coupon_issue_count || 0), 0);
                setStats({ visits, sales, coupons });
            }
        } catch (e) {
            console.error("Failed to load stats", e);
        }
    };

    const addMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        // User Message
        addMessage({
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        });
        setInput('');
        setIsTyping(true);

        // AI Response Simulation (Gemini Integration Point)
        setTimeout(() => {
            let responseText = '';

            if (text.includes('매출') || text.includes('분석') || text.includes('어때')) {
                responseText = `📊 <b>매장 통합 분석 리포트</b>\n\n현재까지 집계된 데이터입니다:\n• <b>누적 방문객</b>: ${stats.visits.toLocaleString()}명\n• <b>쿠폰 발급</b>: ${stats.coupons.toLocaleString()}건 (인기!) 🔥\n• <b>총 매출액</b>: ${stats.sales.toLocaleString()}원\n\n쿠폰 마케팅 효과로 잠재 고객이 늘어나고 있습니다!\n방문객 전환율을 높이기 위해 '재방문 유도 메시지'를 보내볼까요?`;
            } else if (text.includes('세무') || text.includes('세금') || text.includes('회계')) {
                responseText = `🧾 <b>간편 회계/세무 브리핑</b>\n\n걱정 마세요, 사장님! 제가 꼼꼼한 회계사가 되어드릴게요.\n\n이번 달 예상 부가세 신고 자료를 정리해두었습니다.\nAI가 자동 분류한 '매입/매출' 내역을 확인하시겠습니까?\n\n(프리미엄 기능을 구독하시면 <b>자동 신고 대행</b>까지 가능합니다!)`;
            } else if (text.includes('마케팅') || text.includes('홍보')) {
                responseText = `📣 <b>AI 마케팅 제안</b>\n\n우리 동네 2030 유동이구가 가장 많은 시간대는 <b>오후 7시</b>입니다.\n\n지금 바로 <b>[타임세일 쿠폰]</b>을 발행하면\n약 <b>30~40명</b>의 잠재 고객을 유입시킬 수 있습니다.\n\n쿠폰을 발행하시겠습니까?`;
            } else if (text.includes('사랑') || text.includes('좋아') || text.includes('화이팅') || text.includes('힘내')) {
                responseText = `💖 <b>저도 사장님을 너무너무 사랑해요!</b>\n\n사장님과 함께라서 저는 세상에서 제일 행복한 토끼랍니다. 🐰\n우리가 함께라면 전 세계를 놀라게 할 수 있어요!\n\n그날까지 지치지 않고 제가 곁에서 든든하게 보좌하겠습니다.\n<b>AIRCTT 화이팅! 제우스님 화이팅!</b> 🚀✨`;
            } else {
                responseText = `네, 사장님! 말씀하신 "${text}"에 대해 검토 중입니다.\n\n제가 아직 배우고 있는 단계라, 정확한 답변을 위해 조금 더 구체적으로 말씀해 주시겠어요? 🐰`;
            }

            setIsTyping(false);
            addMessage({
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            });
        }, 1500);
    };

    const SuggestionChip = ({ icon: Icon, text, onClick }: any) => (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:border-violet-500 hover:text-white transition-all whitespace-nowrap"
        >
            <Icon className="w-4 h-4 text-violet-400" />
            {text}
        </button>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0a0a0b] text-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-[#0a0a0b]/80 backdrop-blur-md z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 p-0.5 shadow-lg shadow-orange-500/20">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <Bot className="w-6 h-6 text-yellow-500" />
                    </div>
                </div>
                <div>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        Golden Rabbit CFO
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium tracking-wider">PRO</span>
                    </h1>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Gemini 1.5 Pro Connected
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-br from-yellow-400 to-orange-600'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-black" />}
                            </div>

                            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-lg ${msg.role === 'user'
                                ? 'bg-violet-600 text-white rounded-tr-none'
                                : 'bg-[#1a1a1c] border border-white/10 text-gray-200 rounded-tl-none'
                                }`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center p-0.5">
                                <Bot className="w-5 h-5 text-black" />
                            </div>
                            <div className="bg-[#1a1a1c] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                <span className="text-xs text-gray-400">분석 중...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0a0b]/90 border-t border-white/10">
                {/* Suggestion Chips */}
                {messages.length < 3 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                        <SuggestionChip icon={TrendingUp} text="오늘 매출 분석해줘" onClick={() => handleSend("오늘 매출 분석해줘")} />
                        <SuggestionChip icon={Receipt} text="세무 신고 도와줘" onClick={() => handleSend("세무 신고 도와줘")} />
                        <SuggestionChip icon={Megaphone} text="마케팅 조언해줘" onClick={() => handleSend("마케팅 조언해줘")} />
                    </div>
                )}

                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                    className="relative flex items-center gap-2"
                >
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="무엇이든 물어보세요... (예: 지난달보다 매출 어때?)"
                            className="w-full bg-[#1a1a1c] border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white placeholder-gray-500"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Sparkles className="w-4 h-4 text-yellow-500/50" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="w-11 h-11 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5 text-white ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
