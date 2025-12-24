
import { createPostgrestClient } from '@/lib/postgrest';
import { Database } from '@/lib/database.types';
import { PostgrestClient } from '@supabase/postgrest-js';

// This function centralizes the logic for adding a customer to a merchant's DB
// It should be called whenever a "Connection Event" occurs:
// 1. Coupon Acquired (Marketing) -> Increment coupon_issue_count
// 2. Order Placed (Table Order) -> Increment visit_count & total_spent
// 3. Ticket Purchased (Culture) -> Increment visit_count & total_spent

interface CustomerTouchpoint {
    merchant_id: string; // The merchant gaining the customer
    consumer_id: string; // The user
    touchpoint_type: 'COUPON_GAME' | 'TABLE_ORDER' | 'TICKET_BOOKING' | 'VISIT';
    data?: {
        amount?: number;
        coupon_id?: string;
    };
}

export async function registerCustomerInteraction(payload: CustomerTouchpoint) {
    try {
        // Cast to typed client for better Type safety
        const client = createPostgrestClient() as unknown as PostgrestClient<Database>;

        // 1. Check if relation exists
        const { data: existing, error } = await client
            .from('merchant_customers')
            .select('id, visit_count, coupon_issue_count, total_spent')
            .eq('merchant_id', payload.merchant_id)
            .eq('consumer_id', payload.consumer_id)
            .single();

        // Note: .single() returns error if no row found, needing handling

        if (existing) {
            // 2. Update existing customer
            const updates: any = {
                last_visit_at: new Date().toISOString()
            };

            if (payload.touchpoint_type === 'COUPON_GAME') {
                updates.coupon_issue_count = (existing.coupon_issue_count || 0) + 1;
            } else {
                // Table Order, Ticket, or generic Visit
                updates.visit_count = (existing.visit_count || 0) + 1;
                if (payload.data?.amount) {
                    updates.total_spent = (existing.total_spent || 0) + payload.data.amount;
                }
            }

            await client
                .from('merchant_customers')
                .update(updates)
                .eq('id', existing.id);

        } else {
            // 3. Register NEW Customer (Auto-Acquisition)
            // Determine initial values
            let initialVisitCount = 0;
            let initialCouponCount = 0;
            let initialSpend = payload.data?.amount || 0;

            if (payload.touchpoint_type === 'COUPON_GAME') {
                initialCouponCount = 1;
                // Game play might not count as a 'visit' to the store yet? 
                // Let's assume it doesn't count as a physical visit until they use it.
                // But for now, let's keep visit_count 0 if just grabbing coupon.
            } else {
                initialVisitCount = 1;
            }

            await client
                .from('merchant_customers')
                .insert({
                    merchant_id: payload.merchant_id,
                    consumer_id: payload.consumer_id,
                    visit_count: initialVisitCount,
                    coupon_issue_count: initialCouponCount,
                    total_spent: initialSpend,
                    first_visit_at: new Date().toISOString(),
                    last_visit_at: new Date().toISOString(),
                    // source column removed from schema
                });

            console.log(`[CRM] New Customer Acquired for Merchant ${payload.merchant_id}`);
        }

        return true;
    } catch (e) {
        console.error('[CRM Error] Failed to register interaction', e);
        return false;
    }
}
