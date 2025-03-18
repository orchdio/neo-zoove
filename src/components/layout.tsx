import {Header} from "@/components/header/header";
import {NextSeo} from "next-seo";
import type React from "react";
import {Footer} from "@/components/footer/footer";

interface LayoutProps {
  // fixme: using any for now. properly type when its appropriate.
  seo: any;
  children?: React.ReactNode;
}
const Layout = ({ seo = {}, children }: LayoutProps) => {
  return (
    <>
      <div className={"flex flex-col min-h-screen"}>
        <NextSeo {...seo} />

        <Header />
        <main className={"flex-grow"}>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
