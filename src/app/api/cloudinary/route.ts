import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const folder =
      request.nextUrl.searchParams.get("folder") || "contributors";

    const result = await cloudinary.search
      .expression(`folder="${folder}"`)
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute();

    return NextResponse.json(result.resources);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}