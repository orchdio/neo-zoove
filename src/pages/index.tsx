import {useTheme} from "next-themes";
import type {ReactElement} from "react";
import Layout from "@/components/layout";

export default function Home() {
  const { setTheme } = useTheme();

  return (
    <div>
      <div className={"flex flex-row justify-between"}>
        <span
          onClick={() => {
            console.log("Clicking to change theme");
            setTheme("light");
          }}
        >
          light
        </span>
        <span onClick={() => setTheme("dark")}>dark</span>
      </div>
      <span>Hello</span>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout seo={{}}>{page}</Layout>;
};
