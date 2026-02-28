/**
 * ANNUAL REVIEW SERVICE
 * 
 * Checks whether a user's TOD designation is due for annual review.
 * When due:
 *   1. Inserts a notification row into `succession_notifications` (picked up by mailer)
 *   2. Logs ANNUAL_REVIEW_NOTICE_SENT to the SuccessionRegistry audit trail
 *   3. Persists the notification timestamp to `wills.protocol_data` to prevent repeat triggers
 * 
 * REVIEW WINDOW: Triggers at 340 days post-seal (25-day buffer before the 1-year mark)
 */

import { supabase } from '../supabase';
import { SuccessionRegistry } from './SuccessionRegistry';

const REVIEW_WINDOW_DAYS = 340; // Trigger 25 days before the 1-year anniversary

/**
 * Checks if a date is older than REVIEW_WINDOW_DAYS days.
 * @param {string} isoDateString
 * @returns {boolean}
 */
const isDue = (isoDateString) => {
    if (!isoDateString) return false;
    const then = new Date(isoDateString);
    const now  = new Date();
    const daysDiff = (now - then) / (1000 * 60 * 60 * 24);
    return daysDiff >= REVIEW_WINDOW_DAYS;
};

/**
 * Queues a notification in the `succession_notifications` table.
 * A Supabase Edge Function or backend job should poll this table to send email.
 * @param {string} userId
 * @param {string} userEmail
 * @param {object} protocolData
 */
const queueEmailNotification = async (userId, userEmail, protocolData) => {
    const { error } = await supabase
        .from('succession_notifications')
        .insert({
            user_id:          userId,
            email:            userEmail,
            notification_type: 'ANNUAL_REVIEW_DUE',
            successor_name:   protocolData?.successorName || protocolData?.successor_name || 'Unknown',
            protocol_seed:    protocolData?.protocolSeed  || null,
            sent_at:          new Date().toISOString(),
            status:           'queued'
        });

    if (error) {
        // Non-fatal: log but don't interrupt the vault session
        console.warn('[AnnualReviewService] Failed to queue notification:', error.message);
    } else {
        console.log('[AnnualReviewService] Annual review notice queued for:', userEmail);
    }
};

/**
 * Stamps `last_annual_notice_at` into the `wills` record so this
 * doesn't fire again until the next review window.
 * @param {string} userId
 * @param {object} currentProtocolData
 */
const stampNotificationDate = async (userId, currentProtocolData) => {
    const updatedData = {
        ...currentProtocolData,
        last_annual_notice_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('wills')
        .update({ protocol_data: updatedData })
        .eq('user_id', userId);

    if (error) {
        console.warn('[AnnualReviewService] Failed to stamp notification date:', error.message);
    }

    return updatedData;
};

/**
 * MAIN ENTRY POINT
 * 
 * Call this after loading a user's succession data.
 * Returns the (possibly updated) protocol_data object.
 * 
 * @param {string} userId
 * @param {string} userEmail
 * @param {object} protocolData  - The loaded protocol_data from the wills record
 * @param {string} createdAt     - ISO string of the wills record creation date
 * @returns {object}             - Updated protocolData (with last_annual_notice_at if triggered)
 */
export const checkAndTriggerAnnualReview = async (userId, userEmail, protocolData, createdAt) => {
    try {
        const lastNotice = protocolData?.last_annual_notice_at;

        // If we already sent a notice this review cycle, skip
        if (lastNotice && !isDue(lastNotice)) {
            console.log('[AnnualReviewService] Annual review not yet due. Last notice:', lastNotice);
            return protocolData;
        }

        // Determine the reference date: last notice date OR original seal date
        const referenceDate = lastNotice || createdAt;

        if (!isDue(referenceDate)) {
            console.log('[AnnualReviewService] TOD designation is within review window. No action needed.');
            return protocolData;
        }

        // ─── REVIEW IS DUE ───────────────────────────────────────────────────

        console.log('[AnnualReviewService] Annual review triggered. Initiating notice sequence.');

        // 1. Log to the audit trail (SuccessionRegistry in-memory log)
        const now = new Date().toISOString();
        const auditEntry = {
            action:  'ANNUAL_REVIEW_NOTICE_SENT',
            details: 'Annual successor check-in notice dispatched. User prompted to review and re-confirm designation.',
            time:    now,
            ip:      SuccessionRegistry.getState().clientIp || 'SYSTEM'
        };

        // Inject directly into the registry's access log
        const currentState = SuccessionRegistry.getState();
        currentState.accessLog.unshift(auditEntry); // prepend as most recent

        // 2. Queue email notification in Supabase
        await queueEmailNotification(userId, userEmail, protocolData);

        // 3. Stamp the notification date to prevent repeat triggers
        const updatedProtocolData = await stampNotificationDate(userId, protocolData);

        console.log('[AnnualReviewService] Notice sequence complete. Audit entry logged.');
        return updatedProtocolData;

    } catch (err) {
        console.error('[AnnualReviewService] Annual review check failed:', err);
        return protocolData; // Non-fatal: always return something usable
    }
};
