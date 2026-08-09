import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import type { Request } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

type RatePolicy = {
  name: string;
  pattern: RegExp;
  limit: number;
};

const windowMs = 60_000;
const defaultLimit = 300;
const policies: RatePolicy[] = [
  {
    name: "auth-sensitive",
    pattern: /\/api\/v\d+\/auth\/(login|student\/register|refresh|password\/forgot|password\/reset)/,
    limit: 10
  },
  {
    name: "money-sensitive",
    pattern: /\/api\/v\d+\/(orders|pricing\/checkout-quote|payments\/razorpay\/verify|withdrawals)/,
    limit: 30
  },
  {
    name: "admin-sensitive",
    pattern: /\/api\/v\d+\/(admins|instructors|courses|coupons|financial|salary|certificates|notifications\/announcements)/,
    limit: 60
  }
];

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private requestCount = 0;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const policy = this.policyFor(request.path);
    const key = `${this.clientIp(request)}:${request.method}:${policy.name}`;
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      this.pruneOccasionally(now);
      return true;
    }

    bucket.count += 1;

    if (bucket.count > policy.limit) {
      throw new HttpException("Too many requests. Please retry shortly.", HttpStatus.TOO_MANY_REQUESTS);
    }

    this.pruneOccasionally(now);
    return true;
  }

  private policyFor(path: string) {
    return policies.find((policy) => policy.pattern.test(path)) ?? { name: "default", limit: defaultLimit };
  }

  private clientIp(request: Request) {
    const forwardedFor = request.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
      return forwardedFor.split(",")[0]?.trim() ?? "unknown";
    }

    return request.ip || request.socket.remoteAddress || "unknown";
  }

  private pruneOccasionally(now: number) {
    this.requestCount += 1;

    if (this.requestCount % 500 !== 0) {
      return;
    }

    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
