import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

export const alt = "PhotoMarket - Фотостудия";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const studio = await prisma.studio.findUnique({
    where: { id: params.id },
    include: {
      rooms: true,
      reviews: true,
    },
  });

  if (!studio) {
    return new ImageResponse(
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 48,
          fontWeight: "bold",
        }}
      >
        Студия не найдена
      </div>,
      { ...size },
    );
  }

  const minPrice =
    studio.rooms.length > 0
      ? Math.min(...studio.rooms.map((r) => Number(r.pricePerHour)))
      : null;

  const avgRating =
    studio.reviews.length > 0
      ? (
          studio.reviews.reduce((sum, r) => sum + r.rating, 0) /
          studio.reviews.length
        ).toFixed(1)
      : null;

  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px",
        position: "relative",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "white",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          📷
        </div>
        <span style={{ color: "white", fontSize: "28px", fontWeight: 600 }}>
          PhotoMarket
        </span>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Studio Name */}
        <h1
          style={{
            color: "white",
            fontSize: "64px",
            fontWeight: "bold",
            margin: "0 0 16px 0",
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          {studio.name}
        </h1>

        {/* City */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "32px" }}>📍</span>
          <span style={{ color: "#94a3b8", fontSize: "28px" }}>
            {studio.city}
          </span>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "auto",
          }}
        >
          {/* Rooms */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#94a3b8", fontSize: "20px" }}>Залов</span>
            <span
              style={{ color: "white", fontSize: "36px", fontWeight: "bold" }}
            >
              {studio.rooms.length}
            </span>
          </div>

          {/* Price */}
          {minPrice && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#94a3b8", fontSize: "20px" }}>от</span>
              <span
                style={{ color: "white", fontSize: "36px", fontWeight: "bold" }}
              >
                {minPrice.toLocaleString("ru-RU")} ₽/час
              </span>
            </div>
          )}

          {/* Rating */}
          {avgRating && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#94a3b8", fontSize: "20px" }}>
                Рейтинг
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "32px" }}>⭐</span>
                <span
                  style={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                >
                  {avgRating}
                </span>
                <span style={{ color: "#64748b", fontSize: "24px" }}>
                  ({studio.reviews.length})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "40px",
          paddingTop: "32px",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: "24px" }}>
          Забронировать онлайн на photomarket.tech
        </span>
        <div
          style={{
            background: "white",
            color: "#1e293b",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Смотреть →
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
