import type { ReactElement } from "react";
import Layout from "@/components/layout";
import type { ServerSideProps } from "@/lib/blueprint";
import { ConnectPlatformDialog } from "@/views/ConnectPlatformDialog";
import DefaultSeoConfig from "../../next-seo.config";

export default function Connect() {
  return (
    <>
      <ConnectPlatformDialog platforms={["spotify", "deezer", "applemusic"]} />
    </>
  );
}

Connect.getLayout = function getLayout(page: ReactElement<ServerSideProps>) {
  return <Layout seo={{ ...DefaultSeoConfig }}>{page}</Layout>;
};
