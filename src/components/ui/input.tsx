import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-transparent text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ghost: "border-transparent bg-secondary focus-visible:bg-secondary/80 focus-visible:ring-0",
        glass: "glass focus-visible:ring-2 focus-visible:ring-ring",
        glow: "border-primary/30 focus-visible:border-primary focus-visible:shadow-glow focus-visible:ring-0",
      },
      inputSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-1",
        lg: "h-12 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
