import { CreatorDashboardScreen } from "../_components/creator-dashboard-screen";

export default async function CreatorMessagesPage({
  searchParams
}: {
  searchParams?: Promise<{ user?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;

  return <CreatorDashboardScreen activeTab="Messages" initialMessageUserId={params?.user ?? null} />;
}
