"use client";
import { useEffect, useState } from "react"; import { sb, inr, getCart, setCart } from "@/lib/supabase";
export default function Cart() {
  const [c, setC] = useState<any[]>([]); const [f, setF] = useState({ name: "", phone: "", address: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState("");
  useEffect(() => setC(getCart()), []); const upd = (n: any[]) => { setC(n); setCart(n); };
  const total = c.reduce((a, x) => a + x.price * x.qty, 0);
  const submit = async () => { setErr("");
    if (f.name.trim().length < 2) return setErr("Enter your name."); if (f.phone.replace(/\D/g, "").length < 10) return setErr("Enter a valid 10-digit phone number."); if (f.address.trim().length < 10) return setErr("Enter your full delivery address.");
    setBusy(true); const { data, error } = await sb.rpc("place_order", { p_name: f.name, p_phone: f.phone, p_address: f.address, p_items: c.map(x => ({ vid: x.vid, qty: x.qty })) }); setBusy(false);
    if (error) return setErr(error.message.includes("stock") ? "Some items are out of stock. Reduce quantity or remove them." : "Could not place order. Please try again."); upd([]); setDone(String(data).slice(0, 8).toUpperCase()); };
  if (done) return <div className="py-16 text-center"><h1 className="font-head text-5xl">Order placed</h1><p className="mt-2">Order number <b>{done}</b>. Pay on delivery. We will call you to confirm.</p></div>;
  if (!c.length) return <p className="p-10 text-center opacity-60">Your cart is empty.</p>;
  return (<div className="mx-auto max-w-xl"><h1 className="mb-4 font-head text-5xl">Cart</h1>
    {c.map((x, k) => <div key={x.vid} className="flex items-center gap-3 border-b py-3">{x.img && <img src={x.img} alt="" className="h-16 w-14 rounded object-cover" />}<div className="flex-1"><p className="font-semibold">{x.name}</p><p className="text-sm">{x.color} · {x.size} · {inr(x.price)}</p>
      <p className="text-sm">Qty {x.qty} <button className="ml-2 underline" onClick={() => upd(c.filter((_, j) => j !== k))}>Remove</button></p></div><b>{inr(x.price * x.qty)}</b></div>)}
    <p className="my-4 flex justify-between text-xl font-bold"><span>Total (Cash on Delivery)</span><span>{inr(total)}</span></p>
    <input className="inp" placeholder="Full name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input className="inp" type="tel" placeholder="Phone number" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
    <textarea className="inp" rows={3} placeholder="Delivery address with pincode" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
    <p className="mb-2 text-red-600" role="alert">{err}</p><button className="btn w-full" disabled={busy} onClick={submit}>{busy ? "Placing order…" : "Place order"}</button></div>);
}
