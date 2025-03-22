import Button from "@/components/button/button";
import Layout from "@/components/layout";
import ZooveIcon from "@/components/zooveicon";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";

export default function Home() {
  const { setTheme } = useTheme();
  const MotionHeading = motion("h2");

  return (
    <div className={"flex flex-col items-center px-4"}>
      <div className={"flex flex-col items-center container py-24 relative"}>
        <ZooveIcon height={"auto"} className="w-32 h-auto" />
        <h1
          className="animated-heading"
          style={{
            fontSize: "clamp(3rem, 5vw, 4.5rem)",
            textAlign: "center",
            backgroundColor: "var(--color-header-background)",
            color: "transparent",
            backgroundImage: "var(--gradient-color)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            backgroundPosition: "-20% 100%",
            backgroundSize: "var(--bg-size)",
            backgroundRepeat: "no-repeat",
          }}
        >
          Share Music Without Boundaries
        </h1>

        {/**platform icons*/}
        <div>
          <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[12%] top-16 -z-10 pointer-events-none flex items-center justify-center">
            <img
              alt="Apple music icon"
              src="/applemusic/icons/light.svg"
              className="w-5 h-5"
            />
          </div>

          <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[80%] top-52 -z-10 pointer-events-none flex items-center justify-center">
            <img
              alt="Deezer icon"
              src="/deezer/icons/light.svg"
              className="w-4.5 h-4.5"
            />
          </div>

          <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[5%] top-52 -z-10 pointer-events-none flex items-center justify-center">
            <img
              alt="Spotify icon"
              src="/spotify/icons/light.svg"
              className="w-5 h-5"
            />
          </div>

          <div className="absolute w-10 h-10 bg-white shadow-xl rounded-full left-[75%] top-16 -z-10 pointer-events-none flex items-center justify-center">
            <img
              alt="Tidal icon"
              src="/tidal/icons/light.svg"
              className="w-5 h-5"
            />
          </div>
        </div>

        <span
          className={
            "py-2 text-center mt-4 dark:text-zoove-gray-300 light: text-black"
          }
        >
          Share songs and playlists across different streaming platforms with
          just one link.
        </span>

        <div className="w-full mt-16 flex flex-col space-y-2">
          <div className="relative">
            <input
              // disabled={maintenanceMode}
              type="search"
              name="link"
              className="w-full h-12 px-4 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Paste song or playlist link"
              // value={link}
              // onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <Button
            text={"Go"}
            className={
              "dark:text-black text-white bg-zoove-blue-100 rounded-sm h-10"
            }
          />
        </div>
      </div>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout seo={{}}>{page}</Layout>;
};
