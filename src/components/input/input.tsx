import type { HTMLProps } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends HTMLProps<HTMLInputElement> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = (props: InputProps) => {
  const mergedStyles = twMerge(
    "px-4 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed",
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
