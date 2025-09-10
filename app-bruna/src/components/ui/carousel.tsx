import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      align: "start",
    },
    []
  )

  React.useEffect(() => {
    if (carouselRef.current) {
      api?.reInit()
    }
  }, [api, carouselRef])

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn("flex", className)}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { api?: any }
>(({ className, variant = "outline", size = "icon", api, ...props }, ref) => {
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    api.on("reInit", () => setCanScrollPrev(api.canScrollPrev()))
    api.on("select", () => setCanScrollPrev(api.canScrollPrev()))
  }, [api])

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("absolute -left-12 top-1/2 -translate-y-1/2", className)}
      disabled={!canScrollPrev}
      onClick={() => api?.scrollPrev()}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { api?: any }
>(({ className, variant = "outline", size = "icon", api, ...props }, ref) => {
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCanScrollNext(api.canScrollNext())
    api.on("reInit", () => setCanScrollNext(api.canScrollNext()))
    api.on("select", () => setCanScrollNext(api.canScrollNext()))
  }, [api])

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("absolute -right-12 top-1/2 -translate-y-1/2", className)}
      disabled={!canScrollNext}
      onClick={() => api?.scrollNext()}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

type CarouselApi = any

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}