
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { merchantService, Merchant } from '@/lib/merchants';
import { toast } from 'sonner';

interface MerchantFormProps {
  merchant?: Merchant;
  mode: 'create' | 'edit';
}

export default function MerchantForm({ merchant, mode }: MerchantFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: merchant?.name || '',
    businessName: merchant?.businessName || '',
    contact: merchant?.contact || '',
    address: merchant?.address || '',
    status: merchant?.status || 'active' as 'active' | 'inactive',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '가맹점명을 입력해주세요';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = '사업자명을 입력해주세요';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = '연락처를 입력해주세요';
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('입력 내용을 확인해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      if (mode === 'create') {
        const newMerchant = merchantService.create(formData);
        toast.success('가맹점이 등록되었습니다!');
        router.push('/merchants');
      } else if (merchant) {
        merchantService.update(merchant.id, formData);
        toast.success('가맹점 정보가 수정되었습니다!');
        router.push('/merchants');
      }
    } catch (error: any) {
      toast.error(error.message || '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('변경사항이 저장되지 않습니다. 계속하시겠습니까?')) {
        return;
      }
    }
    
    router.push('/merchants');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? '새 가맹점 등록' : '가맹점 정보 수정'}</CardTitle>
          <CardDescription>
            {mode === 'create'
              ? '새로운 가맹점의 정보를 입력하세요'
              : '가맹점 정보를 수정하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                가맹점명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="가맹점명을 입력하세요"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">
                사업자명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="사업자명을 입력하세요"
                className={errors.businessName ? 'border-destructive' : ''}
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">
                연락처 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="010-1234-5678"
                className={errors.contact ? 'border-destructive' : ''}
              />
              {errors.contact && (
                <p className="text-sm text-destructive">{errors.contact}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                주소 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
                rows={3}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                상태 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  handleChange('status', value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">운영중</SelectItem>
                  <SelectItem value="inactive">휴면</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                mode === 'create' ? '등록하기' : '수정하기'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
