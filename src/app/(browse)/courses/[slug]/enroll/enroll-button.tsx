"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface EnrollButtonProps {
  courseId: string
  isFree: boolean
}

export function EnrollButton({ courseId, isFree }: EnrollButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleEnroll() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to enroll")
      }

      if (data.free) {
        toast.success("Enrolled successfully")
        router.push(data.url)
      } else {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll")
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isFree ? "Enroll for Free" : "Proceed to Payment"}
    </Button>
  )
}
