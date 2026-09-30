import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心意手账 · 把心意记下来",
  description: "一本记住朋友、礼物与小心意的复古手账。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preload" href="/fonts/fuluxi-ui.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/alibaba-light-ui.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
