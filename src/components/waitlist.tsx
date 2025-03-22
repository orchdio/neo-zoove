import Button from "@/components/button/button";
import Text from "@/components/text/text";
import { MailIcon } from "lucide-react";

const Waitlist = () => {
  return (
    <div>
      <div className={"flex flex-row space-x-2"}>
        <div className="relative flex h-8 flex-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
            <MailIcon className="h-5 w-5 text-blue-500" />
          </div>
          <input
            type="email"
            id="email"
            placeholder="Join our wait list"
            className="w-full rounded-md outline border  py-1 pl-10 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <Button
          text={"Sign me up"}
          className={
            "rounded-sm text-zoove-blue-100 h-8 bg-transparent outline outline-zoove-blue-100 px-6 text-sm"
          }
        />
      </div>
      <Text
        content={`We'll never spam you.`}
        className={"text-xs text-zoove-gray-300"}
      />
    </div>
  );
};

export default Waitlist;
