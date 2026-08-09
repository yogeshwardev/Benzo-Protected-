"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CreditCard,
  Gift,
  Loader2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  TicketPercent,
  UserRoundCheck,
  WalletCards
} from "lucide-react";
import { apiBaseUrl, parseApiError, type AuthSession } from "@/lib/auth";
import { apiRequest, formatMoney, getSession } from "@/lib/api";

type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = { error?: { description?: string; reason?: string } };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: RazorpayPaymentSuccess) => void;
};
type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailedResponse) => void) => void;
};
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type CourseResponse = { id: string; title: string; slug: string; priceInPaise: number };
type Quote = {
  course: { id: string; title: string; slug: string };
  baseAmountInPaise: number;
  couponDiscountInPaise: number;
  referralDiscountInPaise: number;
  walletBalanceInPaise: number;
  walletUsedInPaise: number;
  finalAmountInPaise: number;
  coupon?: { code: string };
  referral?: { referrerId: string; code: string; createIfMissing: boolean };
};
type CreateOrderResponse = {
  order_id?: string;
  amount?: number;
  currency?: string;
  order: { id: string; finalAmountInPaise: number };
  payment: {
    provider: "RAZORPAY" | "INTERNAL";
    keyId?: string;
    razorpayOrderId?: string;
    amountInPaise?: number;
    currency?: string;
  };
};
type QuoteOverrides = {
  couponCode?: string;
  referralCode?: string;
  walletAmountInPaise?: number;
};

export function RazorpayCheckout({ courseSlug, courseTitle }: { courseSlug: string; courseTitle: string }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [walletAmount, setWalletAmount] = useState("0");
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const stored = getSession();
    setSession(stored);

    void fetchPublicCourse(courseSlug)
      .then(async (loaded) => {
        if (!active) return;
        setCourse(loaded);

        if (stored?.user.role === "STUDENT") {
          const initialQuote = await requestQuote(loaded.id, {});
          if (active) {
            setQuote(initialQuote);
            if (initialQuote.referral?.code) setReferralCode(initialQuote.referral.code);
          }
        }
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load course.");
      });

    return () => {
      active = false;
    };
  }, [courseSlug]);

  async function refreshQuote(overrides: QuoteOverrides = {}, successMessage = "Savings updated.") {
    if (!course || !getSession()) return null;

    setQuoteBusy(true);
    setError(null);
    setMessage(null);

    try {
      const nextQuote = await requestQuote(course.id, {
        couponCode: overrides.couponCode ?? couponCode,
        referralCode: overrides.referralCode ?? referralCode,
        walletAmountInPaise: overrides.walletAmountInPaise ?? toPaise(walletAmount)
      });
      setQuote(nextQuote);
      if (successMessage) setMessage(successMessage);
      return nextQuote;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to calculate checkout price.");
      return null;
    } finally {
      setQuoteBusy(false);
    }
  }

  async function useMaximumWallet() {
    if (!quote) return;
    const payableBeforeWallet = quote.finalAmountInPaise + quote.walletUsedInPaise;
    const maximum = Math.min(quote.walletBalanceInPaise, payableBeforeWallet);
    setWalletAmount(String(maximum / 100));
    await refreshQuote({ walletAmountInPaise: maximum }, "Maximum available wallet balance applied.");
  }

  async function startCheckout() {
    if (!session || session.user.role !== "STUDENT" || !course) return;

    setPaymentBusy(true);
    setMessage(null);
    setError(null);
    let createdOrderId: string | null = null;

    try {
      const confirmedQuote = await refreshQuote({}, "");
      if (!confirmedQuote) throw new Error("Fix the checkout details before continuing.");

      const orderResponse = await apiRequest<CreateOrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify({
          courseId: course.id,
          ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
          ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
          walletAmountInPaise: confirmedQuote.walletUsedInPaise
        })
      });
      createdOrderId = orderResponse.order.id;

      if (orderResponse.payment.provider === "INTERNAL") {
        setMessage("Payment completed using your wallet. Enrollment is active.");
        window.setTimeout(() => window.location.assign(`/student/courses/${course.slug}/learn`), 900);
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again.");
      }

      const key = orderResponse.payment.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const razorpayOrderId = orderResponse.payment.razorpayOrderId ?? orderResponse.order_id;
      const amount = orderResponse.payment.amountInPaise ?? orderResponse.amount;
      const currency = orderResponse.payment.currency ?? orderResponse.currency ?? "INR";

      if (!key || !razorpayOrderId || !amount || amount < 100) {
        throw new Error("The payment order is incomplete.");
      }

      const cancelCreatedOrder = () => {
        if (createdOrderId) void cancelOrder(createdOrderId);
      };
      const razorpay = new window.Razorpay({
        key,
        amount,
        currency,
        name: "BENZO",
        description: `${courseTitle} course enrollment`,
        order_id: razorpayOrderId,
        prefill: { name: session.user.name, email: session.user.email },
        theme: { color: "#2446d8" },
        modal: {
          ondismiss: () => {
            cancelCreatedOrder();
            setPaymentBusy(false);
            setMessage("Payment was cancelled. No enrollment was created.");
          }
        },
        handler: (payment) => {
          void apiRequest<{ success: boolean }>("/payments/razorpay/verify", {
            method: "POST",
            body: JSON.stringify(payment)
          })
            .then(() => {
              setMessage("Payment verified. Your course is ready.");
              window.setTimeout(() => window.location.assign(`/student/courses/${course.slug}/learn`), 900);
            })
            .catch((caught: unknown) => {
              setError(caught instanceof Error ? caught.message : "Payment verification failed.");
            })
            .finally(() => setPaymentBusy(false));
        }
      });

      razorpay.on("payment.failed", (response) => {
        cancelCreatedOrder();
        setError(response.error?.description ?? response.error?.reason ?? "Payment failed.");
        setPaymentBusy(false);
      });
      razorpay.open();
    } catch (caught) {
      if (createdOrderId) void cancelOrder(createdOrderId);
      setError(caught instanceof Error ? caught.message : "Unable to start checkout.");
      setPaymentBusy(false);
    }
  }

  const isStudent = session?.user.role === "STUDENT";
  const basePrice = quote?.baseAmountInPaise ?? course?.priceInPaise ?? 0;
  const totalSavings = quote
    ? quote.couponDiscountInPaise + quote.referralDiscountInPaise + quote.walletUsedInPaise
    : 0;
  const discountPercent = basePrice > 0 ? Math.round((totalSavings / basePrice) * 100) : 0;
  const hasCoupon = Boolean(quote?.couponDiscountInPaise);
  const hasReferral = Boolean(quote?.referralDiscountInPaise);
  const hasWallet = Boolean(quote?.walletUsedInPaise);
  const referralLocked = Boolean(quote?.referral && !quote.referral.createIfMissing);

  return (
    <div className="grid gap-3 sm:gap-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Razorpay checkout could not load. Check your connection.")}
      />

      <section className="rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5" aria-labelledby="course-summary-title">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-[var(--brand)]">Course enrollment</p>
            <h1 id="course-summary-title" className="mt-1.5 text-xl font-black leading-7 sm:text-2xl">
              {course?.title ?? courseTitle}
            </h1>
            <p className="mt-1 text-sm leading-5 text-[var(--muted)]">Live classes, recordings and learning materials</p>
          </div>
          <div className="shrink-0 text-right">
            {totalSavings > 0 ? (
              <p className="text-xs font-bold text-[var(--muted)] line-through">{formatMoney(basePrice)}</p>
            ) : null}
            <p className="mt-0.5 text-2xl font-black">{formatMoney(quote?.finalAmountInPaise ?? basePrice)}</p>
            {discountPercent > 0 ? (
              <span className="mt-1 inline-flex rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                {discountPercent}% saved
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {!session ? (
        <section className="rounded-xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-start gap-3">
            <UserRoundCheck className="mt-0.5 shrink-0 text-[var(--brand)]" size={22} />
            <div>
              <h2 className="font-black">Login required</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Use a student account to apply benefits and complete enrollment.</p>
            </div>
          </div>
          <a
            className="brand-button mt-5 inline-flex h-12 w-full items-center justify-center gap-2 px-4 text-sm font-black"
            href={`/auth/login?next=${encodeURIComponent(`/checkout/${courseSlug}`)}`}
          >
            Login to continue <ArrowRight size={17} />
          </a>
        </section>
      ) : !isStudent ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-800">
          Checkout is available only for student accounts.
        </section>
      ) : (
        <>
          <section className="overflow-hidden rounded-xl border border-[var(--line)] bg-white" aria-labelledby="purchase-summary-title">
            <div className="flex items-center gap-2 border-b border-blue-100 bg-[var(--brand-soft)] px-4 py-2.5 text-xs font-bold text-[var(--brand)] sm:px-5">
              <BadgeCheck size={15} />
              Enrollment opens only after verified payment
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <ReceiptText className="text-[var(--brand)]" size={20} />
                <h2 id="purchase-summary-title" className="text-lg font-black">Purchase summary</h2>
              </div>
              <dl className="mt-4 divide-y divide-[#edf0ef] text-sm">
                <SummaryLine label="Course fee" value={formatMoney(basePrice)} />
                <SummaryLine label="Live classes, recordings and materials" value="Included" positive />
                {hasCoupon ? <SummaryLine label="Coupon discount" value={`-${formatMoney(quote!.couponDiscountInPaise)}`} positive /> : null}
                {hasReferral ? <SummaryLine label="Referral discount" value={`-${formatMoney(quote!.referralDiscountInPaise)}`} positive /> : null}
                {hasWallet ? <SummaryLine label="BENZO wallet used" value={`-${formatMoney(quote!.walletUsedInPaise)}`} positive /> : null}
              </dl>
              <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-4">
                <span className="font-black">Total payment</span>
                <strong className="text-2xl">{formatMoney(quote?.finalAmountInPaise ?? basePrice)}</strong>
              </div>
            </div>
            {totalSavings > 0 ? (
              <div className="flex items-center justify-center gap-2 bg-emerald-700 px-4 py-3 text-center text-sm font-black text-white">
                <Gift size={17} /> You save {formatMoney(totalSavings)} on this purchase
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <BookOpenCheck className="mt-0.5 shrink-0 text-[var(--brand)]" size={22} />
              <div>
                <h2 className="font-black">Lifetime course access</h2>
                <p className="mt-1 text-sm leading-5 text-[var(--muted)]">One verified payment unlocks lessons, live classes and student chat.</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5" aria-labelledby="benefits-title">
            <h2 id="benefits-title" className="text-lg font-black">Apply benefits</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">All options are optional and verified by BENZO.</p>

            <div className="mt-5 grid gap-5">
              <BenefitControl
                icon={<TicketPercent size={18} />}
                label="Have a coupon code?"
                value={couponCode}
                placeholder="Coupon code"
                buttonLabel={!couponCode.trim() && hasCoupon ? "Remove" : "Apply coupon"}
                buttonDisabled={quoteBusy || !course || (!couponCode.trim() && !hasCoupon)}
                onChange={setCouponCode}
                onApply={() => void refreshQuote({}, couponCode.trim() ? "Coupon checked and price updated." : "Coupon removed.")}
              />
              <BenefitControl
                icon={<UserRoundCheck size={18} />}
                label="Have a referral code?"
                value={referralCode}
                placeholder="Referral code"
                buttonLabel={referralLocked ? "Applied" : "Apply referral"}
                buttonDisabled={quoteBusy || !course || referralLocked || !referralCode.trim()}
                inputDisabled={referralLocked}
                onChange={setReferralCode}
                onApply={() => void refreshQuote({}, "Referral checked and price updated.")}
              />
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm font-black" htmlFor="wallet-amount">
                    <WalletCards size={18} className="text-[var(--brand)]" /> Use BENZO wallet
                  </label>
                  <span className="text-xs font-bold text-[var(--muted)]">
                    Available {formatMoney(quote?.walletBalanceInPaise ?? 0)}
                  </span>
                </div>
                <div className="mt-2 flex min-w-0 gap-2">
                  <div className="flex min-w-0 flex-1 items-center rounded border border-[var(--line)] bg-white focus-within:border-[var(--brand)]">
                    <span className="pl-3 text-sm font-bold text-[var(--muted)]">INR</span>
                    <input
                      id="wallet-amount"
                      className="h-11 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm font-bold outline-none"
                      type="number"
                      min="0"
                      max={(quote?.walletBalanceInPaise ?? 0) / 100}
                      value={walletAmount}
                      onChange={(event) => setWalletAmount(event.target.value)}
                    />
                    <button
                      className="mr-1 h-8 shrink-0 px-2 text-xs font-black text-[var(--brand)] disabled:opacity-40"
                      type="button"
                      onClick={() => void useMaximumWallet()}
                      disabled={quoteBusy || !quote?.walletBalanceInPaise}
                    >
                      Use max
                    </button>
                  </div>
                  <button
                    className="h-11 shrink-0 rounded-lg bg-[var(--brand-soft)] px-3 text-xs font-black text-[var(--brand)] transition-colors hover:bg-blue-100 disabled:opacity-40 sm:px-4"
                    type="button"
                    onClick={() => void refreshQuote({}, "Wallet amount updated.")}
                    disabled={quoteBusy || !course}
                  >
                    Apply wallet
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-[var(--brand)]" size={22} />
              <div>
                <h2 className="font-black">Backend-verified enrollment</h2>
                <p className="mt-1 text-sm leading-5 text-[var(--muted)]">BENZO verifies the Razorpay payment signature before activating course access.</p>
              </div>
            </div>
          </section>

          {error ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-bold text-red-800">{error}</p>
          ) : null}
          {message ? (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-bold text-emerald-800">{message}</p>
          ) : null}

          <section className="rounded-xl border border-[var(--line)] bg-white p-4 sm:p-5">
            <button
              className="brand-button inline-flex h-[52px] w-full items-center justify-center gap-2 px-5 text-base font-black disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={() => void startCheckout()}
              disabled={paymentBusy || quoteBusy || !quote || (quote.finalAmountInPaise > 0 && !scriptReady)}
            >
              {paymentBusy ? <Loader2 className="animate-spin" size={19} /> : <CreditCard size={19} />}
              {paymentBusy
                ? "Preparing payment..."
                : quote?.finalAmountInPaise === 0
                  ? "Complete enrollment"
                  : `To Pay ${formatMoney(quote?.finalAmountInPaise ?? basePrice)}`}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-[var(--muted)]">
              <LockKeyhole size={13} /> Secure payment powered by Razorpay
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryLine({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="min-w-0 text-[var(--muted)]">{label}</dt>
      <dd className={`shrink-0 font-black ${positive ? "text-emerald-700" : "text-[var(--ink)]"}`}>
        {positive ? <Check className="mr-1 inline" size={14} /> : null}
        {value}
      </dd>
    </div>
  );
}

function BenefitControl({
  icon,
  label,
  value,
  placeholder,
  buttonLabel,
  buttonDisabled,
  inputDisabled = false,
  onChange,
  onApply
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  buttonLabel: string;
  buttonDisabled: boolean;
  inputDisabled?: boolean;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-black" htmlFor={label === "Have a coupon code?" ? "coupon-code" : "referral-code"}>
        <span className="text-[var(--brand)]">{icon}</span>
        {label}
      </label>
      <div className="mt-2 flex min-w-0 gap-2">
        <input
          id={label === "Have a coupon code?" ? "coupon-code" : "referral-code"}
          className="field h-11 min-w-0 flex-1 rounded-lg px-3 uppercase"
          value={value}
          disabled={inputDisabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !buttonDisabled) onApply();
          }}
          placeholder={placeholder}
        />
        <button
          className="h-11 shrink-0 rounded-lg bg-[var(--brand-soft)] px-3 text-xs font-black text-[var(--brand)] transition-colors hover:bg-blue-100 disabled:opacity-40 sm:px-4"
          type="button"
          onClick={onApply}
          disabled={buttonDisabled}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

function toPaise(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

async function requestQuote(courseId: string, values: QuoteOverrides) {
  return apiRequest<Quote>("/pricing/checkout-quote", {
    method: "POST",
    body: JSON.stringify({
      courseId,
      ...(values.couponCode?.trim() ? { couponCode: values.couponCode.trim() } : {}),
      ...(values.referralCode?.trim() ? { referralCode: values.referralCode.trim() } : {}),
      walletAmountInPaise: values.walletAmountInPaise ?? 0
    })
  });
}

async function fetchPublicCourse(slug: string) {
  const response = await fetch(`${apiBaseUrl}/courses/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(await parseApiError(response));
  return (await response.json()) as CourseResponse;
}

async function cancelOrder(orderId: string) {
  try {
    await apiRequest(`/orders/${orderId}/cancel`, { method: "POST" });
  } catch {
    // Settlement or the webhook remains authoritative if cancellation races payment.
  }
}
