import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariants } from "./button-variants";
import type { VariantProps } from "class-variance-authority";
import { cn } from "./utils";

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };