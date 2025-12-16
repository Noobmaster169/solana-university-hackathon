import "./globals.css";

export const metadata = {
  title: "Keystore - Passkey Wallet for Solana",
  description: "No seed phrases. Just your face.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">{children}</body>
    </html>
  );
}

