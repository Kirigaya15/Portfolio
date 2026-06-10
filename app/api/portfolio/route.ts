import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { defaultPortfolioData, normalizePortfolioData, type PortfolioData } from "@/lib/portfolioData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "portfolio.json");
const blobDataPath = "portfolio/portfolio.json";

const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readPortfolioBlob(): Promise<PortfolioData | null> {
  if (!hasBlobStorage()) {
    return null;
  }

  const blobs = await list({
    prefix: blobDataPath,
    limit: 1,
  });
  const blob = blobs.blobs.find((item) => item.pathname === blobDataPath);

  if (!blob) {
    return null;
  }

  const response = await fetch(`${blob.url}?ts=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return normalizePortfolioData((await response.json()) as Partial<PortfolioData>);
}

async function writePortfolioBlob(data: PortfolioData) {
  await put(blobDataPath, `${JSON.stringify(data, null, 2)}\n`, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json",
  });
}

async function readPortfolioFile(): Promise<PortfolioData> {
  const blobData = await readPortfolioBlob();

  if (blobData) {
    return blobData;
  }

  try {
    const file = await fs.readFile(dataFile, "utf8");
    return normalizePortfolioData(JSON.parse(file) as Partial<PortfolioData>);
  } catch {
    return defaultPortfolioData;
  }
}

async function writePortfolioFile(data: PortfolioData) {
  if (hasBlobStorage()) {
    await writePortfolioBlob(data);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN. Add it in Vercel Environment Variables, then redeploy.");
  }

  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function GET() {
  const data = await readPortfolioFile();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortfolioData>;
    const data = normalizePortfolioData(body);
    await writePortfolioFile(data);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save portfolio data.";

    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}
