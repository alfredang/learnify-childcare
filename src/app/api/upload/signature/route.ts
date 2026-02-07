import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateUploadSignature } from "@/lib/cloudinary"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can upload files", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    const signatureData = generateUploadSignature()

    return NextResponse.json(signatureData)
  } catch (error) {
    console.error("[UPLOAD_SIGNATURE_GET]", error)
    return NextResponse.json(
      { error: "Failed to generate upload signature", code: "SIGNATURE_FAILED" },
      { status: 500 }
    )
  }
}
