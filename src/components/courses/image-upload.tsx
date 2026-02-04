"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

interface ImageUploadProps {
  onUploadComplete: (data: {
    imageUrl: string
    imagePublicId: string
  }) => void
  onUploadStart?: () => void
  onUploadCancel?: () => void
  existingImageUrl?: string | null
  disabled?: boolean
}

type UploadState = "idle" | "uploading" | "success" | "error"

export function ImageUpload({
  onUploadComplete,
  onUploadStart,
  onUploadCancel,
  existingImageUrl,
  disabled = false,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")

  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploading = uploadState === "uploading"

  const resetState = useCallback(() => {
    setUploadState("idle")
    setProgress(0)
    setErrorMessage("")
    setPreviewUrl(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    resetState()
    onUploadCancel?.()
  }, [resetState, onUploadCancel])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file")
      setUploadState("error")
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`
      )
      setUploadState("error")
      return
    }

    setFileName(file.name)
    setErrorMessage("")

    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    setUploadState("uploading")
    setProgress(0)
    onUploadStart?.()

    try {
      const sigRes = await fetch("/api/upload/signature")
      if (!sigRes.ok) {
        const sigErr = await sigRes.json().catch(() => ({}))
        throw new Error(sigErr.error || `Signature request failed (${sigRes.status})`)
      }
      const { timestamp, signature, cloudName, apiKey } = await sigRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      )

      const result = await new Promise<{
        secure_url: string
        public_id: string
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100)
            setProgress(pct)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            try {
              const errBody = JSON.parse(xhr.responseText)
              const msg = errBody?.error?.message || `Upload failed (${xhr.status})`
              reject(new Error(msg))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")))
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")))

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        )
        xhr.send(formData)
      })

      xhrRef.current = null
      setUploadState("success")

      onUploadComplete({
        imageUrl: result.secure_url,
        imagePublicId: result.public_id,
      })
    } catch (err) {
      xhrRef.current = null
      if (err instanceof Error && err.message === "Upload cancelled") {
        return
      }
      setErrorMessage(
        err instanceof Error ? err.message : "Upload failed"
      )
      setUploadState("error")
    }
  }

  const showExisting =
    !previewUrl && existingImageUrl && uploadState === "idle"

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {uploadState === "idle" && !showExisting && (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            "hover:bg-muted/50 hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">Click to upload image</p>
            <p className="text-xs">
              JPG, PNG, WebP &middot; Max {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />
        </label>
      )}

      {/* Existing image preview */}
      {showExisting && (
        <div className="relative rounded-lg overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingImageUrl}
            alt="Course thumbnail"
            className="w-full h-44 object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-2 flex items-center justify-between">
            <span className="text-white text-xs truncate">Current thumbnail</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-white hover:text-white hover:bg-white/20"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Replace
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm truncate">{fileName}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={cancelUpload}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress}% uploaded
          </p>
        </div>
      )}

      {/* Success state with preview */}
      {uploadState === "success" && previewUrl && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded thumbnail"
              className="w-full h-44 object-cover"
            />
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={resetState}
                disabled={disabled}
              >
                Change
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Image uploaded successfully</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {uploadState === "error" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetState}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
