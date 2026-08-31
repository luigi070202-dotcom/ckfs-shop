// src/app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/db';
import { Product } from '@/app/models/Products';
import cloudinary from '@/app/lib/cloudinary';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Football shirt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Add these functions below your existing GET handler in src/app/api/products/[slug]/route.ts

// PUT / UPDATE kit details, stock, and automatically delete removed photos from Cloudinary
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const { slug } = await params;
    const body = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // 1. Photo validation
    if (body.images) {
      if (!Array.isArray(body.images) || body.images.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least 1 product photo is required' },
          { status: 400 }
        );
      }
      if (body.images.length > 15) {
        return NextResponse.json(
          { success: false, error: 'Maximum limit of 15 photos exceeded per kit' },
          { status: 400 }
        );
      }
    }

    // 2. Fetch the current existing product to detect deleted images
    const existingProduct = await Product.findOne({ slug });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Football shirt not found' },
        { status: 404 }
      );
    }

    // 3. Compare old photos with new photos and delete removed ones from Cloudinary
    if (body.images && Array.isArray(body.images)) {
      const oldImages: string[] = existingProduct.images || [];
      const newImages: string[] = body.images;

      // Find photos that were in oldImages but are NOT in newImages
      const removedImages = oldImages.filter((img) => !newImages.includes(img));

      for (const imgUrl of removedImages) {
        if (imgUrl.includes('res.cloudinary.com')) {
          const publicId = extractPublicId(imgUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (cloudErr) {
              console.error(`Failed to clean up removed image (${publicId}):`, cloudErr);
            }
          }
        }
      }
    }

    // 4. Update the MongoDB document
    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Product updated and removed images cleaned up successfully',
      data: updatedProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// Helper to extract the Cloudinary public_id from a secure_url
function extractPublicId(imageUrl: string): string | null {
  // Example URL: https://res.cloudinary.com/.../upload/v1234567/ckfs_kits/sample_abc123.jpg
  // Target public_id: ckfs_kits/sample_abc123
  const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
  const match = imageUrl.match(regex);
  return match ? match[1] : null;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // 1. Find the product first to retrieve its image URLs
    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Football shirt not found' },
        { status: 404 }
      );
    }

    // 2. Delete all kit images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        if (imgUrl.includes('res.cloudinary.com')) {
          const publicId = extractPublicId(imgUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (cloudErr) {
              console.error(`Failed to delete Cloudinary asset (${publicId}):`, cloudErr);
            }
          }
        }
      }
    }

    // 3. Delete the product document from MongoDB
    await Product.findOneAndDelete({ slug });

    return NextResponse.json({
      success: true,
      message: 'Product and associated Cloudinary images deleted successfully',
      data: { slug: product.slug, title: product.title },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}