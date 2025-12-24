
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { customerService, Customer } from '@/lib/customers';
import { validateEmail, validateName, validateImageFile, fileToBase64 } from '@/lib/validation';
import { toast } from 'sonner';
import { aiImage } from '@zoerai/integration';

interface CustomerFormProps {
  customer?: Customer;
  mode: 'create' | 'edit';
}

export default function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    company: customer?.company || '',
    notes: customer?.notes || '',
  });
  
  const [photoUrl, setPhotoUrl] = useState(customer?.photoUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setHasChanges(true);
  };

  const handleGenerateImage = async () => {
    if (!formData.name.trim()) {
      toast.error('이름을 먼저 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `Professional business headshot portrait of ${formData.name}${
        formData.company ? ` from ${formData.company}` : ''
      }, corporate style, clean background, high quality, professional lighting`;

      const result = await aiImage.textToImage(prompt, {
        aspectRatio: '1:1',
        onProgress: (progress) => {
          console.log(`이미지 생성 중: ${progress}%`);
        },
      });

      if (result.success && result.imageUrl) {
        setPhotoUrl(result.imageUrl);
        setHasChanges(true);
        toast.success('프로필 이미지가 생성되었습니다!');
      } else {
        throw new Error(result.error || '이미지 생성 실패');
      }
    } catch (error) {
      console.error('AI 이미지 생성 오류:', error);
      toast.error('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    
    try {
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
      setHasChanges(true);
      toast.success('이미지가 업로드되었습니다!');
    } catch (error) {
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (!validateName(formData.name)) {
      newErrors.name = '이름은 2자 이상 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
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
      const customerData = {
        ...formData,
        photoUrl: photoUrl || undefined,
      };

      if (mode === 'create') {
        const newCustomer = customerService.create(customerData);
        toast.success('고객이 등록되었습니다!');
        router.push(`/customers/${newCustomer.id}`);
      } else if (customer) {
        customerService.update(customer.id, customerData);
        toast.success('고객 정보가 수정되었습니다!');
        router.push(`/customers/${customer.id}`);
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
    
    if (mode === 'edit' && customer) {
      router.push(`/customers/${customer.id}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? '새 고객 등록' : '고객 정보 수정'}</CardTitle>
          <CardDescription>
            {mode === 'create'
              ? '새로운 고객의 정보를 입력하세요'
              : '고객 정보를 수정하세요'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                이름 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="홍길동"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="hong@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">회사</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="회사명 (선택사항)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="고객에 대한 메모를 입력하세요 (선택사항)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>프로필 이미지</Label>
              
              {photoUrl && (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={photoUrl}
                    alt="프로필 미리보기"
                    className="w-full h-full rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                    onClick={() => {
                      setPhotoUrl('');
                      setHasChanges(true);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateImage}
                  disabled={isGenerating || isUploading}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI 자동 생성
                    </>
                  )}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      파일 업로드
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                JPG 또는 PNG 파일, 최대 5MB
              </p>
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
