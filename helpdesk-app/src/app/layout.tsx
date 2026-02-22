import type { Metadata } from "next";
import ToastProvider from "@/components/providers/ToastProvider";
import { UnreadNotificationProvider } from "@/components/providers/UnreadNotificationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HelpDesk - Customer Support System",
  description: "Internal helpdesk system for customer support agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <UnreadNotificationProvider>
          {children}
          <ToastProvider />
        </UnreadNotificationProvider>
      </body>
    </html>
  );
}
