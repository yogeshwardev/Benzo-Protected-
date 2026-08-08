export const BENZO = {
  name: "BENZO",
  productionUrl: "https://benzo.co.in",
  referralDiscountInPaise: 20_000,
  referralCreditInPaise: 20_000,
  minimumWithdrawalInPaise: 60_000,
  instructorEarlyJoinMinutes: 15,
  presentThresholdPercent: 80
} as const;

export function calculateAttendancePercent(attendedSeconds: number, scheduledSeconds: number): number {
  if (scheduledSeconds <= 0 || attendedSeconds <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((attendedSeconds / scheduledSeconds) * 100));
}

export function classifyAttendance(attendedSeconds: number, scheduledSeconds: number) {
  const percent = calculateAttendancePercent(attendedSeconds, scheduledSeconds);

  if (percent >= BENZO.presentThresholdPercent) {
    return "PRESENT" as const;
  }

  if (percent > 0) {
    return "PARTIAL" as const;
  }

  return "ABSENT" as const;
}

export function assertPositiveMoney(amountInPaise: number): void {
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new Error("Amount must be a positive integer in paise.");
  }
}

