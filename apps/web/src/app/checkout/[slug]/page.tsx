import { ArrowLeft, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { RazorpayCheckout } from "@/app/courses/[slug]/razorpay-checkout";
import { courseCatalog, getCourseBySlug } from "@/lib/course-catalog";

export function generateStaticParams() {
  return courseCatalog.map((course) => ({ slug: course.slug }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f3f5f4] text-[var(--ink)]">
      <header className="border-b border-[#dde3e0] bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-5">
          <a
            className="inline-flex min-w-0 items-center gap-2 text-sm font-black text-[var(--ink)] transition-colors hover:text-[var(--brand)]"
            href={`/courses/${course.slug}`}
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to course</span>
            <span className="sm:hidden">Back</span>
          </a>
          <a className="text-xl font-black tracking-normal text-[var(--brand)]" href="/">
            BENZO
          </a>
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
            <LockKeyhole size={14} />
            Razorpay secured
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-5 sm:py-7">
        <RazorpayCheckout courseSlug={course.slug} courseTitle={course.title} />
      </div>
    </main>
  );
}
