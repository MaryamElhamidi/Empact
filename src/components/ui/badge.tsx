import * as React from "react";
import * as SlotPrimitive from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm border border-transparent font-medium outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3.5",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-[22px] min-w-[22px] px-[3px] text-xs",
        lg: "h-[26px] min-w-[26px] px-[5px] text-sm",
        sm: "h-[18px] min-w-[18px] rounded px-[3px] text-[10px]",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        error:
          "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
        info:
          "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        outline:
          "border-border bg-background text-foreground hover:bg-accent/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success:
          "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
        warning:
          "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      },
    },
  },
);

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: VariantProps<typeof badgeVariants>["variant"];
  size?: VariantProps<typeof badgeVariants>["size"];
  render?: React.ReactElement;
  asChild?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  render,
  asChild = false,
  ...props
}: BadgeProps): React.ReactElement {
  const badgeClass = cn(badgeVariants({ variant, size }), className);

  if (render) {
    return React.cloneElement(render, {
      ...props,
      className: cn(badgeClass, (render.props as React.HTMLAttributes<HTMLElement>)?.className),
      "data-slot": "badge",
    } as React.HTMLAttributes<HTMLElement>);
  }

  const Comp = asChild ? SlotPrimitive.Slot : "span";
  return <Comp className={badgeClass} data-slot="badge" {...props} />;
}
