interface Props {
  title: string;
  text: string;
  url: string;
}

export const useShareResults = ({ title, text, url }: Props) => {
  return {
    share: async () => {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        console.log("Unexpected error triggering native share", e);
      }
    },
  };
  // try {
  //   await navigator.share({ title, text, url });
  // } catch (e) {
  //   console.log("Unexpected error triggering native share", e);
  // }
  // return {};
};
