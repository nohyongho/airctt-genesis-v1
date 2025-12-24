
'use client';

import { useState } from 'react';
import { Send, Users, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// Step 10: Marketing Push Center
export default function MarketingPushPage() {
    const [targetCount, setTargetCount] = useState(128); // Mock customer count
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendPush = async () => {
        if (!message) {
            toast.error('내용을 입력해주세요.');
            return;
        }
        setLoading(true);
        // Simulate API Call
        await new Promise(r => setTimeout(r, 2000));

        toast.success(`총 ${targetCount}명의 단골 고객에게 발송 성공! 🚀`);
        setLoading(false);
        setMessage('');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">

            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                    <Bell className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">단골 마케팅 센터</h1>
                    <p className="text-slate-500">우리 가게 고객들에게 깜짝 소식을 전해보세요.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Input Form */}
                <Card className="md:col-span-2 shadow-lg border-t-4 border-t-indigo-600">
                    <CardHeader>
                        <CardTitle>푸시 알림 메시지 작성</CardTitle>
                        <CardDescription>앱 설치 고객에게 무료로 발송됩니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Targeting Options */}
                        <div className="bg-slate-50 p-4 rounded-lg space-y-3 border">
                            <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                <Users className="w-4 h-4" /> 발송 대상 선택
                            </h4>
                            <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="all" defaultChecked />
                                    <label htmlFor="all" className="text-sm">전체 단골 ({targetCount}명)</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="vip" />
                                    <label htmlFor="vip" className="text-sm text-slate-500">VIP 고객만</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="new" />
                                    <label htmlFor="new" className="text-sm text-slate-500">신규 고객만</label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">메시지 제목</label>
                            <Input placeholder="예: [긴급] 오늘만 치킨 50% 할인!" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">내용</label>
                            <Textarea
                                placeholder="고객님들을 위한 특별한 혜택을 적어주세요."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="h-32 resize-none"
                            />
                            <p className="text-right text-xs text-slate-400">{message.length} / 200자</p>
                        </div>

                        {/* Coupon Attachment */}
                        <div className="flex items-center gap-2 border p-3 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors bg-white">
                            <div className="bg-slate-100 p-2 rounded text-slate-400">🎟️</div>
                            <span className="text-sm text-slate-500">쿠폰 첨부하기 (선택)</span>
                            <Button variant="ghost" size="sm" className="ml-auto text-indigo-600">불러오기</Button>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg font-bold h-12"
                            onClick={handleSendPush}
                            disabled={loading}
                        >
                            {loading ? '발송 중...' : '마케팅 메시지 발송하기'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Right: Preview Mockup */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-700 text-center">고객 화면 미리보기</h3>
                    <div className="border-[8px] border-slate-900 rounded-[3rem] p-4 bg-slate-100 h-[500px] relative shadow-2xl overflow-hidden mx-auto w-[280px]">
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-6 bg-slate-900 w-1/2 mx-auto rounded-b-xl" />

                        {/* Lock Screen simulation */}
                        <div className="mt-12 space-y-2">
                            <div className="text-center">
                                <h2 className="text-4xl font-thin text-slate-700">12:30</h2>
                                <p className="text-xs text-slate-400">12월 09일 월요일</p>
                            </div>

                            {/* Notification Bubble */}
                            <div className="mx-2 mt-4 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm border border-white/50 animate-in slide-in-from-top-4 fade-in duration-700">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 bg-indigo-600 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">A</div>
                                        <span className="text-[10px] font-bold text-slate-600">AIRCTT</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400">방금 전</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 mb-0.5">강남 1호점</p>
                                <p className="text-xs text-slate-600 leading-tight">
                                    {message || '사장님이 보낸 메시지가 여기에 표시됩니다.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
