import List from "@/components/List";
const N: any = { tshirts: "T-shirts", denim: "Denim", shirts: "Shirts" };
export default function Cat({ params }: { params: { cat: string } }) {
  return (<div><h1 className="mb-4 font-head text-5xl">{N[params.cat] || "Collection"}</h1><List cat={params.cat} tools /></div>);
}
