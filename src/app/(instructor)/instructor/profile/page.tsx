import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InstructorProfileTabs } from "@/components/layout/instructor-profile-tabs"

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Manage your instructor profile",
}

async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      headline: true,
      bio: true,
      website: true,
      twitter: true,
      linkedin: true,
      youtube: true,
    },
  })
}

export default async function InstructorProfilePage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const user = await getUserProfile(session.user.id)

  if (!user) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile & settings</h1>
      <InstructorProfileTabs user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
