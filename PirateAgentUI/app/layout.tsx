import type { Metadata } from "next";
import "./globals.css";
import "./pirate.css";
import { ThemeProvider } from "@/components/common/theme-provider";

export const metadata: Metadata = {
  title: "PIRATEAGENT — AI Data Intelligence Platform",
  description: "Turn a simple business request into clean, structured, source-backed web data with PirateAgent.",
  icons: {
    icon: "/pirate/images/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Jost:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // One-time migration: if theme was saved as 'dark' by the old default, reset to 'light'
                if (!localStorage.getItem('pirateagent-theme-v2')) {
                  localStorage.removeItem('pirateagent-theme');
                  localStorage.setItem('pirateagent-theme-v2', '1');
                }
                const theme = localStorage.getItem('pirateagent-theme') || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
