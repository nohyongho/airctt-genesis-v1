
import { Utensils, Coffee, ShoppingBag, Ticket, Music, MapPin, Store, Gift } from 'lucide-react';

export interface Category {
    id: string;
    name: string;
    icon: any;
    color: string;
    description: string;
}

export const AIRCTT_CATEGORIES: Category[] = [
    {
        id: 'restaurant',
        name: '맛집',
        icon: Utensils,
        color: 'from-orange-400 to-red-500',
        description: '한식, 중식, 양식, 미슐랭까지'
    },
    {
        id: 'cafe',
        name: '카페/디저트',
        icon: Coffee,
        color: 'from-amber-400 to-orange-500',
        description: '감성 카페, 베이커리, 디저트'
    },
    {
        id: 'culture',
        name: '문화/예술',
        icon: Ticket,
        color: 'from-purple-400 to-indigo-500',
        description: '공연, 전시, 연극, 영화 티켓'
    },
    {
        id: 'shopping',
        name: '쇼핑/라이프',
        icon: ShoppingBag,
        color: 'from-pink-400 to-rose-500',
        description: '패션, 뷰티, 리빙, 편집샵'
    },
    {
        id: 'beauty',
        name: '뷰티/케어',
        icon: Gift,
        color: 'from-emerald-400 to-teal-500',
        description: '헤어, 네일, 에스테틱, 필라테스'
    },
    {
        id: 'entertainment',
        name: '놀거리',
        icon: Music,
        color: 'from-blue-400 to-cyan-500',
        description: '테마파크, 노래방, PC방, 보드게임'
    },
    {
        id: 'local',
        name: '동네장터',
        icon: MapPin,
        color: 'from-lime-400 to-green-500',
        description: '우리동네 직거래, 농수산물'
    },
    {
        id: 'vip',
        name: 'VIP 라운지',
        icon: Store,
        color: 'from-slate-700 to-slate-900',
        description: '프리미엄 멤버십 전용 혜택'
    }
];
