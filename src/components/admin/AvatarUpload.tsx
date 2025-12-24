
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadProfileImage, uploadProfileVideo, createLocalPreviewUrl, revokePreviewUrl } from '@/lib/upload';
import { toast } from 'sonner';

interface AvatarUploadProps {
  type: 'image' | 'video';
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  userId: string;
}

export default function AvatarUpload({ type, currentUrl, onUploadComplete, userId }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = type === 'image';
  const accept = isImage
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : 'video/mp4,video/webm,video/quicktime';

  const maxSize = isImage ? '5MB' : '50MB';
  const Icon = isImage ? ImageIcon : Video;

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = createLocalPreviewUrl(file);
    setPreviewUrl(localUrl);

    setUploading(true);

    try {
      const result = isImage
        ? await uploadProfileImage(file, userId)
        : await uploadProfileVideo(file, userId);

      if (result.success && result.url) {
        onUploadComplete(result.url);
        toast.success(`${isImage ? '이미지' : '영상'}가 업로드되었습니다`);
        revokePreviewUrl(localUrl);
        setPreviewUrl(result.url);
      } else {
        toast.error(result.error || '업로드에 실패했습니다');
        revokePreviewUrl(localUrl);
        setPreviewUrl(currentUrl);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      toast.error('업로드 중 오류가 발생했습니다');
      revokePreviewUrl(localUrl);
      setPreviewUrl(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      revokePreviewUrl(previewUrl);
    }
    setPreviewUrl(undefined);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">
              {isImage ? '프로필 이미지' : '프로필 영상'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">최대 {maxSize}</span>
        </div>

        {previewUrl ? (
          <div className="relative">
            {isImage ? (
              <img
                src={previewUrl}
                alt="프로필 미리보기"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full h-48 rounded-lg bg-black"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              클릭하여 {isImage ? '이미지' : '영상'} 업로드
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.split(',').join(', ')}
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading && (
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="text-sm text-muted-foreground mt-2">업로드 중...</p>
          </div>
        )}
      </div>
    </Card>
  );
}
