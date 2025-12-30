import { v4 as uuidv4 } from "uuid";

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

export async function createYookassaPayment(
  amount: number,
  description: string,
  returnUrl: string,
  metadata: any
) {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    console.warn("YooKassa credentials missing. Simulating payment.");
    // Return a mock response for development if keys are missing
    return {
      id: `mock_${uuidv4()}`,
      status: "pending",
      confirmation: {
        type: "redirect",
        confirmation_url: returnUrl + "?mock_payment=success", // Auto-success for demo
      },
    };
  }

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": uuidv4(),
      Authorization:
        "Basic " +
        Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString(
          "base64"
        ),
    },
    body: JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      description: description,
      metadata: metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`YooKassa Error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}
