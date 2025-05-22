interface Props {
  title: string;
  text: string;
  url: string;
}

export const useShareResults = async ({ title, text, url }: Props) => {
  console.log({ title, text, url });

  try {
    await navigator.share({ title, text, url });
  } catch (e) {}

  // trigger share
  return {};
};
