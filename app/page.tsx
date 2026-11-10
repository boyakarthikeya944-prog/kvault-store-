import Link from "next/link"; import List from "@/components/List";
export default function Home() {
  return (<div className="space-y-12">
    <section className="rounded-3xl bg-ink p-8 text-paper md:p-16"><h1 className="font-head text-6xl leading-none md:text-8xl">WEAR THE <span className="text-lime">VAULT.</span></h1>
      <p className="mt-4 max-w-md opacity-80">Streetwear from Anantapur. Tees, denim and shirts in limited drops.</p><Link href="/drops" className="btn mt-6 !bg-zest">Shop now</Link></section>
    <section><h2 className="mb-3 font-head text-4xl">Latest Drops</h2><List drops limit={4} /></section>
    <section className="grid gap-4 md:grid-cols-3">{[["T-shirts", "tshirts", "bg-volt text-white"], ["Denim", "denim", "bg-lime"], ["Shirts", "shirts", "bg-lav"]].map(([t, c, k]) => <Link key={c} href={`/c/${c}`} className={`rounded-2xl p-10 font-head text-4xl ${k}`}>{t}</Link>)}</section>
    <section><h2 className="mb-3 font-head text-4xl">Best Sellers</h2><List best limit={4} /></section></div>);
}
