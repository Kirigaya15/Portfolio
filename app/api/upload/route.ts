import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const cleanPathPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const cleanFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = cleanPathPart(String(formData.get("folder") || "uploads")) || "uploads";
    const requestedName = cleanFileName(String(formData.get("fileName") || ""));
    const shouldOverwrite = String(formData.get("overwrite") || "") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "No upload file was provided." },
        { status: 400 }
      );
    }

    const fileName = requestedName || cleanFileName(file.name) || "upload";
    const pathname = shouldOverwrite ? `${folder}/${fileName}` : `${folder}/${Date.now()}-${fileName}`;

    if (!hasBlobStorage()) {
      const publicPath =
        folder === "resume-files"
          ? path.join(process.cwd(), "public", fileName)
          : path.join(process.cwd(), "public", "uploads", folder, fileName);
      const publicUrl = folder === "resume-files" ? `/${fileName}` : `/uploads/${folder}/${fileName}`;

      await fs.mkdir(path.dirname(publicPath), { recursive: true });
      await fs.writeFile(publicPath, Buffer.from(await file.arrayBuffer()));

      return NextResponse.json({ ok: true, url: publicUrl });
    }

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: !shouldOverwrite,
      allowOverwrite: shouldOverwrite,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
      contentType: file.type || undefined,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to upload file." },
      { status: 500 }
    );
  }
}
