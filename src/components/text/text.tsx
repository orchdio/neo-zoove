import type { HTMLProps } from "react";
import { twMerge } from "tailwind-merge"; // --
// --

// not sure how to fix this linting issue, how to properly extend the elements. Will ignore for now
// @ts-ignore
interface TextProps extends HTMLProps<HTMLSpanElement> {
  content: string | React.ReactElement;
}

const Text = (props: TextProps) => {
  const mergedStyle = twMerge(props?.className);
  return (
    <span className={twMerge(mergedStyle, props.className)}>
      {props.content}
    </span>
  );
};

export default Text;
