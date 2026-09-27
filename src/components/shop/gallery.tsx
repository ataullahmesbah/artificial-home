import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { BrandIcon } from "@/components/ui/brand-icon";
import { SectionTitle } from "@/components/shop/section-title";

export function Gallery({ images, instagram }: { images: string[]; instagram: string | null }) {
  if (!images.length) return null;
  const Wrap = ({ children }: { children: React.ReactNode }) =>
    instagram ? (
      <a href={instagram} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-[18px] bg-surface" aria-label="Open our Instagram">
        {children}
      </a>
    ) : (
      <div className="group relative block aspect-square overflow-hidden rounded-[18px] bg-surface">{children}</div>
    );
  return (
    <section className="section" aria-labelledby="gallery-title">
      <div className="container-x">
        <SectionTitle eyebrow="@artificialhome" title="Follow us on *Instagram*" text="Tag us in your photos for a chance to be featured." />
        <Stagger className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:grid-cols-6">
          {images.slice(0, 12).map((src, i) => (
            <StaggerItem key={src + i}>
              <Wrap>
                <Image src={src} alt="" fill sizes="(min-width: 1024px) 200px, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 grid place-items-center bg-accent/0 text-white opacity-0 transition-all duration-300 group-hover:bg-accent/45 group-hover:opacity-100">
                  <BrandIcon name="instagram" size={26} />
                </span>
              </Wrap>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
