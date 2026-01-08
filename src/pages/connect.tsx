import Script from "next/script";
import type { ReactElement } from "react";
import Layout from "@/components/layout";
import type { ServerSideProps } from "@/lib/blueprint";
import { ConnectPlatformDialog } from "@/views/ConnectPlatformDialog";
import DefaultSeoConfig from "../../next-seo.config";

export default function Connect() {
  return (
    <>
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("AppleID JS loaded and available..");
        }}
      />
      <Script
        src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Apple MusicKit JS loaded and available");
        }}
      />
      <ConnectPlatformDialog
        platforms={["spotify", "deezer", "applemusic", "soundcloud"]}
      />
    </>
  );
}

Connect.getLayout = function getLayout(page: ReactElement<ServerSideProps>) {
  return <Layout seo={{ ...DefaultSeoConfig }}>{page}</Layout>;
};
