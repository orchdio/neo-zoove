import { useCallback, useState } from "react";
import { toast } from "@/components/toast/toast";
import {
  capitalizeFirstLetter,
  fetchOriginalUrl,
  isMagicURL,
} from "@/lib/utils";

interface UseLinkResolverOptions {
  onLinkResolved?: (resolvedLink: string) => void;
  unsupportedEntities?: string[];
  enableToast?: boolean;
}

export const useLinkResolver = ({
  onLinkResolved,
  unsupportedEntities = ["album"],
  enableToast = true,
}: UseLinkResolverOptions = {}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedLink, setResolvedLink] = useState<string | null>(null);

  const resolveLink = useCallback(
    async (link: string) => {
      // check if it's a magic/short URL
      const isShortLink = isMagicURL(link);

      // strip query parameters
      const strippedURL =
        link?.indexOf("?") !== -1
          ? (link?.substring(0, link?.indexOf("?")) as string)
          : (link as string);

      if (!isShortLink) {
        // if not a short link, return the original link
        onLinkResolved?.(strippedURL);
        return strippedURL;
      }

      setIsResolving(true);

      try {
        const result = await fetchOriginalUrl(strippedURL);

        // check for unsupported entities
        const unsupportedEntity = unsupportedEntities.find((entity) =>
          result.includes(entity),
        );

        if (unsupportedEntity && enableToast) {
          toast({
            title: `Your link is ${unsupportedEntity === "album" ? "an" : "a"} ${unsupportedEntity}`,
            position: "top-right",
            description: (
              <span className={"text-black"}>
                {`💔 ${capitalizeFirstLetter(unsupportedEntity)} conversion is not supported yet`}
              </span>
            ),
            closeButton: true,
            variant: "warning",
            duration: 10000,
          });

          setIsResolving(false);
          return null;
        }

        setResolvedLink(strippedURL);
        setIsResolving(false);

        // call the optional callback
        onLinkResolved?.(strippedURL);

        return strippedURL;
      } catch (error) {
        setIsResolving(false);

        if (enableToast) {
          toast({
            title: "Uh-oh! Something is not right",
            position: "top-right",
            description: (
              <span className={"text-black"}>
                {`💔 Something went wrong while trying to preview your magic link. We're not sure exactly why, please try again.`}
              </span>
            ),
            closeButton: true,
            variant: "warning",
            duration: 10000,
          });
        }

        return link;
      }
    },
    [onLinkResolved, unsupportedEntities, enableToast],
  );

  return {
    resolveLink,
    isResolving,
    resolvedLink,
  };
};
