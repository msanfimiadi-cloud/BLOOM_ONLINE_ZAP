import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom Online — запись к специалистам",
  description: "Онлайн-запись к проверенным специалистам красоты, массажа и заботы о себе от Bloom Club.",
  openGraph: { title: "Bloom Online — запись к специалистам", description: "Выбирайте мастера, услугу и удобное время онлайн.", type: "website", locale: "ru_RU" },
  twitter: { card: "summary", title: "Bloom Online — запись к специалистам", description: "Выбирайте мастера, услугу и удобное время онлайн." },
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
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
