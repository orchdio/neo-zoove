import type { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends HTMLProps<HTMLInputElement> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = (props: InputProps) => {
  const mergedStyles = twMerge(
    `px-4 py-2 text-lg ${props?.disabled ? "ring-2 ring-zoove-blue-400 opacity-50" : "ring-2 ring-zoove-blue-100"}  rounded-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed`,
    props?.className,
  );
  return (
    <input
      type="search"
      name="link"
      placeholder="Paste song or playlist link"
      {...props}
      className={mergedStyles}
      onChange={props.onChange}
    />
  );
};

export default Input;
