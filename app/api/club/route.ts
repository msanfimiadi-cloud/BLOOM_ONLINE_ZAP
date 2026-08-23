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
    if (!token || token.length > 4096) {
      return Response.json({ error: "Подтверждение Bloom Club недействительно." }, { status: 400 });
    }

    const member = await verifyBloomClubMember(token);
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
