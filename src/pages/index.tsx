import Layout from "@/components/layout";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";

export default function Home() {
  const { setTheme } = useTheme();

  return (
    <div>
      <span>Hello</span>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout seo={{}}>{page}</Layout>;
};
