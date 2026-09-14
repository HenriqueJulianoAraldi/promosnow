import Link from "next/link";
import { Header, Footer } from "@/components/shell";
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container empty-state">
        <span className="eyebrow">PÁGINA NÃO ENCONTRADA</span>
        <h1>Esse achado não está por aqui.</h1>
        <p>
          O endereço pode estar incorreto ou o conteúdo não estar disponível.
        </p>
        <Link className="button dark" href="/">
          Voltar ao início
        </Link>
      </main>
      <Footer />
    </>
  );
}
