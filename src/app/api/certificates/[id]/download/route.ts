import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
      },
    })

    if (!certificate) {
      return NextResponse.json(
        { message: "Certificate not found" },
        { status: 404 }
      )
    }

    if (certificate.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    // Generate HTML certificate
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate - ${certificate.courseName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Open Sans', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .certificate {
      width: 1000px;
      height: 700px;
      margin: 0 auto;
      background: white;
      position: relative;
      padding: 40px;
      border: 3px solid #1a365d;
    }

    .certificate::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 1px solid #cbd5e0;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: #1a365d;
      margin-bottom: 10px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      color: #1a365d;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 16px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    .content {
      text-align: center;
      padding: 30px 60px;
    }

    .presented {
      font-size: 14px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
    }

    .recipient {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      color: #2d3748;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
      display: inline-block;
    }

    .completion {
      font-size: 14px;
      color: #718096;
      margin-bottom: 20px;
    }

    .course-name {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #1a365d;
      margin-bottom: 30px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 60px;
      position: absolute;
      bottom: 60px;
      left: 0;
      right: 0;
    }

    .signature {
      text-align: center;
    }

    .signature-line {
      width: 200px;
      border-top: 1px solid #cbd5e0;
      margin-bottom: 8px;
    }

    .signature-name {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    .signature-title {
      font-size: 12px;
      color: #718096;
    }

    .cert-id {
      text-align: center;
      position: absolute;
      bottom: 25px;
      left: 0;
      right: 0;
      font-size: 11px;
      color: #a0aec0;
    }

    .date-info {
      text-align: center;
    }

    .date-label {
      font-size: 12px;
      color: #718096;
      margin-bottom: 5px;
    }

    .date-value {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .certificate {
        border: none;
        box-shadow: none;
      }
      .print-btn {
        display: none;
      }
    }

    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 12px 30px;
      background: #1a365d;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    }

    .print-btn:hover {
      background: #2c5282;
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Download as PDF</button>

  <div class="certificate">
    <div class="header">
      <div class="logo">Learnify</div>
      <div class="title">Certificate of Completion</div>
      <div class="subtitle">Professional Development</div>
    </div>

    <div class="content">
      <div class="presented">This is to certify that</div>
      <div class="recipient">${certificate.user.name || "Student"}</div>
      <div class="completion">has successfully completed the course</div>
      <div class="course-name">${certificate.courseName}</div>
    </div>

    <div class="footer">
      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">${certificate.instructorName}</div>
        <div class="signature-title">Course Instructor</div>
      </div>

      <div class="date-info">
        <div class="date-label">Date of Completion</div>
        <div class="date-value">${new Date(certificate.issuedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
      </div>

      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">Learnify</div>
        <div class="signature-title">Online Learning Platform</div>
      </div>
    </div>

    <div class="cert-id">Certificate ID: ${certificate.certificateId}</div>
  </div>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Certificate download error:", error)
    return NextResponse.json(
      { message: "Failed to download certificate" },
      { status: 500 }
    )
  }
}
