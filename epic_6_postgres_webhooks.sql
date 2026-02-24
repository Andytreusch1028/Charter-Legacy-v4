-- ==============================================================================
-- EPIC 6: UNIVERSAL AUDIT LEDGER - AUTOMATED POSTGRES TRIGGERS
-- ==============================================================================
-- These triggers automatically capture row mutations on core tables (like `llcs`) 
-- and insert immutable records into the `system_events_ledger`.

-- ------------------------------------------------------------------------------
-- 1. Trigger Function: LLC Status Changes
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_llc_status_change()
RETURNS trigger AS $$
DECLARE
    v_actor_id TEXT;
    v_actor_type TEXT;
    v_message TEXT;
    v_severity TEXT;
BEGIN
    -- Only log if the status actually changed
    IF NEW.llc_status IS DISTINCT FROM OLD.llc_status THEN
        
        -- Try to determine the actor. 
        -- If via API/Dashboard, it's the authenticated user.
        -- If via Service Role, we assume System/Staff.
        v_actor_id := auth.uid()::text;
        
        IF v_actor_id IS NULL THEN
            v_actor_id := 'SYSTEM_TRIGGER';
            v_actor_type := 'SYSTEM';
        ELSIF v_actor_id = NEW.user_id::text THEN
            v_actor_type := 'CUSTOMER';
        ELSE
            v_actor_type := 'STAFF';
        END IF;

        -- Generate Jony-style narrative based on the new status
        CASE NEW.llc_status
            WHEN 'FILED' THEN
                v_message := 'Your entity foundation has been officially registered with the state.';
                v_severity := 'SUCCESS';
            WHEN 'TRANSMITTED' THEN
                 v_message := 'Your documents are actively being transmitted to the state division of corporations.';
                 v_severity := 'INFO';
            WHEN 'Setting Up' THEN
                 v_message := 'Intake framework initialized. Awaiting final authorization.';
                 v_severity := 'INFO';
            ELSE
                 v_message := 'Status updated to: ' || NEW.llc_status;
                 v_severity := 'INFO';
        END CASE;

        -- Insert the immutable ledger record
        INSERT INTO public.system_events_ledger (
            entity_id,
            client_id,
            actor_id,
            actor_type,
            event_category,
            event_type,
            severity,
            customer_facing_message,
            internal_payload
        ) VALUES (
            NEW.id,
            NEW.user_id,
            v_actor_id,
            v_actor_type,
            'DATA_MUTATION',
            'LLC_STATUS_UPDATED',
            v_severity,
            v_message,
            jsonb_build_object('old_status', OLD.llc_status, 'new_status', NEW.llc_status)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. Attach Trigger to `llcs` Table
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_log_llc_status_change ON public.llcs;

CREATE TRIGGER trg_log_llc_status_change
AFTER UPDATE OF llc_status ON public.llcs
FOR EACH ROW
EXECUTE FUNCTION public.log_llc_status_change();

-- ------------------------------------------------------------------------------
-- 3. Trigger Function: Privacy Shield Toggles
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_privacy_shield_change()
RETURNS trigger AS $$
DECLARE
    v_actor_id TEXT;
    v_actor_type TEXT;
    v_message TEXT;
BEGIN
    IF NEW.privacy_shield_active IS DISTINCT FROM OLD.privacy_shield_active THEN
        v_actor_id := auth.uid()::text;
        
        IF v_actor_id IS NULL THEN
            v_actor_id := 'SYSTEM_TRIGGER';
            v_actor_type := 'SYSTEM';
        ELSIF v_actor_id = NEW.user_id::text THEN
            v_actor_type := 'CUSTOMER';
        ELSE
            v_actor_type := 'STAFF';
        END IF;

        IF NEW.privacy_shield_active = true THEN
            v_message := 'Privacy Shield activated. Public records sweeping initiated.';
        ELSE
            v_message := 'Privacy Shield deactivated. Protection protocols suspended.';
        END IF;

        INSERT INTO public.system_events_ledger (
            entity_id,
            client_id,
            actor_id,
            actor_type,
            event_category,
            event_type,
            severity,
            customer_facing_message,
            internal_payload
        ) VALUES (
            NEW.id,
            NEW.user_id,
            v_actor_id,
            v_actor_type,
            'COMPLIANCE',
            'PRIVACY_SHIELD_TOGGLED',
            CASE WHEN NEW.privacy_shield_active THEN 'SUCCESS' ELSE 'WARNING' END,
            v_message,
            jsonb_build_object('old_state', OLD.privacy_shield_active, 'new_state', NEW.privacy_shield_active)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 4. Attach Trigger to `llcs` Table
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_log_privacy_shield_change ON public.llcs;

CREATE TRIGGER trg_log_privacy_shield_change
AFTER UPDATE OF privacy_shield_active ON public.llcs
FOR EACH ROW
EXECUTE FUNCTION public.log_privacy_shield_change();
