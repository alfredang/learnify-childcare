"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { profileSchema, type ProfileInput } from "@/lib/validations/user"

interface InstructorProfileFormProps {
  user: {
    name: string | null
    headline: string | null
    bio: string | null
    website: string | null
    twitter: string | null
    linkedin: string | null
    youtube: string | null
  }
}

export function InstructorProfileForm({ user }: InstructorProfileFormProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      headline: user.headline || "",
      bio: user.bio || "",
      website: user.website || "",
      twitter: user.twitter || "",
      linkedin: user.linkedin || "",
      youtube: user.youtube || "",
    },
  })

  const headlineValue = watch("headline") || ""

  async function onSubmit(data: ProfileInput) {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }

      toast.success("Profile saved")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <div className="relative">
              <Input
                id="headline"
                placeholder="Instructor at Learnify"
                {...register("headline")}
                maxLength={100}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {headlineValue.length}
              </span>
            </div>
            {errors.headline && (
              <p className="text-sm text-destructive">
                {errors.headline.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              rows={6}
              placeholder="Tell students about yourself..."
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://yoursite.com"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-sm text-destructive">
                {errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                http://www.twitter.com/
              </span>
              <Input
                id="twitter"
                className="rounded-l-none"
                placeholder="Username"
                {...register("twitter")}
              />
            </div>
            {errors.twitter && (
              <p className="text-sm text-destructive">
                {errors.twitter.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                http://www.linkedin.com/
              </span>
              <Input
                id="linkedin"
                className="rounded-l-none"
                placeholder="Profile URL"
                {...register("linkedin")}
              />
            </div>
            {errors.linkedin && (
              <p className="text-sm text-destructive">
                {errors.linkedin.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">Youtube</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                http://www.youtube.com/
              </span>
              <Input
                id="youtube"
                className="rounded-l-none"
                placeholder="Channel name"
                {...register("youtube")}
              />
            </div>
            {errors.youtube && (
              <p className="text-sm text-destructive">
                {errors.youtube.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
