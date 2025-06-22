import { fromUnixTime, isBefore } from "date-fns";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { useRouter } from "next/router";
import React from "react";
import type { AuthJWTPayload, UserPlatformInfo } from "@/lib/blueprint";

export function useAuthStatus() {
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const [zooveUser, setZooveUser] = React.useState<{
    email: string;
    platforms: UserPlatformInfo[];
    uuid: string;
    username?: string;
    last_authed_platform: string;
  }>({
    email: "",
    platforms: [],
    uuid: "",
    last_authed_platform: "",
  });
  const router = useRouter();

  React.useEffect(() => {
    if (isSignedIn) return;

    const token = router.query.token ?? localStorage.getItem("zoovetkn");
    if (_.isEmpty(token)) return;

    try {
      const decodedToken = jwt.decode(token as string, { complete: true });
      if (!decodedToken) {
        setIsSignedIn(false);
        return;
      }
      const { exp, email, platforms, uuid, last_authed_platform } =
        decodedToken.payload as AuthJWTPayload;

      if (isBefore(new Date(), fromUnixTime(exp))) {
        localStorage.setItem("zoovetkn", token as string);
        localStorage.setItem(
          "zoove-user",
          JSON.stringify({ email, platforms, uuid }),
        );
        setIsSignedIn(true);
        setZooveUser({ email, platforms, uuid, last_authed_platform });
        if (router.query.token) {
          router.replace(router.route, router.route, { shallow: true });
        }
        return;
      }
      localStorage.removeItem("zoovetkn");
      localStorage.removeItem("zoove-user");

      return;
    } catch (_e) {
      if (router.query.token) {
        router.replace(router.route, router.route, { shallow: true });
      }
    }
  }, [router, isSignedIn]);

  const disconnectAccount = React.useCallback(() => {
    localStorage.removeItem("zoovetkn");
    localStorage.removeItem("zoove-user");
    setIsSignedIn(false);
    setZooveUser({} as any);

    router.replace(router.route);
  }, [router]);

  const disconnectPlatform = React.useCallback((platform: string) => {
    // we have gotten the platform we want to delete from:
    // after that, we delete this item from the user's "platforms" field in the currently set "user" object
    const userObj = localStorage.getItem("zoove-user");

    if (userObj) {
      const userObject = JSON.parse(userObj) as AuthJWTPayload;
      const filteredPlatforms: UserPlatformInfo[] = userObject.platforms.filter(
        (p) => p.platform !== platform,
      );

      if (filteredPlatforms.length === 0) {
        localStorage.removeItem("zoovetkn");
        localStorage.removeItem("zoove-user");
        setIsSignedIn(false);
        return;
      }

      const updatedUserObject = { ...userObject, platforms: filteredPlatforms };
      localStorage.setItem("zoove-user", JSON.stringify(updatedUserObject));
    }
  }, []);

  return {
    isSignedIn,
    disconnectAccount,
    zooveUser,
    setZooveUser,
    disconnectPlatform,
  };
}
