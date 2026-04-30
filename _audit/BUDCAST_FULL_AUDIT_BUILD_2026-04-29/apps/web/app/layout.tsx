import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "BudCast",
  description: "Creator marketplace for cannabis brands.",
  icons: {
    apple: "/brand/concept-2b/budcast-icon-square.png",
    icon: "/brand/concept-2b/budcast-favicon-128.png",
    shortcut: "/brand/concept-2b/budcast-favicon-128.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
