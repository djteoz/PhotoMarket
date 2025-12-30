import crypto from "crypto";

const ROBOKASSA_LOGIN = process.env.ROBOKASSA_LOGIN;
const ROBOKASSA_PASS1 = process.env.ROBOKASSA_PASS1;
const ROBOKASSA_PASS2 = process.env.ROBOKASSA_PASS2;
const IS_TEST = process.env.NODE_ENV !== "production";

export function generateRobokassaLink(
  amount: number,
  invId: string,
  description: string,
  email: string
) {
  if (!ROBOKASSA_LOGIN || !ROBOKASSA_PASS1) {
    console.warn("Robokassa credentials missing. Simulating link.");
    return `?mock_payment=success&invId=${invId}`; // Mock link
  }

  const signatureValue = `${ROBOKASSA_LOGIN}:${amount}:${invId}:${ROBOKASSA_PASS1}`;
  const signature = crypto
    .createHash("md5")
    .update(signatureValue)
    .digest("hex");

  const params = new URLSearchParams({
    MerchantLogin: ROBOKASSA_LOGIN,
    OutSum: amount.toString(),
    InvId: invId,
    Description: description,
    SignatureValue: signature,
    Email: email,
    // IsTest: IS_TEST ? '1' : '0' // Robokassa test mode param
  });

  if (IS_TEST) {
    params.append("IsTest", "1");
  }

  return `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
}

export function validateRobokassaSignature(
  outSum: string,
  invId: string,
  signature: string
) {
  if (!ROBOKASSA_PASS2) return false;

  const mySignatureValue = `${outSum}:${invId}:${ROBOKASSA_PASS2}`;
  const mySignature = crypto
    .createHash("md5")
    .update(mySignatureValue)
    .digest("hex");

  return mySignature.toUpperCase() === signature.toUpperCase();
}
