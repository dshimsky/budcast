export function requireOpsApiAccess(request: Request) {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  const configuredToken = process.env.BUDCAST_OPS_API_KEY;
  if (!configuredToken) {
    return Response.json({ error: "Ops API disabled." }, { status: 404 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${configuredToken}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
