import "dotenv/config"
import { PrismaClient, UserRole, CourseLevel, CourseStatus, AssignmentStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Clean database in order (respecting foreign keys)
  await prisma.lectureProgress.deleteMany()
  await prisma.courseAssignment.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.lecture.deleteMany()
  await prisma.section.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log("Database cleaned")

  // ==================== CATEGORIES ====================

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Child Development",
        slug: "child-development",
        description: "Understanding developmental milestones and child psychology",
        icon: "Baby",
      },
    }),
    prisma.category.create({
      data: {
        name: "Health & Safety",
        slug: "health-safety",
        description: "First aid, hygiene, and safety protocols for childcare",
        icon: "HeartPulse",
      },
    }),
    prisma.category.create({
      data: {
        name: "Nutrition & Wellness",
        slug: "nutrition-wellness",
        description: "Meal planning, dietary needs, and wellness for young children",
        icon: "Apple",
      },
    }),
    prisma.category.create({
      data: {
        name: "Curriculum Planning",
        slug: "curriculum-planning",
        description: "Designing age-appropriate learning activities and programmes",
        icon: "BookOpen",
      },
    }),
    prisma.category.create({
      data: {
        name: "Special Needs",
        slug: "special-needs",
        description: "Inclusive education and supporting children with additional needs",
        icon: "Accessibility",
      },
    }),
    prisma.category.create({
      data: {
        name: "Parent Communication",
        slug: "parent-communication",
        description: "Building partnerships with families and effective communication",
        icon: "MessageCircle",
      },
    }),
    prisma.category.create({
      data: {
        name: "Regulatory Compliance",
        slug: "regulatory-compliance",
        description: "ECDA licensing, regulations, and compliance requirements",
        icon: "Shield",
      },
    }),
  ])

  console.log("Categories created:", categories.length)

  // ==================== ORGANIZATIONS ====================

  const org1 = await prisma.organization.create({
    data: {
      name: "Sunshine Childcare Centre",
      slug: "sunshine-childcare",
      contactName: "Tan Wei Ming",
      contactEmail: "manager@sunshine.sg",
      phone: "+65 6234 5678",
      address: "123 Bukit Timah Road, #01-01, Singapore 259700",
      licenseNumber: "SCC-2024-001",
      maxLearners: 50,
      billingEnabled: false,
    },
  })

  const org2 = await prisma.organization.create({
    data: {
      name: "Little Explorers Academy",
      slug: "little-explorers",
      contactName: "Lim Siew Kuan",
      contactEmail: "admin@littleexplorers.sg",
      phone: "+65 6345 6789",
      address: "456 Tampines Street 42, #02-15, Singapore 520456",
      licenseNumber: "LEA-2024-002",
      maxLearners: 30,
      billingEnabled: false,
    },
  })

  const org3 = await prisma.organization.create({
    data: {
      name: "Bright Beginnings Preschool",
      slug: "bright-beginnings",
      contactName: "Aisha Rahman",
      contactEmail: "admin@brightbeginnings.sg",
      phone: "+65 6456 7890",
      address: "789 Woodlands Avenue 6, #01-08, Singapore 738990",
      licenseNumber: "BBP-2024-003",
      maxLearners: 40,
      billingEnabled: false,
    },
  })

  console.log("Organizations created: 3")

  // ==================== USERS ====================

  const hashedPassword = await bcrypt.hash("password123", 12)

  const admin = await prisma.user.create({
    data: {
      email: "admin@learnify.sg",
      password: hashedPassword,
      name: "Platform Admin",
      role: UserRole.SUPER_ADMIN,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      bio: "Platform administrator for Learnify childcare training.",
    },
  })

  const corpAdmin1 = await prisma.user.create({
    data: {
      email: "manager@sunshine.sg",
      password: hashedPassword,
      name: "Tan Wei Ming",
      role: UserRole.CORPORATE_ADMIN,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Centre manager at Sunshine Childcare Centre with 15 years of experience in early childhood education.",
      jobTitle: "Centre Manager",
      organizationId: org1.id,
    },
  })

  const corpAdmin2 = await prisma.user.create({
    data: {
      email: "admin@littleexplorers.sg",
      password: hashedPassword,
      name: "Lim Siew Kuan",
      role: UserRole.CORPORATE_ADMIN,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Principal at Little Explorers Academy, passionate about innovative early childhood education.",
      jobTitle: "Principal",
      organizationId: org2.id,
    },
  })

  const learner1 = await prisma.user.create({
    data: {
      email: "sarah@sunshine.sg",
      password: hashedPassword,
      name: "Sarah Ong",
      role: UserRole.LEARNER,
      image: "https://randomuser.me/api/portraits/women/28.jpg",
      bio: "Early childhood educator specialising in infant care.",
      jobTitle: "Senior Educator",
      staffId: "SCC-E001",
      organizationId: org1.id,
    },
  })

  const learner2 = await prisma.user.create({
    data: {
      email: "priya@sunshine.sg",
      password: hashedPassword,
      name: "Priya Nair",
      role: UserRole.LEARNER,
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      bio: "Passionate about child development and inclusive education.",
      jobTitle: "Educator",
      staffId: "SCC-E002",
      organizationId: org1.id,
    },
  })

  const learner3 = await prisma.user.create({
    data: {
      email: "zhang@littleexplorers.sg",
      password: hashedPassword,
      name: "Zhang Li",
      role: UserRole.LEARNER,
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      bio: "Curriculum specialist focused on early literacy development.",
      jobTitle: "Lead Teacher",
      staffId: "LEA-E001",
      organizationId: org2.id,
    },
  })

  console.log("Users created: 6")

  // ==================== COURSES ====================

  // Sample video URLs (public domain)
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
  ]
  let _vi = 0
  const V = () => VIDEOS[_vi++ % VIDEOS.length]

  // Course 1: CPR & First Aid
  const course1 = await prisma.course.create({
    data: {
      title: "CPR & First Aid for Childcare Workers",
      slug: "cpr-first-aid-childcare-workers",
      subtitle: "Essential life-saving skills for early childhood educators",
      description: `<h2>Be Prepared to Save a Life</h2>
<p>This course equips childcare professionals with critical CPR and first aid skills tailored specifically for infants and young children. Learn to respond to common emergencies in childcare settings.</p>
<h3>Course Highlights</h3>
<ul>
  <li>Infant and child CPR techniques</li>
  <li>Choking response procedures</li>
  <li>Wound care and burn treatment</li>
  <li>Allergy and anaphylaxis management</li>
  <li>Emergency action plans for childcare centres</li>
</ul>`,
      thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
      priceSgd: 60,
      cpdPoints: 3,
      estimatedHours: 2.5,
      level: CourseLevel.ALL_LEVELS,
      learningOutcomes: [
        "Perform infant and child CPR correctly",
        "Respond to choking emergencies in children",
        "Apply appropriate first aid for common injuries",
        "Create and implement emergency action plans",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 5400,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[1].id, // Health & Safety
    },
  })

  // Course 2: Child Development Milestones
  const course2 = await prisma.course.create({
    data: {
      title: "Child Development Milestones: 0-6 Years",
      slug: "child-development-milestones-0-6",
      subtitle: "Understanding physical, cognitive, and social-emotional development",
      description: `<h2>Master Child Development Theory</h2>
<p>Gain a comprehensive understanding of how children grow and develop from birth through age six. This course covers key developmental theories and practical observation techniques.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800",
      priceSgd: 60,
      cpdPoints: 4,
      estimatedHours: 3,
      level: CourseLevel.BEGINNER,
      learningOutcomes: [
        "Identify key developmental milestones from birth to 6 years",
        "Apply developmental theories to daily practice",
        "Recognise signs of developmental delays",
        "Create developmentally appropriate activities",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 7200,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[0].id, // Child Development
    },
  })

  // Course 3: Early Literacy Strategies
  const course3 = await prisma.course.create({
    data: {
      title: "Early Literacy Strategies",
      slug: "early-literacy-strategies",
      subtitle: "Building strong foundations for reading and writing",
      description: `<h2>Foster a Love of Reading</h2>
<p>Discover evidence-based strategies for developing early literacy skills in young children. From phonemic awareness to story-telling, learn to create a language-rich environment.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
      priceSgd: 60,
      cpdPoints: 3,
      estimatedHours: 2,
      level: CourseLevel.INTERMEDIATE,
      learningOutcomes: [
        "Implement phonemic awareness activities",
        "Design a print-rich classroom environment",
        "Use story-telling to develop language skills",
        "Support bilingual literacy development",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 5400,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[3].id, // Curriculum Planning
    },
  })

  // Course 4: Nutrition & Meal Planning
  const course4 = await prisma.course.create({
    data: {
      title: "Nutrition & Meal Planning for Children",
      slug: "nutrition-meal-planning-children",
      subtitle: "Ensuring healthy eating habits in childcare settings",
      description: `<h2>Nourishing Young Minds and Bodies</h2>
<p>Learn to plan nutritious meals and snacks for children, manage food allergies, and promote healthy eating habits in compliance with Singapore HPB guidelines.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800",
      priceSgd: 60,
      cpdPoints: 2,
      estimatedHours: 2,
      level: CourseLevel.ALL_LEVELS,
      learningOutcomes: [
        "Plan age-appropriate nutritious meals",
        "Manage common food allergies and dietary restrictions",
        "Implement HPB My Healthy Plate guidelines",
        "Create positive mealtime environments",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 5400,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[2].id, // Nutrition & Wellness
    },
  })

  // Course 5: Managing Challenging Behaviours
  const course5 = await prisma.course.create({
    data: {
      title: "Managing Challenging Behaviours",
      slug: "managing-challenging-behaviours",
      subtitle: "Positive behaviour guidance for early childhood settings",
      description: `<h2>Guide Children Through Difficult Moments</h2>
<p>Learn research-backed approaches to understanding and managing challenging behaviours in young children. Develop skills in positive behaviour support and trauma-informed care.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800",
      priceSgd: 60,
      cpdPoints: 3,
      estimatedHours: 2.5,
      level: CourseLevel.INTERMEDIATE,
      learningOutcomes: [
        "Understand the root causes of challenging behaviours",
        "Implement positive behaviour guidance strategies",
        "Create supportive classroom environments",
        "Collaborate with families on behaviour management",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 5400,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[4].id, // Special Needs
    },
  })

  // Course 6: Effective Parent-Teacher Communication
  const course6 = await prisma.course.create({
    data: {
      title: "Effective Parent-Teacher Communication",
      slug: "effective-parent-teacher-communication",
      subtitle: "Building strong partnerships with families",
      description: `<h2>Connect with Families</h2>
<p>Strengthen your communication skills to build productive relationships with parents and caregivers. Learn to handle sensitive conversations, share developmental updates, and partner with families.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
      priceSgd: 60,
      cpdPoints: 2,
      estimatedHours: 2,
      level: CourseLevel.BEGINNER,
      learningOutcomes: [
        "Conduct effective parent-teacher conferences",
        "Communicate sensitive information with empathy",
        "Use digital tools for family engagement",
        "Build a culture of partnership with families",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 5400,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[5].id, // Parent Communication
    },
  })

  // Course 7: ECDA Licensing Requirements
  const course7 = await prisma.course.create({
    data: {
      title: "ECDA Licensing Requirements & Compliance",
      slug: "ecda-licensing-requirements-compliance",
      subtitle: "Stay compliant with Singapore childcare regulations",
      description: `<h2>Navigate ECDA Regulations with Confidence</h2>
<p>A comprehensive guide to understanding and meeting ECDA licensing requirements for childcare centres in Singapore. Stay up-to-date with regulatory changes and best practices.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
      priceSgd: 60,
      cpdPoints: 4,
      estimatedHours: 3,
      level: CourseLevel.INTERMEDIATE,
      learningOutcomes: [
        "Understand ECDA licensing framework and requirements",
        "Implement proper staff-to-child ratio protocols",
        "Maintain compliant documentation and records",
        "Prepare for ECDA quality audits",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 7200,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[6].id, // Regulatory Compliance
    },
  })

  // Course 8: Inclusive Education
  const course8 = await prisma.course.create({
    data: {
      title: "Inclusive Education in Early Childhood",
      slug: "inclusive-education-early-childhood",
      subtitle: "Supporting children with diverse learning needs",
      description: `<h2>Every Child Matters</h2>
<p>Learn to create inclusive learning environments that support all children, including those with developmental delays, learning differences, and disabilities. Aligned with Singapore's inclusive education initiatives.</p>`,
      thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
      priceSgd: 60,
      cpdPoints: 3,
      estimatedHours: 2.5,
      level: CourseLevel.INTERMEDIATE,
      learningOutcomes: [
        "Design inclusive learning environments",
        "Adapt curriculum for children with special needs",
        "Collaborate with allied health professionals",
        "Implement individualised education plans (IEPs)",
      ],
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
      totalDuration: 5400,
      totalLectures: 9,
      createdById: admin.id,
      categoryId: categories[4].id, // Special Needs
    },
  })

  console.log("Courses created: 8")

  // ==================== SECTIONS & LECTURES ====================

  // --- Course 1: CPR & First Aid ---
  const sec1a = await prisma.section.create({ data: { title: "Introduction to Emergency Response", position: 1, courseId: course1.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Welcome & Course Overview", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 300, sectionId: sec1a.id },
    { title: "Understanding Medical Emergencies in Childcare", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec1a.id },
    { title: "The Emergency Action Plan", type: "TEXT", position: 3, content: "<h2>Creating Your Emergency Action Plan</h2><p>Every childcare centre should have a written emergency action plan that is reviewed regularly. This lesson covers the key components including emergency contacts, evacuation routes, and communication procedures.</p>", sectionId: sec1a.id },
  ]})

  const sec1b = await prisma.section.create({ data: { title: "CPR for Infants and Children", position: 2, courseId: course1.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Infant CPR: Step-by-Step", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 720, sectionId: sec1b.id },
    { title: "Child CPR Techniques", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec1b.id },
    { title: "CPR Knowledge Check", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "What is the correct compression-to-breath ratio for infant CPR?", options: ["15:2", "30:2", "5:1", "10:2"], correctAnswer: 1 },
      { id: "q2", type: "multiple-choice", question: "For an infant, compressions should be performed with:", options: ["Two hands", "One hand", "Two fingers", "The heel of one hand"], correctAnswer: 2 },
      { id: "q3", type: "multiple-choice", question: "Before starting CPR, you should first:", options: ["Call for help immediately", "Check for responsiveness", "Begin chest compressions", "Give rescue breaths"], correctAnswer: 1 },
    ]}), sectionId: sec1b.id },
  ]})

  const sec1c = await prisma.section.create({ data: { title: "Common Injuries & First Aid", position: 3, courseId: course1.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Choking Response for Infants and Children", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec1c.id },
    { title: "Treating Burns, Cuts, and Allergic Reactions", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec1c.id },
    { title: "First Aid Kit Essentials & Documentation", type: "TEXT", position: 3, content: "<h2>What Every Childcare First Aid Kit Needs</h2><p>Singapore regulations require specific items in childcare centre first aid kits. This lesson covers the mandatory items, proper storage, and incident documentation requirements.</p>", sectionId: sec1c.id },
  ]})

  // --- Course 2: Child Development Milestones ---
  const sec2a = await prisma.section.create({ data: { title: "Foundations of Child Development", position: 1, courseId: course2.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Key Developmental Theories", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec2a.id },
    { title: "Nature vs Nurture in Development", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec2a.id },
    { title: "Observation and Assessment Techniques", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec2a.id },
  ]})

  const sec2b = await prisma.section.create({ data: { title: "Physical and Cognitive Development", position: 2, courseId: course2.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Motor Development: 0-3 Years", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec2b.id },
    { title: "Cognitive Milestones: 0-6 Years", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec2b.id },
    { title: "Development Quiz", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "At what age do most children begin to walk independently?", options: ["6-8 months", "9-12 months", "12-15 months", "18-24 months"], correctAnswer: 2 },
      { id: "q2", type: "multiple-choice", question: "Piaget's preoperational stage typically covers ages:", options: ["0-2 years", "2-7 years", "7-11 years", "11+ years"], correctAnswer: 1 },
    ]}), sectionId: sec2b.id },
  ]})

  const sec2c = await prisma.section.create({ data: { title: "Social-Emotional Development", position: 3, courseId: course2.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Attachment Theory in Practice", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec2c.id },
    { title: "Emotional Regulation in Young Children", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec2c.id },
    { title: "Supporting Social Skills Development", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec2c.id },
  ]})

  // --- Course 3: Early Literacy Strategies ---
  const sec3a = await prisma.section.create({ data: { title: "Building Literacy Foundations", position: 1, courseId: course3.id } })
  await prisma.lecture.createMany({ data: [
    { title: "The Five Pillars of Early Literacy", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec3a.id },
    { title: "Phonemic Awareness Activities", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec3a.id },
    { title: "Creating a Print-Rich Environment", type: "TEXT", position: 3, content: "<h2>Designing a Literacy-Rich Classroom</h2><p>A print-rich environment helps children understand that text carries meaning. Learn how to label classroom areas, create word walls, and display children's writing.</p>", sectionId: sec3a.id },
  ]})

  const sec3b = await prisma.section.create({ data: { title: "Story-Telling and Reading Aloud", position: 2, courseId: course3.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Interactive Read-Aloud Techniques", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec3b.id },
    { title: "Choosing Age-Appropriate Books", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec3b.id },
    { title: "Story-Telling with Props and Puppets", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec3b.id },
  ]})

  const sec3c = await prisma.section.create({ data: { title: "Writing Development", position: 3, courseId: course3.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Stages of Writing Development", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec3c.id },
    { title: "Fine Motor Activities for Writing Readiness", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 420, sectionId: sec3c.id },
    { title: "Literacy Assessment Quiz", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "Which is NOT one of the five pillars of early literacy?", options: ["Phonemic awareness", "Vocabulary", "Mathematics", "Fluency"], correctAnswer: 2 },
      { id: "q2", type: "multiple-choice", question: "At what age do children typically begin to recognise familiar logos and signs?", options: ["1-2 years", "2-3 years", "3-4 years", "5-6 years"], correctAnswer: 1 },
    ]}), sectionId: sec3c.id },
  ]})

  // --- Course 4: Nutrition & Meal Planning ---
  const sec4a = await prisma.section.create({ data: { title: "Nutrition Basics for Children", position: 1, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Nutritional Needs by Age Group", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec4a.id },
    { title: "Understanding Food Groups and Portions", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec4a.id },
    { title: "HPB My Healthy Plate Guidelines", type: "TEXT", position: 3, content: "<h2>My Healthy Plate for Children</h2><p>The Health Promotion Board's My Healthy Plate guidelines recommend filling half the plate with fruits and vegetables, a quarter with wholegrains, and a quarter with protein.</p>", sectionId: sec4a.id },
  ]})

  const sec4b = await prisma.section.create({ data: { title: "Meal Planning & Preparation", position: 2, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Creating Weekly Meal Plans", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec4b.id },
    { title: "Food Safety and Hygiene in Childcare", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec4b.id },
    { title: "Healthy Snack Ideas for Children", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec4b.id },
  ]})

  const sec4c = await prisma.section.create({ data: { title: "Special Dietary Needs", position: 3, courseId: course4.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Managing Food Allergies and Intolerances", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec4c.id },
    { title: "Cultural and Religious Dietary Considerations", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec4c.id },
    { title: "Nutrition Knowledge Check", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "According to HPB guidelines, what portion of a child's plate should be fruits and vegetables?", options: ["One quarter", "One third", "Half", "Two thirds"], correctAnswer: 2 },
      { id: "q2", type: "multiple-choice", question: "Which of the following is the most common food allergy in children?", options: ["Shellfish", "Cow's milk", "Wheat", "Soy"], correctAnswer: 1 },
    ]}), sectionId: sec4c.id },
  ]})

  // --- Course 5: Managing Challenging Behaviours ---
  const sec5a = await prisma.section.create({ data: { title: "Understanding Behaviour", position: 1, courseId: course5.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Why Children Exhibit Challenging Behaviours", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec5a.id },
    { title: "The ABC Model of Behaviour", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec5a.id },
    { title: "Trauma-Informed Approaches", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 480, sectionId: sec5a.id },
  ]})

  const sec5b = await prisma.section.create({ data: { title: "Positive Behaviour Strategies", position: 2, courseId: course5.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Setting Clear Expectations and Routines", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec5b.id },
    { title: "Redirection and De-escalation Techniques", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec5b.id },
    { title: "Building Emotional Literacy", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec5b.id },
  ]})

  const sec5c = await prisma.section.create({ data: { title: "Collaboration and Documentation", position: 3, courseId: course5.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Working with Families on Behaviour Goals", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec5c.id },
    { title: "Behaviour Observation and Documentation", type: "TEXT", position: 2, content: "<h2>Documenting Behaviour Incidents</h2><p>Proper documentation is essential for tracking behaviour patterns and communicating with families. Learn to use ABC charts, incident reports, and progress notes effectively.</p>", sectionId: sec5c.id },
    { title: "Behaviour Management Quiz", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "In the ABC model, what does 'A' stand for?", options: ["Action", "Antecedent", "Assessment", "Attitude"], correctAnswer: 1 },
      { id: "q2", type: "multiple-choice", question: "Which is an example of a positive behaviour guidance strategy?", options: ["Time-out in isolation", "Redirection to appropriate activity", "Removing privileges", "Raising voice to get attention"], correctAnswer: 1 },
    ]}), sectionId: sec5c.id },
  ]})

  // --- Course 6: Parent-Teacher Communication ---
  const sec6a = await prisma.section.create({ data: { title: "Foundations of Family Engagement", position: 1, courseId: course6.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Building Trust with Families", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec6a.id },
    { title: "Cultural Sensitivity in Communication", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec6a.id },
    { title: "Daily Communication Best Practices", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 420, sectionId: sec6a.id },
  ]})

  const sec6b = await prisma.section.create({ data: { title: "Structured Communication", position: 2, courseId: course6.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Conducting Parent-Teacher Conferences", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec6b.id },
    { title: "Writing Progress Reports", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec6b.id },
    { title: "Handling Difficult Conversations", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec6b.id },
  ]})

  const sec6c = await prisma.section.create({ data: { title: "Digital Communication Tools", position: 3, courseId: course6.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Using Apps and Platforms for Parent Updates", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 420, sectionId: sec6c.id },
    { title: "Photo and Video Documentation for Families", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 360, sectionId: sec6c.id },
    { title: "Communication Skills Quiz", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "What is the most important factor in building trust with families?", options: ["Sending frequent updates", "Consistent and honest communication", "Using professional language", "Following up on complaints"], correctAnswer: 1 },
      { id: "q2", type: "multiple-choice", question: "When discussing a child's behavioural concerns with parents, you should:", options: ["Focus on what the child did wrong", "Use 'sandwich' approach: positive-concern-positive", "Wait until the conference to bring it up", "Send a written report only"], correctAnswer: 1 },
    ]}), sectionId: sec6c.id },
  ]})

  // --- Course 7: ECDA Licensing ---
  const sec7a = await prisma.section.create({ data: { title: "ECDA Framework Overview", position: 1, courseId: course7.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Introduction to ECDA and Its Role", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec7a.id },
    { title: "Licensing Categories and Requirements", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 720, sectionId: sec7a.id },
    { title: "Staff Qualifications and Ratios", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec7a.id },
  ]})

  const sec7b = await prisma.section.create({ data: { title: "Compliance Requirements", position: 2, courseId: course7.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Physical Environment Standards", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec7b.id },
    { title: "Health, Hygiene, and Safety Protocols", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec7b.id },
    { title: "Record-Keeping and Documentation", type: "TEXT", position: 3, content: "<h2>Essential Records for ECDA Compliance</h2><p>Childcare centres must maintain several types of records including staff qualifications, children's registration forms, accident/incident reports, fire drill records, and daily attendance. This lesson details each requirement and recommended systems.</p>", sectionId: sec7b.id },
  ]})

  const sec7c = await prisma.section.create({ data: { title: "Quality Assurance", position: 3, courseId: course7.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Preparing for ECDA Quality Audits", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 660, sectionId: sec7c.id },
    { title: "Continuous Improvement Plans", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec7c.id },
    { title: "Compliance Knowledge Check", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "What is the required educator-to-child ratio for infants (2-18 months) in Singapore?", options: ["1:3", "1:5", "1:8", "1:10"], correctAnswer: 1 },
      { id: "q2", type: "multiple-choice", question: "How often must fire drills be conducted at a childcare centre?", options: ["Monthly", "Quarterly", "Every 6 months", "Annually"], correctAnswer: 2 },
    ]}), sectionId: sec7c.id },
  ]})

  // --- Course 8: Inclusive Education ---
  const sec8a = await prisma.section.create({ data: { title: "Principles of Inclusion", position: 1, courseId: course8.id } })
  await prisma.lecture.createMany({ data: [
    { title: "What is Inclusive Education?", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 480, sectionId: sec8a.id },
    { title: "Understanding Different Learning Needs", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 600, sectionId: sec8a.id },
    { title: "Singapore's Inclusive Education Landscape", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 540, sectionId: sec8a.id },
  ]})

  const sec8b = await prisma.section.create({ data: { title: "Adapting the Curriculum", position: 2, courseId: course8.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Universal Design for Learning (UDL)", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 600, sectionId: sec8b.id },
    { title: "Modifying Activities for Diverse Learners", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 540, sectionId: sec8b.id },
    { title: "Creating Individualised Education Plans", type: "VIDEO", position: 3, videoUrl: V(), videoDuration: 600, sectionId: sec8b.id },
  ]})

  const sec8c = await prisma.section.create({ data: { title: "Collaboration and Support", position: 3, courseId: course8.id } })
  await prisma.lecture.createMany({ data: [
    { title: "Working with Allied Health Professionals", type: "VIDEO", position: 1, videoUrl: V(), videoDuration: 540, sectionId: sec8c.id },
    { title: "Supporting Families of Children with Special Needs", type: "VIDEO", position: 2, videoUrl: V(), videoDuration: 480, sectionId: sec8c.id },
    { title: "Inclusive Education Quiz", type: "QUIZ", position: 3, content: JSON.stringify({ version: 1, questions: [
      { id: "q1", type: "multiple-choice", question: "What does UDL stand for?", options: ["Unified Design for Learners", "Universal Design for Learning", "Understanding Different Learners", "United Development of Learning"], correctAnswer: 1 },
      { id: "q2", type: "multiple-choice", question: "An IEP is best described as:", options: ["A standardised test score", "A plan for the entire class", "An individualised plan for a specific child", "A teacher evaluation tool"], correctAnswer: 2 },
    ]}), sectionId: sec8c.id },
  ]})

  console.log("Sections and lectures created for all 8 courses")

  // ==================== ENROLLMENTS & ASSIGNMENTS ====================

  // Fetch lectures for creating progress records
  const course1Lectures = await prisma.lecture.findMany({ where: { section: { courseId: course1.id } }, orderBy: [{ section: { position: "asc" } }, { position: "asc" }] })
  const course2Lectures = await prisma.lecture.findMany({ where: { section: { courseId: course2.id } }, orderBy: [{ section: { position: "asc" } }, { position: "asc" }] })
  const course3Lectures = await prisma.lecture.findMany({ where: { section: { courseId: course3.id } }, orderBy: [{ section: { position: "asc" } }, { position: "asc" }] })

  const now = new Date()
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const sixMonthsFromNow = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Sarah (learner1) - assigned 4 courses by her corporate admin
  // Course 1: 67% complete (6/9 lectures done)
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: learner1.id,
      courseId: course1.id,
      progress: 67,
      lastAccessedAt: now,
      assignedById: corpAdmin1.id,
      assignedAt: threeMonthsAgo,
      deadline: threeMonthsFromNow,
      scormStatus: "incomplete",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner1.id,
      courseId: course1.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: threeMonthsFromNow,
      status: AssignmentStatus.IN_PROGRESS,
      assignedAt: threeMonthsAgo,
      notes: "Mandatory first aid training for all educators",
    },
  })

  // Create progress for first 6 lectures of course 1
  for (let i = 0; i < Math.min(6, course1Lectures.length); i++) {
    await prisma.lectureProgress.create({
      data: {
        userId: learner1.id,
        lectureId: course1Lectures[i].id,
        isCompleted: true,
        completedAt: new Date(threeMonthsAgo.getTime() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
        watchedDuration: course1Lectures[i].videoDuration || 0,
        scormLessonStatus: "completed",
      },
    })
  }

  // Course 2: 33% complete (3/9)
  await prisma.enrollment.create({
    data: {
      userId: learner1.id,
      courseId: course2.id,
      progress: 33,
      lastAccessedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      assignedById: corpAdmin1.id,
      assignedAt: threeMonthsAgo,
      deadline: sixMonthsFromNow,
      scormStatus: "incomplete",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner1.id,
      courseId: course2.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: sixMonthsFromNow,
      status: AssignmentStatus.IN_PROGRESS,
      assignedAt: threeMonthsAgo,
    },
  })

  for (let i = 0; i < Math.min(3, course2Lectures.length); i++) {
    await prisma.lectureProgress.create({
      data: {
        userId: learner1.id,
        lectureId: course2Lectures[i].id,
        isCompleted: true,
        completedAt: new Date(threeMonthsAgo.getTime() + (i + 1) * 5 * 24 * 60 * 60 * 1000),
        watchedDuration: course2Lectures[i].videoDuration || 0,
        scormLessonStatus: "completed",
      },
    })
  }

  // Course 5: Assigned but not started
  await prisma.enrollment.create({
    data: {
      userId: learner1.id,
      courseId: course5.id,
      progress: 0,
      assignedById: corpAdmin1.id,
      assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      deadline: sixMonthsFromNow,
      scormStatus: "not attempted",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner1.id,
      courseId: course5.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: sixMonthsFromNow,
      status: AssignmentStatus.ASSIGNED,
      assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  })

  // Course 7: Assigned but not started
  await prisma.enrollment.create({
    data: {
      userId: learner1.id,
      courseId: course7.id,
      progress: 0,
      assignedById: corpAdmin1.id,
      assignedAt: now,
      deadline: sixMonthsFromNow,
      scormStatus: "not attempted",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner1.id,
      courseId: course7.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: sixMonthsFromNow,
      status: AssignmentStatus.ASSIGNED,
      assignedAt: now,
      notes: "Required for centre license renewal",
    },
  })

  // Priya (learner2) - assigned 3 courses
  // Course 1: 100% complete
  await prisma.enrollment.create({
    data: {
      userId: learner2.id,
      courseId: course1.id,
      progress: 100,
      completedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      assignedById: corpAdmin1.id,
      assignedAt: threeMonthsAgo,
      deadline: threeMonthsFromNow,
      scormStatus: "completed",
      scormScore: 90,
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner2.id,
      courseId: course1.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: threeMonthsFromNow,
      status: AssignmentStatus.COMPLETED,
      assignedAt: threeMonthsAgo,
    },
  })

  // Create completion progress for all lectures
  for (let i = 0; i < course1Lectures.length; i++) {
    await prisma.lectureProgress.create({
      data: {
        userId: learner2.id,
        lectureId: course1Lectures[i].id,
        isCompleted: true,
        completedAt: new Date(threeMonthsAgo.getTime() + (i + 1) * 4 * 24 * 60 * 60 * 1000),
        watchedDuration: course1Lectures[i].videoDuration || 0,
        scormLessonStatus: "completed",
      },
    })
  }

  // Certificate for Priya's completed course
  await prisma.certificate.create({
    data: {
      certificateId: `CERT-${Date.now()}-001`,
      courseName: course1.title,
      organizationName: "Sunshine Childcare Centre",
      cpdPoints: 3,
      userId: learner2.id,
      courseId: course1.id,
      issuedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Course 3: 55% complete
  await prisma.enrollment.create({
    data: {
      userId: learner2.id,
      courseId: course3.id,
      progress: 55,
      lastAccessedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      assignedById: corpAdmin1.id,
      assignedAt: threeMonthsAgo,
      deadline: threeMonthsFromNow,
      scormStatus: "incomplete",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner2.id,
      courseId: course3.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: threeMonthsFromNow,
      status: AssignmentStatus.IN_PROGRESS,
      assignedAt: threeMonthsAgo,
    },
  })

  for (let i = 0; i < Math.min(5, course3Lectures.length); i++) {
    await prisma.lectureProgress.create({
      data: {
        userId: learner2.id,
        lectureId: course3Lectures[i].id,
        isCompleted: true,
        completedAt: new Date(threeMonthsAgo.getTime() + (i + 1) * 5 * 24 * 60 * 60 * 1000),
        watchedDuration: course3Lectures[i].videoDuration || 0,
        scormLessonStatus: "completed",
      },
    })
  }

  // Course 8: Assigned, not started
  await prisma.enrollment.create({
    data: {
      userId: learner2.id,
      courseId: course8.id,
      progress: 0,
      assignedById: corpAdmin1.id,
      assignedAt: now,
      deadline: sixMonthsFromNow,
      scormStatus: "not attempted",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner2.id,
      courseId: course8.id,
      assignedById: corpAdmin1.id,
      organizationId: org1.id,
      deadline: sixMonthsFromNow,
      status: AssignmentStatus.ASSIGNED,
      assignedAt: now,
    },
  })

  // Zhang Li (learner3) - assigned 3 courses by Little Explorers admin
  // Course 2: 78% complete
  await prisma.enrollment.create({
    data: {
      userId: learner3.id,
      courseId: course2.id,
      progress: 78,
      lastAccessedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      assignedById: corpAdmin2.id,
      assignedAt: threeMonthsAgo,
      deadline: oneMonthFromNow,
      scormStatus: "incomplete",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner3.id,
      courseId: course2.id,
      assignedById: corpAdmin2.id,
      organizationId: org2.id,
      deadline: oneMonthFromNow,
      status: AssignmentStatus.IN_PROGRESS,
      assignedAt: threeMonthsAgo,
    },
  })

  for (let i = 0; i < Math.min(7, course2Lectures.length); i++) {
    await prisma.lectureProgress.create({
      data: {
        userId: learner3.id,
        lectureId: course2Lectures[i].id,
        isCompleted: true,
        completedAt: new Date(threeMonthsAgo.getTime() + (i + 1) * 4 * 24 * 60 * 60 * 1000),
        watchedDuration: course2Lectures[i].videoDuration || 0,
        scormLessonStatus: "completed",
      },
    })
  }

  // Course 3: 100% complete
  await prisma.enrollment.create({
    data: {
      userId: learner3.id,
      courseId: course3.id,
      progress: 100,
      completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      assignedById: corpAdmin2.id,
      assignedAt: threeMonthsAgo,
      deadline: threeMonthsFromNow,
      scormStatus: "completed",
      scormScore: 95,
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner3.id,
      courseId: course3.id,
      assignedById: corpAdmin2.id,
      organizationId: org2.id,
      deadline: threeMonthsFromNow,
      status: AssignmentStatus.COMPLETED,
      assignedAt: threeMonthsAgo,
    },
  })

  for (let i = 0; i < course3Lectures.length; i++) {
    await prisma.lectureProgress.create({
      data: {
        userId: learner3.id,
        lectureId: course3Lectures[i].id,
        isCompleted: true,
        completedAt: new Date(threeMonthsAgo.getTime() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
        watchedDuration: course3Lectures[i].videoDuration || 0,
        scormLessonStatus: "completed",
      },
    })
  }

  // Certificate for Zhang Li's completed course
  await prisma.certificate.create({
    data: {
      certificateId: `CERT-${Date.now()}-002`,
      courseName: course3.title,
      organizationName: "Little Explorers Academy",
      cpdPoints: 3,
      userId: learner3.id,
      courseId: course3.id,
      issuedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
  })

  // Course 6: Assigned, not started
  await prisma.enrollment.create({
    data: {
      userId: learner3.id,
      courseId: course6.id,
      progress: 0,
      assignedById: corpAdmin2.id,
      assignedAt: now,
      deadline: threeMonthsFromNow,
      scormStatus: "not attempted",
    },
  })

  await prisma.courseAssignment.create({
    data: {
      learnerId: learner3.id,
      courseId: course6.id,
      assignedById: corpAdmin2.id,
      organizationId: org2.id,
      deadline: threeMonthsFromNow,
      status: AssignmentStatus.ASSIGNED,
      assignedAt: now,
    },
  })

  console.log("Enrollments, assignments, and progress created")
  console.log("Certificates created: 2")

  // ==================== DONE ====================

  console.log("\nSeed completed successfully!")
  console.log("\nTest Accounts:")
  console.log("Super Admin:    admin@learnify.sg / password123")
  console.log("Corporate Admin: manager@sunshine.sg / password123 (Sunshine Childcare)")
  console.log("Corporate Admin: admin@littleexplorers.sg / password123 (Little Explorers)")
  console.log("Learner:        sarah@sunshine.sg / password123 (Sunshine)")
  console.log("Learner:        priya@sunshine.sg / password123 (Sunshine)")
  console.log("Learner:        zhang@littleexplorers.sg / password123 (Little Explorers)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
