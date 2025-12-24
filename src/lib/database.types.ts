export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    phone: string | null
                    password_hash: string | null
                    name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    phone?: string | null
                    password_hash?: string | null
                    name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    phone?: string | null
                    password_hash?: string | null
                    name?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    parent_id: string | null
                    name: string
                    slug: string
                    level: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    parent_id?: string | null
                    name: string
                    slug: string
                    level?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    parent_id?: string | null
                    name?: string
                    slug?: string
                    level?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            merchants: {
                Row: {
                    id: string
                    name: string
                    type: 'restaurant' | 'retail' | 'culture' | 'service' | 'other'
                    homepage_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'restaurant' | 'retail' | 'culture' | 'service' | 'other'
                    homepage_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'restaurant' | 'retail' | 'culture' | 'service' | 'other'
                    homepage_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            stores: {
                Row: {
                    id: string
                    merchant_id: string
                    name: string
                    description: string | null
                    address: string | null
                    lat: number | null
                    lng: number | null
                    phone: string | null
                    opening_hours: Json | null
                    homepage_url: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                    // New fields for store customization
                    radius_meters: number | null
                    hero_image_url: string | null
                    promo_video_url: string | null
                    order_url: string | null
                    reservation_url: string | null
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    name: string
                    description?: string | null
                    address?: string | null
                    lat?: number | null
                    lng?: number | null
                    phone?: string | null
                    opening_hours?: Json | null
                    homepage_url?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                    radius_meters?: number | null
                    hero_image_url?: string | null
                    promo_video_url?: string | null
                    order_url?: string | null
                    reservation_url?: string | null
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    name?: string
                    description?: string | null
                    address?: string | null
                    lat?: number | null
                    lng?: number | null
                    phone?: string | null
                    opening_hours?: Json | null
                    homepage_url?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                    radius_meters?: number | null
                    hero_image_url?: string | null
                    promo_video_url?: string | null
                    order_url?: string | null
                    reservation_url?: string | null
                }
            }
            store_media: {
                Row: {
                    id: string
                    store_id: string
                    type: 'image' | 'video'
                    url: string
                    title: string | null
                    sort_order: number
                    status: 'active' | 'hidden' | 'deleted'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    type: 'image' | 'video'
                    url: string
                    title?: string | null
                    sort_order?: number
                    status?: 'active' | 'hidden' | 'deleted'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    type?: 'image' | 'video'
                    url?: string
                    title?: string | null
                    sort_order?: number
                    status?: 'active' | 'hidden' | 'deleted'
                    created_at?: string
                    updated_at?: string
                }
            }
            store_links: {
                Row: {
                    id: string
                    store_id: string
                    label: string
                    url: string
                    icon: string | null
                    sort_order: number
                    status: 'active' | 'hidden' | 'deleted'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    label: string
                    url: string
                    icon?: string | null
                    sort_order?: number
                    status?: 'active' | 'hidden' | 'deleted'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    label?: string
                    url?: string
                    icon?: string | null
                    sort_order?: number
                    status?: 'active' | 'hidden' | 'deleted'
                    created_at?: string
                    updated_at?: string
                }
            }
            admin_audit_logs: {
                Row: {
                    id: string
                    admin_user_id: string | null
                    action: string
                    target_type: string
                    target_id: string | null
                    old_value: Json | null
                    new_value: Json | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    admin_user_id?: string | null
                    action: string
                    target_type: string
                    target_id?: string | null
                    old_value?: Json | null
                    new_value?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    admin_user_id?: string | null
                    action?: string
                    target_type?: string
                    target_id?: string | null
                    old_value?: Json | null
                    new_value?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
            }
            coupons: {
                Row: {
                    id: string
                    merchant_id: string
                    store_id: string | null
                    title: string
                    description: string | null
                    discount_type: 'percent' | 'amount'
                    discount_value: number
                    max_discount_amount: number | null
                    min_order_amount: number | null
                    category_id: string | null
                    product_id: string | null
                    valid_from: string | null
                    valid_to: string | null
                    total_issuable: number | null
                    per_user_limit: number | null
                    radius_km: number | null
                    center_type: 'store' | 'custom' | null
                    center_lat: number | null
                    center_lng: number | null
                    image_asset_id: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    store_id?: string | null
                    title: string
                    description?: string | null
                    discount_type: 'percent' | 'amount'
                    discount_value: number
                    max_discount_amount?: number | null
                    min_order_amount?: number | null
                    category_id?: string | null
                    product_id?: string | null
                    valid_from?: string | null
                    valid_to?: string | null
                    total_issuable?: number | null
                    per_user_limit?: number | null
                    radius_km?: number | null
                    center_type?: 'store' | 'custom' | null
                    center_lat?: number | null
                    center_lng?: number | null
                    image_asset_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    store_id?: string | null
                    title?: string
                    description?: string | null
                    discount_type?: 'percent' | 'amount'
                    discount_value?: number
                    max_discount_amount?: number | null
                    min_order_amount?: number | null
                    category_id?: string | null
                    product_id?: string | null
                    valid_from?: string | null
                    valid_to?: string | null
                    total_issuable?: number | null
                    per_user_limit?: number | null
                    radius_km?: number | null
                    center_type?: 'store' | 'custom' | null
                    center_lat?: number | null
                    center_lng?: number | null
                    image_asset_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            coupon_issues: {
                Row: {
                    id: string
                    coupon_id: string
                    user_id: string | null
                    phone: string | null
                    issued_from: 'event' | 'merchant' | 'admin' | 'table_order'
                    issued_at: string
                    used_order_id: string | null
                    used_at: string | null
                    is_used: boolean
                    upgraded_from_issue_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    coupon_id: string
                    user_id?: string | null
                    phone?: string | null
                    issued_from?: 'event' | 'merchant' | 'admin' | 'table_order'
                    issued_at?: string
                    used_order_id?: string | null
                    used_at?: string | null
                    is_used?: boolean
                    upgraded_from_issue_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    coupon_id?: string
                    user_id?: string | null
                    phone?: string | null
                    issued_from?: 'event' | 'merchant' | 'admin' | 'table_order'
                    issued_at?: string
                    used_order_id?: string | null
                    used_at?: string | null
                    is_used?: boolean
                    upgraded_from_issue_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            events: {
                Row: {
                    id: string
                    merchant_id: string | null
                    store_id: string | null
                    category_id: string | null
                    name: string
                    description: string | null
                    event_type: 'global' | 'category' | 'store'
                    start_at: string | null
                    end_at: string | null
                    radius_km: number | null
                    center_lat: number | null
                    center_lng: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    merchant_id?: string | null
                    store_id?: string | null
                    category_id?: string | null
                    name: string
                    description?: string | null
                    event_type?: 'global' | 'category' | 'store'
                    start_at?: string | null
                    end_at?: string | null
                    radius_km?: number | null
                    center_lat?: number | null
                    center_lng?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    merchant_id?: string | null
                    store_id?: string | null
                    category_id?: string | null
                    name?: string
                    description?: string | null
                    event_type?: 'global' | 'category' | 'store'
                    start_at?: string | null
                    end_at?: string | null
                    radius_km?: number | null
                    center_lat?: number | null
                    center_lng?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            event_participations: {
                Row: {
                    id: string
                    event_id: string
                    user_id: string | null
                    phone: string | null
                    current_step: number | null
                    is_success: boolean | null
                    success_issue_id: string | null
                    last_attempt_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    event_id: string
                    user_id?: string | null
                    phone?: string | null
                    current_step?: number | null
                    is_success?: boolean | null
                    success_issue_id?: string | null
                    last_attempt_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    event_id?: string
                    user_id?: string | null
                    phone?: string | null
                    current_step?: number | null
                    is_success?: boolean | null
                    success_issue_id?: string | null
                    last_attempt_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            merchant_customers: {
                Row: {
                    id: string
                    merchant_id: string
                    user_id: string | null
                    phone: string | null
                    visit_count: number | null
                    total_spent: number | null
                    first_visit_at: string | null
                    last_visit_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    user_id?: string | null
                    phone?: string | null
                    visit_count?: number | null
                    total_spent?: number | null
                    first_visit_at?: string | null
                    last_visit_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    user_id?: string | null
                    phone?: string | null
                    visit_count?: number | null
                    total_spent?: number | null
                    first_visit_at?: string | null
                    last_visit_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    store_id: string
                    category_id: string | null
                    name: string
                    description: string | null
                    base_price: number
                    product_type: 'menu' | 'retail' | 'ticket' | null
                    is_active: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    category_id?: string | null
                    name: string
                    description?: string | null
                    base_price?: number
                    product_type?: 'menu' | 'retail' | 'ticket' | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    category_id?: string | null
                    name?: string
                    description?: string | null
                    base_price?: number
                    product_type?: 'menu' | 'retail' | 'ticket' | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string | null
                    phone: string | null
                    store_id: string
                    order_type: 'table_order' | 'online_order' | 'ticket'
                    table_id: string | null
                    status: 'pending' | 'paid' | 'preparing' | 'completed' | 'cancelled'
                    total_amount: number
                    discount_amount: number | null
                    final_amount: number
                    used_coupon_issue_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    phone?: string | null
                    store_id: string
                    order_type?: 'table_order' | 'online_order' | 'ticket'
                    table_id?: string | null
                    status?: 'pending' | 'paid' | 'preparing' | 'completed' | 'cancelled'
                    total_amount?: number
                    discount_amount?: number | null
                    final_amount?: number
                    used_coupon_issue_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    phone?: string | null
                    store_id?: string
                    order_type?: 'table_order' | 'online_order' | 'ticket'
                    table_id?: string | null
                    status?: 'pending' | 'paid' | 'preparing' | 'completed' | 'cancelled'
                    total_amount?: number
                    discount_amount?: number | null
                    final_amount?: number
                    used_coupon_issue_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            cultural_events: {
                Row: {
                    id: string
                    merchant_id: string
                    store_id: string
                    category_id: string | null
                    title: string
                    description: string | null
                    age_limit: number | null
                    homepage_url: string | null
                    poster_asset_id: string | null
                    teaser_asset_id: string | null
                    is_active: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    store_id: string
                    category_id?: string | null
                    title: string
                    description?: string | null
                    age_limit?: number | null
                    homepage_url?: string | null
                    poster_asset_id?: string | null
                    teaser_asset_id?: string | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    store_id?: string
                    category_id?: string | null
                    title?: string
                    description?: string | null
                    age_limit?: number | null
                    homepage_url?: string | null
                    poster_asset_id?: string | null
                    teaser_asset_id?: string | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
