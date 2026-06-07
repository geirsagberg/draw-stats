import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { requireUser } from "@/lib/supabase/server";
import { buildTrelloAuthorizeUrl } from "@/lib/trello/auth-url";

export async function GET() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const { user } = await requireUser();
  if (!user) {
    redirect("/");
  }

  return NextResponse.redirect(buildTrelloAuthorizeUrl());
}
