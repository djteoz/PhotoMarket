import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { NewBookingOwnerEmail } from "@/emails/new-booking-owner";

// Lazy-initialize Resend client to avoid crash when API key is missing
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL =
  process.env.FROM_EMAIL || "PhotoMarket <noreply@photomarket.tech>";

export async function sendBookingNotification({
  to,
  userName,
  studioName,
  roomName,
  date,
  time,
  duration = "1 час",
  totalPrice = "",
  studioAddress = "",
  bookingId = "",
}: {
  to: string;
  userName: string;
  studioName: string;
  roomName: string;
  date: string;
  time: string;
  duration?: string;
  totalPrice?: string;
  studioAddress?: string;
  bookingId?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 Mock Email to", to, ": Booking Confirmed", {
      studioName,
      roomName,
      date,
      time,
    });
    return;
  }

  try {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Бронирование подтверждено: ${studioName}`,
      react: BookingConfirmationEmail({
        userName,
        studioName,
        roomName,
        date,
        time,
        duration,
        totalPrice,
        studioAddress,
        bookingId,
      }),
    });
    console.log("📧 Email sent to", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendNewBookingNotificationToOwner({
  to,
  ownerName,
  studioName,
  roomName,
  date,
  time,
  customerName = "",
  customerEmail = "",
  duration = "1 час",
  totalPrice = "",
  bookingId = "",
}: {
  to: string;
  ownerName: string;
  studioName: string;
  roomName: string;
  date: string;
  time: string;
  customerName?: string;
  customerEmail?: string;
  duration?: string;
  totalPrice?: string;
  bookingId?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 Mock Email to Owner", to, ": New Booking", {
      studioName,
      roomName,
      date,
      time,
    });
    return;
  }

  try {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Новое бронирование: ${studioName}`,
      react: NewBookingOwnerEmail({
        ownerName,
        customerName,
        customerEmail,
        studioName,
        roomName,
        date,
        time,
        duration,
        totalPrice,
        bookingId,
      }),
    });
    console.log("📧 Email sent to owner", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
