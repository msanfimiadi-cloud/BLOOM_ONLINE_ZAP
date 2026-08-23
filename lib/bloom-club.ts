export type BloomClubMember = {
  memberId: number;
  partnerId: number;
  bookingSlug: string;
  active: boolean;
  name: string;
  phone: string;
  subscriptionExpiresAt: string | null;
};

export class BloomClubVerificationError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "BloomClubVerificationError";
  }
}

export function bloomClubConfigured() {
  return (
    typeof process.env.BLOOM_CLUB_API_URL === "string" &&
    /^https:\/\//i.test(process.env.BLOOM_CLUB_API_URL.trim()) &&
    typeof process.env.BLOOM_ONLINE_API_TOKEN === "string" &&
    process.env.BLOOM_ONLINE_API_TOKEN.trim().length >= 32
  );
}

export async function verifyBloomClubMember(token: string, expectedSlug?: string): Promise<BloomClubMember> {
  if (!bloomClubConfigured()) {
    throw new BloomClubVerificationError("Подключение Bloom Club пока не настроено.", 503);
  }
  if (!token || token.length > 4096) {
    throw new BloomClubVerificationError("Подтверждение Bloom Club недействительно.", 401);
  }

  const endpoint = `${String(process.env.BLOOM_CLUB_API_URL).replace(/\/+$/, "")}/booking/verify`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BLOOM_ONLINE_API_TOKEN}`,
      },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new BloomClubVerificationError("Bloom Club временно недоступен. Попробуйте ещё раз.", 503);
  }

  if (response.status === 401 || response.status === 403) {
    throw new BloomClubVerificationError(
      "Срок подтверждения Bloom Club истёк. Откройте запись из клуба заново.",
      401,
    );
  }
  if (!response.ok) {
    throw new BloomClubVerificationError("Не удалось подтвердить участие в Bloom Club.", 503);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const member = {
    memberId: Number(data.member_id ?? 0),
    partnerId: Number(data.partner_id ?? 0),
    bookingSlug: typeof data.booking_slug === "string" ? data.booking_slug.trim() : "",
    active: data.active === true,
    name: typeof data.name === "string" ? data.name.trim().slice(0, 100) : "",
    phone: typeof data.phone === "string" ? data.phone.trim().slice(0, 30) : "",
    subscriptionExpiresAt:
      typeof data.subscription_expires_at === "string" ? data.subscription_expires_at : null,
  };
  if (!Number.isSafeInteger(member.memberId) || member.memberId < 1) {
    throw new BloomClubVerificationError("Не удалось подтвердить участницу Bloom Club.", 401);
  }
  if (expectedSlug && member.bookingSlug !== expectedSlug) {
    throw new BloomClubVerificationError("Подтверждение Bloom Club выдано для другого партнёра.", 403);
  }
  return member;
}

export type BloomClubBookingEvent = {
  eventType: "booking_created" | "booking_cancelled" | "booking_completed" | "booking_no_show" | "booking_rescheduled";
  bookingId: string;
  memberId: number;
  partnerId: number;
  appointmentDate: string;
  appointmentTime: string;
  price: number;
  discount: number;
};

export async function notifyBloomClub(event: BloomClubBookingEvent): Promise<boolean> {
  if (!bloomClubConfigured() || event.memberId < 1 || event.partnerId < 1) return false;

  try {
    const response = await fetch(
      `${String(process.env.BLOOM_CLUB_API_URL).replace(/\/+$/, "")}/booking/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BLOOM_ONLINE_API_TOKEN}`,
        },
        body: JSON.stringify({
          event_type: event.eventType,
          booking_id: event.bookingId,
          member_id: event.memberId,
          partner_id: event.partnerId,
          appointment_date: event.appointmentDate,
          appointment_time: event.appointmentTime,
          price: event.price,
          discount: event.discount,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
