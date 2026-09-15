const messages: Record<string, string> = {
  saved: "Rascunho salvo. Revise os dados antes de publicar.",
  published: "Oferta publicada no catálogo.",
  expired: "Oferta encerrada.",
  invalid:
    "Confira os campos: URLs do Mercado Livre, preços e validade de até 30 dias.",
  db: "Não foi possível concluir. Verifique dados duplicados ou encerre a oferta publicada antes de cadastrar uma nova para o mesmo produto.",
  checked: "Preço confirmado por você. A verificação vale por 24 horas.",
  market_updated:
    "Preço consultado no Mercado Livre. Mudanças de preço retiram a oferta do catálogo até uma nova revisão.",
  market_failed:
    "Não foi possível consultar o Mercado Livre. Confira acesso e configuração.",
  sent: "Mensagem enviada ao Telegram.",
  send_failed:
    "O envio falhou ou já foi solicitado. Confira o registro antes de tentar qualquer novo envio.",
  unknown:
    "O resultado do envio é incerto. Confira o canal antes de publicar novamente.",
  unconfigured: "A integração ainda não está configurada.",
  forbidden: "Sua conta não possui acesso administrativo.",
  invalid_login: "Não foi possível entrar. Confira seu e-mail e sua senha.",
};
export function ResultNotice({ code }: { code?: string }) {
  return code && messages[code] ? (
    <div className="notice" role="status">
      <p>{messages[code]}</p>
    </div>
  ) : null;
}
