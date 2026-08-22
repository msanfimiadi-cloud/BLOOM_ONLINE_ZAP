import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom Online — запись к специалистам",
  description: "Онлайн-запись к проверенным специалистам красоты, массажа и заботы о себе от Bloom Club.",
  openGraph: { title: "Bloom Online — запись к специалистам", description: "Выбирайте мастера, услугу и удобное время онлайн.", type: "website", locale: "ru_RU", images: [{ url: "/bloom-online-icon.png", width: 1254, height: 1254, alt: "Bloom Online" }] },
  twitter: { card: "summary", title: "Bloom Online — запись к специалистам", description: "Выбирайте мастера, услугу и удобное время онлайн.", images: ["/bloom-online-icon.png"] },
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "Bloom Online", statusBarStyle: "default" },
  icons: {
    icon: "/bloom-online-icon.png",
    shortcut: "/bloom-online-icon.png",
    apple: "/bloom-online-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
