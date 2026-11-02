import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:bg-hairline disabled:text-muted active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-active",
        secondary:
          "bg-canvas text-ink shadow-[0_0_0_1px_var(--color-hairline)] hover:shadow-[0_0_0_1px_var(--color-muted-soft)]",
        ghost: "bg-transparent text-ink hover:bg-surface-soft",
        dark: "bg-surface-dark-elevated text-on-dark hover:bg-surface-dark-soft",
      },
      size: {
        md: "h-11 rounded-md px-5",
        sm: "h-9 rounded-md px-3.5 text-[13px]",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
