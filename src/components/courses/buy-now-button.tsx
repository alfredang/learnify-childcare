"use client"

import { useState } from "react"
import { Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface BuyNowButtonProps {
  courseId: string
  isFree: boolean
  expectedPrice?: number
  className?: string
}

export function BuyNowButton({
  courseId,
  isFree,
  expectedPrice,
  className,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  async function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, expectedPrice }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "PRICE_CHANGED") {
          toast.error("The price has changed. Please refresh the page.")
          return
        }
        throw new Error(data.message || "Failed to process")
      }

      if (data.free) {
        toast.success("Enrolled successfully")
        router.push(data.url)
      } else {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process"
      )
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("w-full", className)}
      onClick={handleBuyNow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Zap className="h-4 w-4 mr-2" />
      )}
      {isFree ? "Enroll for Free" : "Buy Now"}
    </Button>
  )
}
