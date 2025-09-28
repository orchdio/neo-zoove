// fixme: properly add custom toast styles when the need is justified. keeping it messy
// for a reason for now

import type React from "react";
import type { ToasterProps as Props } from "sonner";
import { toast as sonnerToast } from "sonner";

interface ToastProps extends Props {
  id?: string | number;
  title: string;
  description: string | React.ReactNode;
  button?: {
    label: string;
    onClick: () => void;
  };
  closeButton?: boolean;
  variant?: "success" | "info" | "warning" | "danger" | "default";
}

interface Variants {
  [key: string]: ToastProps["style"];
}

const variantsStyles: Variants = {
  success: {
    backgroundColor: "#74C591",
    color: "black",
  },
  warning: {
    backgroundColor: "#F37677",
    color: "black",
  },
  default: {},
};

const Toast = (props: ToastProps) => {
  const { title, description, button, id } = props;

  return (
    <div className="flex rounded-lg bg-white shadow-lg ring-1 ring-black/5 w-full md:max-w-[364px] items-center p-4">
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {/*<div className="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"></div>*/}
    </div>
  );
};

export function toast(props: ToastProps) {
  sonnerToast(props?.title, {
    ...props,
    position: props.position,
    description: props.description,
    closeButton: true,
    style: {
      ...props.style,
      ...variantsStyles[props.variant ?? "default"],
    },
  });
}
