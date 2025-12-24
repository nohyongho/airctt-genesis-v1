
'use client';

import { useState } from 'react';
import { QrCode, Printer, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react'; // Need to install this, but using standard img for now if unavailable
import { toast } from 'sonner';

export default function TableQrManagePage() {
    const [tables, setTables] = useState([1, 2, 3, 4, 5]);
    const [newTableNum, setNewTableNum] = useState('');

    const addTable = () => {
        if (!newTableNum) return;
        setTables([...tables, parseInt(newTableNum)]);
        setNewTableNum('');
        toast.success('테이블이 추가되었습니다.');
    };

    const downloadQr = (num: number) => {
        // In real implementation, render canvas and download.
        // For MVP, just toast.
        toast.success(`테이블 ${num}번 QR 코드 다운로드 시작`);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">테이블 & QR 관리</h1>
                    <p className="text-slate-500">매장 내 테이블 QR 코드를 생성하고 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        className="w-32"
                        placeholder="테이블 No."
                        type="number"
                        value={newTableNum}
                        onChange={e => setNewTableNum(e.target.value)}
                    />
                    <Button onClick={addTable}><Plus className="w-4 h-4 mr-1" /> 추가</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map((num) => (
                    <Card key={num} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3 text-center">
                            <CardTitle className="text-lg">테이블 {num}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="bg-white p-2 border rounded-lg shadow-sm">
                                {/* QR Code Placeholder with Real Link */}
                                {/* Assuming domain is airctt.com */}
                                <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://airctt.com/order/${num}`}
                                        alt={`QR Table ${num}`}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 w-full">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadQr(num)}>
                                    <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Printer className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 break-all text-center">
                                airctt.com/order/{num}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </div>
    );
}
