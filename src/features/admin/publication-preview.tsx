"use client";
import { useState } from "react";
import { formatMoney, type Offer } from "@/domain/catalog";
import { Icon } from "@/components/ui/icon";
export function PublicationPreview({ offers }: { offers: Offer[] }) {
  const [selected, setSelected] = useState(offers[0]?.id ?? "");
  const offer = offers.find((o) => o.id === selected);
  return (
    <div className="publication-grid">
      <section className="panel">
        <span className="eyebrow">PREPARE SUA MENSAGEM</span>
        <h2>Veja antes de compartilhar.</h2>
        <p>Escolha um exemplo para visualizar a mensagem. Nada será enviado.</p>
        <label className="field">
          Oferta de demonstração
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </label>
        <div className="notice">
          <Icon name="send" />
          <p>
            O Telegram ainda não está conectado. O envio ficará disponível
            depois da configuração e da aprovação da oferta.
          </p>
        </div>
        <button className="button dark full" disabled>
          Envio indisponível nesta etapa
        </button>
      </section>
      <section className="telegram-preview" aria-label="Prévia da mensagem">
        <div className="preview-header">
          <span className="logo-mark">
            <Icon name="bolt" />
          </span>
          <div>
            <strong>PromosNow</strong>
            <small>Prévia de canal · Não conectado</small>
          </div>
        </div>
        <div className="message-bubble" aria-live="polite">
          <span className="eyebrow">EXEMPLO · NÃO É UMA OFERTA REAL</span>
          {offer && (
            <>
              <h3>{offer.title}</h3>
              <p>
                De {formatMoney(offer.referencePriceCents)}
                <br />
                <strong>Por {formatMoney(offer.priceCents)}</strong>
              </p>
              <p>Produto e preços fictícios para demonstração.</p>
              <span className="preview-link">
                [Link da oferta será inserido aqui]
              </span>
            </>
          )}
          <small>Prévia · Não enviada</small>
        </div>
      </section>
    </div>
  );
}
