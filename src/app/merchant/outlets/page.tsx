
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Plus,
  Search,
  MapPin,
  Clock,
  Phone,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Navigation,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { outletService, initMerchantDemo, merchantProfileService } from '@/lib/merchant-service';
import { Outlet } from '@/lib/merchant-types';
import { toast } from 'sonner';

export default function MerchantOutletsPage() {
  const router = useRouter();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [newOutlet, setNewOutlet] = useState({
    name: '',
    address: '',
    phone: '',
    openTime: '09:00',
    closeTime: '22:00',
    description: '',
  });

  useEffect(() => {
    initMerchantDemo();
    loadOutlets();
  }, []);

  const loadOutlets = () => {
    setOutlets(outletService.getAll());
  };

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOutlet = () => {
    if (!newOutlet.name || !newOutlet.address) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    const profile = merchantProfileService.get();
    if (!profile) {
      toast.error('가맹점 정보가 없습니다. 먼저 가맹점 프로필을 설정해주세요.');
      return;
    }

    const outlet = outletService.create({
      merchantId: profile.id,
      ...newOutlet,
      status: 'ACTIVE',
      latitude: 37.5665 + Math.random() * 0.01,
      longitude: 126.978 + Math.random() * 0.01,
    });

    setOutlets([...outlets, outlet]);
    setIsCreateOpen(false);
    setNewOutlet({
      name: '',
      address: '',
      phone: '',
      openTime: '09:00',
      closeTime: '22:00',
      description: '',
    });
    toast.success('매장이 등록되었습니다');
  };

  const handleDeleteOutlet = () => {
    if (!selectedOutlet) return;
    
    outletService.delete(selectedOutlet.id);
    setOutlets(outlets.filter(o => o.id !== selectedOutlet.id));
    setIsDeleteOpen(false);
    setSelectedOutlet(null);
    toast.success('매장이 삭제되었습니다');
  };

  const toggleOutletStatus = (outlet: Outlet) => {
    const newStatus = outlet.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    outletService.update(outlet.id, { status: newStatus });
    setOutlets(outlets.map(o => 
      o.id === outlet.id ? { ...o, status: newStatus } : o
    ));
    toast.success(`매장이 ${newStatus === 'ACTIVE' ? '영업 시작' : '휴업'}되었습니다`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-dark">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">매장 관리</h1>
              <p className="text-white/70 text-xs">총 {outlets.length}개</p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            매장 추가
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-2 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold">{outlets.filter(o => o.status === 'ACTIVE').length}</p>
              <p className="text-xs text-muted-foreground">영업중</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 shadow-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold">4.8</p>
              <p className="text-xs text-muted-foreground">평균 평점</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 shadow-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold">1.2K</p>
              <p className="text-xs text-muted-foreground">총 방문</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="매장 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredOutlets.map((outlet, index) => (
              <motion.div
                key={outlet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover-lift overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {outlet.imageUrl ? (
                        <img
                          src={outlet.imageUrl}
                          alt={outlet.name}
                          className="w-20 h-20 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-violet-500" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{outlet.name}</h3>
                              {outlet.status === 'ACTIVE' && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${outlet.status === 'ACTIVE' ? 'border-emerald-500 text-emerald-500' : 'border-gray-500 text-gray-500'}`}
                            >
                              {outlet.status === 'ACTIVE' ? '영업중' : '휴업'}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleOutletStatus(outlet)}>
                                {outlet.status === 'ACTIVE' ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    휴업하기
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    영업 시작
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Navigation className="w-4 h-4 mr-2" />
                                길찾기
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedOutlet(outlet);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{outlet.address}</span>
                          </div>
                          {outlet.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{outlet.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{(outlet as any).openTime} - {(outlet as any).closeTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-amber-500" />
                            <span>4.8</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />
                            <span>오늘 {Math.floor(Math.random() * 100)}건</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOutlets.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-violet-500" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 매장이 없습니다'}
                </p>
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  첫 매장 등록하기
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              새 매장 등록
            </DialogTitle>
            <DialogDescription>
              새로운 매장 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>매장명 *</Label>
              <Input
                value={newOutlet.name}
                onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
                placeholder="예: 강남점"
              />
            </div>
            
            <div>
              <Label>주소 *</Label>
              <Input
                value={newOutlet.address}
                onChange={(e) => setNewOutlet({ ...newOutlet, address: e.target.value })}
                placeholder="예: 서울시 강남구 테헤란로 123"
              />
            </div>
            
            <div>
              <Label>전화번호</Label>
              <Input
                value={newOutlet.phone}
                onChange={(e) => setNewOutlet({ ...newOutlet, phone: e.target.value })}
                placeholder="예: 02-1234-5678"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>오픈 시간</Label>
                <Input
                  type="time"
                  value={newOutlet.openTime}
                  onChange={(e) => setNewOutlet({ ...newOutlet, openTime: e.target.value })}
                />
              </div>
              <div>
                <Label>마감 시간</Label>
                <Input
                  type="time"
                  value={newOutlet.closeTime}
                  onChange={(e) => setNewOutlet({ ...newOutlet, closeTime: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>설명</Label>
              <Textarea
                value={newOutlet.description}
                onChange={(e) => setNewOutlet({ ...newOutlet, description: e.target.value })}
                placeholder="매장에 대한 간단한 설명"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleCreateOutlet}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>매장 삭제</DialogTitle>
            <DialogDescription>
              정말로 "{selectedOutlet?.name}" 매장을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteOutlet}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
