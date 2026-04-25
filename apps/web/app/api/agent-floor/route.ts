import { getAgentFloorConfigRaw, saveAgentFloorConfig } from "../../../lib/agent-floor";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ raw: getAgentFloorConfigRaw() });
}

export async function POST(request: Request) {
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
    const message = error instanceof Error ? error.message : "BudCast Operations JSON could not be parsed.";
    return Response.json({ error: message }, { status: 400 });
  }

  let result: ReturnType<typeof saveAgentFloorConfig>;

  try {
    result = saveAgentFloorConfig(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "BudCast Operations could not be saved.";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    updatedAt: result.updatedAt,
    path: result.path
  });
}
