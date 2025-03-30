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

// export function toast(props: Omit<ToastProps, "id">) {
//   return <Toaster {...props} />;
//   // return sonnerToast.custom((id) => {
//   //   return <Toast id={id} button={props.button} {...props} />;
//   // });
// }

// export default function Headless() {
//     return (
//         <button
//             className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
//             onClick={() => {
//                 toast({
//                     title: 'This is a headless toast',
//                     description: 'You have full control of styles and jsx, while still having the animations.',
//                     button: {
//                         label: 'Reply',
//                         onClick: () => sonnerToast.dismiss(),
//                     },
//                 });
//             }}
//         >
//             Render toast
//         </button>
//     );
// };
// <button
//     className="rounded bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
//     onClick={() => {
//         button.onClick();
//         sonnerToast.dismiss(id);
//     }}
// >
//     {button.label}
// </button>
