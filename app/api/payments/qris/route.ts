import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sourceUrl = searchParams.get("url") || new URL("/payment/qris.png", req.url).toString();

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "QRIS image not found" }, { status: 404 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="qris-donasi.png"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Gagal mengunduh QRIS",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
