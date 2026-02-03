"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface WishlistButtonProps {
  courseId: string
  initialWishlisted?: boolean
  variant?: "icon" | "full"
  className?: string
}

export function WishlistButton({
  courseId,
  initialWishlisted = false,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()
  const { data: session } = useSession()
  const router = useRouter()

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to update wishlist")
        }

        const data = await res.json()
        setWishlisted(data.wishlisted)

        toast.success(
          data.wishlisted ? "Added to wishlist" : "Removed from wishlist"
        )
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update wishlist"
        )
      }
    })
  }

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        size="lg"
        className={cn("w-full", className)}
        onClick={handleToggle}
        disabled={isPending}
      >
        <Heart
          className={cn(
            "h-4 w-4 mr-2",
            wishlisted && "fill-red-500 text-red-500"
          )}
        />
        {wishlisted ? "Wishlisted" : "Add to Wishlist"}
      </Button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "rounded-full bg-white p-2 shadow-md transition-all hover:scale-110",
        isPending && "opacity-50",
        className
      )}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-5 w-5",
          wishlisted ? "fill-red-500 text-red-500" : "text-slate-700"
        )}
      />
    </button>
  )
}
