import { NextResponse } from "next/server";
import { getPublicBooks } from "@/lib/public-catalog";
import { parsePagination, parseSearch } from "@/lib/validation";

export const runtime = "nodejs";

const publicCacheHeaders = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pagination = parsePagination(url.searchParams, { defaultLimit: 4, maxLimit: 8 });
  if (!pagination.ok) return NextResponse.json({ error: pagination.error }, { status: 422 });

  const searchResult = parseSearch(url.searchParams, 50);
  if (!searchResult.ok) return NextResponse.json({ error: searchResult.error }, { status: 422 });

  const { page, limit } = pagination.value;
  const search = searchResult.value;
  const ddc = url.searchParams.get("ddc")?.trim() || undefined;

  try {
    const { data, total } = await getPublicBooks({ page, limit, search, ddc });
    return NextResponse.json(
      {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
      { headers: publicCacheHeaders }
    );
  } catch (err) {
    console.error("GET /api/publik/buku ERROR:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
