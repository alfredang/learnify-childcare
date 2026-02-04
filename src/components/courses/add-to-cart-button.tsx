"use client"

import { useState, useTransition } from "react"
import { ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  courseId: string
  initialInCart?: boolean
  variant?: "icon" | "full"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function AddToCartButton({
  courseId,
  initialInCart = false,
  variant = "full",
  size = "lg",
  className,
}: AddToCartButtonProps) {
  const [inCart, setInCart] = useState(initialInCart)
  const [isPending, startTransition] = useTransition()
  const { data: session } = useSession()
  const router = useRouter()

  function handleToggleCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    startTransition(async () => {
      try {
        if (inCart) {
          const res = await fetch(`/api/cart?courseId=${courseId}`, {
            method: "DELETE",
          })

          if (!res.ok) {
            throw new Error("Failed to remove from cart")
          }

          setInCart(false)
          toast.success("Removed from cart")
        } else {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId }),
          })

          const data = await res.json()

          if (!res.ok) {
            if (data.code === "ALREADY_IN_CART") {
              setInCart(true)
              return
            }
            throw new Error(data.error || "Failed to add to cart")
          }

          setInCart(true)
          toast.success("Added to cart")
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update cart"
        )
      }
    })
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggleCart}
        disabled={isPending}
        className={cn(
          "rounded-full bg-white p-2 shadow-md transition-all hover:scale-110",
          isPending && "opacity-50",
          className
        )}
        aria-label={inCart ? "Remove from cart" : "Add to cart"}
      >
        {inCart ? (
          <X className="h-5 w-5 text-red-600" />
        ) : (
          <ShoppingCart className="h-5 w-5 text-slate-700" />
        )}
      </button>
    )
  }

  return (
    <Button
      variant={inCart ? "ghost" : "default"}
      size={size}
      className={cn("w-full", inCart ? "text-muted-foreground hover:text-muted-foreground" : "transition-transform hover:scale-105", className)}
      onClick={handleToggleCart}
      disabled={isPending}
    >
      {inCart ? (
        <>
          <X className="h-4 w-4 mr-2" />
          Remove from Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
