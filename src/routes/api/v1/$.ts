import { createFileRoute } from "@tanstack/react-router";
import { handleApi } from "@/domain/node-handler.server";

const handle = ({ request }: { request: Request }) => handleApi(request);

export const Route = createFileRoute("/api/v1/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PATCH: handle,
      DELETE: handle,
      OPTIONS: handle,
    },
  },
});
