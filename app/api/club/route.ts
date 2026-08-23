import {
  BloomClubVerificationError,
  bloomClubConfigured,
  verifyBloomClubMember,
} from "@/lib/bloom-club";

export async function POST(request: Request) {
  if (!bloomClubConfigured()) {
    return Response.json(
      { error: "Подключение Bloom Club пока не настроено.", available: false },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const token = typeof payload.token === "string" ? payload.token : "";
    const slug = typeof payload.slug === "string" ? payload.slug.trim() : "";
    if (!token || token.length > 4096) {
      return Response.json({ error: "Подтверждение Bloom Club недействительно." }, { status: 400 });
    }
    if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(slug)) {
      return Response.json({ error: "Не указан партнёр Bloom Online." }, { status: 400 });
    }

    const member = await verifyBloomClubMember(token, slug);
    return Response.json({
      active: member.active,
      name: member.name,
      phone: member.phone,
      subscriptionExpiresAt: member.subscriptionExpiresAt,
    });
  } catch (error) {
    if (error instanceof BloomClubVerificationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Не удалось проверить участие в Bloom Club." }, { status: 500 });
  }
}
