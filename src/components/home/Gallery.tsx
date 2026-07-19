import { Section, SectionHeading } from "@/components/site/Section";
import { getSocialPosts, instagramHandle, instagramUrl } from "@/lib/social";

/**
 * Social / Instagram wall.
 * Consumes `getSocialPosts()` rather than hard-coded content, so connecting the
 * Instagram Graph API later requires no change to this component.
 */
export default async function Gallery() {
  const { source, posts } = await getSocialPosts(6);
  const isLive = source !== "placeholder";

  return (
    <Section id="gallery" tone="paper">
      <SectionHeading
        eyebrow="Travel gallery"
        title="From the road"
        lede="Moments our travellers sent back — snow at Solang, sunrise at Chandrashila, Shikaras on Dal Lake."
        action={
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold-dim transition-colors hover:text-ink-text"
          >
            @{instagramHandle} →
          </a>
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {posts.map((post) => {
          const tile = (
            <div
              className="group relative aspect-square overflow-hidden rounded-xl"
              style={post.imageUrl ? undefined : { backgroundImage: post.gradient }}
            >
              {post.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt={post.caption ?? "Travel photo from Bundelkhand Pride Travels"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {!isLive && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="rounded-full bg-ink/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-cream backdrop-blur-sm">
                    Photo soon
                  </span>
                </div>
              )}
            </div>
          );

          return (
            <li key={post.id}>
              {post.href ? (
                <a href={post.href} target="_blank" rel="noopener noreferrer">
                  {tile}
                </a>
              ) : (
                tile
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
