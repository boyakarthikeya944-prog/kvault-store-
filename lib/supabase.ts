import { createClient } from "@supabase/supabase-js";
export const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
export const getCart = (): any[] => { try { return JSON.parse(localStorage.getItem("kv-cart") || "[]"); } catch { return []; } };
export const setCart = (c: any[]) => { localStorage.setItem("kv-cart", JSON.stringify(c)); window.dispatchEvent(new Event("kv-cart")); };
