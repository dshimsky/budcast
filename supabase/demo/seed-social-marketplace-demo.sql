-- ============================================================
-- BudCast temporary demo seed pack
-- Purpose: make local/staging QA feel like an active cannabis UGC marketplace.
--
-- Safe-by-design:
-- - Reviewable SQL only. Nothing applies automatically.
-- - Demo records use @demo.budcast.local emails and deterministic UUIDs.
-- - Re-runnable: cleanup removes the same demo records before insert.
-- - Intended for local/staging QA, not production.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Cleanup existing demo pack records
-- ------------------------------------------------------------
DELETE FROM messages
WHERE conversation_id IN (
  SELECT id FROM conversations
  WHERE brand_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
     OR creator_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
);

DELETE FROM conversations
WHERE brand_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
   OR creator_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local');

DELETE FROM content_submissions
WHERE application_id IN (
  SELECT id FROM applications
  WHERE creator_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
     OR opportunity_id IN (
       SELECT id FROM opportunities
       WHERE brand_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
     )
);

DELETE FROM applications
WHERE creator_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
   OR opportunity_id IN (
     SELECT id FROM opportunities
     WHERE brand_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
   );

DELETE FROM opportunities
WHERE brand_id IN (SELECT id FROM users WHERE email LIKE '%@demo.budcast.local')
   OR campaign_number LIKE 'DEMO-%';

DELETE FROM users
WHERE email LIKE '%@demo.budcast.local';

-- ------------------------------------------------------------
-- Demo users: brands
-- ------------------------------------------------------------
INSERT INTO users (
  id, email, user_type, tier, name, company_name, bio, location, avatar_url, website,
  instagram, tiktok, youtube, facebook, linkedin, x_profile, portfolio_image_urls, niches,
  credits_balance, credits_allocated, payment_rate, completion_rate, total_campaigns,
  successful_campaigns, review_score, review_count, reputation_score, badges, account_status
) VALUES
(
  '90000000-0000-4000-8000-000000000001', 'northcoast@demo.budcast.local', 'brand', 'pro',
  'Maya Chen', 'North Coast Supply',
  'Detroit cannabis brand focused on premium flower drops, retail-ready product education, and creator-shot lifestyle content.',
  'Detroit, MI', 'https://placehold.co/320x320/11180d/b8ff3d?text=NC', 'northcoastsupply.demo',
  '@northcoastsupply', '@northcoastdrops', 'North Coast Supply', 'facebook.com/northcoastsupply',
  'linkedin.com/company/north-coast-supply', '@northcoastmi',
  ARRAY[
    'https://placehold.co/900x1200/172413/d7ff72?text=Flower+Drop',
    'https://placehold.co/900x1200/111111/b8ff3d?text=Store+Launch',
    'https://placehold.co/900x1200/22331a/fbfbf7?text=Creator+Reel'
  ],
  ARRAY['flower', 'lifestyle', 'retail'], 1200, 1200, 98.00, 94.00, 12, 10, 4.8, 26, 92.50,
  ARRAY['verified_brand', 'fast_payer', 'creator_favorite'], 'active'
),
(
  '90000000-0000-4000-8000-000000000002', 'greenroom@demo.budcast.local', 'brand', 'premium',
  'Andre Wells', 'Green Room Labs',
  'Cannabis product studio launching infused pre-rolls, concentrates, and high-intent UGC campaigns for adult audiences.',
  'Ann Arbor, MI', 'https://placehold.co/320x320/081006/d7ff72?text=GR', 'greenroomlabs.demo',
  '@greenroomlabs', '@greenroomlabs', 'Green Room Labs', 'facebook.com/greenroomlabs',
  'linkedin.com/company/green-room-labs', '@greenroomlabs',
  ARRAY[
    'https://placehold.co/900x1200/0f1a0b/b8ff3d?text=Infused+Pre+Roll',
    'https://placehold.co/900x1200/1c1c1a/d7ff72?text=Lab+Visuals',
    'https://placehold.co/900x1200/26351b/fbfbf7?text=Creator+Review'
  ],
  ARRAY['pre_rolls', 'concentrates', 'education'], 1600, 1600, 96.00, 91.00, 18, 15, 4.7, 41, 94.10,
  ARRAY['verified_brand', 'high_response', 'premium_campaigns'], 'active'
),
(
  '90000000-0000-4000-8000-000000000003', 'cloudclub@demo.budcast.local', 'brand', 'pro',
  'Sofia Ramirez', 'Cloud Club Collective',
  'Lifestyle cannabis collective building creator campaigns around dispensary events, product education, and community drops.',
  'Grand Rapids, MI', 'https://placehold.co/320x320/151515/b8ff3d?text=CC', 'cloudclubcollective.demo',
  '@cloudclubcollective', '@cloudclubcrew', 'Cloud Club Collective', 'facebook.com/cloudclubcollective',
  'linkedin.com/company/cloud-club-collective', '@cloudclubmi',
  ARRAY[
    'https://placehold.co/900x1200/141f10/d7ff72?text=Event+Recap',
    'https://placehold.co/900x1200/202c18/b8ff3d?text=Dispensary+Drop',
    'https://placehold.co/900x1200/0f0f0d/fbfbf7?text=Lifestyle+UGC'
  ],
  ARRAY['lifestyle', 'dispensary', 'education'], 900, 900, 94.00, 90.00, 9, 8, 4.6, 19, 88.20,
  ARRAY['verified_brand', 'event_campaigns'], 'active'
);

-- ------------------------------------------------------------
-- Demo users: creators
-- ------------------------------------------------------------
INSERT INTO users (
  id, email, user_type, tier, name, bio, location, avatar_url,
  instagram, tiktok, youtube, facebook, linkedin, x_profile,
  follower_count_instagram, follower_count_tiktok, follower_count_youtube,
  portfolio_image_urls, niches, payment_rate, completion_rate, total_campaigns,
  successful_campaigns, review_score, review_count, reputation_score, badges, account_status
) VALUES
(
  '91000000-0000-4000-8000-000000000001', 'alexrivera@demo.budcast.local', 'creator', 'pro',
  'Alex Rivera', 'Detroit UGC creator focused on product review reels, flower closeups, and clean lifestyle edits.',
  'Detroit, MI', 'https://placehold.co/320x320/171717/d7ff72?text=AR',
  '@alexrollscontent', '@alexrolls', 'Alex Rivera UGC', 'facebook.com/alexriveracreates',
  'linkedin.com/in/alexriveracreates', '@alexrolls',
  18400, 42700, 3200,
  ARRAY[
    'https://placehold.co/900x1200/10160d/b8ff3d?text=UGC+Review',
    'https://placehold.co/900x1200/202a18/d7ff72?text=Flower+Macro',
    'https://placehold.co/900x1200/0b0b0a/fbfbf7?text=Reel+Frame'
  ],
  ARRAY['flower', 'reviews', 'lifestyle'], 100.00, 96.00, 14, 13, 4.9, 18, 95.30,
  ARRAY['verified_creator', 'fast_turnaround'], 'active'
),
(
  '91000000-0000-4000-8000-000000000002', 'jaydenbrook@demo.budcast.local', 'creator', 'pro',
  'Jayden Brooks', 'Short-form creator making dispensary walkthroughs, product demos, and direct-to-camera education clips.',
  'Ann Arbor, MI', 'https://placehold.co/320x320/10200c/b8ff3d?text=JB',
  '@jaydencreates', '@jaydenugc', 'Jayden Brooks', 'facebook.com/jaydenugc',
  'linkedin.com/in/jaydenbrooksugc', '@jaydenugc',
  22100, 65100, 5100,
  ARRAY[
    'https://placehold.co/900x1200/1e2e15/b8ff3d?text=Dispensary+Walkthrough',
    'https://placehold.co/900x1200/111111/d7ff72?text=Product+Demo',
    'https://placehold.co/900x1200/243719/fbfbf7?text=Education+Clip'
  ],
  ARRAY['education', 'dispensary', 'reviews'], 96.00, 92.00, 19, 17, 4.8, 27, 93.00,
  ARRAY['verified_creator', 'education_style'], 'active'
),
(
  '91000000-0000-4000-8000-000000000003', 'nialane@demo.budcast.local', 'creator', 'free',
  'Nia Lane', 'Lifestyle creator blending fashion, city visuals, product moments, and approachable cannabis storytelling.',
  'Grand Rapids, MI', 'https://placehold.co/320x320/191919/d7ff72?text=NL',
  '@nialanemedia', '@nialane', 'Nia Lane Media', 'facebook.com/nialanemedia',
  'linkedin.com/in/nialanemedia', '@nialanemedia',
  14300, 38900, 1800,
  ARRAY[
    'https://placehold.co/900x1200/16200f/b8ff3d?text=Lifestyle+Shoot',
    'https://placehold.co/900x1200/0c0c0b/d7ff72?text=City+Reel',
    'https://placehold.co/900x1200/28351d/fbfbf7?text=Product+Moment'
  ],
  ARRAY['lifestyle', 'flower', 'events'], 94.00, 90.00, 9, 8, 4.7, 11, 86.80,
  ARRAY['lifestyle_creator'], 'active'
),
(
  '91000000-0000-4000-8000-000000000004', 'marcusstone@demo.budcast.local', 'creator', 'pro',
  'Marcus Stone', 'Cannabis content creator specializing in raw reaction videos, pre-roll demos, and retail-friendly reviews.',
  'Lansing, MI', 'https://placehold.co/320x320/11170d/b8ff3d?text=MS',
  '@marcusmakesugc', '@marcusstoneugc', 'Marcus Stone Reviews', 'facebook.com/marcusstoneugc',
  'linkedin.com/in/marcusstoneugc', '@marcusugc',
  9700, 28800, 2300,
  ARRAY[
    'https://placehold.co/900x1200/151f10/b8ff3d?text=Reaction+Video',
    'https://placehold.co/900x1200/1d2d15/d7ff72?text=Pre+Roll+Demo',
    'https://placehold.co/900x1200/101010/fbfbf7?text=Retail+Review'
  ],
  ARRAY['pre_rolls', 'reviews', 'product_demo'], 92.00, 88.00, 11, 9, 4.6, 14, 84.50,
  ARRAY['reaction_video'], 'active'
),
(
  '91000000-0000-4000-8000-000000000005', 'taylorjade@demo.budcast.local', 'creator', 'pro',
  'Taylor Jade', 'UGC creator producing product photography, short-form videos, and clean visual assets for cannabis brands.',
  'Detroit, MI', 'https://placehold.co/320x320/172413/d7ff72?text=TJ',
  '@taylorjadeugc', '@taylorjadecreates', 'Taylor Jade UGC', 'facebook.com/taylorjadeugc',
  'linkedin.com/in/taylorjadeugc', '@taylorjadeugc',
  30200, 72400, 6400,
  ARRAY[
    'https://placehold.co/900x1200/0f170c/b8ff3d?text=Product+Photo',
    'https://placehold.co/900x1200/1b2813/d7ff72?text=Short+Form+UGC',
    'https://placehold.co/900x1200/090a08/fbfbf7?text=Brand+Assets'
  ],
  ARRAY['photography', 'lifestyle', 'vapes'], 98.00, 97.00, 22, 21, 5.0, 34, 97.80,
  ARRAY['verified_creator', 'premium_assets', 'fast_turnaround'], 'active'
),
(
  '91000000-0000-4000-8000-000000000006', 'devonmiles@demo.budcast.local', 'creator', 'free',
  'Devon Miles', 'Michigan creator making approachable educational content, dispensary clips, and product explainers.',
  'Kalamazoo, MI', 'https://placehold.co/320x320/141414/b8ff3d?text=DM',
  '@devonmilesmedia', '@devonmilesugc', 'Devon Miles', 'facebook.com/devonmilesmedia',
  'linkedin.com/in/devonmilesmedia', '@devonmiles',
  11200, 24700, 2900,
  ARRAY[
    'https://placehold.co/900x1200/12200d/b8ff3d?text=Education+Reel',
    'https://placehold.co/900x1200/213218/d7ff72?text=Store+Clip',
    'https://placehold.co/900x1200/0e0e0c/fbfbf7?text=Explainer'
  ],
  ARRAY['education', 'dispensary', 'topicals'], 90.00, 86.00, 7, 6, 4.5, 8, 80.60,
  ARRAY['education_style'], 'active'
);

-- ------------------------------------------------------------
-- Demo opportunities / campaigns
-- ------------------------------------------------------------
INSERT INTO opportunities (
  id, brand_id, campaign_number, campaign_type, title, short_description, description, image_url,
  categories, cash_amount, product_description, payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits, reference_image_urls, slots_available, slots_filled,
  application_deadline, deadline, approval_mode, credit_cost, credit_cost_per_slot, credits_reserved,
  status, published_at
) VALUES
(
  '92000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 'DEMO-2604-0001',
  'hybrid', 'Premium flower drop needs Detroit lifestyle reels',
  'Paid + Product campaign for Detroit creators to produce 30-60 sec lifestyle reels around a premium flower drop.',
  'North Coast Supply is launching a premium flower drop and wants creator-shot reels that feel social, polished, and real. Capture product visuals, a lifestyle moment, and a short creator voiceover. Coordinate pickup details through BudCast messages.',
  'https://placehold.co/1280x720/16210f/b8ff3d?text=North+Coast+Flower+Drop',
  ARRAY['flower', 'lifestyle'], 175, 'Premium eighth + branded rolling tray for local pickup.',
  ARRAY['venmo', 'zelle'], ARRAY['ig_reel', 'tiktok_video'], '@northcoastsupply',
  ARRAY['#BudCastPartner', '#NorthCoastDrop'], ARRAY['Show product packaging', 'Mention local pickup coordination', 'Keep language adult-focused'],
  ARRAY['No medical claims', 'No purchase CTAs', 'No content targeted to minors'],
  ARRAY['https://placehold.co/900x1200/172413/b8ff3d?text=Reference+1'],
  8, 3, NOW() + INTERVAL '9 days', NOW() + INTERVAL '30 days', 'manual', 100, 100, 800, 'active', NOW()
),
(
  '92000000-0000-4000-8000-000000000002', '90000000-0000-4000-8000-000000000002', 'DEMO-2604-0002',
  'paid', 'Infused pre-roll review videos for social launch',
  'Paid campaign for short-form creator review videos featuring Green Room Labs infused pre-roll launch.',
  'Create a 30-90 sec UGC review video featuring an infused pre-roll launch. Focus on packaging, creator reaction, and product education language. No medical claims or purchase directives.',
  'https://placehold.co/1280x720/0f1a0b/d7ff72?text=Green+Room+Pre+Roll',
  ARRAY['pre_rolls', 'education'], 250, NULL,
  ARRAY['venmo', 'cashapp', 'zelle'], ARRAY['ig_reel', 'tiktok_video'], '@greenroomlabs',
  ARRAY['#BudCastPartner', '#GreenRoomLabs'], ARRAY['Say infused pre-roll once', 'Show packaging close-up', 'Keep review honest'],
  ARRAY['No overconsumption language', 'No competitor mentions'],
  ARRAY['https://placehold.co/900x1200/0f1a0b/d7ff72?text=Reference+2'],
  10, 4, NOW() + INTERVAL '7 days', NOW() + INTERVAL '28 days', 'manual', 100, 100, 1000, 'active', NOW()
),
(
  '92000000-0000-4000-8000-000000000003', '90000000-0000-4000-8000-000000000003', 'DEMO-2604-0003',
  'gifting', 'Dispensary event recap creators wanted',
  'Product campaign for creators attending a Grand Rapids dispensary event and posting recap content.',
  'Cloud Club Collective needs creators to capture event atmosphere, store visuals, product education moments, and one clean recap edit. Pickup and event timing are coordinated in BudCast messages.',
  'https://placehold.co/1280x720/141f10/b8ff3d?text=Cloud+Club+Event',
  ARRAY['dispensary', 'events', 'lifestyle'], NULL, 'Event access + product bundle for local pickup.',
  ARRAY[]::TEXT[], ARRAY['ig_reel', 'instagram_story'], '@cloudclubcollective',
  ARRAY['#BudCastPartner', '#CloudClubEvent'], ARRAY['Show store atmosphere', 'Capture creator POV', 'Avoid medical claims'],
  ARRAY['No minors visible', 'No direct sales language'],
  ARRAY['https://placehold.co/900x1200/141f10/b8ff3d?text=Reference+3'],
  6, 2, NOW() + INTERVAL '12 days', NOW() + INTERVAL '35 days', 'manual', 50, 50, 300, 'active', NOW()
),
(
  '92000000-0000-4000-8000-000000000004', '90000000-0000-4000-8000-000000000001', 'DEMO-2604-0004',
  'paid', 'Retail shelf education clips for flower line',
  'Paid educational content campaign for creators who can explain product positioning in a clean retail-safe format.',
  'Create educational short-form clips that explain product category, aroma notes, and brand positioning without medical claims. Brand review happens inside BudCast before payment confirmation.',
  'https://placehold.co/1280x720/172413/d7ff72?text=Retail+Education',
  ARRAY['flower', 'education'], 200, NULL,
  ARRAY['venmo', 'paypal'], ARRAY['tiktok_video', 'youtube_short'], '@northcoastsupply',
  ARRAY['#BudCastPartner', '#NorthCoastEducation'], ARRAY['Use retail-safe wording', 'Mention adult audience', 'Show product label'],
  ARRAY['No health benefit claims', 'No price or purchase CTA'],
  ARRAY['https://placehold.co/900x1200/172413/d7ff72?text=Reference+4'],
  5, 1, NOW() + INTERVAL '11 days', NOW() + INTERVAL '32 days', 'manual', 100, 100, 500, 'active', NOW()
);

-- ------------------------------------------------------------
-- Demo applications
-- ------------------------------------------------------------
INSERT INTO applications (
  id, opportunity_id, creator_id, message, credits_spent, status, applied_at,
  accepted_at, rejected_at, completed_at, completion_deadline
) VALUES
(
  '93000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001',
  'My Detroit audience responds well to premium flower closeups and honest lifestyle edits. I can shoot this as a clean 45 sec reel with pickup coordinated in messages.',
  100, 'accepted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL, NULL, NOW() + INTERVAL '18 days'
),
(
  '93000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000003',
  'I can create a lifestyle-first reel that feels social and premium without looking like an ad.',
  100, 'pending', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL
),
(
  '93000000-0000-4000-8000-000000000003', '92000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000004',
  'Reaction videos are my lane. I can keep it honest, direct, and retail-safe with no overconsumption language.',
  100, 'accepted', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL, NULL, NOW() + INTERVAL '17 days'
),
(
  '93000000-0000-4000-8000-000000000004', '92000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000005',
  'I can shoot polished UGC with product detail shots, clean captions, and a tight brand-safe review structure.',
  100, 'accepted', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NULL, NULL, NOW() + INTERVAL '16 days'
),
(
  '93000000-0000-4000-8000-000000000005', '92000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000002',
  'Education-style TikToks are a strong fit for this. I can explain the product without medical claims or hype language.',
  100, 'pending', NOW() - INTERVAL '1 day', NULL, NULL, NULL, NULL
),
(
  '93000000-0000-4000-8000-000000000006', '92000000-0000-4000-8000-000000000003', '91000000-0000-4000-8000-000000000006',
  'I can cover the event as a creator POV recap and keep the content focused on atmosphere, product education, and adult-safe context.',
  50, 'accepted', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL, NULL, NOW() + INTERVAL '19 days'
),
(
  '93000000-0000-4000-8000-000000000007', '92000000-0000-4000-8000-000000000004', '91000000-0000-4000-8000-000000000002',
  'I can create a YouTube Short and TikTok version that explains the product line in a clean retail education format.',
  100, 'pending', NOW() - INTERVAL '2 hours', NULL, NULL, NULL, NULL
);

-- ------------------------------------------------------------
-- Demo content submissions
-- ------------------------------------------------------------
INSERT INTO content_submissions (
  id, application_id, creator_id, post_url, post_type, screenshot_url,
  verification_status, verification_results, verification_feedback, verified_at,
  payment_confirmed_by_brand, payment_confirmed_by_creator, payment_method,
  brand_confirmed_at, creator_confirmed_at, created_at
) VALUES
(
  '94000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001',
  'https://example.com/demo/alex-northcoast-reel', 'instagram_reel',
  'https://placehold.co/1080x1920/16210f/b8ff3d?text=Submitted+Reel',
  'pending', '{"demo": true, "checks": ["brand mention", "product visual", "adult-safe language"]}'::jsonb,
  NULL, NULL, false, false, 'venmo', NULL, NULL, NOW() - INTERVAL '18 hours'
),
(
  '94000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000003', '91000000-0000-4000-8000-000000000004',
  'https://example.com/demo/marcus-greenroom-review', 'tiktok_video',
  'https://placehold.co/1080x1920/0f1a0b/d7ff72?text=Needs+Revision',
  'needs_revision', '{"demo": true, "checks": ["product visible", "caption missing"]}'::jsonb,
  'Please remove the purchase CTA from the caption and resubmit with the same video link.',
  NULL, false, false, 'cashapp', NULL, NULL, NOW() - INTERVAL '2 days'
),
(
  '94000000-0000-4000-8000-000000000003', '93000000-0000-4000-8000-000000000004', '91000000-0000-4000-8000-000000000005',
  'https://example.com/demo/taylor-greenroom-assets', 'instagram_reel',
  'https://placehold.co/1080x1920/111111/b8ff3d?text=Approved+Content',
  'verified', '{"demo": true, "checks": ["approved", "brand-safe", "deliverable met"]}'::jsonb,
  'Approved. Clean product detail shots and strong creator pacing.',
  NOW() - INTERVAL '10 hours', true, false, 'zelle', NOW() - INTERVAL '8 hours', NULL, NOW() - INTERVAL '1 day'
),
(
  '94000000-0000-4000-8000-000000000004', '93000000-0000-4000-8000-000000000006', '91000000-0000-4000-8000-000000000006',
  'https://example.com/demo/devon-cloudclub-recap', 'instagram_story',
  'https://placehold.co/1080x1920/141f10/b8ff3d?text=Complete',
  'verified', '{"demo": true, "checks": ["approved", "event recap", "adult-safe"]}'::jsonb,
  'Approved and complete.',
  NOW() - INTERVAL '1 day', true, true, NULL, NOW() - INTERVAL '20 hours', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '3 days'
);

-- ------------------------------------------------------------
-- Demo conversations and messages
-- ------------------------------------------------------------
INSERT INTO conversations (
  id, conversation_type, brand_id, creator_id, opportunity_id, application_id,
  created_by, last_message_at, created_at
) VALUES
(
  '95000000-0000-4000-8000-000000000001', 'campaign',
  '90000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001',
  '92000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '3 days'
),
(
  '95000000-0000-4000-8000-000000000002', 'campaign',
  '90000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000005',
  '92000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000004',
  '90000000-0000-4000-8000-000000000002', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 days'
),
(
  '95000000-0000-4000-8000-000000000003', 'direct',
  '90000000-0000-4000-8000-000000000003', '91000000-0000-4000-8000-000000000003',
  NULL, NULL, '90000000-0000-4000-8000-000000000003', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 day'
);

INSERT INTO messages (id, conversation_id, sender_id, body, read_at, created_at) VALUES
(
  '96000000-0000-4000-8000-000000000001', '95000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001',
  'You are accepted for the premium flower drop. Let us coordinate pickup timing here before you shoot.',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'
),
(
  '96000000-0000-4000-8000-000000000002', '95000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000001',
  'Sounds good. I can pick up Thursday afternoon and shoot the reel Friday morning.',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
),
(
  '96000000-0000-4000-8000-000000000003', '95000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000001',
  'Thursday works. Please avoid purchase language and keep the caption adult-audience focused.',
  NULL, NOW() - INTERVAL '40 minutes'
),
(
  '96000000-0000-4000-8000-000000000004', '95000000-0000-4000-8000-000000000002',
  '91000000-0000-4000-8000-000000000005',
  'I uploaded the first version. Let me know if you want the opening shot tighter on the package.',
  NOW() - INTERVAL '3 hours', NOW() - INTERVAL '4 hours'
),
(
  '96000000-0000-4000-8000-000000000005', '95000000-0000-4000-8000-000000000002',
  '90000000-0000-4000-8000-000000000002',
  'The product shots are strong. We approved it and marked payment sent by Zelle.',
  NULL, NOW() - INTERVAL '2 hours'
),
(
  '96000000-0000-4000-8000-000000000006', '95000000-0000-4000-8000-000000000003',
  '90000000-0000-4000-8000-000000000003',
  'We have an event recap campaign opening next week. Your lifestyle work looks like a strong fit.',
  NULL, NOW() - INTERVAL '1 hour'
);

-- ------------------------------------------------------------
-- Optional targeted demo activity for the current Shiminsky brand profile.
-- This block only inserts when the brand profile exists, so the seed remains
-- portable across local/staging databases.
-- ------------------------------------------------------------
INSERT INTO opportunities (
  id, brand_id, campaign_number, campaign_type, title, short_description, description, image_url,
  categories, cash_amount, product_description, payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits, reference_image_urls, slots_available, slots_filled,
  application_deadline, deadline, approval_mode, credit_cost, credit_cost_per_slot, credits_reserved,
  status, published_at
)
SELECT *
FROM (
  VALUES
  (
    '92000000-0000-4000-8000-000000000101'::uuid,
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    'DEMO-SHIMINSKY-0001',
    'hybrid',
    'Premium flower launch needs creator reels',
    'Paid + Product campaign for creators to shoot polished UGC around a premium flower drop.',
    'Shiminsky Cannabis is testing a creator campaign flow. Creators should produce a 30-60 sec reel with a product visual, creator reaction, and adult-safe caption. Pickup, content notes, and payment details are coordinated in BudCast messages.',
    'https://placehold.co/1280x720/18230f/b8ff3d?text=Shiminsky+Flower+Launch',
    ARRAY['flower', 'lifestyle']::TEXT[],
    225,
    'Premium flower package for local pickup coordination.',
    ARRAY['venmo', 'zelle']::TEXT[],
    ARRAY['ig_reel', 'tiktok_video']::TEXT[],
    '@shiminskycannabis',
    ARRAY['#BudCastPartner', '#ShiminskyCannabis']::TEXT[],
    ARRAY['Show packaging clearly', 'Keep copy adult-focused', 'Coordinate pickup in BudCast messages']::TEXT[],
    ARRAY['No medical claims', 'No purchase CTAs', 'No shipping language']::TEXT[],
    ARRAY['https://placehold.co/900x1200/18230f/b8ff3d?text=Brand+Reference']::TEXT[],
    6,
    2,
    NOW() + INTERVAL '8 days',
    NOW() + INTERVAL '24 days',
    'manual',
    100,
    100,
    600,
    'active',
    NOW()
  ),
  (
    '92000000-0000-4000-8000-000000000102'::uuid,
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    'DEMO-SHIMINSKY-0002',
    'paid',
    'Retail menu content for weekend campaign',
    'Paid campaign for creators to make short-form content around a weekend retail menu push.',
    'Create concise, social-first UGC that highlights the brand, product category, and weekend campaign context without purchase directives or medical claims. Brand review and payment confirmation happen inside BudCast.',
    'https://placehold.co/1280x720/10180c/d7ff72?text=Shiminsky+Retail+Menu',
    ARRAY['retail', 'education', 'lifestyle']::TEXT[],
    175,
    NULL,
    ARRAY['venmo', 'cashapp']::TEXT[],
    ARRAY['ig_reel', 'youtube_short']::TEXT[],
    '@shiminskycannabis',
    ARRAY['#BudCastPartner', '#WeekendMenu']::TEXT[],
    ARRAY['Mention adult audience', 'Show retail-safe product context', 'Keep caption clean']::TEXT[],
    ARRAY['No minors', 'No price claims', 'No direct sales language']::TEXT[],
    ARRAY['https://placehold.co/900x1200/10180c/d7ff72?text=Menu+Reference']::TEXT[],
    4,
    1,
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '18 days',
    'manual',
    100,
    100,
    400,
    'active',
    NOW()
  )
) AS demo_campaigns (
  id, brand_id, campaign_number, campaign_type, title, short_description, description, image_url,
  categories, cash_amount, product_description, payment_methods, content_types, brand_mention,
  required_hashtags, must_includes, off_limits, reference_image_urls, slots_available, slots_filled,
  application_deadline, deadline, approval_mode, credit_cost, credit_cost_per_slot, credits_reserved,
  status, published_at
)
WHERE EXISTS (
  SELECT 1
  FROM users
  WHERE id = '15bcadd8-9119-4db1-968a-978471f168e3'
    AND user_type = 'brand'
);

INSERT INTO applications (
  id, opportunity_id, creator_id, message, credits_spent, status, applied_at,
  accepted_at, rejected_at, completed_at, completion_deadline
)
SELECT *
FROM (
  VALUES
  (
    '93000000-0000-4000-8000-000000000101'::uuid,
    '92000000-0000-4000-8000-000000000101'::uuid,
    '91000000-0000-4000-8000-000000000005'::uuid,
    'My product detail shots and clean reel pacing are a strong fit for this launch. I can shoot pickup, product, and lifestyle frames in one edit.',
    100,
    'accepted',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    NULL::timestamptz,
    NULL::timestamptz,
    NOW() + INTERVAL '12 days'
  ),
  (
    '93000000-0000-4000-8000-000000000102'::uuid,
    '92000000-0000-4000-8000-000000000101'::uuid,
    '91000000-0000-4000-8000-000000000001'::uuid,
    'I can make this feel native to Instagram Reels with tight product visuals and a straightforward creator reaction.',
    100,
    'pending',
    NOW() - INTERVAL '18 hours',
    NULL::timestamptz,
    NULL::timestamptz,
    NULL::timestamptz,
    NULL::timestamptz
  ),
  (
    '93000000-0000-4000-8000-000000000103'::uuid,
    '92000000-0000-4000-8000-000000000101'::uuid,
    '91000000-0000-4000-8000-000000000003'::uuid,
    'Lifestyle-first cannabis content is my lane. I can keep it premium, adult-safe, and social without making it feel like an ad.',
    100,
    'pending',
    NOW() - INTERVAL '7 hours',
    NULL::timestamptz,
    NULL::timestamptz,
    NULL::timestamptz,
    NULL::timestamptz
  ),
  (
    '93000000-0000-4000-8000-000000000104'::uuid,
    '92000000-0000-4000-8000-000000000102'::uuid,
    '91000000-0000-4000-8000-000000000002'::uuid,
    'I can explain the retail menu in a clear YouTube Short format and cut a second vertical version for Reels.',
    100,
    'accepted',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    NULL::timestamptz,
    NULL::timestamptz,
    NOW() + INTERVAL '9 days'
  )
) AS demo_applications (
  id, opportunity_id, creator_id, message, credits_spent, status, applied_at,
  accepted_at, rejected_at, completed_at, completion_deadline
)
WHERE EXISTS (
  SELECT 1
  FROM opportunities
  WHERE id = demo_applications.opportunity_id
);

INSERT INTO content_submissions (
  id, application_id, creator_id, post_url, post_type, screenshot_url,
  verification_status, verification_results, verification_feedback, verified_at,
  payment_confirmed_by_brand, payment_confirmed_by_creator, payment_method,
  brand_confirmed_at, creator_confirmed_at, created_at
)
SELECT *
FROM (
  VALUES
  (
    '94000000-0000-4000-8000-000000000101'::uuid,
    '93000000-0000-4000-8000-000000000101'::uuid,
    '91000000-0000-4000-8000-000000000005'::uuid,
    'https://example.com/demo/taylor-shiminsky-launch-reel',
    'instagram_reel',
    'https://placehold.co/1080x1920/18230f/b8ff3d?text=Shiminsky+Creator+Reel',
    'pending',
    '{"demo": true, "checks": ["brand mention", "product visual", "adult-safe language"]}'::jsonb,
    NULL,
    NULL::timestamptz,
    false,
    false,
    'zelle',
    NULL::timestamptz,
    NULL::timestamptz,
    NOW() - INTERVAL '6 hours'
  ),
  (
    '94000000-0000-4000-8000-000000000102'::uuid,
    '93000000-0000-4000-8000-000000000104'::uuid,
    '91000000-0000-4000-8000-000000000002'::uuid,
    'https://example.com/demo/jayden-shiminsky-menu-short',
    'youtube_short',
    'https://placehold.co/1080x1920/10180c/d7ff72?text=Retail+Menu+Short',
    'needs_revision',
    '{"demo": true, "checks": ["caption needs cleanup", "product context visible"]}'::jsonb,
    'Please remove the price callout and keep the final caption focused on product category, not purchase direction.',
    NULL::timestamptz,
    false,
    false,
    'venmo',
    NULL::timestamptz,
    NULL::timestamptz,
    NOW() - INTERVAL '1 day'
  )
) AS demo_submissions (
  id, application_id, creator_id, post_url, post_type, screenshot_url,
  verification_status, verification_results, verification_feedback, verified_at,
  payment_confirmed_by_brand, payment_confirmed_by_creator, payment_method,
  brand_confirmed_at, creator_confirmed_at, created_at
)
WHERE EXISTS (
  SELECT 1
  FROM applications
  WHERE id = demo_submissions.application_id
);

INSERT INTO conversations (
  id, conversation_type, brand_id, creator_id, opportunity_id, application_id,
  created_by, last_message_at, created_at
)
SELECT *
FROM (
  VALUES
  (
    '95000000-0000-4000-8000-000000000101'::uuid,
    'campaign',
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    '91000000-0000-4000-8000-000000000005'::uuid,
    '92000000-0000-4000-8000-000000000101'::uuid,
    '93000000-0000-4000-8000-000000000101'::uuid,
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    NOW() - INTERVAL '18 minutes',
    NOW() - INTERVAL '2 days'
  ),
  (
    '95000000-0000-4000-8000-000000000102'::uuid,
    'campaign',
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    '91000000-0000-4000-8000-000000000002'::uuid,
    '92000000-0000-4000-8000-000000000102'::uuid,
    '93000000-0000-4000-8000-000000000104'::uuid,
    '91000000-0000-4000-8000-000000000002'::uuid,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 day'
  ),
  (
    '95000000-0000-4000-8000-000000000103'::uuid,
    'direct',
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    '91000000-0000-4000-8000-000000000003'::uuid,
    NULL::uuid,
    NULL::uuid,
    '91000000-0000-4000-8000-000000000003'::uuid,
    NOW() - INTERVAL '35 minutes',
    NOW() - INTERVAL '9 hours'
  )
) AS demo_conversations (
  id, conversation_type, brand_id, creator_id, opportunity_id, application_id,
  created_by, last_message_at, created_at
)
WHERE EXISTS (
  SELECT 1
  FROM users
  WHERE id = demo_conversations.brand_id
    AND user_type = 'brand'
);

INSERT INTO messages (id, conversation_id, sender_id, body, read_at, created_at)
SELECT *
FROM (
  VALUES
  (
    '96000000-0000-4000-8000-000000000101'::uuid,
    '95000000-0000-4000-8000-000000000101'::uuid,
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    'You are accepted for the premium flower launch. Please use BudCast messages for pickup timing and content questions.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '2 days'
  ),
  (
    '96000000-0000-4000-8000-000000000102'::uuid,
    '95000000-0000-4000-8000-000000000101'::uuid,
    '91000000-0000-4000-8000-000000000005'::uuid,
    'Perfect. I can pick up tomorrow afternoon and upload the first cut before the weekend.',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '1 day'
  ),
  (
    '96000000-0000-4000-8000-000000000103'::uuid,
    '95000000-0000-4000-8000-000000000101'::uuid,
    '91000000-0000-4000-8000-000000000005'::uuid,
    'First cut is uploaded. I kept the caption adult-safe and avoided purchase language.',
    NULL::timestamptz,
    NOW() - INTERVAL '18 minutes'
  ),
  (
    '96000000-0000-4000-8000-000000000104'::uuid,
    '95000000-0000-4000-8000-000000000102'::uuid,
    '91000000-0000-4000-8000-000000000002'::uuid,
    'I submitted the menu Short. The pacing is clear, but I can revise the caption if you want it more brand-safe.',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 day'
  ),
  (
    '96000000-0000-4000-8000-000000000105'::uuid,
    '95000000-0000-4000-8000-000000000102'::uuid,
    '15bcadd8-9119-4db1-968a-978471f168e3'::uuid,
    'Please remove the price callout. Everything else is strong.',
    NULL::timestamptz,
    NOW() - INTERVAL '1 hour'
  ),
  (
    '96000000-0000-4000-8000-000000000106'::uuid,
    '95000000-0000-4000-8000-000000000103'::uuid,
    '91000000-0000-4000-8000-000000000003'::uuid,
    'I saw your brand profile and would love to be considered for future lifestyle campaigns.',
    NULL::timestamptz,
    NOW() - INTERVAL '35 minutes'
  )
) AS demo_messages (id, conversation_id, sender_id, body, read_at, created_at)
WHERE EXISTS (
  SELECT 1
  FROM conversations
  WHERE id = demo_messages.conversation_id
);

COMMIT;
