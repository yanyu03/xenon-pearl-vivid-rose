import { handlePagesApi, type PagesEnv } from "../../src/domain/tidb-pages";

type PagesContext = { request: Request; env: PagesEnv };
export async function onRequest(context: PagesContext): Promise<Response> {
  try {
    return await handlePagesApi(context.request, context.env);
  } catch (error) {
    console.error("[folio] Pages API request failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
