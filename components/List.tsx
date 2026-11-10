"use client";
import Link from "next/link"; import { useEffect, useState } from "react"; import { sb, inr } from "@/lib/supabase";
export default function List({ cat, drops, best, limit, tools }: { cat?: string; drops?: boolean; best?: boolean; limit?: number; tools?: boolean }) {
  const [rows, setRows] = useState<any[] | null>(null); const [err, setErr] = useState(""); const [q, setQ] = useState(""); const [sort, setSort] = useState("new");
  useEffect(() => {
    let r: any = sb.from("products").select("*,variants(stock)").eq("hidden", false);
    if (cat) r = r.eq("category", cat); if (drops) r = r.eq("is_new_drop", true); if (best) r = r.eq("best_seller", true);
    r = r.order("created_at", { ascending: false }); if (limit) r = r.limit(limit);
    r.then(({ data, error }: any) => (error ? setErr("Could not load products. Check your connection and refresh.") : setRows(data)));
  }, [cat, drops, best, limit]);
  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!rows) return <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-ink/10" />)}</div>;
  let v = rows.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const price = (p: any) => p.discount_price ?? p.price;
  if (sort === "lo") v = [...v].sort((a, b) => price(a) - price(b)); if (sort === "hi") v = [...v].sort((a, b) => price(b) - price(a));
  return (<div>{tools && <div className="mb-4 flex gap-2"><input className="inp !mb-0" placeholder="Search products" value={q} onChange={e => setQ(e.target.value)} />
      <select className="inp !mb-0 !w-auto" value={sort} onChange={e => setSort(e.target.value)}><option value="new">Newest</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option></select></div>}
    {!v.length ? <p className="p-6 text-center opacity-60">No products here yet.</p> :
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{v.map(p => { const out = !p.variants?.some((x: any) => x.stock > 0);
        return (<Link key={p.id} href={`/p/${p.slug}`} className="group block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-lav/40">{p.images?.[0] && <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />}
            {p.is_new_drop && <span className="absolute left-2 top-2 rounded-full bg-lime px-2 py-1 text-xs font-bold">NEW</span>}
            {out && <span className="absolute inset-x-0 bottom-0 bg-ink/80 p-1 text-center text-xs text-white">Sold out</span>}</div>
          <p className="mt-2 font-semibold">{p.name}</p><p>{inr(price(p))} {p.discount_price && <s className="text-sm opacity-50">{inr(p.price)}</s>}</p></Link>); })}</div>}</div>);
}
