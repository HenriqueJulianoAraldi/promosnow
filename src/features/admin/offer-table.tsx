"use client";
import { useState } from "react";
import Link from "next/link";
import { formatMoney, normalizeSearch, type Offer } from "@/domain/catalog";
import { ProductArt } from "@/components/ui/product-art";
const labels = {
  published: "No catálogo",
  draft: "Em revisão",
  expired: "Encerrada",
};
export function OfferTable({
  offers,
  kind,
}: {
  offers: Offer[];
  kind: "produtos" | "ofertas";
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const rows = offers.filter(
    (o) =>
      normalizeSearch(o.title).includes(normalizeSearch(query)) &&
      (!status || o.status === status),
  );
  return (
    <section className="panel table-panel">
      <div className="table-filters">
        <label>
          <span className="sr-only">Buscar {kind}</span>
          <input
            type="search"
            placeholder={`Buscar ${kind}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={150}
          />
        </label>
        <label>
          <span className="sr-only">Filtrar situação</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas as situações</option>
            <option value="published">No catálogo</option>
            <option value="draft">Em revisão</option>
            <option value="expired">Encerrada</option>
          </select>
        </label>
      </div>
      <p className="result-count" role="status">
        {rows.length} registros de exemplo
      </p>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            {kind === "produtos" ? "Produtos" : "Ofertas"} de demonstração
          </caption>
          <thead>
            <tr>
              <th scope="col">Produto</th>
              <th scope="col">Preço ilustrativo</th>
              <th scope="col">Situação</th>
              <th scope="col">Visualização</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div className="table-product">
                    <span className={`table-art ${offer.color}`}>
                      <ProductArt kind={offer.art} />
                    </span>
                    <div>
                      <strong>{offer.title}</strong>
                      <small>{offer.id} · Cadastro de exemplo</small>
                    </div>
                  </div>
                </td>
                <td>{formatMoney(offer.priceCents)}</td>
                <td>
                  <span className={`badge ${offer.status}`}>
                    {labels[offer.status]}
                  </span>
                </td>
                <td>
                  {offer.status === "draft" ? (
                    <span className="muted">Não publicado</span>
                  ) : (
                    <Link className="text-link" href={`/ofertas/${offer.slug}`}>
                      Ver exemplo ↗
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty-state">
          <h3>Nenhum registro encontrado.</h3>
          <button
            className="button dark"
            onClick={() => {
              setQuery("");
              setStatus("");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  );
}
