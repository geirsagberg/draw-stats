import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { encryptToken } from "@/lib/crypto";
import { requireServerEnv } from "@/lib/env";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import { fetchTrelloMember } from "@/lib/trello/client";

const tokenSchema = z.object({
  token: z.string().min(8)
});

export async function POST(request: NextRequest) {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = tokenSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Trello token payload" }, { status: 400 });
  }

  const member = await fetchTrelloMember(parsed.data.token);
  const encrypted = encryptToken(parsed.data.token, requireServerEnv("TRELLO_TOKEN_SECRET"));
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("trello_accounts").upsert({
    user_id: user.id,
    trello_member_id: member.id,
    username: member.username,
    full_name: member.fullName,
    encrypted_token: encrypted.encrypted,
    token_nonce: encrypted.nonce,
    token_tag: encrypted.tag,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
