import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingNotification({
  to,
  userName,
  studioName,
  roomName,
  date,
  time,
}: {
  to: string;
  userName: string;
  studioName: string;
  roomName: string;
  date: string;
  time: string;
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
    await resend.emails.send({
      from: "PhotoMarket <onboarding@resend.dev>",
      to,
      subject: `Бронирование подтверждено: ${studioName}`,
      html: `
        <h1>Бронирование подтверждено!</h1>
        <p>Здравствуйте, ${userName}!</p>
        <p>Вы успешно забронировали зал <strong>${roomName}</strong> в студии <strong>${studioName}</strong>.</p>
        <p><strong>Дата:</strong> ${date}</p>
        <p><strong>Время:</strong> ${time}</p>
        <br/>
        <p>С уважением,<br/>Команда PhotoMarket</p>
      `,
    });
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
}: {
  to: string;
  ownerName: string;
  studioName: string;
  roomName: string;
  date: string;
  time: string;
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
    await resend.emails.send({
      from: "PhotoMarket <onboarding@resend.dev>",
      to,
      subject: `Новое бронирование: ${studioName}`,
      html: `
        <h1>Новое бронирование!</h1>
        <p>Здравствуйте, ${ownerName}!</p>
        <p>В вашей студии <strong>${studioName}</strong> (зал ${roomName}) появилось новое бронирование.</p>
        <p><strong>Дата:</strong> ${date}</p>
        <p><strong>Время:</strong> ${time}</p>
        <br/>
        <p>Проверьте личный кабинет для подтверждения.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
