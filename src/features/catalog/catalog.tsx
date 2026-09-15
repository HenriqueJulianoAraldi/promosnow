"use client";
import { useState } from "react";
import { categories, selectOffers, type Offer } from "@/domain/catalog";
import { Icon } from "@/components/ui/icon";
import { OfferCard } from "./offer-card";
export function Catalog({
  offers,
  demo = true,
}: {
  offers: Offer[];
  demo?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const list = selectOffers(offers, { query, category, sort });
  const hasFilters = Boolean(query || category);
  function clearFilters() {
    setQuery("");
    setCategory("");
  }
  return (
    <section className="catalog container" id="ofertas">
      <div className="section-heading">
        <div>
          <span className="eyebrow">EXPLORE O CATÁLOGO</span>
          <h2>
            Encontre seu próximo achado<span className="accent">.</span>
          </h2>
        </div>
        <span className="muted">
          {demo ? "Seleção de demonstração" : "Ofertas revisadas"}
        </span>
      </div>
      <div className="search-sort">
        <label className="search">
          <Icon name="search" />
          <span className="sr-only">Buscar ofertas</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você está procurando?"
            maxLength={150}
          />
        </label>
        <label className="sort-label">
          <span>Ordenar por</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Destaques</option>
            <option value="price">Menor preço</option>
            <option value="discount">Maior desconto</option>
          </select>
        </label>
      </div>
      <div
        className="category-row"
        role="group"
        aria-label="Filtrar por categoria"
      >
        <button
          onClick={() => setCategory("")}
          aria-pressed={!category}
          className={!category ? "chip active" : "chip"}
        >
          <Icon name="grid" size={16} /> Todas as ofertas
        </button>
        {categories.map((c) => (
          <button
            key={c.value}
            aria-pressed={category === c.value}
            className={category === c.value ? "chip active" : "chip"}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="catalog-results">
        <p
          className="result-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {list.length}{" "}
          {list.length === 1 ? "oferta encontrada" : "ofertas encontradas"}
        </p>
        {hasFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>
      {list.length ? (
        <div className="offer-grid">
          {list.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name={offers.length ? "search" : "tag"} size={32} />
          <h3>
            {offers.length
              ? "Não encontramos essa combinação."
              : "Os próximos achados estão a caminho."}
          </h3>
          <p>
            {offers.length
              ? "Tente outro termo ou limpe os filtros para ver a seleção completa."
              : "Assim que uma oferta estiver disponível, ela aparece aqui. Volte em breve para conferir."}
          </p>
          {hasFilters && (
            <button className="button dark" onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </section>
  );
}
