import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand + Tagline */}
          <div className="text-center md:text-left">
            <Link href="/" className="font-bold text-lg">
              Learnify
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              Professional Development for Childcare Professionals
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Learnify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
