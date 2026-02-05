"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const pricingSchema = z.object({
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
})

type PricingInput = z.infer<typeof pricingSchema>

interface PricingSectionProps {
  courseId: string
  price: number
  onSaved: () => void
}

export function PricingSection({ courseId, price, onSaved }: PricingSectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const hasInitialized = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSavedRef = useRef(onSaved)
  onSavedRef.current = onSaved

  const form = useForm<PricingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pricingSchema) as any,
    defaultValues: {
      price: price || 0,
    },
  })

  const watchedPrice = form.watch("price")

  // Debounced auto-save
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      return
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      const priceVal = Number(form.getValues("price"))
      if (isNaN(priceVal) || priceVal < 0) return
      setIsSaving(true)
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: priceVal,
            isFree: priceVal === 0,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to save")
        }
        onSavedRef.current()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save")
      } finally {
        setIsSaving(false)
      }
    }, 1500)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPrice, courseId])

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-bold">Pricing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set the price for your course. Setting it to $0 makes the course free.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="max-w-xs"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Learnify keeps a 30% platform fee. You earn 70% of each sale.
                  Set to 0 for a free course.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
