import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { Sidebar } from "../components/layout/Sidebar";

export const metadata: Metadata = {
  title: "SpeakUp - AI English Coach & Interview Preparation",
  description: "Master workplace English, conquer job interviews, and build lasting confidence with an AI coach tailored for Indian professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen">
        <AuthProvider>
          <SettingsProvider>
            <div className="flex w-full min-h-screen">
              <Sidebar />
              <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
                {children}
              </main>
            </div>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
