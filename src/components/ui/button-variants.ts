import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-ring border-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-primary hover:bg-[#E54F0F] hover:border-[#E54F0F] active:bg-[#CC4509] active:border-[#CC4509]",
        destructive:
          "bg-destructive text-white border-destructive hover:bg-[#B91C1C] hover:border-[#B91C1C] active:bg-[#991B1B] active:border-[#991B1B]",
        outline:
          "border-border bg-background hover:bg-accent hover:border-accent active:bg-muted active:border-muted",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary hover:bg-[#3D3D3D] hover:border-[#3D3D3D] active:bg-[#4D4D4D] active:border-[#4D4D4D]",
        ghost:
          "border-transparent hover:bg-accent hover:border-accent active:bg-muted active:border-muted",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
