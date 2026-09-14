import { getAppState } from "@/server/env";
import { LivePublications } from "@/features/admin/live-publications";
import { ResultNotice } from "@/features/admin/result";
import { PublicationPreview } from "@/features/admin/publication-preview";
import { getDemoCatalog } from "@/server/services/catalog";
export default async function Publications({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  if (getAppState() === "live") {
    const { result } = await searchParams;
    return (
      <>
        <ResultNotice code={result} />
        <LivePublications />
      </>
    );
  }
  return (
    <>
      <div className="admin-heading">
        <span className="eyebrow">DA CURADORIA AO CANAL</span>
        <h1>Publicações</h1>
        <p>Uma prévia de como os seus achados poderão chegar ao Telegram.</p>
      </div>
      <PublicationPreview
        offers={getDemoCatalog().filter((o) => o.status === "published")}
      />
    </>
  );
}
