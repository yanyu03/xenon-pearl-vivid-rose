import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { CallbackRow, ClusterRow, EntryRow } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const TOKEN_KEY = "folio.admin.token";

type Tab = "overview" | "clusters" | "entries" | "callbacks";

type Overview = {
  clusters: number;
  entries: number;
  published: number;
  drafts: number;
  callbacks: CallbackRow[];
};

async function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as { data?: T; detail?: string; title?: string };
  if (!response.ok) throw new Error(body.detail || body.title || "请求失败");
  return body.data as T;
}

export function AdminConsole() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setToken(sessionStorage.getItem(TOKEN_KEY));
    setReady(true);
  }, []);

  if (!ready) return <main className="min-h-dvh bg-canvas" />;
  if (!token) {
    return (
      <Login
        onToken={(value) => {
          sessionStorage.setItem(TOKEN_KEY, value);
          setToken(value);
        }}
      />
    );
  }

  return (
    <Console
      token={token}
      tab={tab}
      onTab={setTab}
      onLogout={() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }}
    />
  );
}

function Login({ onToken }: { onToken: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/v1/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json()) as { data?: { token: string }; detail?: string };
      if (!response.ok || !body.data?.token) throw new Error(body.detail || "登录失败");
      onToken(body.data.token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-surface-card p-8">
        <p className="text-xs font-medium tracking-[0.14em] text-primary">FOLIO ADMIN</p>
        <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] text-ink">后台</h1>
        <p className="mt-3 text-sm leading-6 text-body">
          管理卡片聚类、公开与草稿。请使用已在 Cloudflare 配置的管理员口令；如果服务端尚未配置，请先设置 ADMIN_PASSWORD 与 SESSION_SECRET。
        </p>
        <label className="mt-6 block text-xs font-medium text-muted" htmlFor="password">
          口令
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <Button type="submit" className="mt-4 w-full" disabled={pending}>
          {pending ? "正在核对" : "进入后台"}
        </Button>
      </form>
    </main>
  );
}

function Console({
  token,
  tab,
  onTab,
  onLogout,
}: {
  token: string;
  tab: Tab;
  onTab: (tab: Tab) => void;
  onLogout: () => void;
}) {
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "概览" },
    { id: "clusters", label: "聚类" },
    { id: "entries", label: "卡片" },
    { id: "callbacks", label: "回传" },
  ];

  return (
    <main className="min-h-dvh bg-canvas">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <p className="font-display text-2xl tracking-[-0.03em] text-ink">Folio 后台</p>
          <button type="button" onClick={onLogout} className="text-sm font-medium text-muted hover:text-ink">
            退出
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTab(item.id)}
              className={cn(
                "h-10 rounded-full px-4 text-sm font-medium",
                tab === item.id ? "bg-ink text-canvas" : "bg-surface-card text-body",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "overview" ? <OverviewPanel token={token} /> : null}
          {tab === "clusters" ? <ClusterPanel token={token} /> : null}
          {tab === "entries" ? <EntryPanel token={token} /> : null}
          {tab === "callbacks" ? <CallbackPanel token={token} /> : null}
        </div>
      </div>
    </main>
  );
}

function OverviewPanel({ token }: { token: string }) {
  const [data, setData] = useState<Overview | null>(null);
  useEffect(() => {
    api<Overview>("/api/v1/admin/overview", token).then(setData).catch((error: Error) => toast.error(error.message));
  }, [token]);
  if (!data) return <p className="text-sm text-muted">正在读取。</p>;
  const stats = [
    ["聚类", data.clusters],
    ["卡片", data.entries],
    ["已公开", data.published],
    ["未公开", data.drafts],
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-surface-card px-5 py-6">
          <p className="text-xs tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-2 font-display text-4xl text-ink tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ClusterPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<ClusterRow[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [blurb, setBlurb] = useState("");

  function reload() {
    api<ClusterRow[]>("/api/v1/admin/clusters", token).then(setRows).catch((error: Error) => toast.error(error.message));
  }
  useEffect(() => {
    reload();
  }, [token]);

  async function create(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/v1/admin/clusters", token, {
        method: "POST",
        body: JSON.stringify({ name, slug, blurb }),
      });
      setName("");
      setSlug("");
      setBlurb("");
      toast.success("聚类已建立");
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "失败");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <ul className="divide-y divide-hairline border-y border-hairline">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-ink">{row.name}</p>
              <p className="text-sm text-muted">{row.blurb}</p>
              <p className="mt-1 font-mono text-xs text-muted-soft">{row.slug}</p>
            </div>
            <button
              type="button"
              className="text-sm text-muted hover:text-error"
              onClick={async () => {
                try {
                  await api(`/api/v1/admin/clusters/${row.id}`, token, { method: "DELETE" });
                  reload();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "无法删除");
                }
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="rounded-lg bg-surface-card p-4">
        <p className="text-sm font-medium text-ink">新建聚类</p>
        <Field label="名称" value={name} onChange={setName} />
        <Field label="slug" value={slug} onChange={setSlug} />
        <Field label="说明" value={blurb} onChange={setBlurb} />
        <Button type="submit" size="sm" className="mt-4">
          建立
        </Button>
      </form>
    </div>
  );
}

function EntryPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [clusters, setClusters] = useState<ClusterRow[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [dek, setDek] = useState("");
  const [clusterId, setClusterId] = useState("");
  const [kind, setKind] = useState<"note" | "work">("note");

  function reload() {
    Promise.all([
      api<EntryRow[]>("/api/v1/admin/entries", token),
      api<ClusterRow[]>("/api/v1/admin/clusters", token),
    ])
      .then(([entries, nextClusters]) => {
        setRows(entries);
        setClusters(nextClusters);
        setClusterId((current) => current || nextClusters[0]?.id || "");
      })
      .catch((error: Error) => toast.error(error.message));
  }
  useEffect(() => {
    reload();
  }, [token]);

  async function create(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/v1/admin/entries", token, {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          dek,
          clusterId,
          kind,
          visibility: "private",
          status: "draft",
          bodyText: dek,
        }),
      });
      setTitle("");
      setSlug("");
      setDek("");
      toast.success("草稿已建立");
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "失败");
    }
  }

  async function move(id: string, nextCluster: string) {
    await api(`/api/v1/admin/entries/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ clusterId: nextCluster }),
    });
    reload();
  }

  return (
    <div className="space-y-8">
      <ul className="divide-y divide-hairline border-y border-hairline">
        {rows.map((row) => (
          <li key={row.id} className="grid gap-3 py-4 md:grid-cols-[1fr_180px_auto]">
            <div>
              <p className="font-medium text-ink">{row.title}</p>
              <p className="text-sm text-muted">{row.dek}</p>
              <p className="mt-1 font-mono text-xs text-muted-soft">
                {row.kind} · {row.visibility} · {row.status}
              </p>
            </div>
            <select
              value={row.clusterId}
              onChange={(event) => move(row.id, event.target.value).catch((error: Error) => toast.error(error.message))}
              className="h-11 rounded-md border border-hairline bg-canvas px-2 text-sm text-ink"
            >
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-sm font-medium text-primary"
                onClick={async () => {
                  try {
                    await api(`/api/v1/admin/entries/${row.id}/publish`, token, { method: "POST" });
                    toast.success("已公开，并尝试回传");
                    reload();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "失败");
                  }
                }}
              >
                公开
              </button>
              <button
                type="button"
                className="text-sm text-muted"
                onClick={async () => {
                  try {
                    await api(`/api/v1/admin/entries/${row.id}`, token, {
                      method: "PATCH",
                      body: JSON.stringify({ visibility: "private", status: "draft" }),
                    });
                    reload();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "失败");
                  }
                }}
              >
                收回
              </button>
              <button
                type="button"
                className="text-sm text-muted hover:text-error"
                onClick={async () => {
                  try {
                    await api(`/api/v1/admin/entries/${row.id}`, token, { method: "DELETE" });
                    reload();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "无法删除");
                  }
                }}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="rounded-lg bg-surface-card p-5">
        <p className="text-sm font-medium text-ink">新建草稿</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="标题" value={title} onChange={setTitle} />
          <Field label="slug" value={slug} onChange={setSlug} />
          <Field label="摘要" value={dek} onChange={setDek} />
          <label className="block text-xs font-medium text-muted">
            类型
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value === "work" ? "work" : "note")}
              className="mt-2 h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink"
            >
              <option value="note">笔记</option>
              <option value="work">作品</option>
            </select>
          </label>
        </div>
        <Button type="submit" size="sm" className="mt-4">
          存为草稿
        </Button>
      </form>
    </div>
  );
}

function CallbackPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<CallbackRow[]>([]);
  useEffect(() => {
    api<CallbackRow[]>("/api/v1/admin/callbacks", token)
      .then(setRows)
      .catch((error: Error) => toast.error(error.message));
  }, [token]);
  if (rows.length === 0) {
    return <p className="text-sm leading-6 text-muted">公开一篇卡片后，这里会留下 CloudEvents 回传记录。</p>;
  }
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {rows.map((row) => (
        <li key={row.id} className="py-4">
          <p className="font-mono text-xs text-muted">{row.eventType}</p>
          <p className="mt-1 text-sm text-ink">{row.detail}</p>
          <p className="mt-1 text-xs text-muted-soft">
            {row.createdAt} · {row.statusCode ?? "—"} · {row.ok ? "ok" : "failed"}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-3 block text-xs font-medium text-muted">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink focus:border-primary focus:outline-none"
      />
    </label>
  );
}
