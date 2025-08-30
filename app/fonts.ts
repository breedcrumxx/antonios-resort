import { Inter, Cormorant_Garamond } from "next/font/google";

export const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  subsets: ["cyrillic-ext"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});
