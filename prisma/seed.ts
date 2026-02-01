import "dotenv/config"
import { PrismaClient, UserRole, CourseLevel, CourseStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Clean database
  await prisma.lectureProgress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.lecture.deleteMany()
  await prisma.section.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.earning.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log("Database cleaned")

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Development",
        slug: "development",
        description: "Web, mobile, and software development courses",
        icon: "Code",
      },
    }),
    prisma.category.create({
      data: {
        name: "Business",
        slug: "business",
        description: "Business strategy, entrepreneurship, and management",
        icon: "Briefcase",
      },
    }),
    prisma.category.create({
      data: {
        name: "Design",
        slug: "design",
        description: "UI/UX, graphic design, and creative skills",
        icon: "Palette",
      },
    }),
    prisma.category.create({
      data: {
        name: "Marketing",
        slug: "marketing",
        description: "Digital marketing, SEO, and social media",
        icon: "Megaphone",
      },
    }),
    prisma.category.create({
      data: {
        name: "IT & Software",
        slug: "it-software",
        description: "Cloud computing, DevOps, and IT certifications",
        icon: "Server",
      },
    }),
    prisma.category.create({
      data: {
        name: "Personal Development",
        slug: "personal-development",
        description: "Productivity, leadership, and personal growth",
        icon: "User",
      },
    }),
  ])

  console.log("Categories created:", categories.length)

  const hashedPassword = await bcrypt.hash("password123", 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@learnify.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
  })

  // Create instructors
  const instructor1 = await prisma.user.create({
    data: {
      email: "john@learnify.com",
      password: hashedPassword,
      name: "John Smith",
      role: UserRole.INSTRUCTOR,
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      headline: "Senior Web Developer & Educator",
      bio: "10+ years of experience in web development. Passionate about teaching and helping others grow their skills. I've worked at companies like Google and Meta.",
      website: "https://johnsmith.dev",
      twitter: "johnsmithdev",
    },
  })

  const instructor2 = await prisma.user.create({
    data: {
      email: "sarah@learnify.com",
      password: hashedPassword,
      name: "Sarah Johnson",
      role: UserRole.INSTRUCTOR,
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      headline: "UX Designer & Product Lead",
      bio: "Design lead with 8 years of experience. Former design lead at Airbnb. Teaching design thinking and user experience.",
      website: "https://sarahjohnson.design",
      linkedin: "sarahjohnsondesign",
    },
  })

  const instructor3 = await prisma.user.create({
    data: {
      email: "mike@learnify.com",
      password: hashedPassword,
      name: "Mike Williams",
      role: UserRole.INSTRUCTOR,
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      headline: "Marketing Strategist & Growth Expert",
      bio: "Helped scale startups from 0 to millions in revenue. Expert in digital marketing, SEO, and growth hacking.",
    },
  })

  console.log("Instructors created")

  // Create students
  const student1 = await prisma.user.create({
    data: {
      email: "student1@example.com",
      password: hashedPassword,
      name: "Emily Brown",
      role: UserRole.STUDENT,
      image: "https://randomuser.me/api/portraits/women/3.jpg",
    },
  })

  const student2 = await prisma.user.create({
    data: {
      email: "student2@example.com",
      password: hashedPassword,
      name: "David Wilson",
      role: UserRole.STUDENT,
      image: "https://randomuser.me/api/portraits/men/5.jpg",
    },
  })

  console.log("Students created")

  // Create courses
  const course1 = await prisma.course.create({
    data: {
      title: "Complete Web Development Bootcamp 2024",
      slug: "complete-web-development-bootcamp-2024",
      subtitle: "Become a full-stack web developer with just one course",
      description: `
        <h2>Become a Full-Stack Web Developer</h2>
        <p>This comprehensive bootcamp will take you from zero to job-ready developer. You'll learn HTML, CSS, JavaScript, React, Node.js, and more.</p>
        <h3>What You'll Build</h3>
        <ul>
          <li>10+ real-world projects</li>
          <li>Portfolio website</li>
          <li>E-commerce application</li>
          <li>Social media clone</li>
        </ul>
      `,
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      price: 9999,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Build responsive websites with HTML, CSS, and JavaScript",
        "Master React and Next.js for frontend development",
        "Create APIs with Node.js and Express",
        "Work with databases like MongoDB and PostgreSQL",
        "Deploy applications to production",
      ],
      requirements: [
        "No programming experience required",
        "Basic computer skills",
        "A computer with internet access",
      ],
      targetAudience: [
        "Beginners wanting to learn web development",
        "Career changers looking to enter tech",
        "Designers wanting to add coding skills",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 3600,
      totalLectures: 150,
      totalStudents: 1250,
      averageRating: 4.7,
      totalReviews: 342,
      isFeatured: true,
      featuredOrder: 1,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
    },
  })

  // Create sections and lectures for course1
  const section1 = await prisma.section.create({
    data: {
      title: "Introduction to Web Development",
      description: "Get started with the basics",
      position: 1,
      courseId: course1.id,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        title: "Welcome to the Course",
        description: "Introduction and course overview",
        type: "VIDEO",
        position: 1,
        videoUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
        videoDuration: 300,
        isFreePreview: true,
        sectionId: section1.id,
      },
      {
        title: "How the Web Works",
        description: "Understanding HTTP, browsers, and servers",
        type: "VIDEO",
        position: 2,
        videoUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
        videoDuration: 600,
        isFreePreview: true,
        sectionId: section1.id,
      },
      {
        title: "Setting Up Your Environment",
        description: "Install VS Code and extensions",
        type: "VIDEO",
        position: 3,
        videoUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
        videoDuration: 480,
        sectionId: section1.id,
      },
    ],
  })

  const section2 = await prisma.section.create({
    data: {
      title: "HTML Fundamentals",
      description: "Learn the building blocks of the web",
      position: 2,
      courseId: course1.id,
    },
  })

  await prisma.lecture.createMany({
    data: [
      {
        title: "Your First HTML Page",
        type: "VIDEO",
        position: 1,
        videoUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
        videoDuration: 720,
        sectionId: section2.id,
      },
      {
        title: "HTML Elements and Tags",
        type: "VIDEO",
        position: 2,
        videoUrl: "https://res.cloudinary.com/demo/video/upload/sample.mp4",
        videoDuration: 900,
        sectionId: section2.id,
      },
    ],
  })

  // Create more courses
  const course2 = await prisma.course.create({
    data: {
      title: "UX Design Masterclass",
      slug: "ux-design-masterclass",
      subtitle: "Learn user experience design from industry experts",
      description: "<h2>Master UX Design</h2><p>Learn the complete UX design process from research to prototyping.</p>",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      price: 7999,
      level: CourseLevel.INTERMEDIATE,
      learningOutcomes: [
        "Conduct user research and interviews",
        "Create user personas and journey maps",
        "Design wireframes and prototypes",
        "Perform usability testing",
      ],
      requirements: ["Basic design knowledge helpful but not required"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1800,
      totalLectures: 80,
      totalStudents: 856,
      averageRating: 4.8,
      totalReviews: 215,
      isFeatured: true,
      featuredOrder: 2,
      instructorId: instructor2.id,
      categoryId: categories[2].id,
    },
  })

  const course3 = await prisma.course.create({
    data: {
      title: "Digital Marketing Fundamentals",
      slug: "digital-marketing-fundamentals",
      subtitle: "Master the art of digital marketing",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      price: 4999,
      level: CourseLevel.BEGINNER,
      learningOutcomes: [
        "Understand digital marketing channels",
        "Create effective ad campaigns",
        "Analyze marketing metrics",
        "Build a marketing strategy",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1200,
      totalLectures: 45,
      totalStudents: 623,
      averageRating: 4.5,
      totalReviews: 156,
      isFeatured: true,
      featuredOrder: 3,
      instructorId: instructor3.id,
      categoryId: categories[3].id,
    },
  })

  const course4 = await prisma.course.create({
    data: {
      title: "Python for Data Science",
      slug: "python-for-data-science",
      subtitle: "Learn Python programming for data analysis",
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
      price: 8999,
      level: CourseLevel.INTERMEDIATE,
      learningOutcomes: [
        "Master Python programming basics",
        "Work with NumPy and Pandas",
        "Create data visualizations",
        "Build machine learning models",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 2400,
      totalLectures: 120,
      totalStudents: 1500,
      averageRating: 4.9,
      totalReviews: 400,
      isFeatured: true,
      featuredOrder: 4,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
    },
  })

  // Free course
  const course5 = await prisma.course.create({
    data: {
      title: "Introduction to Programming",
      slug: "introduction-to-programming",
      subtitle: "Start your coding journey for free",
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
      price: 0,
      isFree: true,
      level: CourseLevel.BEGINNER,
      learningOutcomes: [
        "Understand programming fundamentals",
        "Write your first code",
        "Learn problem-solving skills",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 600,
      totalLectures: 20,
      totalStudents: 5000,
      averageRating: 4.6,
      totalReviews: 800,
      isFeatured: true,
      featuredOrder: 5,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
    },
  })

  console.log("Courses created")

  // Create enrollments
  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: course1.id,
      progress: 25,
      lastAccessedAt: new Date(),
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: course1.id,
      progress: 60,
      lastAccessedAt: new Date(),
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: course2.id,
      progress: 10,
      lastAccessedAt: new Date(),
    },
  })

  console.log("Enrollments created")

  // Create reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Excellent course! The instructor explains everything clearly. I went from complete beginner to building my own projects.",
      userId: student1.id,
      courseId: course1.id,
    },
  })

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Great content and well-structured. Would love to see more advanced topics added.",
      userId: student2.id,
      courseId: course1.id,
    },
  })

  console.log("Reviews created")

  // Create purchases
  await prisma.purchase.create({
    data: {
      userId: student1.id,
      courseId: course1.id,
      amount: 9999,
      platformFee: 3000,
      instructorEarning: 6999,
      status: "COMPLETED",
      courseName: course1.title,
      coursePrice: 99.99,
    },
  })

  console.log("Purchases created")

  // Create platform settings
  await prisma.platformSettings.create({
    data: {
      platformFeePercent: 30,
      minCoursePrice: 0,
      maxCoursePrice: 999.99,
    },
  })

  console.log("Platform settings created")

  console.log("Seed completed successfully!")
  console.log("\nTest Accounts:")
  console.log("Admin: admin@learnify.com / password123")
  console.log("Instructor: john@learnify.com / password123")
  console.log("Student: student1@example.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
