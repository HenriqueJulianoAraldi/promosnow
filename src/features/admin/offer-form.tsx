import { saveOffer } from "@/server/actions/offers";
import { Submit } from "@/components/ui/submit";
import { categories } from "@/domain/catalog";
import type { LiveRow } from "@/server/repositories/live-catalog";
export function OfferForm({ offer }: { offer?: LiveRow }) {
  const link = offer
    ? Array.isArray(offer.affiliate_links)
      ? offer.affiliate_links[0]
      : offer.affiliate_links
    : undefined;
  const expiry = offer
    ? new Date(new Date(offer.expires_at).getTime() - 3 * 3600000)
        .toISOString()
        .slice(0, 16)
    : "";
  return (
    <form action={saveOffer} className="panel live-form">
      <h2>{offer ? "Editar rascunho" : "Cadastrar produto e oferta"}</h2>
      <p>O cadastro fica em revisão até você aprovar a publicação.</p>
      <input type="hidden" name="id" value={offer?.id ?? ""} />
      <label className="field">
        Nome do produto
        <input
          name="title"
          required
          minLength={3}
          maxLength={180}
          defaultValue={offer?.title}
        />
      </label>
      <label className="field">
        Descrição
        <textarea
          name="description"
          maxLength={2000}
          rows={3}
          defaultValue={offer?.description ?? ""}
        />
      </label>
      <div className="form-grid">
        <label className="field">
          Categoria
          <select
            name="category"
            defaultValue={offer?.products.category ?? "tecnologia"}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Fonte
          <select
            name="provider"
            defaultValue={offer?.products.provider ?? "manual"}
          >
            <option value="manual">Cadastro manual</option>
            <option value="mercado_livre">
              Mercado Livre (consulta por código)
            </option>
          </select>
        </label>
      </div>
      <label className="field">
        Código do anúncio (obrigatório para consulta automática)
        <input
          name="external_id"
          placeholder="MLB1234567890"
          maxLength={40}
          defaultValue={offer?.products.external_id ?? ""}
        />
      </label>
      <label className="field">
        Endereço original do produto no Mercado Livre
        <input
          name="canonical_url"
          type="url"
          required
          maxLength={2048}
          placeholder="https://produto.mercadolivre.com.br/..."
          defaultValue={offer?.products.canonical_url}
        />
      </label>
      <label className="field">
        Seu link de afiliado
        <input
          name="destination_url"
          type="url"
          required
          maxLength={2048}
          placeholder="Cole o link obtido no programa de afiliados"
          defaultValue={link?.destination_url}
        />
      </label>
      <label className="field">
        Imagem do produto (opcional; endereço http2.mlstatic.com)
        <input
          name="image_url"
          type="url"
          maxLength={2048}
          defaultValue={offer?.products.image_url ?? ""}
        />
      </label>
      <div className="form-grid">
        <label className="field">
          Preço atual (R$)
          <input
            name="price"
            inputMode="decimal"
            placeholder="249,90"
            required
            defaultValue={offer ? (offer.price_cents / 100).toFixed(2) : ""}
          />
        </label>
        <label className="field">
          Preço de referência (opcional)
          <input
            name="reference_price"
            inputMode="decimal"
            placeholder="399,90"
            defaultValue={
              offer?.reference_price_cents
                ? (offer.reference_price_cents / 100).toFixed(2)
                : ""
            }
          />
        </label>
      </div>
      <label className="field">
        Origem e data do preço de referência
        <input
          name="reference_basis"
          maxLength={300}
          placeholder="Ex.: preço anterior observado na loja em 14/09/2026"
          defaultValue={offer?.reference_basis ?? ""}
        />
      </label>
      <label className="field">
        Válida até (horário de Brasília; máximo de 30 dias)
        <input
          name="expires_at"
          type="datetime-local"
          required
          defaultValue={expiry}
        />
      </label>
      <p className="price-note">
        Informe preços sem separador de milhar. O preço atual precisa ser
        reconferido a cada 24 horas.
      </p>
      <Submit>Salvar rascunho</Submit>
    </form>
  );
}
