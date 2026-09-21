import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

export interface RazorpayOrderResult {
  gatewayOrderId: string;
  amount: number; // in paise
  currency: string;
  isMock: boolean;
}

/**
 * Creates an authoritative payment order on the server
 */
export async function createPaymentOrder(
  internalOrderId: string,
  amountInRupees: number,
  currency = 'INR'
): Promise<RazorpayOrderResult> {
  const amountInPaise = Math.round(amountInRupees * 100);

  // If live or configured Razorpay keys are available, create real Razorpay order
  const isConfigured =
    process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes('placeholder') &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_SECRET.includes('placeholder');

  if (isConfigured) {
    try {
      const authHeader = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString('base64');

      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: internalOrderId,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return {
          gatewayOrderId: json.id,
          amount: json.amount,
          currency: json.currency,
          isMock: false,
        };
      }
    } catch (e) {
      console.warn('Razorpay live API failed, falling back to secure sandbox', e);
    }
  }

  // Authoritative Sandbox Order Generation for test mode
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const gatewayOrderId = `order_mock_${randomSuffix}`;

  return {
    gatewayOrderId,
    amount: amountInPaise,
    currency,
    isMock: true,
  };
}

/**
 * Authoritative cryptographic signature verification for payments
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  try {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const secret = RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    // Constant-time comparison
    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generates valid HMAC signature for mock sandbox payments
 */
export function generateMockSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string
): string {
  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  return crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
}
