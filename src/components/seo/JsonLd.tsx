/**
 * Renders JSON-LD structured data.
 *
 * Content is our own build-time data (never user input), and we escape `<` to
 * close off any chance of breaking out of the script tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
