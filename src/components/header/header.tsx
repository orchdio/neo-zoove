import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container items-center">
          <div className="navbar-header flex flex-row justify-between mx-2 p-4">
            <img
              alt={"zoove logo — googly eyes"}
              src={`/zoove-logo-${theme ?? "dark"}.svg`}
            />
            <div className={"flex flex-row items-center space-x-3"}>
              <div
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "light" ? (
                  <MoonIcon size={"20px"} />
                ) : (
                  <SunIcon size={"20px"} />
                )}
              </div>
              {/**todo: button component*/}
              <button
                type={"button"}
                className={"bg-zoove-blue-100 p-2 rounded-sm text-black"}
              >
                Connect account
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
