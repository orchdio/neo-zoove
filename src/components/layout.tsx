import { Footer } from "@/components/footer/footer";
import { Header } from "@/components/header/header";
import { Toaster } from "@/components/ui/sonner";
import { NextSeo } from "next-seo";
import type React from "react";

interface LayoutProps {
  // fixme: using any for now. properly type when its appropriate.
  seo: any;
  children?: React.ReactNode;
}
const Layout = ({ seo = {}, children }: LayoutProps) => {
  return (
    <>
      <NextSeo {...seo} />
      <div className={"flex flex-col min-h-screen mx-4"}>
        <Header />
        <main className={"flex-grow"}>{children}</main>
        <Toaster />
        <Footer />
      </div>
    </>
  );
};

export default Layout;
