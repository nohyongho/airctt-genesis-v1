
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Store, ArrowUpDown } from 'lucide-react';
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
import { merchantService, Merchant } from '@/lib/merchants';
import { toast } from 'sonner';

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

function MerchantsContent() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = () => {
    const allMerchants = merchantService.getAll();
    setMerchants(allMerchants);
  };

  const getSortedMerchants = (merchantsList: Merchant[]): Merchant[] => {
    const sorted = [...merchantsList];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'ko'));
      default:
        return sorted;
    }
  };

  const filteredMerchants = searchQuery
    ? merchantService.search(searchQuery)
    : merchants;

  const sortedAndFilteredMerchants = getSortedMerchants(filteredMerchants);

  const handleDelete = (merchant: Merchant) => {
    if (!confirm(`"${merchant.name}" 가맹점을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      merchantService.delete(merchant.id);
      toast.success('가맹점이 삭제되었습니다.');
      loadMerchants();
    } catch (error: any) {
      toast.error(error.message || '삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            운영중
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
            휴면
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            정지
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">가맹점 관리</h1>
              <p className="text-muted-foreground">
                가맹점 정보를 관리하세요
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>가맹점 목록</CardTitle>
                <CardDescription>
                  총 {sortedAndFilteredMerchants.length}개의 가맹점
                </CardDescription>
              </div>
              <Button onClick={() => router.push('/merchants/new')}>
                <Plus className="mr-2 h-4 w-4" />
                가맹점 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="가맹점명, 사업자명, 연락처로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최근 등록순</SelectItem>
                  <SelectItem value="oldest">오래된 순</SelectItem>
                  <SelectItem value="name-asc">이름 오름차순</SelectItem>
                  <SelectItem value="name-desc">이름 내림차순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sortedAndFilteredMerchants.length === 0 ? (
              <div className="text-center py-12">
                <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 가맹점이 없습니다'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? '다른 검색어로 시도해보세요'
                    : '첫 번째 가맹점을 등록해보세요'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push('/merchants/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    가맹점 추가
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>가맹점명</TableHead>
                      <TableHead>사업자명</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndFilteredMerchants.map((merchant) => (
                      <TableRow key={merchant.id}>
                        <TableCell className="font-medium">
                          {merchant.name}
                        </TableCell>
                        <TableCell>{merchant.businessName}</TableCell>
                        <TableCell>{merchant.contact}</TableCell>
                        <TableCell>
                          {getStatusBadge(merchant.status)}
                        </TableCell>
                        <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/merchants/${merchant.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(merchant)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

export default function MerchantsPage() {
  return (
    <ProtectedRoute>
      <MerchantsContent />
    </ProtectedRoute>
  );
}
