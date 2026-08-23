import { env } from "cloudflare:workers";

export type BloomClubMember = {
  memberId: number;
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
    typeof env.BLOOM_CLUB_API_URL === "string" &&
    /^https:\/\//i.test(env.BLOOM_CLUB_API_URL.trim()) &&
    typeof env.BLOOM_ONLINE_API_TOKEN === "string" &&
    env.BLOOM_ONLINE_API_TOKEN.trim().length >= 32
  );
}

export async function verifyBloomClubMember(token: string): Promise<BloomClubMember> {
  if (!bloomClubConfigured()) {
    throw new BloomClubVerificationError("Подключение Bloom Club пока не настроено.", 503);
  }
  if (!token || token.length > 4096) {
    throw new BloomClubVerificationError("Подтверждение Bloom Club недействительно.", 401);
  }

  const endpoint = `${String(env.BLOOM_CLUB_API_URL).replace(/\/+$/, "")}/booking/verify`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.BLOOM_ONLINE_API_TOKEN}`,
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
  return {
    memberId: Number(data.member_id ?? 0),
    active: data.active === true,
    name: typeof data.name === "string" ? data.name.trim().slice(0, 100) : "",
    phone: typeof data.phone === "string" ? data.phone.trim().slice(0, 30) : "",
    subscriptionExpiresAt:
      typeof data.subscription_expires_at === "string" ? data.subscription_expires_at : null,
  };
}
