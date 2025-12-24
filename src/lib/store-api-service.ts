/**
 * Store API Service
 * 매장 관련 실제 API 호출 서비스
 * 기존 localStorage 기반 서비스와 병행 사용
 */

import { uploadStoreHeroImage, uploadStoreMedia } from './upload';

export interface StoreData {
    id: string;
    merchant_id: string;
    name: string;
    description: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    phone: string | null;
    opening_hours: any;
    homepage_url: string | null;
    hero_image_url: string | null;
    promo_video_url: string | null;
    order_url: string | null;
    reservation_url: string | null;
    radius_meters: number | null;
    is_active: boolean;
    store_media?: StoreMedia[];
    store_links?: StoreLink[];
}

export interface StoreMedia {
    id: string;
    store_id: string;
    type: 'image' | 'video';
    url: string;
    title: string | null;
    sort_order: number;
    status: 'active' | 'hidden' | 'deleted';
}

export interface StoreLink {
    id: string;
    store_id: string;
    label: string;
    url: string;
    icon: string | null;
    sort_order: number;
    status: 'active' | 'hidden' | 'deleted';
}

// Merchant Store API Service
export const storeApiService = {
    // 매장 상세 조회
    async getStore(storeId: string): Promise<StoreData | null> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            console.error('Error fetching store:', error);
            return null;
        }
    },

    // 매장 정보 업데이트
    async updateStore(storeId: string, data: Partial<StoreData>): Promise<StoreData | null> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Update failed');
            }
            return await res.json();
        } catch (error) {
            console.error('Error updating store:', error);
            throw error;
        }
    },

    // 대표 이미지 업로드 및 저장
    async uploadHeroImage(storeId: string, file: File): Promise<string | null> {
        try {
            // 1. 파일 업로드
            const uploadResult = await uploadStoreHeroImage(file, storeId);
            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || '업로드 실패');
            }

            // 2. DB에 URL 저장
            const res = await fetch(`/api/merchant/stores/${storeId}/hero-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: uploadResult.url }),
            });

            if (!res.ok) {
                throw new Error('DB 저장 실패');
            }

            return uploadResult.url;
        } catch (error) {
            console.error('Error uploading hero image:', error);
            throw error;
        }
    },

    // 대표 이미지 삭제
    async deleteHeroImage(storeId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/hero-image`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Error deleting hero image:', error);
            return false;
        }
    },

    // 갤러리 미디어 조회
    async getMedia(storeId: string): Promise<StoreMedia[]> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/media`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error('Error fetching media:', error);
            return [];
        }
    },

    // 갤러리 이미지 업로드
    async uploadMedia(storeId: string, file: File, type: 'image' | 'video', title?: string): Promise<StoreMedia | null> {
        try {
            // 1. 파일 업로드
            const uploadResult = await uploadStoreMedia(file, storeId, type);
            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || '업로드 실패');
            }

            // 2. DB에 저장
            const res = await fetch(`/api/merchant/stores/${storeId}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: uploadResult.url,
                    type,
                    title,
                }),
            });

            if (!res.ok) {
                throw new Error('DB 저장 실패');
            }

            const data = await res.json();
            return data.media;
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    },

    // 미디어 삭제
    async deleteMedia(storeId: string, mediaId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/media?mediaId=${mediaId}`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Error deleting media:', error);
            return false;
        }
    },

    // 링크 조회
    async getLinks(storeId: string): Promise<StoreLink[]> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/links`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error('Error fetching links:', error);
            return [];
        }
    },

    // 링크 추가
    async addLink(storeId: string, label: string, url: string, icon?: string): Promise<StoreLink | null> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label, url, icon }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || '링크 추가 실패');
            }

            const data = await res.json();
            return data.link;
        } catch (error) {
            console.error('Error adding link:', error);
            throw error;
        }
    },

    // 링크 수정
    async updateLink(storeId: string, linkId: string, data: Partial<StoreLink>): Promise<StoreLink | null> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/links`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkId, ...data }),
            });

            if (!res.ok) {
                throw new Error('링크 수정 실패');
            }

            const result = await res.json();
            return result.link;
        } catch (error) {
            console.error('Error updating link:', error);
            throw error;
        }
    },

    // 링크 삭제
    async deleteLink(storeId: string, linkId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}/links?linkId=${linkId}`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Error deleting link:', error);
            return false;
        }
    },

    // 반경 설정 (0 ~ 20,000km)
    async setRadius(storeId: string, radiusMeters: number): Promise<boolean> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ radius_meters: radiusMeters }),
            });
            return res.ok;
        } catch (error) {
            console.error('Error setting radius:', error);
            return false;
        }
    },

    // 홍보 영상 URL 설정
    async setPromoVideo(storeId: string, videoUrl: string | null): Promise<boolean> {
        try {
            const res = await fetch(`/api/merchant/stores/${storeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promo_video_url: videoUrl }),
            });
            return res.ok;
        } catch (error) {
            console.error('Error setting promo video:', error);
            return false;
        }
    },
};

// Consumer Store API Service
export const consumerStoreApiService = {
    // 주변 매장 조회 (반경 필터링 적용)
    async getNearbyStores(lat: number, lng: number, options?: {
        category?: string;
        search?: string;
        limit?: number;
    }): Promise<StoreData[]> {
        try {
            const params = new URLSearchParams();
            params.set('lat', lat.toString());
            params.set('lng', lng.toString());
            if (options?.category) params.set('category', options.category);
            if (options?.search) params.set('search', options.search);
            if (options?.limit) params.set('limit', options.limit.toString());

            const res = await fetch(`/api/consumer/stores?${params.toString()}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error('Error fetching nearby stores:', error);
            return [];
        }
    },

    // 매장 상세 조회
    async getStore(storeId: string): Promise<StoreData | null> {
        try {
            const res = await fetch(`/api/consumer/stores/${storeId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            console.error('Error fetching store:', error);
            return null;
        }
    },
};

// Admin Store API Service
export const adminStoreApiService = {
    // 전체 매장 조회
    async getAllStores(options?: {
        search?: string;
        status?: 'active' | 'inactive' | 'all';
        limit?: number;
        offset?: number;
    }): Promise<{ stores: StoreData[]; total: number }> {
        try {
            const params = new URLSearchParams();
            if (options?.search) params.set('search', options.search);
            if (options?.status) params.set('status', options.status);
            if (options?.limit) params.set('limit', options.limit.toString());
            if (options?.offset) params.set('offset', options.offset.toString());

            const res = await fetch(`/api/admin/stores?${params.toString()}`);
            if (!res.ok) return { stores: [], total: 0 };
            return await res.json();
        } catch (error) {
            console.error('Error fetching stores:', error);
            return { stores: [], total: 0 };
        }
    },

    // 매장 상세 조회
    async getStore(storeId: string): Promise<StoreData | null> {
        try {
            const res = await fetch(`/api/admin/stores/${storeId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            console.error('Error fetching store:', error);
            return null;
        }
    },

    // 매장 업데이트
    async updateStore(storeId: string, data: Partial<StoreData>): Promise<StoreData | null> {
        try {
            const res = await fetch(`/api/admin/stores/${storeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            console.error('Error updating store:', error);
            return null;
        }
    },

    // 매장 비활성화
    async deactivateStore(storeId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/admin/stores/${storeId}`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Error deactivating store:', error);
            return false;
        }
    },

    // 미디어 숨김
    async hideMedia(mediaId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/admin/media/${mediaId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'hidden' }),
            });
            return res.ok;
        } catch (error) {
            console.error('Error hiding media:', error);
            return false;
        }
    },

    // 미디어 삭제
    async deleteMedia(mediaId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/admin/media/${mediaId}`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Error deleting media:', error);
            return false;
        }
    },

    // 미디어 활성화
    async activateMedia(mediaId: string): Promise<boolean> {
        try {
            const res = await fetch(`/api/admin/media/${mediaId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });
            return res.ok;
        } catch (error) {
            console.error('Error activating media:', error);
            return false;
        }
    },
};
