import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Tudu Auth",
  description: "Unified Authentication System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body> 
        <Navigation/>
        {children}
        <Toaster
        richColors
        expand
        closeButton
        duration={10000}
        toastOptions={{
          classNames : {
            title : "text-base"
                  }
          }  }
        />
      </body>
    </html>
  );
}
