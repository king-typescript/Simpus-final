import { NextResponse } from "next/server";

import { noStoreHeaders, requireLibrarian } from "@/lib/auth";
import {
  BOOK_COVER_MAX_BYTES,
  detectBookCoverImage,
  saveBookCover,
} from "@/lib/book-cover-storage";
import { getBookCoverUrl } from "@/lib/book-cover-url";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) return errorResponse("Tidak memiliki akses.", auth.status);

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > BOOK_COVER_MAX_BYTES + 1024 * 1024) {
    return errorResponse("Ukuran request terlalu besar.", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Form-data tidak valid.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return errorResponse("File sampul wajib diunggah.", 422);
  if (file.size <= 0) return errorResponse("File sampul kosong.", 422);
  if (file.size > BOOK_COVER_MAX_BYTES) return errorResponse("Ukuran file sampul maksimal 10 MB.", 422);

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return errorResponse("File sampul tidak dapat dibaca.", 422);
  }

  const image = detectBookCoverImage(bytes);
  if (!image) return errorResponse("Format file gambar tidak didukung. Gunakan JPG, PNG, WebP, GIF, BMP, atau AVIF.", 422);

  try {
    const saved = await saveBookCover(bytes, image, auth.schoolId);
    let presignedUrl: string | null = null;
    try {
      presignedUrl = await getBookCoverUrl(saved.key);
    } catch (urlErr) {
      console.warn("Gagal membuat presigned url untuk cover:", urlErr);
    }

    return NextResponse.json({
      data: {
        ...saved,
        url: presignedUrl || saved.key,
      },
    }, { status: 201, headers: noStoreHeaders });
  } catch (err) {
    console.error("saveBookCover error:", err);
    return errorResponse("File sampul gagal disimpan ke storage.", 500);
  }
}
