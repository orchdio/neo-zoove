import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Text from "@/components/text/text";
import { MailIcon } from "lucide-react";

const Waitlist = () => {
  return (
    <div className={"justify-center"}>
      <div className={"flex flex-row space-x-2 items-center"}>
        <div className="relative flex h-8 flex-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
            <MailIcon className="h-5 w-5 text-blue-500" />
          </div>
          <Input
            type="email"
            id="email"
            placeholder="Join our wait list"
            className="w-full rounded-md py-1 pl-10 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:ring dark:ring-gray-500"
          />
        </div>
        <Button
          variant={"secondary"}
          className={"bg-zoove-blue-400 dark:bg-transparent"}
        >
          <Text
            content={"Add me"}
            className={"dark:text-zoove-blue-100 text-white"}
          />
        </Button>
      </div>
      <Text
        content={`We'll never spam you.`}
        className={"text-xs dark:text-zoove-gray-300 text-zoove-gray"}
      />
    </div>
  );
};

export default Waitlist;
