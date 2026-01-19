import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { getCityName } from "@/lib/cities";

export const runtime = "edge";

export const alt = "PhotoMarket - Фотостудии города";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const cityName = getCityName(params.slug) || params.slug;

  const stats = await prisma.studio.aggregate({
    where: { city: cityName },
    _count: true,
  });

  const roomsCount = await prisma.room.count({
    where: { studio: { city: cityName } },
  });

  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px",
        position: "relative",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "60px",
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
        {/* Pre-title */}
        <span
          style={{ color: "#94a3b8", fontSize: "28px", marginBottom: "16px" }}
        >
          Аренда фотостудий в городе
        </span>

        {/* City Name */}
        <h1
          style={{
            color: "white",
            fontSize: "80px",
            fontWeight: "bold",
            margin: "0 0 48px 0",
            lineHeight: 1,
          }}
        >
          {cityName}
        </h1>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "60px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: "white", fontSize: "56px", fontWeight: "bold" }}
            >
              {stats._count}
            </span>
            <span style={{ color: "#94a3b8", fontSize: "24px" }}>
              {stats._count === 1
                ? "студия"
                : stats._count < 5
                  ? "студии"
                  : "студий"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: "white", fontSize: "56px", fontWeight: "bold" }}
            >
              {roomsCount}
            </span>
            <span style={{ color: "#94a3b8", fontSize: "24px" }}>
              {roomsCount === 1 ? "зал" : roomsCount < 5 ? "зала" : "залов"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "32px",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "22px" }}>
          Сравните цены • Читайте отзывы • Бронируйте онлайн
        </span>
        <span style={{ color: "#94a3b8", fontSize: "22px" }}>
          photomarket.tech
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
