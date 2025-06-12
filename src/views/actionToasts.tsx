import type { ToasterProps } from "sonner";
import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";

export const SuccessToast = ({
  title,
  position,
  description,
  duration,
}: {
  title: string;
  position: ToasterProps["position"];
  description: string;
  duration?: number;
}) => {
  return toast({
    title,
    position,
    description: <Text content={description} className={"text-black"} />,
    duration: duration ?? 4000,
    variant: "success",
  });
};

export const WarnToast = ({
  title,
  position,
  description,
  duration,
}: {
  title: string;
  position: ToasterProps["position"];
  description: string;
  duration?: number;
}) => {
  return toast({
    title,
    position,
    description: <Text content={description} className={"text-black"} />,
    duration: duration ?? 10000,
    variant: "warning",
  });
};

export const UnknownErrorToast = () => {
  return toast({
    title: "🙈 Uh-oh! That was embarrassing",
    position: "top-right",
    description: (
      <Text
        content={"Something went wrong, please try again."}
        className={"text-black"}
      />
    ),
    variant: "warning",
  });
};

export const InvalidTargetPlatformSelectionErrorToast = (value: string) => {
  return toast({
    title: "🚨 Uh-oh! You cannot do that.",
    position: "top-right",
    description: (
      <Text
        content={`You are already trying to convert a ${value} playlist. Please choose another option apart from ${value}.`}
        className={"text-black"}
      />
    ),
    variant: "warning",
  });
};
