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

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        course: {
          select: {
            title: true,
            instructor: { select: { name: true } },
          },
        },
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      )
    }

    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const invoiceNumber = `INV-${purchase.id.slice(0, 8).toUpperCase()}`
    const amount = Number(purchase.amount) / 100 // Convert cents to dollars

    // Generate HTML invoice
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #1a1a1a;
    }

    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 50px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #1a365d;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a365d;
      margin-bottom: 10px;
    }

    .invoice-number {
      font-size: 14px;
      color: #666;
    }

    .addresses {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .address-block {
      max-width: 250px;
    }

    .address-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .address-content {
      font-size: 14px;
      line-height: 1.6;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .table th {
      background: #f8f9fa;
      padding: 15px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
    }

    .table td {
      padding: 20px 15px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
    }

    .table .description {
      font-weight: 500;
    }

    .table .meta {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
    }

    .table .amount {
      text-align: right;
      font-weight: 500;
    }

    .totals {
      margin-left: auto;
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .total-row.grand {
      border-bottom: none;
      border-top: 2px solid #1a365d;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: 600;
    }

    .total-label {
      color: #666;
    }

    .total-row.grand .total-label {
      color: #1a365d;
    }

    .footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #f0f0f0;
      text-align: center;
      font-size: 13px;
      color: #666;
    }

    .payment-status {
      display: inline-block;
      padding: 5px 15px;
      background: #d4edda;
      color: #155724;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 10px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice {
        box-shadow: none;
        padding: 20px;
      }
      .print-btn {
        display: none;
      }
    }

    .print-btn {
      display: block;
      margin: 0 auto 20px;
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

  <div class="invoice">
    <div class="header">
      <div class="logo">Learnify</div>
      <div class="invoice-info">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoiceNumber}</div>
        <div class="invoice-number">Date: ${new Date(purchase.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <div class="address-label">From</div>
        <div class="address-content">
          <strong>Learnify Inc.</strong><br>
          123 Learning Street<br>
          San Francisco, CA 94102<br>
          United States
        </div>
      </div>
      <div class="address-block">
        <div class="address-label">Bill To</div>
        <div class="address-content">
          <strong>${purchase.user.name || "Customer"}</strong><br>
          ${purchase.user.email}
        </div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 100px;">Qty</th>
          <th style="width: 120px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="description">${purchase.course.title}</div>
            <div class="meta">Online Course • Lifetime Access</div>
            <div class="meta">Instructor: ${purchase.course.instructor.name}</div>
          </td>
          <td>1</td>
          <td class="amount">$${amount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span class="total-label">Subtotal</span>
        <span>$${amount.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span class="total-label">Tax</span>
        <span>$0.00</span>
      </div>
      <div class="total-row grand">
        <span class="total-label">Total</span>
        <span>$${amount.toFixed(2)}</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <span class="payment-status">✓ Paid</span>
    </div>

    <div class="footer">
      <p>Thank you for your purchase!</p>
      <p style="margin-top: 10px;">
        Questions? Contact us at support@learnify.com
      </p>
      ${purchase.stripePaymentIntentId ? `<p style="margin-top: 10px; font-size: 11px; color: #999;">Payment ID: ${purchase.stripePaymentIntentId}</p>` : ''}
    </div>
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
    console.error("Invoice download error:", error)
    return NextResponse.json(
      { message: "Failed to download invoice" },
      { status: 500 }
    )
  }
}
