import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// On-demand revalidation API route
// POST /api/revalidate?secret=YOUR_SECRET&path=/yellow-books
// POST /api/revalidate?secret=YOUR_SECRET&tag=business-123

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');

  // Validate secret token
  const expectedSecret = process.env.REVALIDATION_SECRET || 'your-secret-token';

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Invalid secret token' },
      { status: 401 }
    );
  }

  try {
    if (tag) {
      // Revalidate by tag (e.g., business-123)
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: Date.now(),
      });
    }

    if (path) {
      // Revalidate by path
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { error: 'Missing path or tag parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
