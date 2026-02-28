import { supabase } from './supabase';
import { MarketingEngine } from './MarketingEngine';

/**
 * MarketingTriggerService
 * Handles the logic for taking app milestones, checking thresholds, and queueing drafts.
 * Implements "Steve's Aggregate Trigger" to prevent flooding the queue.
 */
class MarketingTriggerService {
    constructor() {
        this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        this.engine = new MarketingEngine(this.apiKey, null); // Webhook handled by dashboard
        
        // Configuration: Roll up events into a single draft if more than 5 in the last 24 hours.
        this.AGGREGATE_THRESHOLD = 5; 
        this.AGGREGATE_TIMEFRAME_HOURS = 24;
    }

    /**
     * Main entry point for any milestone.
     * @param {string} eventType e.g., 'LLC Formation Accepted', 'Annual Report Renewal'
     * @param {Object} rawData Contextual payload
     */
    async triggerMilestone(eventType, rawData) {
        try {
            if (!this.apiKey) {
                console.warn('[MarketingTriggerService] Draft generation skipped (no API Key). Queuing raw entry.');
                await this._insertRawDraft(eventType, rawData, '[API_KEY_MISSING] Manual invention required.');
                return;
            }

            // 1. Check for Aggregation Threshold
            const isAggregateEligible = ['Annual Report Renewal', 'BOI Compliance Filed'].includes(eventType);
            
            if (isAggregateEligible) {
                const count = await this._getRecentEventCount(eventType);
                
                // If we've hit the threshold, we trigger an Aggregate Action instead.
                if (count >= this.AGGREGATE_THRESHOLD) {
                    console.log(`[MarketingTriggerService] Aggregate threshold hit for ${eventType}. Initiating Fleet Action.`);
                    await this._generateAggregatePost(eventType, count + 1);
                    return;
                }
            }

            // 2. Standard Single Event Generation
            console.log(`[MarketingTriggerService] Generating standard narrative for ${eventType}.`);
            await this._generateSinglePost(eventType, rawData);

        } catch (error) {
            console.error('[MarketingTriggerService] Error triggering milestone:', error);
        }
    }

    async _getRecentEventCount(eventType) {
        const timeAgo = new Date();
        timeAgo.setHours(timeAgo.getHours() - this.AGGREGATE_TIMEFRAME_HOURS);

        const { count, error } = await supabase
            .from('marketing_queue')
            .select('*', { count: 'exact', head: true })
            .eq('source_event_type', eventType)
            .gte('created_at', timeAgo.toISOString());

        if (error) {
            console.error('[MarketingTriggerService] Error counting recent events:', error);
            return 0; // Default to 0 to prevent breaking flow
        }
        return count || 0;
    }

    async _generateAggregatePost(eventType, totalCount) {
        // Build a synthetic raw data payload for the AI to understand it's a fleet action.
        const aggregateData = {
            fleet_action: true,
            total_entities_processed: totalCount,
            event_type: eventType,
            timeframe: `${this.AGGREGATE_TIMEFRAME_HOURS} hours`
        };

        const promptDetail = { 
            event: `${eventType} (Bulk Aggregate: ${totalCount} instances in ${this.AGGREGATE_TIMEFRAME_HOURS}h)`, 
            details: aggregateData 
        };

        const copy = await this.engine.generatePost(promptDetail);
        const finalCopy = copy.headline ? `${copy.headline}\n\n${copy.body}` : copy.body;

        await this._insertRawDraft(`${eventType} (Aggregate)`, aggregateData, finalCopy);
    }

    async _generateSinglePost(eventType, rawData) {
        const promptDetail = { event: eventType, details: rawData };
        const copy = await this.engine.generatePost(promptDetail);
        const finalCopy = copy.headline ? `${copy.headline}\n\n${copy.body}` : copy.body;
        
        await this._insertRawDraft(eventType, rawData, finalCopy);
    }

    async _insertRawDraft(eventType, rawData, suggestedCopy) {
        // Redact PII from rawData before saving to the DB just in case, per Professional Customer Agent.
        const safeData = { ...rawData };
        delete safeData.firstName;
        delete safeData.lastName;
        delete safeData.email;
        delete safeData.phone;
        delete safeData.streetAddress;
        delete safeData.companyNameMatch; // Remove precise company name
        
        const { error } = await supabase.from('marketing_queue').insert({
            source_event_type: eventType,
            raw_data: safeData,
            suggested_copy: suggestedCopy,
            status: 'draft',
            platform: 'linkedin' // Default
        });

        if (error) throw error;
    }
}

export const marketingTriggerService = new MarketingTriggerService();
