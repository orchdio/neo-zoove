interface Props {
  title: string;
  text: string;
  url: string;
}

export const useShareResults = async ({ title, text, url }: Props) => {
  try {
    await navigator.share({ title, text, url });
  } catch (e) {
    console.log("Unexpected error triggering native share", e);
  }
  return {};
};
