-- ============================================================
-- Migration: 017_messaging
-- Text-only direct and campaign-linked messaging between brands
-- and creators. No external chat service; Supabase RLS protects
-- participant access.
-- ============================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_type TEXT NOT NULL DEFAULT 'direct'
    CHECK (conversation_type IN ('direct', 'campaign')),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (brand_id <> creator_id)
);

CREATE UNIQUE INDEX idx_conversations_direct_pair
  ON conversations(brand_id, creator_id)
  WHERE conversation_type = 'direct' AND opportunity_id IS NULL AND application_id IS NULL;

CREATE UNIQUE INDEX idx_conversations_campaign_application
  ON conversations(application_id)
  WHERE conversation_type = 'campaign' AND application_id IS NOT NULL;

CREATE INDEX idx_conversations_brand_last
  ON conversations(brand_id, last_message_at DESC);

CREATE INDEX idx_conversations_creator_last
  ON conversations(creator_id, last_message_at DESC);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 2000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_conversation_created
  ON messages(conversation_id, created_at ASC);

CREATE INDEX idx_messages_sender
  ON messages(sender_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = brand_id OR auth.uid() = creator_id);

CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (auth.uid() = brand_id OR auth.uid() = creator_id)
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = conversations.brand_id
        AND brand.user_type = 'brand'
    )
    AND EXISTS (
      SELECT 1 FROM users creator
      WHERE creator.id = conversations.creator_id
        AND creator.user_type = 'creator'
    )
  );

CREATE POLICY "Participants can update conversation metadata"
  ON conversations FOR UPDATE
  USING (auth.uid() = brand_id OR auth.uid() = creator_id);

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (auth.uid() = conversations.brand_id OR auth.uid() = conversations.creator_id)
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (auth.uid() = conversations.brand_id OR auth.uid() = conversations.creator_id)
    )
  );

CREATE POLICY "Participants can mark messages read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (auth.uid() = conversations.brand_id OR auth.uid() = conversations.creator_id)
    )
  );

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_conversation_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message_at();
