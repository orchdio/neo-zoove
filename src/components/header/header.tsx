import { MoonIcon, SunIcon } from "lucide-react";
import { router } from "next/client";
import Image from "next/image";
import Link from "next/link"; // todo: remove zoovetkn from being set in the localstorage.
import { useTheme } from "next-themes";
import Button from "@/components/button/button";
import { useAuthStatus } from "@/hooks/useAuth";
import { getPlatformPrettyNameByKey } from "@/lib/utils"; // todo: remove zoovetkn from being set in the localstorage.

// todo: remove zoovetkn from being set in the localstorage.
export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { disconnectAccount, isSignedIn, zooveUser } = useAuthStatus();
  const signedInPlatform = getPlatformPrettyNameByKey(zooveUser?.platform);

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container items-center">
          <div className="navbar-header flex flex-row justify-between mx-2 p-4">
            <Image
              alt={"zoove logo — googly eyes"}
              src={`/zoove-logo-${resolvedTheme ?? "dark"}.svg`}
              onClick={() => router.push({ pathname: "/" })}
              width={81}
              height={43}
            />
            <div className={"flex flex-row items-center space-x-3"}>
              <div
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
              >
                {resolvedTheme === "light" ? (
                  <MoonIcon size={"20px"} />
                ) : (
                  <SunIcon size={"20px"} />
                )}
              </div>
              {isSignedIn && (
                <Button
                  className={"bg-zoove-blue-100 p-2 rounded-sm text-black"}
                >
                  <Image
                    src={`${zooveUser?.platform}/icons/${resolvedTheme ?? "light"}.svg`}
                    alt={`${signedInPlatform} icon`}
                    height={21}
                    width={21}
                  />
                  <span onClick={disconnectAccount}>Disconnect</span>
                </Button>
              )}

              {!isSignedIn && (
                <Button
                  className={"bg-zoove-blue-100 p-2 rounded-sm text-black"}
                >
                  <Link href={"/connect"}>Connect platform</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
