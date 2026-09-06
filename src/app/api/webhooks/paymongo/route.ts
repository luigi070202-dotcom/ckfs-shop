// // src/app/api/webhooks/paymongo/route.ts
// import { NextResponse } from 'next/server';
// import crypto from 'crypto';
// import { connectDB } from '@/app/lib/db';
// import { Order } from '@/app/models/Order';

// export const dynamic = 'force-dynamic';

// function verifyPayMongoSignature(
//   rawBody: string,
//   signatureHeader: string | null,
//   webhookSecret: string
// ): boolean {
//   if (!signatureHeader || !webhookSecret) return false;

//   // Header format: "t=1700000000,te=hash1,li=hash2"
//   const parts = signatureHeader.split(',').reduce((acc: Record<string, string>, curr) => {
//     const [key, value] = curr.split('=');
//     if (key && value) acc[key.trim()] = value.trim();
//     return acc;
//   }, {});

//   const timestamp = parts.t;
//   const testSignature = parts.te;
//   const liveSignature = parts.li;

//   if (!timestamp || (!testSignature && !liveSignature)) {
//     return false;
//   }

//   // Construct comparison payload: "<timestamp>.<raw_payload>"
//   const payloadToSign = `${timestamp}.${rawBody}`;
//   const computedHash = crypto
//     .createHmac('sha256', webhookSecret)
//     .update(payloadToSign)
//     .digest('hex');

//   // Verify against test or live mode signature
//   const targetSignature = liveSignature || testSignature;
//   return crypto.timingSafeEqual(
//     Buffer.from(computedHash),
//     Buffer.from(targetSignature)
//   );
// }

// export async function POST(req: Request) {
//   try {
//     const rawBody = await req.text();
//     const signatureHeader = req.headers.get('paymongo-signature');
//     const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

//     // 1. Signature Verification
//     if (webhookSecret) {
//       const isValid = verifyPayMongoSignature(rawBody, signatureHeader, webhookSecret);
//       if (!isValid) {
//         return NextResponse.json(
//           { success: false, error: 'Invalid webhook signature' },
//           { status: 401 }
//         );
//       }
//     }

//     const payload = JSON.parse(rawBody);
//     const eventType = payload.data?.attributes?.type;
//     const resourceData = payload.data?.attributes?.data;

//     await connectDB();

//     // 2. Handle Payment Success
//     if (eventType === 'checkout_session.payment.paid') {
//       const metadata = resourceData?.attributes?.metadata;
//       const orderId = metadata?.orderId;

//       if (orderId) {
//         await Order.findByIdAndUpdate(orderId, {
//           $set: {
//             status: 'PAID',
//             paidAt: new Date(),
//             paymentDetails: {
//               paymentId: resourceData?.id,
//               source: resourceData?.attributes?.payments?.[0]?.attributes?.source?.type || 'unknown',
//             },
//           },
//         });
//       }
//     }

//     // Always acknowledge PayMongo with 200 OK immediately
//     return NextResponse.json({ success: true, received: true });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error.message || 'Webhook processing failed' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Webhook temporarily disabled' }, { status: 200 });
}