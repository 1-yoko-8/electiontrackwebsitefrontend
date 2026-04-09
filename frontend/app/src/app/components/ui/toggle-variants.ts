import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input",
      },
      size: {
        default: "h-9 px-2",
        sm: "h-8 px-1.5",
        lg: "h-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);