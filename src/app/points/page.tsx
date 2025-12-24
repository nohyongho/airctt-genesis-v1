
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Search, ArrowUpDown, TrendingUp, TrendingDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { pointService, PointTransaction } from '@/lib/points';

type SortOption = 'newest' | 'oldest' | 'points-high' | 'points-low';
type FilterOption = 'all' | 'earn' | 'use';

function PointsContent() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const allTransactions = pointService.getAll();
    setTransactions(allTransactions);
  };

  const getSortedTransactions = (transactionsList: PointTransaction[]): PointTransaction[] => {
    const sorted = [...transactionsList];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'points-high':
        return sorted.sort((a, b) => b.points - a.points);
      case 'points-low':
        return sorted.sort((a, b) => a.points - b.points);
      default:
        return sorted;
    }
  };

  const getFilteredTransactions = (transactionsList: PointTransaction[]): PointTransaction[] => {
    if (filterBy === 'all') return transactionsList;
    return transactionsList.filter(t => t.type === filterBy);
  };

  const searchTransactions = (transactionsList: PointTransaction[]): PointTransaction[] => {
    if (!searchQuery.trim()) return transactionsList;
    
    const lowerQuery = searchQuery.toLowerCase().trim();
    return transactionsList.filter(t => 
      t.customerName.toLowerCase().includes(lowerQuery) ||
      t.customerId.toLowerCase().includes(lowerQuery) ||
      (t.description && t.description.toLowerCase().includes(lowerQuery))
    );
  };

  const filteredTransactions = getFilteredTransactions(transactions);
  const searchedTransactions = searchTransactions(filteredTransactions);
  const sortedAndFilteredTransactions = getSortedTransactions(searchedTransactions);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalEarned = pointService.getTotalPointsEarned();
  const totalUsed = pointService.getTotalPointsUsed();
  const totalBalance = totalEarned - totalUsed;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">포인트 관리</h1>
              <p className="text-muted-foreground">
                포인트 적립 및 사용 내역을 관리하세요
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 적립</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{totalEarned.toLocaleString()}P
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{totalUsed.toLocaleString()}P
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">현재 잔액</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalBalance.toLocaleString()}P
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>포인트 내역</CardTitle>
                <CardDescription>
                  총 {sortedAndFilteredTransactions.length}개의 거래 내역
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="고객명, 고객ID, 사유로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="유형 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="earn">적립</SelectItem>
                  <SelectItem value="use">사용</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최근 날짜순</SelectItem>
                  <SelectItem value="oldest">오래된 날짜순</SelectItem>
                  <SelectItem value="points-high">포인트 높은순</SelectItem>
                  <SelectItem value="points-low">포인트 낮은순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sortedAndFilteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || filterBy !== 'all' ? '검색 결과가 없습니다' : '포인트 내역이 없습니다'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterBy !== 'all'
                    ? '다른 검색어나 필터로 시도해보세요'
                    : '고객 상세 페이지에서 포인트를 적립해보세요'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>고객명</TableHead>
                      <TableHead>고객 ID</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead className="text-right">포인트</TableHead>
                      <TableHead>사유</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndFilteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.customerName}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {transaction.customerId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === 'earn' ? 'default' : 'secondary'}
                            className={
                              transaction.type === 'earn'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            }
                          >
                            {transaction.type === 'earn' ? (
                              <>
                                <TrendingUp className="mr-1 h-3 w-3" />
                                적립
                              </>
                            ) : (
                              <>
                                <TrendingDown className="mr-1 h-3 w-3" />
                                사용
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span
                            className={
                              transaction.type === 'earn'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {transaction.type === 'earn' ? '+' : '-'}
                            {transaction.points.toLocaleString()}P
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const customerId = transaction.customerId;
                              router.push(`/customers/${customerId}`);
                            }}
                            title="고객 상세 보기"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function PointsPage() {
  return (
    <ProtectedRoute>
      <PointsContent />
    </ProtectedRoute>
  );
}
