"use client";
import Link from "next/link"; import { useEffect, useState } from "react"; import { getCart } from "@/lib/supabase";
export default function Header() {
  const [n, setN] = useState(0);
  useEffect(() => { const f = () => setN(getCart().reduce((a, x) => a + x.qty, 0)); f(); window.addEventListener("kv-cart", f); return () => window.removeEventListener("kv-cart", f); }, []);
  return (<header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur">
    <Link href="/" className="font-head text-3xl tracking-wide">K<span className="text-volt">/</span>VAULT</Link>
    <nav className="flex items-center gap-4 text-sm font-semibold"><Link href="/drops">New Drops</Link><Link href="/c/tshirts">T-shirts</Link><Link href="/c/denim">Denim</Link><Link href="/c/shirts">Shirts</Link>
      <Link href="/cart" className="rounded-full bg-zest px-3 py-1 text-white">Cart {n}</Link></nav></header>);
}
