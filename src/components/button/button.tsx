import type { VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import {
  type buttonVariants,
  Button as ShadCNButton,
} from "@/components/ui/button";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;
const Button = (props: ButtonProps) => {
  // merge tailwind classnames
  const mergedStyles = twMerge("text-center px-6 rounded-sm", props?.className);
  return <ShadCNButton {...props} className={mergedStyles} />;
};

export default Button;
