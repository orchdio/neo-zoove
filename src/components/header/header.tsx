import Button from "@/components/button/button";
import Text from "@/components/text/text";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container items-center">
          <div className="navbar-header flex flex-row justify-between mx-2 p-4">
            <img
              alt={"zoove logo — googly eyes"}
              src={`/zoove-logo-${resolvedTheme ?? "dark"}.svg`}
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
              {/**todo: button component*/}
              <Button className={"bg-zoove-blue-100 p-2 rounded-sm text-black"}>
                <Text content={"Connect platform"} />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
