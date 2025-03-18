import { ThemeProvider as NextThemeProvider } from "next-themes";

export const ThemeProvider = (
  props: React.ComponentProps<typeof NextThemeProvider>,
) => {
  return <NextThemeProvider {...props}>{props?.children}</NextThemeProvider>;
};
