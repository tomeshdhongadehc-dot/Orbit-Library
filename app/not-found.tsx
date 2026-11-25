import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">404</p>
      <h1 className="text-3xl font-extrabold">That page is not in the library</h1>
      <p className="o-lead">It may have moved, been switched off, or never existed. Try the list of all items.</p>
      <div className="flex gap-3">
        <Button render={<Link href="/items" />}>All items</Button>
        <Button render={<Link href="/" />} variant="outline">Home</Button>
      </div>
    </div>
  );
}
