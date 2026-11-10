"use client";
import { useEffect, useState } from "react"; import { useRouter } from "next/navigation"; import { sb, inr, getCart, setCart } from "@/lib/supabase"; import List from "@/components/List";
export default function Product({ params }: { params: { slug: string } }) {
  const [p, setP] = useState<any>(null); const [err, setErr] = useState(""); const [i, setI] = useState(0); const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [qty, setQty] = useState(1); const [msg, setMsg] = useState(""); const r = useRouter();
  useEffect(() => { sb.from("products").select("*,variants(*)").eq("slug", params.slug).eq("hidden", false).maybeSingle().then(({ data, error }) => { if (error) setErr("Could not load product."); else if (!data) setErr("Product not found."); else { setP(data); document.title = data.name + " | KVAULT"; } }); }, [params.slug]);
  if (err) return <p className="p-6">{err}</p>; if (!p) return <div className="aspect-square animate-pulse rounded-xl bg-ink/10" />;
  const sizes = Array.from(new Set(p.variants.map((v: any) => v.size))) as string[], colors = Array.from(new Set(p.variants.map((v: any) => v.color))) as string[];
  const v = p.variants.find((x: any) => x.size === size && x.color === color); const price = p.discount_price ?? p.price;
  const add = () => { if (!v) { setMsg("Choose a size and colour."); return false; } if (v.stock < 1) { setMsg("Out of stock."); return false; } const c = getCart(); const e = c.find((x: any) => x.vid === v.id);
    const n = (e?.qty || 0) + qty; if (n > v.stock) { setMsg(`Only ${v.stock} left.`); return false; } if (e) e.qty = n; else c.push({ vid: v.id, name: p.name, price, size, color, img: p.images[0], qty }); setCart(c); setMsg("Added to cart."); return true; };
  return (<div><div className="grid gap-8 md:grid-cols-2"><div><div className="aspect-[3/4] overflow-hidden rounded-2xl bg-lav/40">{p.images[i] && <img src={p.images[i]} alt={p.name} className="h-full w-full object-cover" />}</div>
      <div className="mt-2 flex gap-2 overflow-x-auto">{p.images.map((u: string, k: number) => <button key={u} onClick={() => setI(k)} className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${k === i ? "border-volt" : "border-transparent"}`}><img src={u} alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}</div></div>
    <div><h1 className="font-head text-5xl">{p.name}</h1><p className="my-2 text-2xl">{inr(price)} {p.discount_price && <s className="text-base opacity-50">{inr(p.price)}</s>}</p><p className="mb-4 opacity-80">{p.description}</p>
      <p className="font-semibold">Size</p><div className="mb-3 flex flex-wrap gap-2">{sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`rounded-lg border px-4 py-2 ${s === size ? "bg-ink text-paper" : ""}`}>{s}</button>)}</div>
      <p className="font-semibold">Colour</p><div className="mb-3 flex flex-wrap gap-2">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={`rounded-lg border px-4 py-2 ${c === color ? "bg-ink text-paper" : ""}`}>{c}</button>)}</div>
      {v && <p className="mb-2 text-sm">{v.stock > 0 ? (v.stock < 5 ? `Only ${v.stock} left` : "In stock") : "Out of stock"}</p>}
      <div className="mb-4 flex items-center gap-3"><button className="h-10 w-10 rounded-full border" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button className="h-10 w-10 rounded-full border" onClick={() => setQty(Math.min(10, qty + 1))}>+</button></div>
      <div className="flex gap-2"><button className="btn" onClick={add}>Add to cart</button><button className="btn !bg-zest" onClick={() => { if (add()) r.push("/cart"); }}>Buy now</button></div>
      <p className="mt-3 text-sm" role="status">{msg}</p></div></div>
    <h2 className="mb-3 mt-12 font-head text-4xl">You may also like</h2><List cat={p.category} limit={4} /></div>);
}
