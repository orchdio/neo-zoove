import { fromUnixTime, isAfter } from "date-fns";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { useRouter } from "next/router";
import React from "react";
import type { AuthJWTPayload } from "@/lib/blueprint";

export function useAuthStatus() {
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const [zooveUser, setZooveUser] = React.useState<{
    email: string;
    platform: string;
    uuid: string;
    username?: string;
  }>({
    email: "",
    platform: "",
    uuid: "",
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
      const { exp, email, platform, uuid } =
        decodedToken.payload as AuthJWTPayload;

      if (isAfter(fromUnixTime(exp), new Date())) {
        localStorage.setItem("zoovetkn", token as string);
        localStorage.setItem(
          "zoove-user",
          JSON.stringify({ email, platform, uuid }),
        );
        setIsSignedIn(true);
        setZooveUser({ email, platform, uuid });
        if (router.query.token) {
          router.replace(router.route, router.route, { shallow: true });
        }
      }
    } catch (e) {
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

  return { isSignedIn, disconnectAccount, zooveUser, setZooveUser };
}
