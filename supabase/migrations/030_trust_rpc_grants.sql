-- =============================================================================
-- Migration 030: P0 Trust RPC Grants
-- =============================================================================
-- Migrations 027 and 028 introduced SECURITY DEFINER RPCs for the trust,
-- rights, and gifting layers. This forward migration makes execution access
-- explicit for authenticated users and removes broad PUBLIC execute access.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.accept_terms(DATE, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_terms(DATE, TEXT, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.confirm_campaign_rights(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_campaign_rights(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) TO authenticated;
