"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  videoUrl: string
  lastPosition?: number
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  className?: string
}

export function VideoPlayer({
  videoUrl,
  lastPosition = 0,
  onTimeUpdate,
  onEnded,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasResumed, setHasResumed] = useState(false)

  // Resume from last position on load
  useEffect(() => {
    const video = videoRef.current
    if (!video || hasResumed) return

    const handleLoaded = () => {
      if (lastPosition > 0 && lastPosition < video.duration) {
        video.currentTime = lastPosition
      }
      setHasResumed(true)
    }

    video.addEventListener("loadedmetadata", handleLoaded)
    return () => video.removeEventListener("loadedmetadata", handleLoaded)
  }, [lastPosition, hasResumed])

  // Throttled time update reporting
  const lastReportedTime = useRef(0)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video || !onTimeUpdate) return

    // Report every 5 seconds to avoid excessive calls
    if (Math.abs(video.currentTime - lastReportedTime.current) >= 5) {
      lastReportedTime.current = video.currentTime
      onTimeUpdate(video.currentTime, video.duration)
    }
  }, [onTimeUpdate])

  const handleEnded = useCallback(() => {
    onEnded?.()
  }, [onEnded])

  return (
    <div className={cn("relative w-full max-w-5xl max-h-[65vh] aspect-video bg-black overflow-hidden mx-auto mt-4", className)}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain"
        controls
        controlsList="nodownload"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  )
}
