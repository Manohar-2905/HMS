import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-primary to-orange-600 text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/30%)] hover:shadow-[0_6px_20px_hsl(var(--primary)/40%)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 rounded-full border border-primary/20",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-sm hover:shadow-md transition-all",
                outline:
                    "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-full transition-all",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full shadow-sm hover:shadow-md transition-all",
                ghost: "hover:bg-accent hover:text-accent-foreground rounded-full",
                link: "text-primary underline-offset-4 hover:underline",
                hero: "bg-gradient-to-r from-primary to-orange-600 text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/30%)] hover:shadow-[0_6px_20px_hsl(var(--primary)/40%)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 rounded-full border border-primary/20",
                heroOutline: "border-2 border-primary-foreground/50 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 rounded-full",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
                xl: "h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
