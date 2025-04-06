import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";

export const MaxResultsToast = () => {
  return toast({
    title: "Large playlist result",
    description: (
      <Text
        content={
          "🫶 We can only show 20 results for now. We will address this soon"
        }
        className={"text-black"}
      />
    ),
    duration: 6000,
    variant: "warning",
    position: "top-right",
  });
};

export const PlaylistConversionStartedToast = () => {
  return toast({
    title: "🎉 Your playlist conversion has started",
    position: "top-right",
    description: (
      <Text
        content={
          "We've started processing your playlist, you'll start seeing the results shortly"
        }
        className={"text-black"}
      />
    ),
    variant: "success",
    duration: 4000,
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

export const UnsupportedPlatformErrorToast = () => {
  return toast({
    title: "💔 We're sorry, you cannot do that yet",
    position: "top-right",
    description: (
      <Text
        content={`We're improving our Apple Music support and it'll be available soon, please bear with us and check back`}
        className={"text-black"}
      />
    ),
    variant: "warning",
    duration: 10000,
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

export const ConversionCompleteToast = () => {
  return toast({
    title: "All done!",
    description: (
      <Text
        content={"🎉 Your conversion is ready, you can see your results below"}
        className={"text-black"}
      />
    ),
    variant: "success",
    position: "top-right",
  });
};
