-- Migration 012: Brand seed data
--
-- Seeds 4 real cannabis brands + one campaign each for the Free Store
-- to launch with populated content. Brands are stub accounts (no auth,
-- no login) — just enough data for the opportunities to render as if
-- they were posted by these brands.
--
-- Idempotent: uses deterministic UUIDs so re-running this doesn't
-- create duplicates. Uses ON CONFLICT DO NOTHING.
--
-- Brands (all real Michigan / US cannabis companies):
--   - Tip Top Crop       (MI small-batch flower, craft aesthetic)
--   - Spyder Legs        (live-resin pre-rolls, tarantula signature)
--   - Hyman              (Detroit hip-hop flower brand)
--   - Jungle Juice       (value-tier potency, "Born to Disrupt")

-- ---------------------------------------------------------------
-- Brand user accounts (stub — no auth credentials)
-- ---------------------------------------------------------------

-- Tip Top Crop
INSERT INTO users (
  id, email, user_type, tier, company_name, website,
  credits_balance, credits_allocated, account_status,
  niches, badges, bio
) VALUES (
  '11111111-1111-4111-8111-111111111111'::uuid,
  'seed+tiptopcrop@budcast.internal',
  'brand',
  'pro',
  'Tip Top Crop',
  'https://tiptopcrop.com',
  500,
  500,
  'active',
  ARRAY['Flower', 'Pre-rolls'],
  ARRAY['founding_brand'],
  'Michigan craft cannabis. Small-batch hand-trimmed flower grown slow for flavor. In 30+ dispensaries statewide.'
) ON CONFLICT (id) DO NOTHING;

-- Spyder Legs
INSERT INTO users (
  id, email, user_type, tier, company_name, website,
  credits_balance, credits_allocated, account_status,
  niches, badges, bio
) VALUES (
  '22222222-2222-4222-8222-222222222222'::uuid,
  'seed+spyderlegs@budcast.internal',
  'brand',
  'pro',
  'Spyder Legs',
  'https://spyderlegs.com',
  500,
  500,
  'active',
  ARRAY['Pre-rolls', 'Concentrates'],
  ARRAY['founding_brand'],
  'Live-resin infused pre-rolls and blunts. Tarantula-dusted tips. If you see a spider, it''s the real one.'
) ON CONFLICT (id) DO NOTHING;

-- Hyman
INSERT INTO users (
  id, email, user_type, tier, company_name, website,
  credits_balance, credits_allocated, account_status,
  niches, badges, bio
) VALUES (
  '33333333-3333-4333-8333-333333333333'::uuid,
  'seed+hyman@budcast.internal',
  'brand',
  'pro',
  'Hyman',
  'https://hymanlife.com',
  500,
  500,
  'active',
  ARRAY['Flower', 'Concentrates'],
  ARRAY['founding_brand'],
  'Detroit hip-hop cannabis. Series I-IV flower drops. BLADE Icewood + Mitten Extracts collaborations.'
) ON CONFLICT (id) DO NOTHING;

-- Jungle Juice
INSERT INTO users (
  id, email, user_type, tier, company_name, website,
  credits_balance, credits_allocated, account_status,
  niches, badges, bio
) VALUES (
  '44444444-4444-4444-8444-444444444444'::uuid,
  'seed+junglejuice@budcast.internal',
  'brand',
  'pro',
  'Jungle Juice',
  'https://junglejuicecanna.com',
  500,
  500,
  'active',
  ARRAY['Flower', 'Pre-rolls'],
  ARRAY['founding_brand'],
  'Born to disrupt. High-potency value-tier flower and pre-rolls. Built for heavy smokers who can''t pay collector prices.'
) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- Campaigns — one per brand, each a realistic first campaign
-- ---------------------------------------------------------------

-- Tip Top Crop: Gifting campaign for new MAC1 drop
INSERT INTO opportunities (
  id, brand_id, campaign_number, campaign_type,
  title, short_description, description, image_url,
  categories, cash_amount, product_description,
  payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits,
  slots_available, application_deadline, approval_mode,
  credit_cost_per_slot, credits_reserved, status, published_at
) VALUES (
  '11111111-aaaa-4aaa-8aaa-111111111111'::uuid,
  '11111111-1111-4111-8111-111111111111'::uuid,
  'BC-2604-0001',
  'gifting',
  'MAC1 eighth drop — honest reaction videos wanted',
  'Free eighth of our new MAC1 for an honest reaction video. Hand-trimmed, slow-cured, 28%+ THC.',
  'We just dropped our MAC1 at 10 dispensaries statewide and want creators to capture the real first-impression moment. We''ll send you a free eighth — you make a short reaction video showing the nugs up close and your honest take after the first session. No script, no corporate energy. If you love it, say so. If it''s just okay, say that too. Authenticity is the brief.',
  'https://placehold.co/1280x720/2d5a3d/DDF8A8?text=MAC1+Drop',
  ARRAY['Flower'],
  NULL,
  'One free eighth (3.5g) of MAC1 flower + Tip Top Crop grinder. Retail value ~$55.',
  ARRAY[]::TEXT[],
  ARRAY['ig_reel', 'tiktok_video'],
  'tiptopcropmi',
  ARRAY['#gifted', '#mac1'],
  ARRAY['Show the nugs close-up before rolling', 'Mention it''s hand-trimmed'],
  ARRAY['Don''t compare to competitor brands by name'],
  5,
  (NOW() + INTERVAL '14 days')::TIMESTAMPTZ,
  'manual',
  50, 250, 'active', NOW()
) ON CONFLICT (id) DO NOTHING;

-- Spyder Legs: Paid campaign for new live-resin blunt
INSERT INTO opportunities (
  id, brand_id, campaign_number, campaign_type,
  title, short_description, description, image_url,
  categories, cash_amount, product_description,
  payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits,
  slots_available, application_deadline, approval_mode,
  credit_cost_per_slot, credits_reserved, status, published_at
) VALUES (
  '22222222-aaaa-4aaa-8aaa-222222222222'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  'BC-2604-0002',
  'paid',
  'White Runtz 2g live-resin blunt — $250 per creator',
  '$250 to make a 30-90 sec video showing our tarantula-dusted live-resin blunt. 8 creator slots, paid via Venmo.',
  'Launching our White Runtz 2g live-resin-infused blunt and need 8 creators to push it. $250 paid via Venmo / Zelle / Cash App after content is verified. Keep it raw — show the tarantula-dusted tip close-up, light it, and do a real first-puff reaction. The burn should be on-camera (it''s white-ash slow — that''s the tell). Mention ''live resin infused'' at least once. No hype scripts, no influencer voice. Just you, the blunt, and the honest take.',
  'https://placehold.co/1280x720/1a3a1a/7CFC00?text=White+Runtz+2g',
  ARRAY['Pre-rolls', 'Flower'],
  250,
  NULL,
  ARRAY['venmo', 'zelle', 'cashapp'],
  ARRAY['ig_reel', 'tiktok_video'],
  'spyderlegsofficial',
  ARRAY['#ad', '#whiteruntz'],
  ARRAY['Say ''live resin infused'' at least once', 'Show the tarantula tip close-up', 'Burn on camera — show the white ash'],
  ARRAY['Don''t call it ''rolled in'' — it''s infused', 'No competitor brand mentions'],
  8,
  (NOW() + INTERVAL '10 days')::TIMESTAMPTZ,
  'manual',
  100, 800, 'active', NOW()
) ON CONFLICT (id) DO NOTHING;

-- Hyman: Hybrid campaign — BLADE Icewood Series IV
INSERT INTO opportunities (
  id, brand_id, campaign_number, campaign_type,
  title, short_description, description, image_url,
  categories, cash_amount, product_description,
  payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits,
  slots_available, application_deadline, approval_mode,
  credit_cost_per_slot, credits_reserved, status, published_at
) VALUES (
  '33333333-aaaa-4aaa-8aaa-333333333333'::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  'BC-2604-0003',
  'hybrid',
  'Series IV launch — BLADE Icewood x Hyman — product + $150',
  'Free Series IV eighth + $150 cash for Detroit-area creators. Hip-hop + cannabis content, authentic only.',
  'Series IV is our most ambitious drop yet — co-produced with BLADE Icewood. Looking for Detroit creators in the hip-hop / streetwear / cannabis lane to get an eighth (free) plus $150 cash to make one Reel or TikTok. Must show the packaging, must mention BLADE, must feel like your normal content — not a commercial. If your page is all corporate brand deals, this isn''t for you. If it feels like Detroit when someone scrolls your feed, apply.',
  'https://placehold.co/1280x720/3a1a1a/F5B700?text=Series+IV',
  ARRAY['Flower', 'Concentrates'],
  150,
  'Series IV eighth (3.5g) + BLADE Icewood x Hyman collab sticker pack + rolling tray. Retail value ~$75.',
  ARRAY['venmo', 'cashapp'],
  ARRAY['ig_reel', 'tiktok_video', 'ig_post'],
  'hymanlife',
  ARRAY['#ad', '#gifted', '#seriesiv'],
  ARRAY['Mention BLADE Icewood', 'Show the packaging', 'Feel native to your page'],
  ARRAY['No corporate scripts', 'Don''t feature other cannabis brands in the same post'],
  4,
  (NOW() + INTERVAL '21 days')::TIMESTAMPTZ,
  'manual',
  75, 300, 'active', NOW()
) ON CONFLICT (id) DO NOTHING;

-- Jungle Juice: Paid campaign — value-tier flower review
INSERT INTO opportunities (
  id, brand_id, campaign_number, campaign_type,
  title, short_description, description, image_url,
  categories, cash_amount, product_description,
  payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits,
  slots_available, application_deadline, approval_mode,
  credit_cost_per_slot, credits_reserved, status, published_at
) VALUES (
  '44444444-aaaa-4aaa-8aaa-444444444444'::uuid,
  '44444444-4444-4444-8444-444444444444'::uuid,
  'BC-2604-0004',
  'paid',
  'Real smokers only — $100 for honest value-tier review',
  '$100 for creators who smoke every day. We want honest ''is this actually good for the price?'' content. 10 slots.',
  'Jungle Juice is built for heavy smokers who can''t justify collector prices. We need 10 creators who smoke daily to do honest value-tier reviews — ''is this actually good for the price, or is it mid dressed up?'' No sugar-coating. Grab an eighth at any of our retailers ($25-30 retail), do a real sit-down review for 60-120 sec, post to TikTok or IG Reels. $100 Venmo/Zelle after verified. If your page is aesthetic blunts and nothing else, keep scrolling — we want real smokers.',
  'https://placehold.co/1280x720/3a3a1a/F4F4F7?text=Jungle+Juice',
  ARRAY['Flower', 'Pre-rolls'],
  100,
  NULL,
  ARRAY['venmo', 'zelle'],
  ARRAY['tiktok_video', 'ig_reel'],
  'getjunglejuice',
  ARRAY['#ad', '#junglejuice'],
  ARRAY['Be honest about whether it''s worth the price', 'Sit-down review, not walk-and-talk'],
  ARRAY['Don''t stage the content — real smoke session only', 'No overhyping — we want real reviews'],
  10,
  (NOW() + INTERVAL '14 days')::TIMESTAMPTZ,
  'auto',
  100, 1000, 'active', NOW()
) ON CONFLICT (id) DO NOTHING;
