/**
 * Social content adapter.
 *
 * The UI never talks to Instagram directly — it consumes `SocialPost[]` from
 * `getSocialPosts()`. When the Instagram Graph API (or a connector) is wired up,
 * only this file changes; every consuming component keeps working untouched.
 *
 * Deliberately NOT hard-coding real Instagram posts: we don't have API access,
 * and inventing engagement numbers or captions would be fabricating content.
 */

export type SocialPost = {
  id: string;
  /** Permalink to the post. Null while no live source is connected. */
  href: string | null;
  /** Image URL once connected; gradient placeholder is used when absent. */
  imageUrl: string | null;
  caption: string | null;
  /** Placeholder styling used until real media exists. */
  gradient: string;
};

export type SocialSource = "placeholder" | "instagram";

const placeholderPosts: SocialPost[] = [
  { id: "g1", href: null, imageUrl: null, caption: null, gradient: "linear-gradient(160deg,#356074,#0a0e1a)" },
  { id: "g2", href: null, imageUrl: null, caption: null, gradient: "linear-gradient(160deg,#2f5d50,#0a0e1a)" },
  { id: "g3", href: null, imageUrl: null, caption: null, gradient: "linear-gradient(160deg,#8a6e34,#0a0e1a)" },
  { id: "g4", href: null, imageUrl: null, caption: null, gradient: "linear-gradient(160deg,#6a3f52,#0a0e1a)" },
  { id: "g5", href: null, imageUrl: null, caption: null, gradient: "linear-gradient(160deg,#4a5a72,#0a0e1a)" },
  { id: "g6", href: null, imageUrl: null, caption: null, gradient: "linear-gradient(160deg,#1f6a7a,#0a0e1a)" },
];

export const instagramHandle = "bundelkhand_pridetravels";
export const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;

/**
 * Returns social posts for the gallery.
 *
 * Today: placeholders. Once Instagram is connected, fetch here (cached/revalidated)
 * and map the response into `SocialPost[]` — no component changes required.
 */
export async function getSocialPosts(limit = 6): Promise<{
  source: SocialSource;
  posts: SocialPost[];
}> {
  return { source: "placeholder", posts: placeholderPosts.slice(0, limit) };
}
