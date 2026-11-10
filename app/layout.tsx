import "./globals.css";
import Header from "@/components/Header";
export const metadata = { title: "KVAULT – Streetwear in Anantapur", description: "KVAULT streetwear: T-shirts, denim and shirts from Anantapur, Andhra Pradesh. Cash on Delivery.", openGraph: { title: "KVAULT Streetwear", description: "New drops, denim, tees and shirts." } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP, ig = process.env.NEXT_PUBLIC_INSTAGRAM;
  return (<html lang="en"><body><Header /><main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    <footer className="mt-16 bg-ink p-8 text-center text-paper"><p className="font-head text-3xl">KVAULT</p><p className="text-sm opacity-70">Anantapur, Andhra Pradesh, India</p>
      <p className="mt-3 space-x-4 text-lime">{ig && <a href={ig} target="_blank" rel="noopener">Instagram</a>}{wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener">WhatsApp</a>}</p></footer>
    {wa && <a aria-label="WhatsApp" href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="fixed bottom-4 right-4 rounded-full bg-lime px-4 py-3 font-bold shadow-lg">Chat</a>}</body></html>);
}
