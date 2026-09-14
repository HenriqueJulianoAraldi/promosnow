"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container empty-state">
      <h1>Não foi possível carregar esta página.</h1>
      <p>Tente novamente em alguns instantes.</p>
      <button className="button dark" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
