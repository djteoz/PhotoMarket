import { sendEmail } from "./email";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { NewBookingOwnerEmail } from "@/emails/new-booking-owner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface BookingDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  ownerName: string;
  ownerEmail: string;
  studioName: string;
  roomName: string;
  studioAddress: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
}

/**
 * Send booking confirmation emails to both customer and studio owner
 */
export async function sendBookingConfirmationEmails(booking: BookingDetails) {
  const date = format(booking.startTime, "d MMMM yyyy", { locale: ru });
  const time = format(booking.startTime, "HH:mm", { locale: ru });

  // Calculate duration
  const durationMs = booking.endTime.getTime() - booking.startTime.getTime();
  const durationHours = Math.round(durationMs / (1000 * 60 * 60));
  const duration = `${durationHours} ${durationHours === 1 ? "час" : durationHours < 5 ? "часа" : "часов"}`;

  const totalPrice = `${booking.totalPrice.toLocaleString("ru-RU")} ₽`;

  // Send to customer
  const customerResult = await sendEmail({
    to: booking.customerEmail,
    subject: `Бронирование подтверждено: ${booking.studioName}`,
    react: BookingConfirmationEmail({
      userName: booking.customerName,
      studioName: booking.studioName,
      roomName: booking.roomName,
      date,
      time,
      duration,
      totalPrice,
      studioAddress: booking.studioAddress,
      bookingId: booking.id.slice(0, 8).toUpperCase(),
    }),
  });

  // Send to studio owner
  const ownerResult = await sendEmail({
    to: booking.ownerEmail,
    subject: `Новое бронирование: ${booking.roomName} на ${date}`,
    react: NewBookingOwnerEmail({
      ownerName: booking.ownerName,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      studioName: booking.studioName,
      roomName: booking.roomName,
      date,
      time,
      duration,
      totalPrice,
      bookingId: booking.id.slice(0, 8).toUpperCase(),
    }),
  });

  return {
    customer: customerResult,
    owner: ownerResult,
  };
}

/**
 * Send booking cancellation notification
 */
export async function sendBookingCancellationEmail(
  to: string,
  details: {
    userName: string;
    studioName: string;
    roomName: string;
    date: string;
    reason?: string;
  },
) {
  return sendEmail({
    to,
    subject: `Бронирование отменено: ${details.studioName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Бронирование отменено</h2>
        <p>Здравствуйте, ${details.userName}!</p>
        <p>Ваше бронирование было отменено:</p>
        <ul>
          <li><strong>Студия:</strong> ${details.studioName}</li>
          <li><strong>Зал:</strong> ${details.roomName}</li>
          <li><strong>Дата:</strong> ${details.date}</li>
          ${details.reason ? `<li><strong>Причина:</strong> ${details.reason}</li>` : ""}
        </ul>
        <p>Если у вас есть вопросы, свяжитесь с нами.</p>
        <p>С уважением,<br>Команда PhotoMarket</p>
      </div>
    `,
  });
}

/**
 * Send new review notification to studio owner
 */
export async function sendNewReviewNotification(
  to: string,
  details: {
    ownerName: string;
    reviewerName: string;
    studioName: string;
    rating: number;
    comment: string;
  },
) {
  const stars = "⭐".repeat(details.rating);

  return sendEmail({
    to,
    subject: `Новый отзыв: ${details.studioName} — ${stars}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Новый отзыв о вашей студии!</h2>
        <p>Здравствуйте, ${details.ownerName}!</p>
        <p>${details.reviewerName} оставил отзыв о студии <strong>${details.studioName}</strong>:</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="font-size: 24px; margin: 0 0 8px;">${stars}</p>
          <p style="margin: 0; color: #374151;">"${details.comment}"</p>
        </div>
        <p>
          <a href="https://www.photomarket.tech/dashboard" 
             style="background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Посмотреть отзыв
          </a>
        </p>
        <p>С уважением,<br>Команда PhotoMarket</p>
      </div>
    `,
  });
}
