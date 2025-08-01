import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convinient.store - Home",
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
