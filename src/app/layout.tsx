import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "PromosNow — boas escolhas, bons achados",
    template: "%s | PromosNow",
  },
  description:
    "Projeto de curadoria de promoções. Catálogo em desenvolvimento.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#main">
          Pular para o conteúdo
        </a>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
