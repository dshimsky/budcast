-- =============================================================================
-- Migration 031: Revoke Trust RPC Anon Access
-- =============================================================================
-- Supabase's anon role can retain explicit function privileges independent of
-- PUBLIC. Revoke anon execution for trust RPCs and keep authenticated access.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.accept_terms(DATE, TEXT, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.accept_terms(DATE, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_terms(DATE, TEXT, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.confirm_campaign_rights(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN) FROM anon;
REVOKE EXECUTE ON FUNCTION public.confirm_campaign_rights(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_campaign_rights(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) TO authenticated;
