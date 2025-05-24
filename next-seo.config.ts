import type {DefaultSeoProps} from "next-seo";

const DefaultSeoConfig: DefaultSeoProps = {
  titleTemplate: "%s | Zoove",
  defaultTitle: "Zoove • Share music without boundaries.",
  description: "Easiest way to share music across digital streaming platforms.",
  openGraph: {
    type: "website",
    siteName: "Zoove",
    // todo: fetch this domain dynamically. Probably via an env config, or via parsing the host.
    url: process.env.NEXT_PUBLIC_ZOOVE_HOST ?? "https://zoove.xyz",
    images: [
      {
        url: "https://zoove.xyz/zoove.svg",
        alt: "Zoove logo",
      },
    ],
  },
  additionalMetaTags: [],
};

export default DefaultSeoConfig;
