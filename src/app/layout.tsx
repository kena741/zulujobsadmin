import type { Metadata } from "next";
import { ReduxProvider } from "@/store/ReduxProvider";
import "./globals.css";
import Toast from "@/components/Toast";
import AuthListener from "@/components/AuthListener";

export const metadata: Metadata = {
  title: "Zulu Jobs Admin",
  description: "Admin panel for Zulu Jobs platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthListener />
          {children}
          <Toast />
        </ReduxProvider>
      </body>
    </html>
  );
}
