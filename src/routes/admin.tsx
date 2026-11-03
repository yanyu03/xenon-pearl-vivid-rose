import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin-console";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "后台 · Folio" }] }),
  component: () => import.meta.env.VITE_ADMIN_ENABLED === "true" ? <AdminConsole /> : <main className="mx-auto max-w-xl px-5 py-24"><h1 className="text-3xl font-semibold text-ink">管理后台暂未开放</h1><p className="mt-5 leading-8 text-body">后台需要完成服务端部署、数据库连接和管理员鉴权配置后才能使用。</p></main>,
});
