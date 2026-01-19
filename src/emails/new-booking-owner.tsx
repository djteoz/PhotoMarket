import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface NewBookingOwnerEmailProps {
  ownerName: string;
  customerName: string;
  customerEmail: string;
  studioName: string;
  roomName: string;
  date: string;
  time: string;
  duration: string;
  totalPrice: string;
  bookingId: string;
}

export function NewBookingOwnerEmail({
  ownerName = "Владелец",
  customerName = "Иван Петров",
  customerEmail = "client@example.com",
  studioName = "Фотостудия Example",
  roomName = "Зал 1",
  date = "20 января 2026",
  time = "14:00",
  duration = "2 часа",
  totalPrice = "3 000 ₽",
  bookingId = "abc123",
}: NewBookingOwnerEmailProps) {
  const previewText = `Новое бронирование: ${roomName} на ${date} в ${time}`;

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
            <Heading style={heading}>🎉 Новое бронирование!</Heading>

            <Text style={paragraph}>Здравствуйте, {ownerName}!</Text>

            <Text style={paragraph}>
              У вас новое бронирование в студии <strong>{studioName}</strong>.
            </Text>

            {/* Booking Details Card */}
            <Section style={bookingCard}>
              <Text style={bookingTitle}>{roomName}</Text>

              <Hr style={divider} />

              <table style={detailsTable}>
                <tr>
                  <td style={detailLabel}>👤 Клиент:</td>
                  <td style={detailValue}>{customerName}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>📧 Email:</td>
                  <td style={detailValue}>
                    <Link href={`mailto:${customerEmail}`} style={link}>
                      {customerEmail}
                    </Link>
                  </td>
                </tr>
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
              </table>

              <Hr style={divider} />

              <Text style={priceText}>
                Сумма: <strong>{totalPrice}</strong>
              </Text>
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`https://www.photomarket.tech/dashboard`}
              >
                Открыть бронирование
              </Button>
            </Section>

            <Text style={smallText}>
              Номер бронирования: <strong>{bookingId}</strong>
            </Text>

            <Text style={smallText}>
              Вы можете связаться с клиентом через личные сообщения на сайте.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 PhotoMarket. Все права защищены.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NewBookingOwnerEmail;

// Styles (same as booking-confirmation)
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
  backgroundColor: "#059669",
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
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const bookingTitle = {
  color: "#1e293b",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#bbf7d0",
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
  backgroundColor: "#059669",
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
  margin: "16px 0 0",
  textAlign: "center" as const,
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
  margin: "0",
};
