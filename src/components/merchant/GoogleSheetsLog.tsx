'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function GoogleSheetsLog() {
    const [isSyncing, setIsSyncing] = React.useState(false);

    // Mock data simulating a Google Sheet
    const logs = [
        { id: 1, time: '2025-12-04 14:20:15', merchant: 'Jollibee', category: 'Restaurant', action: 'COUPON_ISSUE', status: 'SYNCED' },
        { id: 2, time: '2025-12-04 14:18:22', merchant: 'Nike Store', category: 'Clothing', action: 'COUPON_USE', status: 'SYNCED' },
        { id: 3, time: '2025-12-04 14:15:00', merchant: 'E-Mart', category: 'Mart', action: 'POINT_ACCUM', status: 'SYNCED' },
        { id: 4, time: '2025-12-04 14:10:45', merchant: 'Starbucks', category: 'Cafe', action: 'COUPON_ISSUE', status: 'SYNCED' },
        { id: 5, time: '2025-12-04 14:05:30', merchant: 'Jollibee', category: 'Restaurant', action: 'COUPON_USE', status: 'SYNCED' },
    ];

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <Card className="glass-card border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-400">
                    <FileSpreadsheet className="w-4 h-4" />
                    Google Sheets Transaction Log
                </CardTitle>
                <button
                    onClick={handleSync}
                    className={`p-1 rounded-full hover:bg-white/10 transition-colors ${isSyncing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-green-900/20">
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="text-xs text-green-200/70">Time</TableHead>
                                <TableHead className="text-xs text-green-200/70">Merchant</TableHead>
                                <TableHead className="text-xs text-green-200/70">Category</TableHead>
                                <TableHead className="text-xs text-green-200/70">Action</TableHead>
                                <TableHead className="text-xs text-green-200/70 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-white/5 border-white/10">
                                    <TableCell className="text-xs font-mono text-muted-foreground">{log.time}</TableCell>
                                    <TableCell className="text-xs font-medium">{log.merchant}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{log.category}</TableCell>
                                    <TableCell className="text-xs">
                                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px] h-5">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-right">
                                        <span className="inline-flex items-center gap-1 text-green-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            {isSyncing ? 'Syncing...' : log.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Auto-sync active</span>
                    </div>
                    <a
                        href="https://docs.google.com/spreadsheets/u/0/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-400 underline decoration-green-500/30 underline-offset-2"
                    >
                        Open in Google Sheets ↗
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
