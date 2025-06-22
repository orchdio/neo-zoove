import { MoonIcon, SunIcon } from "lucide-react";
import { router } from "next/client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import Button from "@/components/button/button";
import { useAuthStatus } from "@/hooks/useAuth";
import { ConnectedPlatformsDialog } from "@/views/ConnectedPlatformsDialog";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { isSignedIn, zooveUser } = useAuthStatus();

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
              {/** todo: return the needed field (connected platforms) from API & update here.*/}
              {isSignedIn && (
                <ConnectedPlatformsDialog
                  activePlatforms={zooveUser?.platforms}
                />
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
