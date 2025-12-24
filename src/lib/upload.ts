
import { upload } from "@zoerai/integration";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }
  return fileName.slice(dotIndex).toLowerCase();
}

function getAllowedExtensions(isImage: boolean): string[] {
  return isImage ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_VIDEO_EXTENSIONS;
}

function getMaxSize(isImage: boolean): number {
  return isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
}

async function commonUpload(
  file: File,
  userId: string,
  isImage: boolean
): Promise<UploadResult> {
  const ext = getFileExtension(file.name);
  const allowedExtensions = getAllowedExtensions(isImage);

  if (!allowedExtensions.includes(ext)) {
    return {
      success: false,
      error: isImage
        ? "지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp, gif만 가능)"
        : "지원하지 않는 영상 형식입니다. (mp4, webm, mov만 가능)",
    };
  }

  const maxSize = getMaxSize(isImage);
  if (file.size > maxSize) {
    return {
      success: false,
      error: `파일 크기는 ${maxSize / 1024 / 1024}MB를 초과할 수 없습니다.`,
    };
  }

  try {
    const result = await upload.uploadWithPresignedUrl(file, {
      fileName: `${isImage ? "profile-image" : "profile-video"}-${userId}-${Date.now()}${ext}`,
      allowedExtensions,
      maxSize,
    });

    if (!result.success || !result.url) {
      return {
        success: false,
        error:
          result.error ||
          (isImage
            ? "이미지 업로드에 실패했습니다."
            : "영상 업로드에 실패했습니다."),
      };
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: isImage
        ? "이미지 업로드 중 오류가 발생했습니다."
        : "영상 업로드 중 오류가 발생했습니다.",
    };
  }
}

export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  return commonUpload(file, userId, true);
}

export async function uploadProfileVideo(
  file: File,
  userId: string
): Promise<UploadResult> {
  return commonUpload(file, userId, false);
}

export function createLocalPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// Store media upload functions
export async function uploadStoreHeroImage(
  file: File,
  storeId: string
): Promise<UploadResult> {
  const ext = getFileExtension(file.name);

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      success: false,
      error: "지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp, gif만 가능)",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      success: false,
      error: `파일 크기는 ${MAX_IMAGE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`,
    };
  }

  try {
    const result = await upload.uploadWithPresignedUrl(file, {
      fileName: `store-hero-${storeId}-${Date.now()}${ext}`,
      allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
      maxSize: MAX_IMAGE_SIZE,
    });

    if (!result.success || !result.url) {
      return {
        success: false,
        error: result.error || "대표 이미지 업로드에 실패했습니다.",
      };
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error("Store hero image upload error:", error);
    return {
      success: false,
      error: "대표 이미지 업로드 중 오류가 발생했습니다.",
    };
  }
}

export async function uploadStoreMedia(
  file: File,
  storeId: string,
  type: 'image' | 'video'
): Promise<UploadResult> {
  const ext = getFileExtension(file.name);
  const isImage = type === 'image';
  const allowedExtensions = isImage ? ALLOWED_IMAGE_EXTENSIONS : ALLOWED_VIDEO_EXTENSIONS;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (!allowedExtensions.includes(ext)) {
    return {
      success: false,
      error: isImage
        ? "지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp, gif만 가능)"
        : "지원하지 않는 영상 형식입니다. (mp4, webm, mov만 가능)",
    };
  }

  if (file.size > maxSize) {
    return {
      success: false,
      error: `파일 크기는 ${maxSize / 1024 / 1024}MB를 초과할 수 없습니다.`,
    };
  }

  try {
    const result = await upload.uploadWithPresignedUrl(file, {
      fileName: `store-gallery-${storeId}-${Date.now()}${ext}`,
      allowedExtensions,
      maxSize,
    });

    if (!result.success || !result.url) {
      return {
        success: false,
        error: result.error || "미디어 업로드에 실패했습니다.",
      };
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error("Store media upload error:", error);
    return {
      success: false,
      error: "미디어 업로드 중 오류가 발생했습니다.",
    };
  }
}
