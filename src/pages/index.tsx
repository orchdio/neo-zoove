import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Layout from "@/components/layout";
import ZooveIcon from "@/components/zooveicon";
import {
  capitalizeFirstLetter,
  fetchOriginalUrl,
  isMagicURL,
  isValidURL,
} from "@/lib/utils";
import HeadIcons from "@/views/HeadIcons";
import { useTheme } from "next-themes";
import { type ReactElement, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [goButtonIsDisabled, setGoButtonIsDisabled] = useState(true);
  const [link, setLink] = useState<string>("");

  const { theme } = useTheme();

  const maintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "maintenance";
  // disable go button
  const disableGoButton = maintenanceMode || goButtonIsDisabled;

  useEffect(() => {
    const isValidLink = isValidURL(link);
    if (!isValidLink || !link) {
      setGoButtonIsDisabled(true);
      return;
    }

    console.log("Link value is....", link);
    const isShortLink = isMagicURL(link);

    console.log("Is valid link...", isShortLink);
    if (isShortLink) {
      fetchOriginalUrl(link).then((result) => {
        // show toast message for unsupported "entities", for now
        const unsupportedEntity = ["album"].find((entity) =>
          result.includes(entity),
        );

        if (unsupportedEntity) {
          toast(
            `Your link is ${unsupportedEntity === "album link" ? "an" : "a"} ${unsupportedEntity}`,
            {
              position: "top-right",
              description: (
                <span className={"text-black"}>
                  {`💔 ${capitalizeFirstLetter(unsupportedEntity)} conversion is not supported yet`}
                </span>
              ),
              closeButton: true,
              style: {
                backgroundColor: "#F37677",
                color: "black",
              },
              duration: 2000,
            },
          );
          return;
        }

        if (result?.preview?.url.includes("playlist")) {
          // todo: set playlist related state
        }

        const strippedURL =
          result?.indexOf("?") !== -1
            ? (result?.substring(0, result?.indexOf("?")) as string)
            : (result as string);
        setLink(strippedURL);
        setGoButtonIsDisabled(false);
      });
      return;
    }

    setGoButtonIsDisabled(false);
  }, [link]);

  const handleGoButtonClick = async () => {};

  return (
    <div className={"flex flex-col items-center px-4"}>
      <div
        className={
          "flex flex-col items-center py-24 relative md:mx-32 lg:mx-48"
        }
      >
        <ZooveIcon height={"auto"} className="w-40 h-auto" />
        <h1
          className="animated-heading font-bold text-5xl md:text-7xl"
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
        <HeadIcons />
        <span
          className={
            "py-2 text-center mt-10 dark:text-zoove-gray-300 light: text-black"
          }
        >
          Share songs and playlists across different streaming platforms with
          just one link.
        </span>

        <div className="w-full mt-10 flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-x-3">
          <Input
            disabled={maintenanceMode}
            placeholder="Paste track or playlist link"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
            }}
            className={"w-full flex-auto h-14 rounded-sm px-2"}
          />
          <Button
            text={"Go"}
            className={
              "dark:text-black text-white bg-zoove-blue-100 rounded-sm h-10 md:w-48 mb-2 disabled:cursor-not-allowed disabled:opacity-50"
            }
            disabled={disableGoButton}
            onClick={handleGoButtonClick}
          />
        </div>
      </div>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout seo={{}}>{page}</Layout>;
};
