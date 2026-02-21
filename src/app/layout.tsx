import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/TRPCProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuestCareer Pilot",
  description: "Descubra sua carreira ideal através de quests e trilhas de aprendizado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
