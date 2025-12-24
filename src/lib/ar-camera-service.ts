
export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
}

export interface ARCameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
  deviceId?: string;
}

export class ARCameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async getAvailableCameras(): Promise<CameraDevice[]> {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `카메라 ${device.deviceId.slice(0, 5)}`,
          kind: device.kind,
        }));
    } catch (error) {
      console.error('Failed to get camera devices:', error);
      throw new Error('카메라 접근 권한이 필요합니다');
    }
  }

  async startCamera(
    videoElement: HTMLVideoElement,
    config: Partial<ARCameraConfig> = {}
  ): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: config.width || 1280 },
          height: { ideal: config.height || 720 },
          facingMode: config.facingMode || 'user',
          ...(config.deviceId && { deviceId: { exact: config.deviceId } }),
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement = videoElement;
      videoElement.srcObject = this.stream;
      
      await new Promise<void>((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play()
            .then(() => resolve())
            .catch(reject);
        };
      });
    } catch (error) {
      console.error('Failed to start camera:', error);
      throw new Error('카메라를 시작할 수 없습니다');
    }
  }

  async switchCamera(deviceId: string): Promise<void> {
    if (!this.videoElement) {
      throw new Error('비디오 요소가 초기화되지 않았습니다');
    }

    this.stopCamera();
    await this.startCamera(this.videoElement, { deviceId });
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  captureFrame(): string | null {
    if (!this.videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(this.videoElement, 0, 0);
    return canvas.toDataURL('image/png');
  }

  isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }
}

export const arCameraService = new ARCameraService();
