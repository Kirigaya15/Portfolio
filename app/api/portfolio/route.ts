import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { defaultPortfolioData, normalizePortfolioData, type PortfolioData } from "@/lib/portfolioData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "portfolio.json");
const legacyBlobDataPath = "portfolio/portfolio.json";
const blobDataPrefix = "portfolio/snapshots/portfolio-";

const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function fetchBlobJson(url: string): Promise<PortfolioData | null> {
  const response = await fetch(`${url}?ts=${Date.now()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return normalizePortfolioData((await response.json()) as Partial<PortfolioData>);
}

async function readPortfolioBlob(): Promise<PortfolioData | null> {
  if (!hasBlobStorage()) {
    return null;
  }

  const snapshotBlobs = await list({
    prefix: blobDataPrefix,
    limit: 100,
  });
  const latestSnapshot = snapshotBlobs.blobs
    .filter((item) => item.pathname.endsWith(".json"))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];

  if (latestSnapshot) {
    return fetchBlobJson(latestSnapshot.url);
  }

  const legacyBlobs = await list({
    prefix: legacyBlobDataPath,
    limit: 1,
  });
  const legacyBlob = legacyBlobs.blobs.find((item) => item.pathname === legacyBlobDataPath);

  return legacyBlob ? fetchBlobJson(legacyBlob.url) : null;
}

async function writePortfolioBlob(data: PortfolioData) {
  await put(`${blobDataPrefix}${Date.now()}.json`, `${JSON.stringify(data, null, 2)}\n`, {
    access: "public",
    addRandomSuffix: true,
    cacheControlMaxAge: 0,
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