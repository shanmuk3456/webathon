import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Civic Collaboration Platform",
  description: "A platform for community issue reporting and management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Civic Platform",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
      <Script id="pwa-service-worker" strategy="afterInteractive">
        {`
          (function () {
            if (!('serviceWorker' in navigator)) return;
            const isProd = ${JSON.stringify(process.env.NODE_ENV === "production")};

            window.addEventListener('load', async () => {
              try {
                if (!isProd) {
                  // In development, service workers often cause stale asset caching.
                  // Ensure we unregister and clear caches so the dev server works reliably.
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map((r) => r.unregister()));
                  if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map((k) => caches.delete(k)));
                  }
                  return;
                }

                await navigator.serviceWorker.register('/sw.js');
              } catch (e) {
                console.log('SW setup failed:', e);
              }
            });
          })();
        `}
      </Script>
    </html>
  );
}
