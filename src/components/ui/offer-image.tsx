import Image from "next/image";
import { ProductArt } from "./product-art";
import type { Offer } from "@/domain/catalog";
export function OfferImage({ offer }: { offer: Offer }) {
  return offer.imageUrl ? (
    <Image
      src={offer.imageUrl}
      alt={offer.title}
      width={480}
      height={360}
      unoptimized
      className="offer-photo"
    />
  ) : (
    <ProductArt kind={offer.art} />
  );
}
