import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteChrome } from "@/components/site-chrome";
import { Toaster } from "sonner";
import { site } from "@/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} · ${site.tagline}` },
      { name: "description", content: site.description },
      { name: "theme-color", content: "#faf9f5" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@400;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.startsWith("/admin")) return <Outlet />;
  return (
    <SiteChrome>
      <Outlet />
    </SiteChrome>
  );
}

function RootDocument() {
  return (
    <html lang="zh-CN" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-body">
        <PreviewHostBridge />
        <AuthProvider>
          <AppShell />
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "!bg-surface-dark !text-on-dark !border-0 !font-sans !text-sm !rounded-lg",
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
