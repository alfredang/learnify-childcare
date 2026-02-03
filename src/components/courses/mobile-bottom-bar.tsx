"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/stripe"

interface MobileBottomBarProps {
  courseSlug: string
  price: number
  discountPrice: number | null
  isFree: boolean
}

export function MobileBottomBar({
  courseSlug,
  price,
  discountPrice,
  isFree,
}: MobileBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-4 lg:hidden">
      <div className="container flex items-center justify-between gap-4">
        <div>
          {isFree ? (
            <span className="text-lg font-bold">Free</span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">
                {formatPrice(discountPrice ?? price)}
              </span>
              {discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>
          )}
        </div>
        <Button size="lg" asChild>
          <Link href={`/courses/${courseSlug}/enroll`}>
            {isFree ? "Enroll for Free" : "Buy Now"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
