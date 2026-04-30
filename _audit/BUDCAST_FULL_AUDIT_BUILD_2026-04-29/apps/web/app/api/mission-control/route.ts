import { getMissionControlConfigRaw, saveMissionControlConfig } from "../../../lib/mission-control";
import { requireOpsApiAccess } from "../../../lib/ops-api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = requireOpsApiAccess(request);
  if (unauthorized) return unauthorized;

  return Response.json({ raw: getMissionControlConfigRaw() });
}

export async function POST(request: Request) {
  const unauthorized = requireOpsApiAccess(request);
  if (unauthorized) return unauthorized;

  let payload: { raw?: unknown } = {};

  try {
    payload = (await request.json()) as { raw?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof payload.raw !== "string") {
    return Response.json({ error: "Expected a raw JSON string." }, { status: 400 });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(payload.raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mission control JSON could not be parsed.";
    return Response.json({ error: message }, { status: 400 });
  }

  const result = saveMissionControlConfig(parsed);

  return Response.json({
    ok: true,
    updatedAt: result.updatedAt,
    path: result.path
  });
}
