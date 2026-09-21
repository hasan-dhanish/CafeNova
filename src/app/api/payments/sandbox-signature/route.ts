import { NextRequest, NextResponse } from 'next/server';
import { generateMockSignature } from '@/lib/payments';
import { apiBadRequest } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { gatewayOrderId, gatewayPaymentId } = await request.json();
    if (!gatewayOrderId || !gatewayPaymentId) {
      return apiBadRequest('Missing params');
    }

    const signature = generateMockSignature(gatewayOrderId, gatewayPaymentId);
    return NextResponse.json({ signature });
  } catch (e) {
    return apiBadRequest('Failed to compute signature');
  }
}
