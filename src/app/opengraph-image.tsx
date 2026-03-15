import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CostWise – US Cost of Living Comparison Tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #1a56db 0%, #1e3a8a 50%, #1e40af 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Decorative grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "24px",
          padding: "8px 20px",
          marginBottom: "24px",
        }}
      >
        <span style={{ color: "#fff", fontSize: "18px", fontWeight: 600 }}>
          Free &bull; 6,000+ Cities &bull; 50 States &bull; 2026 Data
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          CostWise
        </span>
        <span
          style={{
            fontSize: "32px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.3,
          }}
        >
          Cost of Living Comparison Calculator for US Cities &amp; States
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "40px",
        }}
      >
        {[
          { label: "Cities", value: "6,000+" },
          { label: "States", value: "50" },
          { label: "Data Sources", value: "4 Gov APIs" },
          { label: "Compare &amp; Save", value: "$$$" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px 24px",
            }}
          >
            <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>
              {stat.value}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Domain */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          right: "32px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "16px",
        }}
      >
        costwise.usa-net-zero.com
      </div>
    </div>,
    { ...size },
  );
}
