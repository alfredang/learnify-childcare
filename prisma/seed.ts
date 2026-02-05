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

  // Video URLs — rotate through public domain sample videos
  const VIDEOS = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  ]
  let _vi = 0
  const V = () => VIDEOS[_vi++ % VIDEOS.length]

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
        videoUrl: V(),
        videoDuration: 300,
        isFreePreview: true,
        sectionId: section1.id,
      },
      {
        title: "How the Web Works",
        description: "Understanding HTTP, browsers, and servers",
        type: "VIDEO",
        position: 2,
        videoUrl: V(),
        videoDuration: 600,
        isFreePreview: true,
        sectionId: section1.id,
      },
      {
        title: "Setting Up Your Environment",
        description: "Install VS Code and extensions",
        type: "VIDEO",
        position: 3,
        videoUrl: V(),
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
        videoUrl: V(),
        videoDuration: 720,
        sectionId: section2.id,
      },
      {
        title: "HTML Elements and Tags",
        type: "VIDEO",
        position: 2,
        videoUrl: V(),
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

  // --- Business category courses ---

  const course6 = await prisma.course.create({
    data: {
      title: "Business Strategy & Management",
      slug: "business-strategy-management",
      subtitle: "Learn to think strategically and lead organizations",
      description: "<h2>Master Business Strategy</h2><p>From competitive analysis to strategic planning, learn the frameworks used by top consultants and executives.</p>",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      price: 6999,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      learningOutcomes: [
        "Apply strategic frameworks like SWOT, Porter's Five Forces, and Blue Ocean",
        "Create comprehensive business plans",
        "Analyze competitive landscapes",
        "Make data-driven strategic decisions",
      ],
      requirements: ["Basic understanding of business concepts"],
      targetAudience: [
        "Aspiring managers and entrepreneurs",
        "MBA students seeking practical knowledge",
        "Business professionals looking to advance their careers",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1500,
      totalLectures: 65,
      totalStudents: 420,
      averageRating: 4.6,
      totalReviews: 98,
      isFeatured: true,
      featuredOrder: 6,
      instructorId: instructor3.id,
      categoryId: categories[1].id, // Business
    },
  })

  const course7 = await prisma.course.create({
    data: {
      title: "Entrepreneurship: Launch Your Startup",
      slug: "entrepreneurship-launch-your-startup",
      subtitle: "From idea validation to funding and scaling",
      description: "<h2>Build Your Startup From Scratch</h2><p>Learn the lean startup methodology, validate your ideas, build MVPs, pitch to investors, and scale.</p>",
      thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
      price: 8499,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Validate business ideas using lean startup principles",
        "Build minimum viable products quickly",
        "Create compelling investor pitch decks",
        "Understand fundraising and equity structures",
      ],
      requirements: ["No prior business experience needed"],
      targetAudience: [
        "Aspiring entrepreneurs",
        "Anyone with a business idea they want to pursue",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1800,
      totalLectures: 72,
      totalStudents: 310,
      averageRating: 4.7,
      totalReviews: 85,
      instructorId: instructor3.id,
      categoryId: categories[1].id, // Business
    },
  })

  // --- IT & Software category courses ---

  const course8 = await prisma.course.create({
    data: {
      title: "AWS Cloud Practitioner Certification",
      slug: "aws-cloud-practitioner-certification",
      subtitle: "Pass the AWS CCP exam on your first attempt",
      description: "<h2>Get AWS Certified</h2><p>Comprehensive preparation for the AWS Certified Cloud Practitioner exam. Covers all exam domains with hands-on labs.</p>",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      price: 5999,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Understand AWS cloud concepts and global infrastructure",
        "Navigate key AWS services (EC2, S3, RDS, Lambda)",
        "Implement basic security and compliance practices",
        "Understand AWS pricing and billing models",
      ],
      requirements: [
        "Basic IT knowledge",
        "No prior cloud experience needed",
      ],
      targetAudience: [
        "IT professionals looking to learn cloud computing",
        "Developers wanting AWS certification",
        "Career changers entering cloud computing",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 2100,
      totalLectures: 95,
      totalStudents: 780,
      averageRating: 4.8,
      totalReviews: 210,
      instructorId: instructor1.id,
      categoryId: categories[4].id, // IT & Software
    },
  })

  const course9 = await prisma.course.create({
    data: {
      title: "Docker & Kubernetes: The Complete Guide",
      slug: "docker-kubernetes-complete-guide",
      subtitle: "Master containerization and container orchestration",
      description: "<h2>Learn Docker & Kubernetes</h2><p>From building your first container to deploying multi-service applications on Kubernetes clusters.</p>",
      thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800",
      price: 7499,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      learningOutcomes: [
        "Build and manage Docker containers",
        "Create multi-container apps with Docker Compose",
        "Deploy applications to Kubernetes clusters",
        "Implement CI/CD pipelines with containers",
      ],
      requirements: [
        "Basic command line skills",
        "Some programming experience",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1900,
      totalLectures: 88,
      totalStudents: 540,
      averageRating: 4.7,
      totalReviews: 145,
      instructorId: instructor1.id,
      categoryId: categories[4].id, // IT & Software
    },
  })

  const course10 = await prisma.course.create({
    data: {
      title: "Cybersecurity Fundamentals",
      slug: "cybersecurity-fundamentals",
      subtitle: "Protect systems and networks from cyber threats",
      description: "<h2>Start Your Cybersecurity Journey</h2><p>Learn network security, ethical hacking basics, vulnerability assessment, and security best practices.</p>",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
      price: 6499,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Understand common cyber threats and attack vectors",
        "Perform basic vulnerability assessments",
        "Implement network security best practices",
        "Understand cryptography fundamentals",
      ],
      requirements: ["Basic networking knowledge helpful but not required"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1600,
      totalLectures: 70,
      totalStudents: 390,
      averageRating: 4.5,
      totalReviews: 92,
      instructorId: instructor1.id,
      categoryId: categories[4].id, // IT & Software
    },
  })

  // --- Personal Development category courses ---

  const course11 = await prisma.course.create({
    data: {
      title: "Productivity Mastery: Get More Done",
      slug: "productivity-mastery-get-more-done",
      subtitle: "Proven systems to manage your time and energy",
      description: "<h2>Transform Your Productivity</h2><p>Learn time management, habit building, focus techniques, and workflow optimization from proven frameworks.</p>",
      thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
      price: 3999,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Build effective daily routines and habits",
        "Master time-blocking and the Pomodoro technique",
        "Eliminate distractions and improve deep focus",
        "Set and achieve meaningful goals with OKRs",
      ],
      requirements: ["No prerequisites — just willingness to improve"],
      targetAudience: [
        "Professionals feeling overwhelmed by their workload",
        "Students wanting better study habits",
        "Anyone looking to take control of their time",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 900,
      totalLectures: 40,
      totalStudents: 1100,
      averageRating: 4.7,
      totalReviews: 280,
      instructorId: instructor2.id,
      categoryId: categories[5].id, // Personal Development
    },
  })

  const course12 = await prisma.course.create({
    data: {
      title: "Leadership & Communication Skills",
      slug: "leadership-communication-skills",
      subtitle: "Develop the soft skills that drive career success",
      description: "<h2>Become a Better Leader</h2><p>Effective leadership and communication are the most sought-after skills in any industry. Learn to lead teams, give presentations, and influence stakeholders.</p>",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      price: 5499,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      learningOutcomes: [
        "Develop an authentic leadership style",
        "Give compelling presentations and public speeches",
        "Navigate difficult conversations with confidence",
        "Build high-performing teams",
      ],
      requirements: ["Some work experience helpful"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1400,
      totalLectures: 55,
      totalStudents: 670,
      averageRating: 4.6,
      totalReviews: 160,
      instructorId: instructor2.id,
      categoryId: categories[5].id, // Personal Development
    },
  })

  // --- More Design courses (Sarah) ---

  const course13 = await prisma.course.create({
    data: {
      title: "Figma UI Design: From Beginner to Pro",
      slug: "figma-ui-design-beginner-to-pro",
      subtitle: "Design beautiful interfaces with the industry-standard tool",
      description: "<h2>Master Figma</h2><p>Learn Figma from scratch — components, auto layout, prototyping, design systems, and real-world UI projects.</p>",
      thumbnail: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800",
      price: 5999,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Navigate Figma's interface and tools confidently",
        "Create responsive designs with Auto Layout",
        "Build reusable component libraries and design systems",
        "Create interactive prototypes for user testing",
      ],
      requirements: ["No design experience needed"],
      targetAudience: [
        "Aspiring UI designers",
        "Developers wanting to improve their design skills",
        "Graphic designers transitioning to digital",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1600,
      totalLectures: 75,
      totalStudents: 920,
      averageRating: 4.9,
      totalReviews: 230,
      instructorId: instructor2.id,
      categoryId: categories[2].id, // Design
    },
  })

  // --- More Marketing courses (Mike) ---

  const course14 = await prisma.course.create({
    data: {
      title: "SEO Masterclass: Rank #1 on Google",
      slug: "seo-masterclass-rank-1-google",
      subtitle: "Learn search engine optimization from an industry expert",
      description: "<h2>Dominate Google Search</h2><p>Technical SEO, keyword research, link building, content strategy, and analytics — everything you need to rank.</p>",
      thumbnail: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800",
      price: 5499,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      learningOutcomes: [
        "Perform comprehensive keyword research",
        "Optimize on-page and technical SEO factors",
        "Build high-quality backlinks",
        "Track and analyze SEO performance with Google Analytics",
      ],
      requirements: ["Basic understanding of websites and the internet"],
      targetAudience: [
        "Marketing professionals wanting to master SEO",
        "Business owners looking to increase organic traffic",
        "Content creators wanting more visibility",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1300,
      totalLectures: 58,
      totalStudents: 480,
      averageRating: 4.6,
      totalReviews: 120,
      instructorId: instructor3.id,
      categoryId: categories[3].id, // Marketing
    },
  })

  const course15 = await prisma.course.create({
    data: {
      title: "Social Media Marketing Strategy",
      slug: "social-media-marketing-strategy",
      subtitle: "Build brands and grow audiences on every platform",
      description: "<h2>Social Media That Actually Works</h2><p>Learn platform-specific strategies for Instagram, TikTok, LinkedIn, X, and YouTube. From content creation to paid ads.</p>",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
      price: 4499,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Create platform-specific content strategies",
        "Build and engage online communities",
        "Run effective paid social campaigns",
        "Measure ROI and optimize performance",
      ],
      requirements: ["No prior marketing experience needed"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1100,
      totalLectures: 50,
      totalStudents: 350,
      averageRating: 4.4,
      totalReviews: 88,
      instructorId: instructor3.id,
      categoryId: categories[3].id, // Marketing
    },
  })

  // --- More Development courses ---

  const course16 = await prisma.course.create({
    data: {
      title: "React & Next.js: The Complete Guide",
      slug: "react-nextjs-complete-guide",
      subtitle: "Build production-ready apps with React 19 and Next.js",
      description: "<h2>Modern React Development</h2><p>Server components, app router, server actions, authentication, database integration, and deployment — the full stack.</p>",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      price: 8999,
      level: CourseLevel.INTERMEDIATE,
      language: "English",
      learningOutcomes: [
        "Build full-stack applications with React and Next.js",
        "Master server components and the app router",
        "Implement authentication and authorization",
        "Deploy production apps to Vercel",
      ],
      requirements: [
        "Basic JavaScript knowledge",
        "HTML and CSS fundamentals",
      ],
      targetAudience: [
        "JavaScript developers wanting to learn React",
        "Frontend developers upgrading to Next.js",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 2600,
      totalLectures: 130,
      totalStudents: 680,
      averageRating: 4.8,
      totalReviews: 175,
      instructorId: instructor1.id,
      categoryId: categories[0].id, // Development
    },
  })

  // --- A Business course by Sarah ---

  const course17 = await prisma.course.create({
    data: {
      title: "Product Management Fundamentals",
      slug: "product-management-fundamentals",
      subtitle: "Learn to build products users love",
      description: "<h2>Become a Product Manager</h2><p>From user research to roadmaps, sprints, and stakeholder management — master the PM skill set.</p>",
      thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800",
      price: 7499,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Define product vision and strategy",
        "Prioritize features using proven frameworks",
        "Write effective user stories and PRDs",
        "Lead cross-functional product teams",
      ],
      requirements: ["No prior PM experience required"],
      targetAudience: [
        "Aspiring product managers",
        "Designers and developers wanting to understand product thinking",
        "Startup founders wearing the PM hat",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 1700,
      totalLectures: 68,
      totalStudents: 510,
      averageRating: 4.7,
      totalReviews: 130,
      instructorId: instructor2.id,
      categoryId: categories[1].id, // Business
    },
  })

  // --- A free Personal Development course by Mike ---

  const course18 = await prisma.course.create({
    data: {
      title: "Public Speaking Crash Course",
      slug: "public-speaking-crash-course",
      subtitle: "Overcome fear and speak with confidence",
      thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
      price: 0,
      isFree: true,
      level: CourseLevel.BEGINNER,
      language: "English",
      learningOutcomes: [
        "Overcome stage fright and nervousness",
        "Structure compelling presentations",
        "Use body language and vocal variety effectively",
      ],
      requirements: ["No prerequisites"],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 400,
      totalLectures: 15,
      totalStudents: 2200,
      averageRating: 4.5,
      totalReviews: 450,
      instructorId: instructor3.id,
      categoryId: categories[5].id, // Personal Development
    },
  })

  console.log("Courses created: 18")

  // Create sections and lectures for new courses

  // ============================================
  // SECTIONS & LECTURES FOR ALL 18 COURSES
  // ============================================

  // --- Course 2: UX Design Masterclass (Sarah) ---
  const sec2a = await prisma.section.create({ data: { title: "Introduction to UX Design", position: 1, courseId: course2.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What is UX Design?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, isFreePreview: true, sectionId: sec2a.id },
    { title: "UX vs UI: Understanding the Difference", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec2a.id },
    { title: "The UX Design Process Overview", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec2a.id },
  ]})
  const sec2b = await prisma.section.create({ data: { title: "User Research Methods", position: 2, courseId: course2.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Planning User Interviews", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec2b.id },
    { title: "Creating User Surveys", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec2b.id },
    { title: "Analyzing Research Data", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec2b.id },
  ]})
  const sec2c = await prisma.section.create({ data: { title: "Wireframing & Prototyping", position: 3, courseId: course2.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Low-Fidelity Wireframes", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec2c.id },
    { title: "High-Fidelity Prototypes", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec2c.id },
    { title: "Usability Testing Your Prototypes", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec2c.id },
  ]})

  // --- Course 3: Digital Marketing Fundamentals (Mike) ---
  const sec3a = await prisma.section.create({ data: { title: "Digital Marketing Landscape", position: 1, courseId: course3.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Welcome & Course Overview", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 300, isFreePreview: true, sectionId: sec3a.id },
    { title: "The Digital Marketing Ecosystem", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec3a.id },
    { title: "Understanding Your Target Audience", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec3a.id },
  ]})
  const sec3b = await prisma.section.create({ data: { title: "Content Marketing", position: 2, courseId: course3.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Content Strategy Fundamentals", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec3b.id },
    { title: "Blog Writing That Converts", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec3b.id },
    { title: "Email Marketing Campaigns", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec3b.id },
  ]})
  const sec3c = await prisma.section.create({ data: { title: "Paid Advertising", position: 3, courseId: course3.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Google Ads Fundamentals", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 720, sectionId: sec3c.id },
    { title: "Facebook & Instagram Ads", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 660, sectionId: sec3c.id },
    { title: "Measuring Campaign ROI", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec3c.id },
  ]})

  // --- Course 4: Python for Data Science (John) ---
  const sec4a = await prisma.section.create({ data: { title: "Python Basics", position: 1, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Installing Python & Jupyter", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 360, isFreePreview: true, sectionId: sec4a.id },
    { title: "Variables, Types, and Operators", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec4a.id },
    { title: "Control Flow & Loops", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec4a.id },
    { title: "Functions & Modules", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 600, sectionId: sec4a.id },
  ]})
  const sec4b = await prisma.section.create({ data: { title: "Data Analysis with Pandas", position: 2, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Introduction to NumPy Arrays", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec4b.id },
    { title: "Pandas DataFrames", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec4b.id },
    { title: "Data Cleaning & Transformation", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 660, sectionId: sec4b.id },
    { title: "Merging & Grouping Data", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 600, sectionId: sec4b.id },
  ]})
  const sec4c = await prisma.section.create({ data: { title: "Data Visualization", position: 3, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Matplotlib Fundamentals", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec4c.id },
    { title: "Seaborn for Statistical Plots", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec4c.id },
    { title: "Interactive Visualizations with Plotly", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec4c.id },
  ]})
  const sec4d = await prisma.section.create({ data: { title: "Introduction to Machine Learning", position: 4, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What is Machine Learning?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec4d.id },
    { title: "Linear Regression", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec4d.id },
    { title: "Classification with Scikit-Learn", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 660, sectionId: sec4d.id },
  ]})

  // --- Course 5: Introduction to Programming (John, free) ---
  const sec5a = await prisma.section.create({ data: { title: "What is Programming?", position: 1, courseId: course5.id } })
  await prisma.lecture.createMany({ data: [
    { title: "How Computers Think", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 300, isFreePreview: true, sectionId: sec5a.id },
    { title: "Choosing Your First Language", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec5a.id },
    { title: "Setting Up Your Coding Environment", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec5a.id },
  ]})
  const sec5b = await prisma.section.create({ data: { title: "Core Programming Concepts", position: 2, courseId: course5.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Variables and Data Types", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec5b.id },
    { title: "Conditionals: If/Else Logic", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 420, sectionId: sec5b.id },
    { title: "Loops: Repeating Actions", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec5b.id },
    { title: "Functions: Reusable Code Blocks", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 540, sectionId: sec5b.id },
  ]})
  const sec5c = await prisma.section.create({ data: { title: "Your First Projects", position: 3, courseId: course5.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Project: Number Guessing Game", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec5c.id },
    { title: "Project: Simple Calculator", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec5c.id },
    { title: "Where to Go From Here", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 300, sectionId: sec5c.id },
  ]})

  // --- Course 6: Business Strategy (Mike) - add more sections ---
  const sec6a = await prisma.section.create({ data: { title: "Strategic Thinking Foundations", position: 1, courseId: course6.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What is Strategy?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, isFreePreview: true, sectionId: sec6a.id },
    { title: "Competitive Analysis Frameworks", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec6a.id },
    { title: "SWOT Analysis Deep Dive", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec6a.id },
  ]})
  const sec6b = await prisma.section.create({ data: { title: "Market Analysis & Positioning", position: 2, courseId: course6.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Porter's Five Forces", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec6b.id },
    { title: "Blue Ocean Strategy", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec6b.id },
    { title: "Competitive Positioning Map", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec6b.id },
  ]})
  const sec6c = await prisma.section.create({ data: { title: "Building a Business Plan", position: 3, courseId: course6.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Executive Summary & Vision", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec6c.id },
    { title: "Financial Projections", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 660, sectionId: sec6c.id },
    { title: "Implementation Roadmap", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec6c.id },
  ]})

  // --- Course 7: Entrepreneurship (Mike) ---
  const sec7a = await prisma.section.create({ data: { title: "Finding & Validating Ideas", position: 1, courseId: course7.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Where Great Ideas Come From", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, isFreePreview: true, sectionId: sec7a.id },
    { title: "Customer Discovery Interviews", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec7a.id },
    { title: "The Lean Canvas", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec7a.id },
  ]})
  const sec7b = await prisma.section.create({ data: { title: "Building Your MVP", position: 2, courseId: course7.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What is an MVP?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec7b.id },
    { title: "No-Code MVP Tools", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec7b.id },
    { title: "Getting Your First 10 Customers", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec7b.id },
  ]})
  const sec7c = await prisma.section.create({ data: { title: "Fundraising & Pitching", position: 3, courseId: course7.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Types of Funding: Bootstrapping to VC", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec7c.id },
    { title: "Crafting Your Pitch Deck", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec7c.id },
    { title: "Negotiating Term Sheets", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec7c.id },
  ]})

  // --- Course 8: AWS Cloud Practitioner (John) ---
  const sec8a = await prisma.section.create({ data: { title: "Cloud Computing Basics", position: 1, courseId: course8.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What is Cloud Computing?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 360, isFreePreview: true, sectionId: sec8a.id },
    { title: "AWS Global Infrastructure", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec8a.id },
    { title: "Creating Your AWS Account", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec8a.id },
  ]})
  const sec8b = await prisma.section.create({ data: { title: "Core AWS Services", position: 2, courseId: course8.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Introduction to EC2", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec8b.id },
    { title: "S3 Storage Deep Dive", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec8b.id },
    { title: "RDS & DynamoDB Databases", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec8b.id },
  ]})
  const sec8c = await prisma.section.create({ data: { title: "Security & Pricing", position: 3, courseId: course8.id } })
  await prisma.lecture.createMany({ data: [
    { title: "IAM: Users, Groups & Policies", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec8c.id },
    { title: "AWS Pricing Models", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec8c.id },
    { title: "Exam Prep & Practice Questions", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec8c.id },
  ]})

  // --- Course 9: Docker & Kubernetes (John) ---
  const sec9a = await prisma.section.create({ data: { title: "Docker Fundamentals", position: 1, courseId: course9.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What are Containers?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 360, isFreePreview: true, sectionId: sec9a.id },
    { title: "Installing Docker", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 420, sectionId: sec9a.id },
    { title: "Building Your First Docker Image", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec9a.id },
    { title: "Dockerfile Best Practices", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 540, sectionId: sec9a.id },
  ]})
  const sec9b = await prisma.section.create({ data: { title: "Docker Compose", position: 2, courseId: course9.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Multi-Container Applications", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec9b.id },
    { title: "Networking Between Containers", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec9b.id },
    { title: "Volumes & Data Persistence", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec9b.id },
  ]})
  const sec9c = await prisma.section.create({ data: { title: "Kubernetes Essentials", position: 3, courseId: course9.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Kubernetes Architecture", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec9c.id },
    { title: "Pods, Services & Deployments", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec9c.id },
    { title: "Scaling & Load Balancing", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec9c.id },
    { title: "CI/CD with Containers", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 660, sectionId: sec9c.id },
  ]})

  // --- Course 10: Cybersecurity Fundamentals (John) ---
  const sec10a = await prisma.section.create({ data: { title: "Security Fundamentals", position: 1, courseId: course10.id } })
  await prisma.lecture.createMany({ data: [
    { title: "The Cybersecurity Landscape", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 360, isFreePreview: true, sectionId: sec10a.id },
    { title: "Common Threat Actors & Motivations", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec10a.id },
    { title: "The CIA Triad", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec10a.id },
  ]})
  const sec10b = await prisma.section.create({ data: { title: "Network Security", position: 2, courseId: course10.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Firewalls & Network Segmentation", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec10b.id },
    { title: "VPNs & Secure Communication", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec10b.id },
    { title: "Intrusion Detection Systems", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec10b.id },
  ]})
  const sec10c = await prisma.section.create({ data: { title: "Cryptography & Application Security", position: 3, courseId: course10.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Encryption: Symmetric vs Asymmetric", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec10c.id },
    { title: "Hashing & Digital Signatures", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec10c.id },
    { title: "OWASP Top 10 Vulnerabilities", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 720, sectionId: sec10c.id },
  ]})

  // --- Course 11: Productivity Mastery (Sarah) ---
  const sec11a = await prisma.section.create({ data: { title: "Building Your Foundation", position: 1, courseId: course11.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Why Most Productivity Systems Fail", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 300, isFreePreview: true, sectionId: sec11a.id },
    { title: "The Science of Habits", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec11a.id },
    { title: "Designing Your Morning Routine", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec11a.id },
  ]})
  const sec11b = await prisma.section.create({ data: { title: "Time Management Techniques", position: 2, courseId: course11.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Time Blocking Mastery", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec11b.id },
    { title: "The Pomodoro Technique", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec11b.id },
    { title: "Eisenhower Matrix for Prioritization", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec11b.id },
  ]})
  const sec11c = await prisma.section.create({ data: { title: "Deep Focus & Goal Setting", position: 3, courseId: course11.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Eliminating Digital Distractions", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, sectionId: sec11c.id },
    { title: "Flow State: Getting in the Zone", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec11c.id },
    { title: "Setting OKRs That Actually Work", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec11c.id },
  ]})

  // --- Course 12: Leadership & Communication (Sarah) ---
  const sec12a = await prisma.section.create({ data: { title: "Foundations of Leadership", position: 1, courseId: course12.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Leadership Styles Overview", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, isFreePreview: true, sectionId: sec12a.id },
    { title: "Finding Your Authentic Leadership Voice", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec12a.id },
    { title: "Emotional Intelligence for Leaders", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec12a.id },
  ]})
  const sec12b = await prisma.section.create({ data: { title: "Communication Mastery", position: 2, courseId: course12.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Active Listening Skills", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, sectionId: sec12b.id },
    { title: "Giving & Receiving Feedback", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec12b.id },
    { title: "Navigating Difficult Conversations", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec12b.id },
  ]})
  const sec12c = await prisma.section.create({ data: { title: "Public Speaking & Presentations", position: 3, courseId: course12.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Structuring a Compelling Talk", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec12c.id },
    { title: "Slide Design That Works", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec12c.id },
    { title: "Handling Q&A with Confidence", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec12c.id },
  ]})

  // --- Course 13: Figma UI Design (Sarah) ---
  const sec13a = await prisma.section.create({ data: { title: "Getting Started with Figma", position: 1, courseId: course13.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Figma Interface Tour", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 360, isFreePreview: true, sectionId: sec13a.id },
    { title: "Frames, Shapes, and Text", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec13a.id },
    { title: "Colors, Styles & Typography", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec13a.id },
  ]})
  const sec13b = await prisma.section.create({ data: { title: "Components & Auto Layout", position: 2, courseId: course13.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Auto Layout Fundamentals", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 660, sectionId: sec13b.id },
    { title: "Building Reusable Components", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec13b.id },
    { title: "Component Variants & Properties", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec13b.id },
  ]})
  const sec13c = await prisma.section.create({ data: { title: "Design Systems & Prototyping", position: 3, courseId: course13.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Building a Design System Library", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 720, sectionId: sec13c.id },
    { title: "Interactive Prototyping", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec13c.id },
    { title: "Developer Handoff Best Practices", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec13c.id },
  ]})

  // --- Course 14: SEO Masterclass (Mike) ---
  const sec14a = await prisma.section.create({ data: { title: "SEO Foundations", position: 1, courseId: course14.id } })
  await prisma.lecture.createMany({ data: [
    { title: "How Search Engines Work", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, isFreePreview: true, sectionId: sec14a.id },
    { title: "Keyword Research Mastery", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec14a.id },
    { title: "Search Intent & Content Mapping", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec14a.id },
  ]})
  const sec14b = await prisma.section.create({ data: { title: "On-Page & Technical SEO", position: 2, courseId: course14.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Title Tags, Meta Descriptions & Headers", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec14b.id },
    { title: "Site Speed & Core Web Vitals", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec14b.id },
    { title: "Schema Markup & Structured Data", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec14b.id },
  ]})
  const sec14c = await prisma.section.create({ data: { title: "Link Building & Analytics", position: 3, courseId: course14.id } })
  await prisma.lecture.createMany({ data: [
    { title: "White-Hat Link Building Strategies", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec14c.id },
    { title: "Google Search Console Deep Dive", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec14c.id },
    { title: "SEO Reporting & KPIs", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec14c.id },
  ]})

  // --- Course 15: Social Media Marketing (Mike) ---
  const sec15a = await prisma.section.create({ data: { title: "Social Media Strategy", position: 1, courseId: course15.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Building Your Social Media Plan", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, isFreePreview: true, sectionId: sec15a.id },
    { title: "Choosing the Right Platforms", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec15a.id },
    { title: "Content Pillars & Calendar", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec15a.id },
  ]})
  const sec15b = await prisma.section.create({ data: { title: "Platform Deep Dives", position: 2, courseId: course15.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Instagram Growth Strategies", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec15b.id },
    { title: "TikTok for Business", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec15b.id },
    { title: "LinkedIn B2B Marketing", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec15b.id },
  ]})
  const sec15c = await prisma.section.create({ data: { title: "Paid Social & Analytics", position: 3, courseId: course15.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Running Paid Social Campaigns", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec15c.id },
    { title: "A/B Testing Creatives", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 420, sectionId: sec15c.id },
    { title: "Measuring ROI & Reporting", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec15c.id },
  ]})

  // --- Course 16: React & Next.js (John) ---
  const sec16a = await prisma.section.create({ data: { title: "React Fundamentals", position: 1, courseId: course16.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Why React?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 300, isFreePreview: true, sectionId: sec16a.id },
    { title: "JSX and Components", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec16a.id },
    { title: "Props and State", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 720, sectionId: sec16a.id },
    { title: "Hooks: useState & useEffect", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 660, sectionId: sec16a.id },
  ]})
  const sec16b = await prisma.section.create({ data: { title: "Next.js App Router", position: 2, courseId: course16.id } })
  await prisma.lecture.createMany({ data: [
    { title: "File-Based Routing", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec16b.id },
    { title: "Server Components vs Client Components", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 660, sectionId: sec16b.id },
    { title: "Data Fetching Patterns", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec16b.id },
  ]})
  const sec16c = await prisma.section.create({ data: { title: "Full-Stack with Next.js", position: 3, courseId: course16.id } })
  await prisma.lecture.createMany({ data: [
    { title: "API Routes & Server Actions", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec16c.id },
    { title: "Authentication with NextAuth", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec16c.id },
    { title: "Database Integration with Prisma", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 660, sectionId: sec16c.id },
    { title: "Deploying to Vercel", type: "VIDEO", position: 4, videoUrl: V(), videoDuration: 480, sectionId: sec16c.id },
  ]})

  // --- Course 17: Product Management (Sarah) ---
  const sec17a = await prisma.section.create({ data: { title: "The Product Manager Role", position: 1, courseId: course17.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What Does a PM Actually Do?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, isFreePreview: true, sectionId: sec17a.id },
    { title: "Product vs Project Management", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec17a.id },
    { title: "The PM Toolkit", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec17a.id },
  ]})
  const sec17b = await prisma.section.create({ data: { title: "Discovery & Strategy", position: 2, courseId: course17.id } })
  await prisma.lecture.createMany({ data: [
    { title: "User Research for PMs", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec17b.id },
    { title: "Defining Product Vision & Strategy", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec17b.id },
    { title: "Prioritization Frameworks: RICE, MoSCoW, ICE", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec17b.id },
  ]})
  const sec17c = await prisma.section.create({ data: { title: "Execution & Delivery", position: 3, courseId: course17.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Writing User Stories & PRDs", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec17c.id },
    { title: "Working with Engineering Teams", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec17c.id },
    { title: "Metrics & Product Analytics", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec17c.id },
  ]})

  // --- Course 18: Public Speaking Crash Course (Mike, free) ---
  const sec18a = await prisma.section.create({ data: { title: "Overcoming Fear", position: 1, courseId: course18.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Why We Fear Public Speaking", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 300, isFreePreview: true, sectionId: sec18a.id },
    { title: "Breathing & Relaxation Techniques", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec18a.id },
    { title: "Reframing Nervousness as Energy", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 300, sectionId: sec18a.id },
  ]})
  const sec18b = await prisma.section.create({ data: { title: "Crafting Your Message", position: 2, courseId: course18.id } })
  await prisma.lecture.createMany({ data: [
    { title: "The 3-Part Speech Structure", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, sectionId: sec18b.id },
    { title: "Opening Hooks That Grab Attention", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec18b.id },
    { title: "Storytelling for Speakers", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec18b.id },
  ]})
  const sec18c = await prisma.section.create({ data: { title: "Delivery & Body Language", position: 3, courseId: course18.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Vocal Variety & Pacing", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 360, sectionId: sec18c.id },
    { title: "Body Language & Eye Contact", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 420, sectionId: sec18c.id },
    { title: "Practice Drills & Final Tips", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 300, sectionId: sec18c.id },
  ]})

  console.log("Sections and lectures created for all 18 courses")

  // Create enrollments
  await prisma.enrollment.createMany({
    data: [
      { userId: student1.id, courseId: course1.id, progress: 25, lastAccessedAt: new Date() },
      { userId: student2.id, courseId: course1.id, progress: 60, lastAccessedAt: new Date() },
      { userId: student1.id, courseId: course2.id, progress: 10, lastAccessedAt: new Date() },
      { userId: student2.id, courseId: course3.id, progress: 45, lastAccessedAt: new Date() },
      { userId: student1.id, courseId: course6.id, progress: 30, lastAccessedAt: new Date() },
      { userId: student2.id, courseId: course8.id, progress: 15, lastAccessedAt: new Date() },
      { userId: student1.id, courseId: course11.id, progress: 70, lastAccessedAt: new Date() },
      { userId: student2.id, courseId: course13.id, progress: 50, lastAccessedAt: new Date() },
      { userId: student1.id, courseId: course16.id, progress: 20, lastAccessedAt: new Date() },
      { userId: student2.id, courseId: course17.id, progress: 35, lastAccessedAt: new Date() },
    ],
  })

  console.log("Enrollments created")

  // Create reviews
  await prisma.review.createMany({
    data: [
      { rating: 5, comment: "Excellent course! The instructor explains everything clearly. I went from complete beginner to building my own projects.", userId: student1.id, courseId: course1.id },
      { rating: 4, comment: "Great content and well-structured. Would love to see more advanced topics added.", userId: student2.id, courseId: course1.id },
      { rating: 5, comment: "Sarah is an amazing teacher. The UX frameworks she teaches are directly applicable to my work.", userId: student1.id, courseId: course2.id },
      { rating: 5, comment: "Mike's marketing knowledge is top-notch. Already seeing results from applying his strategies.", userId: student2.id, courseId: course3.id },
      { rating: 4, comment: "Very practical business strategy course. The case studies really helped solidify the concepts.", userId: student1.id, courseId: course6.id },
      { rating: 5, comment: "Passed the AWS CCP exam on my first try thanks to this course! Highly recommended.", userId: student2.id, courseId: course8.id },
      { rating: 5, comment: "My productivity has doubled since taking this course. The habit-building section alone was worth it.", userId: student1.id, courseId: course11.id },
      { rating: 5, comment: "Best Figma course out there. Sarah covers everything from basics to advanced component design.", userId: student2.id, courseId: course13.id },
      { rating: 4, comment: "Great Next.js content. Would love more on server actions and deployment.", userId: student1.id, courseId: course16.id },
      { rating: 5, comment: "Clear, practical, and immediately useful. Sarah's product management insights are invaluable.", userId: student2.id, courseId: course17.id },
    ],
  })

  console.log("Reviews created")

  // Create purchases (amounts in cents, 70/30 split)
  await prisma.purchase.createMany({
    data: [
      { userId: student1.id, courseId: course1.id, amount: 9999, platformFee: 3000, instructorEarning: 6999, status: "COMPLETED", courseName: course1.title, coursePrice: 99.99 },
      { userId: student2.id, courseId: course1.id, amount: 9999, platformFee: 3000, instructorEarning: 6999, status: "COMPLETED", courseName: course1.title, coursePrice: 99.99 },
      { userId: student1.id, courseId: course2.id, amount: 7999, platformFee: 2400, instructorEarning: 5599, status: "COMPLETED", courseName: course2.title, coursePrice: 79.99 },
      { userId: student2.id, courseId: course3.id, amount: 4999, platformFee: 1500, instructorEarning: 3499, status: "COMPLETED", courseName: course3.title, coursePrice: 49.99 },
      { userId: student1.id, courseId: course6.id, amount: 6999, platformFee: 2100, instructorEarning: 4899, status: "COMPLETED", courseName: course6.title, coursePrice: 69.99 },
      { userId: student2.id, courseId: course8.id, amount: 5999, platformFee: 1800, instructorEarning: 4199, status: "COMPLETED", courseName: course8.title, coursePrice: 59.99 },
      { userId: student1.id, courseId: course11.id, amount: 3999, platformFee: 1200, instructorEarning: 2799, status: "COMPLETED", courseName: course11.title, coursePrice: 39.99 },
      { userId: student2.id, courseId: course13.id, amount: 5999, platformFee: 1800, instructorEarning: 4199, status: "COMPLETED", courseName: course13.title, coursePrice: 59.99 },
      { userId: student1.id, courseId: course16.id, amount: 8999, platformFee: 2700, instructorEarning: 6299, status: "COMPLETED", courseName: course16.title, coursePrice: 89.99 },
      { userId: student2.id, courseId: course17.id, amount: 7499, platformFee: 2250, instructorEarning: 5249, status: "COMPLETED", courseName: course17.title, coursePrice: 74.99 },
    ],
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
  console.log("Admin:      admin@learnify.com / password123")
  console.log("Instructor: john@learnify.com / password123")
  console.log("Instructor: sarah@learnify.com / password123")
  console.log("Instructor: mike@learnify.com / password123")
  console.log("Student:    student1@example.com / password123")
  console.log("Student:    student2@example.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
