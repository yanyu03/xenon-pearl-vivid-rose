import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin-console";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "后台 · Folio" }] }),
  component: AdminConsole,
});
