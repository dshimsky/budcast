import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import type { Conversation, ConversationType, Message, User, UserType } from "../types/database";

export type MessageParticipant = Pick<
  User,
  | "id"
  | "user_type"
  | "name"
  | "company_name"
  | "avatar_url"
  | "location"
  | "badges"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "x_profile"
  | "website"
  | "niches"
>;

export type ConversationSummary = Conversation & {
  brand: MessageParticipant | null;
  creator: MessageParticipant | null;
  latest_message: Pick<Message, "body" | "created_at" | "sender_id"> | null;
};

export type MessageWithSender = Message & {
  sender: MessageParticipant | null;
  sender_brand: MessageParticipant | null;
};

export type StartConversationInput = {
  applicationId?: string | null;
  brandId: string;
  conversationType?: ConversationType;
  creatorId: string;
  opportunityId?: string | null;
};

export type SendMessageInput = {
  body: string;
  conversationId: string;
};

const participantSelect = `
  id, user_type, name, company_name, avatar_url, location,
  badges, instagram, tiktok, youtube, facebook, linkedin, x_profile,
  website, niches
`;

function cleanSearchTerm(term: string) {
  return term.trim().replace(/[,%]/g, "");
}

function getOtherParticipant(conversation: Conversation, currentUserId: string | null | undefined) {
  if (!currentUserId) return null;
  return conversation.brand_id === currentUserId ? conversation.creator_id : conversation.brand_id;
}

async function invalidateMessagingQueries(queryClient: ReturnType<typeof useQueryClient>, currentUserId?: string | null) {
  await queryClient.invalidateQueries({ queryKey: ["conversations", currentUserId] });
  await queryClient.invalidateQueries({ queryKey: ["messages"] });
}

export function useUserSearch(term: string, targetType?: UserType) {
  const { profile } = useAuth();
  const currentUserId = profile?.id ?? null;
  const searchTerm = cleanSearchTerm(term);

  return useQuery<MessageParticipant[]>({
    queryKey: ["message-user-search", currentUserId, targetType, searchTerm],
    enabled: searchTerm.length >= 2,
    queryFn: async () => {
      let query = supabase
        .from("users")
        .select(participantSelect)
        .neq("id", currentUserId ?? "00000000-0000-0000-0000-000000000000")
        .eq("account_status", "active")
        .or(
          [
            `name.ilike.%${searchTerm}%`,
            `company_name.ilike.%${searchTerm}%`,
            `instagram.ilike.%${searchTerm}%`,
            `tiktok.ilike.%${searchTerm}%`,
            `youtube.ilike.%${searchTerm}%`,
            `facebook.ilike.%${searchTerm}%`,
            `linkedin.ilike.%${searchTerm}%`,
            `x_profile.ilike.%${searchTerm}%`
          ].join(",")
        )
        .limit(8);

      if (targetType) {
        query = query.eq("user_type", targetType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MessageParticipant[];
    },
    staleTime: 20_000
  });
}

export function useMessageParticipant(userId: string | null | undefined) {
  return useQuery<MessageParticipant | null>({
    queryKey: ["message-participant", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select(participantSelect).eq("id", userId!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as MessageParticipant | null;
    },
    staleTime: 30_000
  });
}

export function useConversations() {
  const { brandContext, profile } = useAuth();
  const currentUserId = profile?.id ?? null;
  const effectiveBrandId = brandContext?.brandId ?? (profile?.user_type === "brand" ? profile.id : null);
  const participantColumn = effectiveBrandId ? "brand_id" : "creator_id";
  const participantId = effectiveBrandId ?? currentUserId;

  return useQuery<ConversationSummary[]>({
    queryKey: ["conversations", currentUserId, effectiveBrandId],
    enabled: !!participantId,
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          brand:users!conversations_brand_id_fkey (${participantSelect}),
          creator:users!conversations_creator_id_fkey (${participantSelect})
        `
        )
        .eq(participantColumn, participantId!)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      const rows = (conversations ?? []) as Array<Conversation & {
        brand: MessageParticipant | null;
        creator: MessageParticipant | null;
      }>;
      if (!rows.length) return [];

      const conversationIds = rows.map((row) => row.id);
      const { data: messages, error: messageError } = await supabase
        .from("messages")
        .select("conversation_id, body, created_at, sender_id")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      if (messageError) throw messageError;

      const latestByConversation = new Map<string, Pick<Message, "body" | "created_at" | "sender_id">>();
      for (const message of messages ?? []) {
        if (!latestByConversation.has(message.conversation_id)) {
          latestByConversation.set(message.conversation_id, {
            body: message.body,
            created_at: message.created_at,
            sender_id: message.sender_id
          });
        }
      }

      return rows.map((row) => ({
        ...row,
        latest_message: latestByConversation.get(row.id) ?? null
      }));
    },
    staleTime: 8_000
  });
}

export function useMessages(conversationId: string | null | undefined) {
  return useQuery<MessageWithSender[]>({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const richQuery = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!messages_sender_id_fkey (${participantSelect}),
          sender_brand:users!messages_sender_brand_id_fkey (${participantSelect})
        `
        )
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });

      if (!richQuery.error) {
        return (richQuery.data ?? []) as MessageWithSender[];
      }

      console.warn("[useMessages] sender join failed, falling back:", richQuery.error.message);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return ((data ?? []) as Message[]).map((message) => ({
        ...message,
        sender: null,
        sender_brand: null
      }));
    },
    staleTime: 5_000
  });
}

async function findConversation(input: StartConversationInput) {
  let query = supabase
    .from("conversations")
    .select("id")
    .eq("brand_id", input.brandId)
    .eq("creator_id", input.creatorId)
    .limit(1);

  if (input.applicationId) {
    query = query.eq("application_id", input.applicationId);
  } else {
    query = query.is("application_id", null).is("opportunity_id", null);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { brandContext, profile } = useAuth();

  return useMutation<{ conversationId: string }, unknown, StartConversationInput>({
    mutationFn: async (input) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");
      const actorId = brandContext?.actorId ?? profile.id;

      const existingId = await findConversation(input);
      if (existingId) return { conversationId: existingId };

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          application_id: input.applicationId ?? null,
          brand_id: input.brandId,
          conversation_type: input.conversationType ?? (input.applicationId ? "campaign" : "direct"),
          created_by: actorId,
          creator_id: input.creatorId,
          opportunity_id: input.opportunityId ?? null
        })
        .select("id")
        .single();

      if (error) {
        const duplicateId = await findConversation(input);
        if (duplicateId) return { conversationId: duplicateId };
        throw error;
      }

      return { conversationId: data.id };
    },
    onSuccess: async () => {
      await invalidateMessagingQueries(queryClient, profile?.id);
    }
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { brandContext, profile } = useAuth();

  return useMutation<Message, unknown, SendMessageInput>({
    mutationFn: async (input) => {
      if (!profile?.id) throw new Error("NOT_SIGNED_IN");
      const body = input.body.trim();
      if (!body) throw new Error("MESSAGE_REQUIRED");
      const actorId = brandContext?.actorId ?? profile.id;
      const effectiveBrandId = brandContext?.brandId ?? (profile.user_type === "brand" ? profile.id : null);
      const senderBrandId = effectiveBrandId && profile.user_type !== "creator" ? effectiveBrandId : null;

      const { data, error } = await supabase
        .from("messages")
        .insert({
          body,
          conversation_id: input.conversationId,
          sender_brand_id: senderBrandId,
          sender_id: actorId
        })
        .select("*")
        .single();

      if (error) throw error;

      const { data: conversation } = await supabase
        .from("conversations")
        .select("id, brand_id, creator_id")
        .eq("id", input.conversationId)
        .maybeSingle();

      const currentParticipantId = senderBrandId ?? profile.id;
      const recipientId = conversation ? getOtherParticipant(conversation as Conversation, currentParticipantId) : null;
      if (recipientId) {
        await supabase.from("notifications").insert({
          action_url: senderBrandId ? "/creator-dashboard/messages" : "/dashboard/messages",
          message: body.length > 140 ? `${body.slice(0, 137)}...` : body,
          related_user_id: actorId,
          title: "New BudCast message",
          type: "message_received",
          user_id: recipientId
        });
      }

      return data as Message;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      await invalidateMessagingQueries(queryClient, profile?.id);
    }
  });
}
