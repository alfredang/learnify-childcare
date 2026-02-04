"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/shared/star-rating"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Trash2, Users, Loader2, AlertTriangle } from "lucide-react"
import { formatPrice } from "@/lib/stripe"
import { toast } from "sonner"
import type { CartItemCourse } from "@/types"

interface CartGridProps {
  initialItems: CartItemCourse[]
  enrolledCourseIds: string[]
}

export function CartGrid({ initialItems, enrolledCourseIds }: CartGridProps) {
  const [items, setItems] = useState(initialItems)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()
  const enrolledSet = new Set(enrolledCourseIds)

  // Filter out any courses the user is already enrolled in
  const validItems = items.filter((item) => !enrolledSet.has(item.course.id))

  const totalPrice = validItems.reduce((sum, item) => {
    const price = item.course.discountPrice
      ? Number(item.course.discountPrice)
      : Number(item.course.price)
    return item.course.isFree ? sum : sum + price
  }, 0)

  const originalPrice = validItems.reduce((sum, item) => {
    return item.course.isFree ? sum : sum + Number(item.course.price)
  }, 0)

  const paidItems = validItems.filter((item) => !item.course.isFree)
  const freeItems = validItems.filter((item) => item.course.isFree)
  const hasUnpublished = validItems.some((item) => item.course.status !== "PUBLISHED")

  async function refreshCartPrices() {
    try {
      const res = await fetch("/api/cart")
      if (!res.ok) return
      const data = await res.json()
      setItems(data.cartItems)
    } catch {
      // silent — page can be reloaded manually
    }
  }

  async function handleCheckout() {
    if (paidItems.length === 0 && freeItems.length === 0) return

    // Build expected prices so the API can validate nothing changed
    const expectedPrices: Record<string, number> = {}
    for (const item of validItems) {
      if (!item.course.isFree) {
        expectedPrices[item.course.id] = item.course.discountPrice
          ? Number(item.course.discountPrice)
          : Number(item.course.price)
      }
    }

    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartCheckout: true,
          courseIds: validItems.map((item) => item.course.id),
          expectedPrices,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Price changed — refresh cart to show new prices
        if (data.code === "PRICE_CHANGED") {
          toast.error("Some course prices have changed. Please review the updated prices.")
          await refreshCartPrices()
          setIsCheckingOut(false)
          return
        }
        throw new Error(data.message || "Failed to create checkout session")
      }

      if (data.free) {
        toast.success("Enrolled successfully")
        router.push("/my-courses")
        router.refresh()
      } else {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to checkout"
      )
      setIsCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Browse courses and add them to your cart"
        actionLabel="Browse Courses"
        actionHref="/courses"
      />
    )
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_360px] gap-8">
      {/* Cart items */}
      <div>
        <p className="text-muted-foreground mb-4">
          {validItems.length} {validItems.length === 1 ? "course" : "courses"} in cart
        </p>
        <div className="space-y-4">
          {validItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={(id) =>
                setItems((prev) => prev.filter((i) => i.id !== id))
              }
            />
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div>
        <Card className="sticky top-20">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Total:</h2>
            <div className="space-y-1">
              <div className="text-3xl font-bold">
                {formatPrice(totalPrice)}
              </div>
              {originalPrice > totalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </div>
              )}
            </div>

            <Separator />

            {paidItems.length > 0 && (
              <div className="space-y-1 text-sm">
                {paidItems.map((item) => {
                  const itemPrice = item.course.discountPrice
                    ? Number(item.course.discountPrice)
                    : Number(item.course.price)
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate mr-2">{item.course.title}</span>
                      <span className="flex-shrink-0">{formatPrice(itemPrice)}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {freeItems.length > 0 && (
              <div className="space-y-1 text-sm">
                {freeItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate mr-2">{item.course.title}</span>
                    <span className="flex-shrink-0 text-green-600">Free</span>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {hasUnpublished && (
              <div className="flex gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Some courses in your cart have been unpublished by the instructor. You may still purchase them, but content updates are not guaranteed.
                </span>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut || validItems.length === 0}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Checkout"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              30-Day Money-Back Guarantee
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface CartItemCardProps {
  item: CartItemCourse
  onRemove: (id: string) => void
}

function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const [isPending, startTransition] = useTransition()
  const course = item.course
  const price = Number(course.price)
  const discountPrice = course.discountPrice ? Number(course.discountPrice) : null
  const rating = Number(course.averageRating)

  function handleRemove() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/cart?courseId=${course.id}`, {
          method: "DELETE",
        })

        if (!res.ok) {
          throw new Error("Failed to remove from cart")
        }

        onRemove(item.id)
        toast.success("Removed from cart")
      } catch {
        toast.error("Failed to remove from cart")
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Link
            href={`/courses/${course.slug}`}
            className="flex-shrink-0"
          >
            <div className="relative w-32 h-20 sm:w-44 sm:h-28 rounded overflow-hidden">
              <Image
                src={course.thumbnail || "/images/placeholder-course.jpg"}
                alt={course.title}
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  <Link href={`/courses/${course.slug}`} className="min-w-0">
                    <h3 className="font-semibold line-clamp-2 hover:text-primary">
                      {course.title}
                    </h3>
                  </Link>
                  {course.status !== "PUBLISHED" && (
                    <Badge variant="outline" className="flex-shrink-0 px-2 py-0.5 text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-200 dark:border-amber-800 dark:bg-amber-950/20">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unpublished
                    </Badge>
                  )}
                </div>
                <Link
                  href={`/instructors/${course.instructor.id}`}
                  className="text-sm text-muted-foreground mt-1 hover:text-primary hover:underline inline-block"
                >
                  {course.instructor.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={rating} size="sm" showValue />
                  <span className="text-sm text-muted-foreground">
                    ({course.totalReviews.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  {course.isFree ? (
                    <span className="font-bold text-green-600">Free</span>
                  ) : (
                    <>
                      <div className="font-bold">
                        {formatPrice(discountPrice ?? price)}
                      </div>
                      {discountPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(price)}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
