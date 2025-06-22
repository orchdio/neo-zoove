import Text from "@/components/text/text";
import Waitlist from "@/components/waitlist";

export const Footer = () => {
  return (
    <footer className="footer mb-4">
      <div className={"mt-auto flex flex-col md:flex-row md:justify-between"}>
        <div
          className={
            "text-zoove-gray-300 mt-8 md:mt-0 md:items-center order-2 md:order-1"
          }
        >
          <span className={"text-zoove-blue-100 font-bold text-lg"}>
            😚 zoove
          </span>
          <Text
            content={` - Copyright @${new Date().getFullYear()}.`}
            className={"dark:text-white text-black"}
          />
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
            className={"text-sm text-center dark:text-white text-black"}
          />
        </div>
        <div className={"order-1 md:order-2 md:w-96 lg:w-[32rem]"}>
          <Waitlist show_label placeholder={"Join our waitlist"} />
        </div>
      </div>
    </footer>
  );
};
