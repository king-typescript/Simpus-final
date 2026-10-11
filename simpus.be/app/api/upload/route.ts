import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { noStoreHeaders, requireLibrarian } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function getExtension(mime: string, originalName: string): string {
  const extFromName = originalName.split(".").pop()?.toLowerCase();
  if (extFromName && /^[a-z0-9]+$/.test(extFromName)) {
    return extFromName;
  }
  switch (mime) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/gif": return "gif";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

export async function POST(request: Request) {
  const auth = await requireLibrarian();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak memiliki akses." }, { status: auth.status, headers: noStoreHeaders });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400, headers: noStoreHeaders });
    }

    const blob = file as File;

    if (blob.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB." },
        { status: 400, headers: noStoreHeaders }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(blob.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Gunakan gambar (JPG, PNG, WebP) atau PDF." },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const extension = getExtension(blob.type, blob.name || "file");
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, filename);

    const buffer = Buffer.from(await blob.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        data: {
          url: fileUrl,
          filename,
          size: blob.size,
          mime: blob.type,
        },
      },
      { status: 201, headers: noStoreHeaders }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Gagal mengunggah file." },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
