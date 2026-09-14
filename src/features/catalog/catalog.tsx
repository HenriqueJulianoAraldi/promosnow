"use client";
import { useState } from "react";
import { categories, selectOffers, type Offer } from "@/domain/catalog";
import { Icon } from "@/components/ui/icon";
import { OfferCard } from "./offer-card";
export function Catalog({ offers }: { offers: Offer[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const list = selectOffers(offers, { query, category, sort });
  return (
    <section className="catalog container" id="ofertas">
      <div className="section-heading">
        <div>
          <span className="eyebrow">EXPLORE O CATÁLOGO</span>
          <h2>
            Um achado para cada dia<span className="orange">.</span>
          </h2>
        </div>
        <span className="muted">Seleção de demonstração</span>
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
      <p className="result-count" role="status">
        {list.length}{" "}
        {list.length === 1 ? "oferta encontrada" : "ofertas encontradas"}
      </p>
      {list.length ? (
        <div className="offer-grid">
          {list.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h3>Nenhum achado por aqui ainda.</h3>
          <p>Tente outro termo ou escolha uma categoria diferente.</p>
          <button
            className="button dark"
            onClick={() => {
              setQuery("");
              setCategory("");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  );
}
