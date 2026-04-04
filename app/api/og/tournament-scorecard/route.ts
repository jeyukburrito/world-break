import { createElement } from "react";

import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#12131d",
          color: "#e4e5f0",
          fontSize: 40,
          fontWeight: 700,
        },
      },
      "World Break",
    ),
    {
      width: 500,
      height: 700,
    },
  );
}
