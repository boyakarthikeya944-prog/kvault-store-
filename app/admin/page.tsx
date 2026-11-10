"use client";
import { useEffect, useState } from "react"; import { sb, inr } from "@/lib/supabase";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
async function compress(file: File): Promise<Blob> { const bmp = await createImageBitmap(file); const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)); const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
  cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height); return new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error("compress"))), "image/webp", 0.82)); }
export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null); const [tab, setTab] = useState("products"); const [em, setEm] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const check = async () => { const { data: { user } } = await sb.auth.getUser(); if (!user) return setOk(false); const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(); setOk(!!data); };
  useEffect(() => { check(); }, []);
  const login = async () => { setErr(""); const { error } = await sb.auth.signInWithPassword({ email: em, password: pw }); if (error) return setErr("Wrong email or password."); await check(); };
  if (ok === null) return <p>Loading…</p>;
  if (!ok) return (<div className="mx-auto max-w-sm"><h1 className="mb-4 font-head text-4xl">Admin login</h1><input className="inp" type="email" placeholder="Email" value={em} onChange={e => setEm(e.target.value)} /><input className="inp" type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} /><p className="text-red-600">{err}</p><button className="btn w-full" onClick={login}>Log in</button></div>);
  return (<div><div className="mb-6 flex flex-wrap gap-2">{["products", "add", "orders"].map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-2 ${tab === t ? "bg-ink text-paper" : ""}`}>{t === "add" ? "Add product" : t[0].toUpperCase() + t.slice(1)}</button>)}<button className="ml-auto underline" onClick={async () => { await sb.auth.signOut(); setOk(false); }}>Log out</button></div>
    {tab === "products" && <Products />}{tab === "add" && <Add done={() => setTab("products")} />}{tab === "orders" && <Orders />}</div>);
}
function Products() {
  const [rows, setRows] = useState<any[]>([]); const load = () => sb.from("products").select("*,variants(*)").order("created_at", { ascending: false }).then(({ data }) => setRows(data || [])); useEffect(() => { load(); }, []);
  const toggle = async (p: any, k: string) => { await sb.from("products").update({ [k]: !p[k] }).eq("id", p.id); load(); };
  const del = async (p: any) => { if (!confirm("Delete " + p.name + "?")) return; await sb.from("products").delete().eq("id", p.id); load(); };
  const stock = async (v: any) => { const n = prompt(`New stock for ${v.size} / ${v.color}`, v.stock); if (n === null || isNaN(+n) || +n < 0) return; await sb.from("variants").update({ stock: Math.floor(+n) }).eq("id", v.id); load(); };
  if (!rows.length) return <p className="opacity-60">No products yet. Use Add product.</p>;
  return (<div className="space-y-4">{rows.map(p => <div key={p.id} className="flex gap-3 rounded-xl bg-white p-3">{p.images[0] && <img src={p.images[0]} alt="" className="h-24 w-20 rounded object-cover" />}<div className="flex-1"><p className="font-semibold">{p.name} · {inr(p.discount_price ?? p.price)} {p.hidden && <i className="text-red-600">(hidden)</i>}</p>
    <p className="text-sm">{p.variants.map((v: any) => <button key={v.id} className={`mr-2 underline ${v.stock < 5 ? "text-zest" : ""}`} onClick={() => stock(v)}>{v.size}/{v.color}: {v.stock}</button>)}</p>
    <p className="mt-1 space-x-3 text-sm"><button className="underline" onClick={() => toggle(p, "is_new_drop")}>{p.is_new_drop ? "Remove from drops" : "Make new drop"}</button><button className="underline" onClick={() => toggle(p, "best_seller")}>{p.best_seller ? "Unmark best seller" : "Mark best seller"}</button><button className="underline" onClick={() => toggle(p, "hidden")}>{p.hidden ? "Show" : "Hide"}</button><button className="text-red-600 underline" onClick={() => del(p)}>Delete</button></p></div></div>)}</div>);
}
function Add({ done }: { done: () => void }) {
  const [f, setF] = useState<any>({ name: "", description: "", category: "tshirts", price: "", discount_price: "", variants: "", is_new_drop: false, best_seller: false, drop_name: "" });
  const [files, setFiles] = useState<File[]>([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const move = (i: number) => { if (i < 1) return; const n = [...files]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setFiles(n); };
  const publish = async () => { setErr("");
    const vs = f.variants.split("\n").map((l: string) => l.split(",").map(s => s.trim())).filter((a: string[]) => a[0]).map((a: string[]) => ({ size: a[0], color: a[1], stock: parseInt(a[2], 10) }));
    if (f.name.trim().length < 2) return setErr("Enter a product name."); if (!(+f.price > 0)) return setErr("Enter a valid price."); if (f.discount_price && !(+f.discount_price > 0 && +f.discount_price < +f.price)) return setErr("Discount price must be lower than price.");
    if (!files.length) return setErr("Add at least one photo."); if (!vs.length || vs.some((v: any) => !v.color || isNaN(v.stock) || v.stock < 0)) return setErr("Variants: one per line as size,colour,stock (e.g. M,Black,10).");
    setBusy(true); try { const slug = slugify(f.name), urls: string[] = [];
      for (let i = 0; i < files.length; i++) { const b = await compress(files[i]); const path = `${slug}/${i}-${Date.now()}.webp`; const { error } = await sb.storage.from("products").upload(path, b, { contentType: "image/webp" }); if (error) throw error; urls.push(sb.storage.from("products").getPublicUrl(path).data.publicUrl); }
      const { data, error } = await sb.from("products").insert({ slug, name: f.name.trim(), description: f.description, category: f.category, price: +f.price, discount_price: f.discount_price ? +f.discount_price : null, images: urls, is_new_drop: f.is_new_drop, drop_name: f.drop_name || null, best_seller: f.best_seller }).select().single(); if (error) throw error;
      const { error: e2 } = await sb.from("variants").insert(vs.map((v: any) => ({ ...v, product_id: data.id }))); if (e2) throw e2; done();
    } catch (e: any) { setErr("Publish failed: " + (e.message || "unknown error")); } setBusy(false); };
  return (<div className="max-w-xl"><input className="inp" placeholder="Product name" value={f.name} onChange={e => set("name", e.target.value)} /><textarea className="inp" rows={3} placeholder="Description" value={f.description} onChange={e => set("description", e.target.value)} />
    <select className="inp" value={f.category} onChange={e => set("category", e.target.value)}><option value="tshirts">T-shirts</option><option value="denim">Denim</option><option value="shirts">Shirts</option></select>
    <div className="flex gap-2"><input className="inp" type="number" placeholder="Price ₹" value={f.price} onChange={e => set("price", e.target.value)} /><input className="inp" type="number" placeholder="Discount price ₹" value={f.discount_price} onChange={e => set("discount_price", e.target.value)} /></div>
    <textarea className="inp" rows={4} placeholder={"Sizes, colours and stock, one per line:\nM,Black,10\nL,Black,8"} value={f.variants} onChange={e => set("variants", e.target.value)} />
    <label className="mb-3 block"><input type="checkbox" checked={f.is_new_drop} onChange={e => set("is_new_drop", e.target.checked)} /> New drop</label>{f.is_new_drop && <input className="inp" placeholder="Drop name" value={f.drop_name} onChange={e => set("drop_name", e.target.value)} />}
    <label className="mb-3 block"><input type="checkbox" checked={f.best_seller} onChange={e => set("best_seller", e.target.checked)} /> Best seller</label>
    <input className="inp" type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />
    <div className="mb-3 flex flex-wrap gap-2">{files.map((x, i) => <div key={i} className="text-center text-xs"><img src={URL.createObjectURL(x)} alt="" className="h-24 w-20 rounded object-cover" />{i === 0 ? <b>Main</b> : <button className="underline" onClick={() => move(i)}>Move left</button>}</div>)}</div>
    <p className="mb-2 text-red-600" role="alert">{err}</p><button className="btn w-full" disabled={busy} onClick={publish}>{busy ? "Publishing…" : "Publish"}</button></div>);
}
function Orders() {
  const [rows, setRows] = useState<any[]>([]); const load = () => sb.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data || [])); useEffect(() => { load(); }, []);
  const set = async (id: string, status: string) => { await sb.from("orders").update({ status }).eq("id", id); load(); };
  if (!rows.length) return <p className="opacity-60">No orders yet.</p>;
  return (<div className="space-y-3">{rows.map(o => <div key={o.id} className="rounded-xl bg-white p-4"><div className="flex justify-between"><b>#{o.id.slice(0, 8).toUpperCase()} · {o.name}</b><b>{inr(o.total)}</b></div><p className="text-sm">{o.phone} · {o.address}</p>
    <ul className="my-2 text-sm">{o.items.map((x: any, i: number) => <li key={i}>{x.qty} × {x.name} ({x.color}, {x.size})</li>)}</ul><p className="text-xs opacity-60">{new Date(o.created_at).toLocaleString("en-IN")}</p>
    <select className="inp mt-2 !mb-0 !w-auto" value={o.status} onChange={e => set(o.id, e.target.value)}>{["new", "confirmed", "shipped", "delivered", "cancelled"].map(s => <option key={s}>{s}</option>)}</select></div>)}</div>);
}
