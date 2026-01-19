import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface BookingConfirmationEmailProps {
  userName: string;
  studioName: string;
  roomName: string;
  date: string;
  time: string;
  duration: string;
  totalPrice: string;
  studioAddress: string;
  bookingId: string;
}

export function BookingConfirmationEmail({
  userName = "Пользователь",
  studioName = "Фотостудия Example",
  roomName = "Зал 1",
  date = "20 января 2026",
  time = "14:00",
  duration = "2 часа",
  totalPrice = "3 000 ₽",
  studioAddress = "г. Москва, ул. Примерная, 1",
  bookingId = "abc123",
}: BookingConfirmationEmailProps) {
  const previewText = `Бронирование подтверждено: ${studioName} на ${date}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>📷 PhotoMarket</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Бронирование подтверждено!</Heading>
            
            <Text style={paragraph}>
              Здравствуйте, {userName}!
            </Text>
            
            <Text style={paragraph}>
              Ваше бронирование успешно оформлено. Ждём вас в студии!
            </Text>

            {/* Booking Details Card */}
            <Section style={bookingCard}>
              <Text style={bookingTitle}>{studioName}</Text>
              <Text style={bookingSubtitle}>{roomName}</Text>
              
              <Hr style={divider} />
              
              <table style={detailsTable}>
                <tr>
                  <td style={detailLabel}>📅 Дата:</td>
                  <td style={detailValue}>{date}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>🕐 Время:</td>
                  <td style={detailValue}>{time}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>⏱️ Длительность:</td>
                  <td style={detailValue}>{duration}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>📍 Адрес:</td>
                  <td style={detailValue}>{studioAddress}</td>
                </tr>
              </table>
              
              <Hr style={divider} />
              
              <Text style={priceText}>
                Итого: <strong>{totalPrice}</strong>
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`https://www.photomarket.tech/dashboard`}
              >
                Мои бронирования
              </Button>
            </Section>

            <Text style={paragraph}>
              Номер бронирования: <strong>{bookingId}</strong>
            </Text>

            <Text style={smallText}>
              Если у вас возникли вопросы, свяжитесь с владельцем студии через 
              личные сообщения на сайте или напишите нам на{" "}
              <Link href="mailto:support@photomarket.tech" style={link}>
                support@photomarket.tech
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 PhotoMarket. Все права защищены.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://www.photomarket.tech" style={footerLink}>
                Сайт
              </Link>
              {" • "}
              <Link href="https://www.photomarket.tech/terms" style={footerLink}>
                Условия
              </Link>
              {" • "}
              <Link href="https://www.photomarket.tech/contacts" style={footerLink}>
                Контакты
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#1e293b",
  padding: "24px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "32px 40px",
};

const heading = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const bookingCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const bookingTitle = {
  color: "#1e293b",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 4px",
};

const bookingSubtitle = {
  color: "#64748b",
  fontSize: "16px",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "16px 0",
};

const detailsTable = {
  width: "100%",
};

const detailLabel = {
  color: "#64748b",
  fontSize: "14px",
  padding: "4px 0",
  width: "140px",
};

const detailValue = {
  color: "#1e293b",
  fontSize: "14px",
  fontWeight: "500",
  padding: "4px 0",
};

const priceText = {
  color: "#1e293b",
  fontSize: "18px",
  textAlign: "center" as const,
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#1e293b",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const smallText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "24px 0 0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 8px",
};

const footerLinks = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0",
};

const footerLink = {
  color: "#64748b",
  textDecoration: "underline",
};
