
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Image as ImageIcon,
  DollarSign,
  Layers,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Brain,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AIBunnyAssistant from '@/components/shared/AIBunnyAssistant';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'INACTIVE';
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: '아메리카노',
    description: '신선한 원두로 내린 아메리카노',
    price: 4500,
    stock: 100,
    category: '음료',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: '카페라떼',
    description: '부드러운 우유와 에스프레소',
    price: 5000,
    stock: 80,
    category: '음료',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: '크로와상',
    description: '갓 구운 버터 크로와상',
    price: 3500,
    stock: 0,
    category: '베이커리',
    status: 'OUT_OF_STOCK',
  },
];

export default function MerchantProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      label: '전체 상품',
      value: products.length,
      icon: Package,
      color: 'from-violet-500 to-purple-500',
    },
    {
      label: '활성 상품',
      value: products.filter((p) => p.status === 'ACTIVE').length,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-500',
    },
    {
      label: '품절',
      value: products.filter((p) => p.status === 'OUT_OF_STOCK').length,
      icon: AlertCircle,
      color: 'from-red-500 to-rose-500',
    },
    {
      label: '총 재고',
      value: products.reduce((sum, p) => sum + p.stock, 0),
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const handleAIStockPrediction = async () => {
    setIsAIGenerating(true);
    toast.info('AI가 재고를 분석하고 있습니다...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const predictions = [
      '아메리카노 재고가 3일 내 소진될 예정입니다.',
      '주말에 크로와상 수요가 40% 증가할 것으로 예상됩니다.',
      '카페라떼 재고를 20개 추가 확보하는 것을 권장합니다.',
    ];
    
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    setIsAIGenerating(false);
    toast.success(`AI 예측: ${randomPrediction}`);
  };

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    const created: Product = {
      id: `prod_${Date.now()}`,
      ...newProduct,
      status: newProduct.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
    };

    setProducts([...products, created]);
    setIsCreateOpen(false);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
    });
    toast.success('상품이 등록되었습니다');
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    setProducts(products.filter((p) => p.id !== selectedProduct.id));
    setIsDeleteOpen(false);
    setSelectedProduct(null);
    toast.success('상품이 삭제되었습니다');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            판매중
          </Badge>
        );
      case 'OUT_OF_STOCK':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            품절
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            판매중지
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
              <h1 className="text-white font-bold text-lg">상품 관리</h1>
              <p className="text-white/70 text-xs">총 {products.length}개</p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            상품 등록
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden border-2 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold gradient-text">AI 재고 예측</h3>
                  <p className="text-xs text-muted-foreground">인공지능이 재고를 예측합니다</p>
                </div>
              </div>
              <Button
                onClick={handleAIStockPrediction}
                disabled={isAIGenerating}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600"
              >
                {isAIGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    AI 재고 예측 시작
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="상품 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">가격</p>
                          <p className="text-lg font-bold gradient-text">
                            {product.price.toLocaleString()}원
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">재고</p>
                          <p className="text-lg font-bold">
                            {product.stock}개
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? '검색 결과가 없습니다' : '등록된 상품이 없습니다'}
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  첫 상품 등록하기
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              새 상품 등록
            </DialogTitle>
            <DialogDescription>새로운 상품을 등록합니다</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>상품명 *</Label>
              <Input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                placeholder="예: 아메리카노"
              />
            </div>

            <div>
              <Label>설명</Label>
              <Textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                placeholder="상품 설명을 입력하세요"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>가격 *</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: Number(e.target.value || 0),
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>재고</Label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stock: Number(e.target.value || 0),
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label>카테고리</Label>
              <Input
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                placeholder="예: 음료"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleCreateProduct}
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
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              정말로 "{selectedProduct?.name}" 상품을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIBunnyAssistant userType="merchant" />
    </div>
  );
}
