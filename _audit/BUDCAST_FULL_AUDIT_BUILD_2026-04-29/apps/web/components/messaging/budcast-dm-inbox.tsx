"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, Plus, Search, Send, Sparkles } from "lucide-react";
import {
  type ConversationSummary,
  type MessageWithSender,
  type MessageParticipant,
  type UserType,
  getPrimaryTrustBadge,
  useAuth,
  useConversations,
  useMessageParticipant,
  useMessages,
  useSendMessage,
  useStartConversation,
  useUserSearch
} from "@budcast/shared";
import { TrustBadge } from "../marketplace/trust-badge";
import { ProfileSafetyActions } from "../safety/profile-safety-actions";

type BudCastDmInboxProps = {
  initialUserId?: string | null;
  mobileOnly?: boolean;
  searchTargetType: UserType;
  subtitle: string;
  title: string;
};

function getParticipantName(participant?: MessageParticipant | null) {
  return participant?.company_name || participant?.name || "BudCast member";
}

function getParticipantHandle(participant?: MessageParticipant | null) {
  const handle = participant?.instagram || participant?.tiktok || participant?.x_profile || participant?.youtube;
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;
  return participant?.user_type === "brand" ? "Brand profile" : "Creator profile";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BC";
}

function formatMessageTime(value?: string | null) {
  if (!value) return "Now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatThreadDate(value?: string | null) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date);
}

function getMessagingErrorCopy(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (message.includes("PGRST205") || message.includes("MESSAGING_SETUP_PENDING") || message.includes("conversations")) {
    return "Messaging database setup is pending. The inbox UI is ready, but the Supabase messaging migration still needs to be applied before DMs can send.";
  }

  if (message.includes("MESSAGE_REQUIRED")) {
    return "Write a message before sending.";
  }

  if (message.includes("NOT_SIGNED_IN")) {
    return "Sign in before starting a message.";
  }

  return "BudCast could not complete that messaging action. Try again in a moment.";
}

function Avatar({ participant, size = "md" }: { participant?: MessageParticipant | null; size?: "sm" | "md" | "lg" }) {
  const name = getParticipantName(participant);
  const sizeClass = size === "lg" ? "h-14 w-14 rounded-[22px]" : size === "sm" ? "h-10 w-10 rounded-[16px]" : "h-12 w-12 rounded-[18px]";

  return (
    <span
      className={`${sizeClass} grid shrink-0 place-items-center overflow-hidden border border-white/[0.08] bg-[linear-gradient(145deg,rgba(215,255,114,0.22),rgba(255,255,255,0.04))] text-sm font-black text-[#fff4ee] shadow-[0_14px_34px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.08)_inset]`}
    >
      {participant?.avatar_url ? (
        <img alt="" className="h-full w-full object-cover" src={participant.avatar_url} />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

function getOtherParticipant(conversation: ConversationSummary, currentParticipantId?: string | null) {
  return conversation.brand_id === currentParticipantId ? conversation.creator : conversation.brand;
}

function getStartInput(participant: MessageParticipant, currentUser: MessageParticipant, effectiveBrandId?: string | null) {
  if (currentUser.user_type === "brand" && participant.user_type === "creator") {
    return { brandId: effectiveBrandId ?? currentUser.id, creatorId: participant.id };
  }

  if (currentUser.user_type === "brand_team" && participant.user_type === "creator" && effectiveBrandId) {
    return { brandId: effectiveBrandId, creatorId: participant.id };
  }

  if (currentUser.user_type === "creator" && participant.user_type === "brand") {
    return { brandId: participant.id, creatorId: currentUser.id };
  }

  return null;
}

function ParticipantName({ participant }: { participant?: MessageParticipant | null }) {
  const primaryBadge = participant?.user_type
    ? getPrimaryTrustBadge({ badges: participant.badges, profileType: participant.user_type })
    : null;

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{getParticipantName(participant)}</span>
      {primaryBadge ? <TrustBadge badge={primaryBadge} size="micro" /> : null}
    </span>
  );
}

function getMessageSenderLabel(message: MessageWithSender, fallbackBrand?: MessageParticipant | null) {
  if (!message.sender_brand_id || !message.sender) return null;

  const brandName = message.sender_brand?.company_name || message.sender_brand?.name || fallbackBrand?.company_name || fallbackBrand?.name;
  const senderName = message.sender.name || message.sender.company_name;
  if (!senderName || !brandName || senderName === brandName) return brandName ?? senderName ?? null;

  return `${senderName} · ${brandName}`;
}

export function BudCastDmInbox({ initialUserId, mobileOnly = false, searchTargetType, subtitle, title }: BudCastDmInboxProps) {
  const { brandContext, profile } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [newMessageMode, setNewMessageMode] = useState(false);
  const [searchFocusRequest, setSearchFocusRequest] = useState(0);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [autoStartedFor, setAutoStartedFor] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const conversations = useConversations();
  const messages = useMessages(selectedConversationId);
  const search = useUserSearch(query, searchTargetType);
  const initialParticipant = useMessageParticipant(initialUserId);
  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();

  const currentUser = profile as MessageParticipant | null;
  const effectiveBrandId = brandContext?.brandId ?? (profile?.user_type === "brand" ? profile.id : null);
  const currentConversationParticipantId = effectiveBrandId ?? profile?.id ?? null;
  const conversationRows = conversations.data ?? [];
  const selectedConversation = useMemo(
    () => conversationRows.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversationRows, selectedConversationId]
  );
  const selectedParticipant = selectedConversation ? getOtherParticipant(selectedConversation, currentConversationParticipantId) : null;

  useEffect(() => {
    if (!selectedConversationId && conversationRows.length > 0) {
      setSelectedConversationId(conversationRows[0].id);
    }
  }, [conversationRows, selectedConversationId]);

  useEffect(() => {
    if (!initialUserId || autoStartedFor === initialUserId || !currentUser || !initialParticipant.data) return;
    const input = getStartInput(initialParticipant.data, currentUser, effectiveBrandId);
    if (!input) return;

    setAutoStartedFor(initialUserId);
    startConversation.mutate(input, {
      onSuccess: ({ conversationId }) => {
        setSelectedConversationId(conversationId);
        setMobileThreadOpen(true);
        setNewMessageMode(false);
      },
      onError: (error) => {
        setActionError(getMessagingErrorCopy(error));
      }
    });
  }, [autoStartedFor, currentUser, effectiveBrandId, initialParticipant.data, initialUserId, startConversation]);

  function handleStart(participant: MessageParticipant) {
    if (!currentUser) return;
    const input = getStartInput(participant, currentUser, effectiveBrandId);
    if (!input) return;

    setActionError(null);
    startConversation.mutate(input, {
      onSuccess: ({ conversationId }) => {
        setSelectedConversationId(conversationId);
        setMobileThreadOpen(true);
        setNewMessageMode(false);
        setQuery("");
      },
      onError: (error) => {
        setActionError(getMessagingErrorCopy(error));
      }
    });
  }

  function sendCurrentMessage() {
    if (!selectedConversationId || !composer.trim()) return;

    setActionError(null);
    sendMessage.mutate(
      {
        body: composer,
        conversationId: selectedConversationId
      },
      {
        onSuccess: () => setComposer(""),
        onError: (error) => {
          setActionError(getMessagingErrorCopy(error));
        }
      }
    );
  }

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendCurrentMessage();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendCurrentMessage();
  }

  function openNewMessageSearch() {
    setActionError(null);
    setMobileThreadOpen(false);
    setNewMessageMode(true);
    setSearchFocusRequest((request) => request + 1);
  }

  function closeNewMessageSearch() {
    setNewMessageMode(false);
    setQuery("");
  }

  const showSearchResults = query.trim().length >= 2;
  const showSearchPanel = newMessageMode || showSearchResults;
  const threadVisibleOnMobile = Boolean(mobileThreadOpen && selectedConversation);
  const passiveError = conversations.error ? getMessagingErrorCopy(conversations.error) : null;
  const visibleMessages = messages.data ?? [];
  const hasThreads = conversationRows.length > 0;

  useEffect(() => {
    if (searchFocusRequest === 0 || threadVisibleOnMobile) return;

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [searchFocusRequest, threadVisibleOnMobile]);

  return (
    <section className="grid min-w-0 gap-4 overflow-hidden">
      <div className="min-w-0 rounded-[32px] border border-white/[0.08] bg-[radial-gradient(circle_at_14%_0%,rgba(184,255,61,0.14),transparent_36%),linear-gradient(180deg,rgba(24,15,12,0.92),rgba(8,6,5,0.98))] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.44),0_1px_0_rgba(255,255,255,0.06)_inset] md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e7ff9a]">
              <MessageCircle className="h-3.5 w-3.5" />
              Direct messages
            </div>
            <h1 className={`mt-2 font-black leading-none tracking-[-0.04em] text-[#fff4ee] ${mobileOnly ? "text-3xl" : "text-3xl md:text-5xl"}`}>
              {title}
            </h1>
            <p className={`mt-3 max-w-2xl text-sm font-medium leading-6 text-[#cbbcaf] ${mobileOnly ? "" : "md:text-base md:leading-7"}`}>
              {subtitle}
            </p>
          </div>
          <button
            aria-label="New message"
            className={`h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_16px_34px_rgba(184,255,61,0.28),0_1px_0_rgba(255,255,255,0.26)_inset] transition active:scale-95 ${mobileOnly ? "inline-flex" : "inline-flex md:hidden"}`}
            onClick={openNewMessageSearch}
            type="button"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className={`${mobileOnly ? "hidden" : "hidden items-center gap-2 md:flex"}`}>
            <span className="rounded-full border border-[#e7ff9a]/14 bg-white/[0.045] px-4 py-2 text-xs font-black text-[#e7ff9a]">
              {conversationRows.length} threads
            </span>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 text-xs font-black text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.22)_inset] transition hover:-translate-y-0.5 hover:brightness-110"
              onClick={openNewMessageSearch}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              New message
            </button>
          </div>
        </div>
      </div>

      {actionError || passiveError ? (
        <div className="rounded-[24px] border border-[#e7ff9a]/18 bg-[#b8ff3d]/10 px-4 py-3 text-sm font-bold leading-6 text-[#e7ff9a] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
          {actionError || passiveError}
        </div>
      ) : null}

      <div
        className={`grid min-h-[calc(100svh-220px)] min-w-0 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,12,10,0.94),rgba(5,4,3,0.98))] shadow-[0_32px_100px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.05)_inset] ${
          mobileOnly ? "" : "lg:min-h-[640px] lg:grid-cols-[380px_minmax(0,1fr)]"
        }`}
      >
        <aside className={`${threadVisibleOnMobile ? (mobileOnly ? "hidden" : "hidden lg:block") : "block"} min-w-0 border-white/[0.08] transition ${mobileOnly ? "" : "lg:border-r"}`}>
          <div className="border-b border-white/[0.08] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e7ff9a]">
                  {showSearchPanel ? "New message" : "Inbox"}
                </div>
                <p className="mt-1 text-xs font-semibold text-[#8f8177]">
                  {showSearchPanel
                    ? `Search ${searchTargetType === "brand" ? "brands" : "creators"} to start a DM.`
                    : "Open a thread or start a new DM."}
                </p>
              </div>
              {showSearchPanel ? (
                <button
                  className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#cbbcaf] transition hover:border-[#b8ff3d]/24 hover:text-[#e7ff9a]"
                  onClick={closeNewMessageSearch}
                  type="button"
                >
                  Inbox
                </button>
              ) : (
                <button
                  className="shrink-0 rounded-full border border-[#e7ff9a]/18 bg-[#b8ff3d]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e7ff9a] transition hover:bg-[#b8ff3d]/16"
                  onClick={openNewMessageSearch}
                  type="button"
                >
                  New
                </button>
              )}
            </div>
            <label className="flex min-h-12 items-center gap-3 rounded-full border border-white/[0.08] bg-black/25 px-4 text-sm text-[#fbfbf7] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
              <Search className="h-4 w-4 text-[#e7ff9a]" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#7f7168]"
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (event.target.value) setNewMessageMode(true);
                }}
                onFocus={() => setNewMessageMode(true)}
                placeholder={searchTargetType === "brand" ? "Search brands or handles" : "Search creators or handles"}
                ref={searchInputRef}
                type="search"
                value={query}
              />
            </label>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {["Campaign details", "Pickup", "Payment", "Content notes"].map((label) => (
                <span
                  className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#8f8177]"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className={`max-h-[calc(100svh-345px)] overflow-y-auto ${mobileOnly ? "" : "lg:max-h-[560px]"}`}>
            {showSearchResults ? (
              <div className="grid gap-1 p-3">
                <div className="px-2 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#8f8177]">
                  Tap Message to start
                </div>
                {search.isLoading ? (
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-4 text-sm font-bold text-[#c7ccc2]">
                    Searching BudCast...
                  </div>
                ) : (search.data ?? []).length > 0 ? (
                  search.data?.map((participant) => (
                    <button
                      className="group flex min-h-[82px] w-full items-center gap-3 rounded-[28px] border border-white/[0.06] bg-white/[0.03] px-4 py-4 text-left transition hover:border-[#b8ff3d]/20 hover:bg-white/[0.055] active:scale-[0.99]"
                      disabled={startConversation.isPending}
                      key={participant.id}
                      onClick={() => handleStart(participant)}
                      type="button"
                    >
                      <Avatar participant={participant} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-[#fbfbf7]">
                          <ParticipantName participant={participant} />
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-[#aeb5aa]">
                          {getParticipantHandle(participant)}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {participant.location ? (
                            <span className="rounded-full bg-white/[0.045] px-2 py-0.5 text-[10px] font-bold text-[#8f8177]">
                              {participant.location}
                            </span>
                          ) : null}
                          {(participant.niches ?? []).slice(0, 2).map((niche) => (
                            <span
                              className="rounded-full bg-[#b8ff3d]/10 px-2 py-0.5 text-[10px] font-bold text-[#e7ff9a]"
                              key={niche}
                            >
                              {niche}
                            </span>
                          ))}
                        </span>
                      </span>
                      <span className="rounded-full bg-[#b8ff3d] px-3.5 py-2 text-[10px] font-black text-[#071007] shadow-[0_10px_22px_rgba(184,255,61,0.2)]">
                        {startConversation.isPending ? "Opening" : "Message"}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-4 text-sm font-bold text-[#c7ccc2]">
                    No matching BudCast profiles yet.
                  </div>
                )}
              </div>
            ) : showSearchPanel ? (
              <div className="p-5">
                <div className="rounded-[28px] border border-dashed border-[#e7ff9a]/16 bg-[radial-gradient(circle_at_50%_0%,rgba(184,255,61,0.12),transparent_44%),rgba(255,255,255,0.03)] p-5 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-[20px] border border-[#e7ff9a]/16 bg-[#b8ff3d]/10 text-[#e7ff9a] shadow-[0_12px_28px_rgba(184,255,61,0.12)]">
                    <Plus className="h-5 w-5" />
                  </span>
                  <div className="mt-3 text-xl font-black tracking-[-0.04em] text-[#fbfbf7]">New message</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[#aeb5aa]">
                    Type at least two characters to search BudCast {searchTargetType === "brand" ? "brands" : "creators"}.
                  </p>
                </div>
              </div>
            ) : hasThreads ? (
              <div className="divide-y divide-white/[0.06]">
                {conversationRows.map((conversation) => {
                  const participant = getOtherParticipant(conversation, currentConversationParticipantId);
                  const active = conversation.id === selectedConversationId;
                  const latestFromThem = Boolean(
                    conversation.latest_message && conversation.latest_message.sender_id !== profile?.id
                  );
                  return (
                    <button
                      className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                        active ? "bg-[#b8ff3d]/12" : "hover:bg-white/[0.035]"
                      }`}
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        setMobileThreadOpen(true);
                      }}
                      type="button"
                    >
                      <Avatar participant={participant} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
                            {latestFromThem ? (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[#b8ff3d] shadow-[0_0_14px_rgba(184,255,61,0.62)]" />
                            ) : null}
                            <span className="truncate text-sm font-black text-[#fbfbf7]">
                            <ParticipantName participant={participant} />
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] font-bold text-[#8f8177]">
                            {formatMessageTime(conversation.latest_message?.created_at ?? conversation.last_message_at)}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-[#aeb5aa]">
                          {conversation.latest_message?.body || "Start the conversation."}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-5">
                <div className="rounded-[28px] border border-dashed border-white/[0.1] bg-[radial-gradient(circle_at_50%_0%,rgba(184,255,61,0.12),transparent_44%),rgba(255,255,255,0.03)] p-5 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-[20px] border border-[#e7ff9a]/16 bg-[#b8ff3d]/10 text-[#e7ff9a] shadow-[0_12px_28px_rgba(184,255,61,0.12)]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="mt-3 text-xl font-black tracking-[-0.04em] text-[#fbfbf7]">Start your first BudCast DM.</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[#aeb5aa]">
                    Search a {searchTargetType === "brand" ? "brand" : "creator"} to coordinate campaign details,
                    pickup, payment timing, and content questions.
                  </p>
                  <button
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] px-4 text-xs font-black text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.22)_inset]"
                    onClick={openNewMessageSearch}
                    type="button"
                  >
                    Search profiles
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div
          className={`${
            threadVisibleOnMobile
              ? mobileOnly
                ? "fixed inset-0 z-50 flex h-[100svh] rounded-none bg-[linear-gradient(180deg,rgba(16,12,10,0.98),rgba(5,4,3,1))]"
                : "fixed inset-0 z-50 flex h-[100svh] rounded-none bg-[linear-gradient(180deg,rgba(16,12,10,0.98),rgba(5,4,3,1))] lg:static lg:z-auto lg:h-auto lg:bg-transparent"
              : mobileOnly
                ? "hidden"
                : "hidden lg:flex"
          } min-h-0 flex-col overflow-hidden transition ${mobileOnly ? "" : "lg:min-h-[640px]"}`}
        >
          {selectedConversation ? (
            <>
              <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/[0.08] bg-[rgba(12,9,7,0.96)] px-3 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.22)] backdrop-blur md:px-4 md:py-4 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
                <button
                  className={`h-11 shrink-0 items-center gap-2 rounded-full border border-[#e7ff9a]/20 bg-[#b8ff3d]/12 px-3 text-xs font-black text-[#e7ff9a] shadow-[0_10px_24px_rgba(0,0,0,0.22)] ${mobileOnly ? "inline-flex" : "inline-flex lg:hidden"}`}
                  onClick={() => setMobileThreadOpen(false)}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Inbox
                </button>
                <Avatar participant={selectedParticipant} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-black text-[#fbfbf7]">
                    <ParticipantName participant={selectedParticipant} />
                  </div>
                  <div className="truncate text-xs font-semibold text-[#aeb5aa]">
                    {getParticipantHandle(selectedParticipant)} · Coordinate in BudCast
                  </div>
                </div>
                <span className={`${mobileOnly ? "hidden" : "hidden md:inline-flex"} rounded-full border border-emerald-300/16 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100`}>
                  Active
                </span>
                <ProfileSafetyActions
                  blockProfileId={selectedParticipant?.id}
                  compact
                  reportedUserId={selectedParticipant?.id}
                  targetId={selectedConversation.id}
                  targetType="conversation"
                />
                <button
                  aria-label="New message"
                  className={`h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.22)] ${mobileOnly ? "grid" : "grid lg:hidden"}`}
                  onClick={openNewMessageSearch}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
                {visibleMessages.length > 0 ? (
                  <>
                    <div className="flex justify-center">
                      <span className="rounded-full border border-white/[0.075] bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8f8177]">
                        {formatThreadDate(visibleMessages[0]?.created_at)}
                      </span>
                    </div>
                    {visibleMessages.map((message) => {
                    const mine =
                      message.sender_id === profile?.id ||
                      Boolean(effectiveBrandId && message.sender_brand_id === effectiveBrandId);
                    const senderLabel = getMessageSenderLabel(message, selectedConversation.brand);
                    return (
                      <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`} key={message.id}>
                        <div
                          className={`rounded-[24px] px-4 py-3 text-sm font-semibold leading-6 shadow-[0_14px_40px_rgba(0,0,0,0.26)] ${mobileOnly ? "max-w-[82%]" : "max-w-[82%] md:max-w-[66%]"} ${
                            mine
                              ? "rounded-br-[8px] bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007]"
                              : "rounded-bl-[8px] border border-white/[0.08] bg-white/[0.055] text-[#fbfbf7]"
                          }`}
                        >
                          {senderLabel ? (
                            <div className={`mb-1 text-[10px] font-black ${mine ? "text-[#4a150b]" : "text-[#e7ff9a]"}`}>
                              {senderLabel}
                            </div>
                          ) : null}
                          {message.body}
                          <div className={`mt-1 text-[10px] font-black ${mine ? "text-[#4a150b]" : "text-[#8f8177]"}`}>
                            {formatMessageTime(message.created_at)}
                          </div>
                        </div>
                        {!mine ? (
                          <ProfileSafetyActions
                            blockProfileId={message.sender_id}
                            className="mt-1"
                            compact
                            reportLabel="Report message"
                            reportedUserId={message.sender_id}
                            targetId={message.id}
                            targetType="message"
                          />
                        ) : null}
                      </div>
                    );
                    })}
                  </>
                ) : (
                  <div className="grid h-full place-items-center py-16 text-center">
                    <div>
                      <Avatar participant={selectedParticipant} size="lg" />
                      <h2 className="mt-4 text-2xl font-black tracking-[-0.045em] text-[#fbfbf7]">
                        Message {getParticipantName(selectedParticipant)}
                      </h2>
                      <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[#aeb5aa]">
                        Keep pickup details, creative direction, payment timing, and review notes in one BudCast thread.
                      </p>
                      <div className={`mx-auto mt-5 grid max-w-md gap-2 text-left ${mobileOnly ? "" : "sm:grid-cols-3"}`}>
                        {["Confirm pickup", "Ask about content", "Track payment"].map((prompt) => (
                          <button
                            className="rounded-[18px] border border-white/[0.075] bg-white/[0.04] px-3 py-3 text-xs font-black text-[#d8ded1] transition hover:border-[#b8ff3d]/24 hover:text-[#e7ff9a]"
                            key={prompt}
                            onClick={() => setComposer(prompt)}
                            type="button"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form className={`sticky bottom-0 border-t border-white/[0.08] bg-[rgba(12,9,7,0.96)] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur ${mobileOnly ? "" : "lg:bg-transparent lg:pb-3 lg:backdrop-blur-none"}`} onSubmit={handleSend}>
                <div className="flex items-end gap-2 rounded-[28px] border border-white/[0.08] bg-black/25 p-2 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
                  <textarea
                    className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm font-semibold leading-6 text-[#fbfbf7] outline-none placeholder:text-[#7f7168]"
                    onKeyDown={handleComposerKeyDown}
                    onChange={(event) => setComposer(event.target.value)}
                    placeholder="Write a message..."
                    value={composer}
                  />
                  <button
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_12px_28px_rgba(184,255,61,0.24),0_1px_0_rgba(255,255,255,0.22)_inset] transition disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={!composer.trim() || sendMessage.isPending}
                    type="submit"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <MessageCircle className="mx-auto h-8 w-8 text-[#e7ff9a]" />
                <h2 className="mt-4 text-3xl font-black tracking-[-0.055em] text-[#fbfbf7]">Choose a conversation.</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[#aeb5aa]">
                  Search for a profile or open an existing DM to coordinate the campaign.
                </p>
                <button
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e7ff9a]/14 bg-white/[0.045] px-4 py-2 text-xs font-black text-[#e7ff9a] transition hover:border-[#b8ff3d]/24 hover:bg-[#b8ff3d]/10"
                  onClick={openNewMessageSearch}
                  type="button"
                >
                  Search to start
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
