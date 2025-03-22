import Text from "@/components/text/text";
import Waitlist from "@/components/waitlist";

export const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <Waitlist />
      <div className={"text-zoove-gray-300 mt-10"}>
        <span className={"text-white font-bold text-lg"}>😚 zoove</span>
        <Text content={` - Copyright @${new Date().getFullYear()}.`} />
        &nbsp;
        <Text
          content={
            <span>
              An{" "}
              <span>
                <a
                  href={"https://orchdio.com"}
                  target={"_blank"}
                  rel="noreferrer"
                  className={"underline font-bold"}
                >
                  Orchdio Labs
                </a>
              </span>
              &nbsp;product.
            </span>
          }
          className={"text-sm text-center"}
        />
      </div>
    </footer>
  );
};
