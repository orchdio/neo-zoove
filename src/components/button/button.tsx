import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}
const Button = (props: ButtonProps) => {
  // merge tailwind classnames
  const mergedStyles = twMerge(
    "text-center px-6 w-full rounded-sm",
    props?.className,
  );
  return (
    <button type={"button"} className={mergedStyles} {...props}>
      {props?.text}
    </button>
  );
};

export default Button;
