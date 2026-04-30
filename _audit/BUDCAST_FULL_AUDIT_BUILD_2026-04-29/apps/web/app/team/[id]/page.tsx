"use client";

import { useParams } from "next/navigation";
import { PublicTeamMemberProfile } from "../../../components/brand-team";

export default function PublicTeamMemberPage() {
  const params = useParams<{ id: string }>();

  return <PublicTeamMemberProfile userId={params.id} />;
}
