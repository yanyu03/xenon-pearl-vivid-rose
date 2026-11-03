import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin-console";

// Show the login UI regardless of build-time env. Authentication and
// database availability are enforced by the server, never by a VITE_* flag.
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "后台 · Folio" }] }),
  component: AdminConsole,
});
