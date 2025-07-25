import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextCommerce | Nextjs E-commerce template",
  description: "This is Home for Convinient.store",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
