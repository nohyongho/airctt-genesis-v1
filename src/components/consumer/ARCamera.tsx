
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  SwitchCamera, 
  X, 
  Maximize, 
  Minimize,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { arCameraService, CameraDevice } from '@/lib/ar-camera-service';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ARCameraProps {
  isOpen: boolean;
  onClose: () => void;
  overlayImageUrl?: string;
  itemName?: string;
}

export default function ARCamera({ 
  isOpen, 
  onClose, 
  overlayImageUrl,
  itemName 
}: ARCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isOpen]);

  const initializeCamera = async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    try {
      const availableCameras = await arCameraService.getAvailableCameras();
      setCameras(availableCameras);

      if (availableCameras.length > 0) {
        const defaultCamera = availableCameras[0];
        setSelectedCamera(defaultCamera.deviceId);
        await arCameraService.startCamera(videoRef.current, {
          deviceId: defaultCamera.deviceId,
          facingMode: 'user',
        });
        setIsCameraActive(true);
        toast.success('카메라가 시작되었습니다');
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      toast.error('카메라를 시작할 수 없습니다. 권한을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    arCameraService.stopCamera();
    setIsCameraActive(false);
  };

  const handleCameraSwitch = async (deviceId: string) => {
    if (!videoRef.current) return;

    setIsLoading(true);
    try {
      await arCameraService.switchCamera(deviceId);
      setSelectedCamera(deviceId);
      toast.success('카메라가 전환되었습니다');
    } catch (error) {
      console.error('Failed to switch camera:', error);
      toast.error('카메라 전환에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = () => {
    const imageData = arCameraService.captureFrame();
    if (imageData) {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `ar-fitting-${Date.now()}.png`;
      link.click();
      toast.success('사진이 저장되었습니다');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full ${
            isFullscreen ? 'h-full' : 'max-w-4xl max-h-[90vh]'
          }`}
        >
          <Card className="overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1">
                  <Camera className="w-3 h-3" />
                  AR 피팅
                </Badge>
                {itemName && (
                  <span className="text-sm font-medium">{itemName}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {overlayImageUrl && isCameraActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <img
                    src={overlayImageUrl}
                    alt="AR Overlay"
                    className="max-w-[60%] max-h-[60%] object-contain"
                  />
                </motion.div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <RefreshCw className="w-8 h-8 animate-spin text-white" />
                </div>
              )}

              {!isCameraActive && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">카메라를 시작하는 중...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-background/95 backdrop-blur space-y-3">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCamera}
                  onValueChange={handleCameraSwitch}
                  disabled={isLoading || cameras.length === 0}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="카메라 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.deviceId} value={camera.deviceId}>
                        {camera.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => initializeCamera()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCapture}
                  disabled={!isCameraActive || isLoading}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  사진 저장
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  닫기
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
