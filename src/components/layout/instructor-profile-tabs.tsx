"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Camera, Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InstructorProfileForm } from "./instructor-profile-form"

interface ProfileUser {
  name: string | null
  email: string | null
  image: string | null
  headline: string | null
  bio: string | null
  website: string | null
  twitter: string | null
  linkedin: string | null
  youtube: string | null
}

const TABS = [
  { id: "profile", label: "Learnify profile" },
  { id: "picture", label: "Profile picture" },
] as const

type TabId = (typeof TABS)[number]["id"]

export function InstructorProfileTabs({ user }: { user: ProfileUser }) {
  const [activeTab, setActiveTab] = useState<TabId>("profile")
  const [imageUrl, setImageUrl] = useState(user.image)

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-3 text-sm font-medium -mb-px transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && <InstructorProfileForm user={user} />}
      {activeTab === "picture" && (
        <ProfilePictureSection
          currentImage={imageUrl}
          userName={user.name}
          onImageUpdated={setImageUrl}
        />
      )}
    </>
  )
}

// ─── Profile Picture Section ────────────────────────────────────────

type UploadState = "idle" | "uploading" | "saving" | "success" | "error"

function ProfilePictureSection({
  currentImage,
  userName,
  onImageUpdated,
}: {
  currentImage: string | null
  userName: string | null
  onImageUpdated: (url: string) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB")
        return
      }

      setSelectedFile(file)
      setUploadState("idle")

      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    },
    []
  )

  const handleCancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    setPreview(null)
    setSelectedFile(null)
    setUploadState("idle")
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleSave = useCallback(async () => {
    if (!selectedFile) return

    setUploadState("uploading")
    setProgress(0)

    try {
      // 1. Get Cloudinary signature
      const sigRes = await fetch("/api/upload/signature")
      if (!sigRes.ok) throw new Error("Signature request failed")
      const { timestamp, signature, cloudName, apiKey } = await sigRes.json()

      // 2. Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      )

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRef.current = xhr

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100))
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(new Error("Upload failed"))
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Network error")))
          xhr.addEventListener("abort", () =>
            reject(new Error("Upload cancelled"))
          )

          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
          )
          xhr.send(formData)
        }
      )

      xhrRef.current = null

      // 3. Save URL to user profile
      setUploadState("saving")
      const saveRes = await fetch("/api/profile/image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: result.secure_url }),
      })

      if (!saveRes.ok) throw new Error("Failed to save profile picture")

      setUploadState("success")
      onImageUpdated(result.secure_url)
      setPreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      toast.success("Profile picture updated")
    } catch (err) {
      xhrRef.current = null
      if (err instanceof Error && err.message === "Upload cancelled") return
      setUploadState("error")
      toast.error(err instanceof Error ? err.message : "Upload failed")
    }
  }, [selectedFile, onImageUpdated])

  const displayImage = preview || currentImage
  const isUploading = uploadState === "uploading" || uploadState === "saving"

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-semibold">Image preview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Minimum 200x200 pixels, Maximum 5MB.
        </p>
      </div>

      {/* Preview area */}
      <div className="flex items-start gap-8">
        <div className="relative group shrink-0">
          <div className="w-[200px] h-[200px] rounded-full overflow-hidden bg-muted border">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={userName || "Profile"}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Camera className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Overlay on hover (when idle) */}
          {!isUploading && !preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Upload progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white text-sm mt-2">
                {uploadState === "saving"
                  ? "Saving..."
                  : `${progress}%`}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload image
          </Button>

          <p className="text-xs text-muted-foreground">
            Accepted formats: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Action buttons when file is selected */}
      {preview && (
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isUploading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadState === "saving" ? "Saving..." : `Uploading ${progress}%`}
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
