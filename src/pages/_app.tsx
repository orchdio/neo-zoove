import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import posthog from "posthog-js";
import { type ReactElement, type ReactNode, useEffect } from "react"; // biome-ignore lint/complexity/noBannedTypes: not sure how to shut linter up here and its not worth fighting the checker because of this. waste of time

// biome-ignore lint/complexity/noBannedTypes: not sure how to shut linter up here and its not worth fighting the checker because of this. waste of time
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // posthog config
  useEffect(() => {
    posthog
      .init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: "always",
        capture_pageview: false,
        debug: false,
        loaded: (posthog) => {
          // if (process.env.NODE_ENV === "development") posthog.debug();
        },
      })
      .debug(false);

    const handleRouteChange = () => posthog?.capture("$pageview");
    Router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ThemeProvider
      attribute={"class"}
      defaultTheme={"system"}
      enableSystem
      disableTransitionOnChange
    >
      {getLayout(<Component {...pageProps} />)}
    </ThemeProvider>
  );
}
