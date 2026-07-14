export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. '2026-07-14'. */
  date: string;
  keywords?: string[];
  /** IDs of tools referenced by this post, rendered as a related-tools rail. */
  relatedTools?: string[];
  /** Markdown body. */
  body: string;
}

// Guides and how-tos. Each post targets long-tail keywords and links to the
// relevant tool pages, which builds internal links and gives people something
// to link to from other sites.
export const posts: BlogPost[] = [
  {
    slug: 'how-to-merge-pdf-files-free',
    title: 'How to Merge PDF Files for Free (Without Uploading Them)',
    description:
      'Combine multiple PDFs into one document directly in your browser — no software, no sign-up, and your files never leave your device.',
    date: '2026-07-14',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'free pdf merger'],
    relatedTools: ['pdf-merger', 'pdf-splitter', 'pdf-compressor'],
    body: `Merging PDFs is one of the most common document tasks, yet most online tools force you to upload sensitive files to a server first. Here is how to combine PDFs **entirely in your browser**, so contracts, invoices, and statements never leave your device.

## Why browser-based merging is safer

When a website processes your PDF on its own servers, your document is transmitted, and often temporarily stored, on a machine you do not control. For anything sensitive — signed agreements, financial records, medical documents — that is an unnecessary risk. A browser-based tool uses your device's own processing power, so the file stays local.

## Step-by-step

1. Open the [PDF Merger](/tools/pdf/merger).
2. Upload two or more PDF files from your device.
3. Drag the files into the exact order you want them combined.
4. Click merge, then download the single combined PDF.

## Does merging reduce quality?

No. Pages are copied losslessly into the new document — text stays selectable and images keep their original resolution. There is no re-compression step.

## Related tasks

Need to split a PDF back apart, or shrink an oversized file? See the [PDF Splitter](/tools/pdf/splitter) and [PDF Compressor](/tools/pdf/compressor).`,
  },
  {
    slug: 'json-formatter-vs-validator',
    title: 'JSON Formatter vs Validator: What Is the Difference?',
    description:
      'Formatting pretty-prints JSON for readability; validation checks that it is well-formed and matches a schema. Here is when to use each.',
    date: '2026-07-14',
    keywords: ['json formatter', 'json validator', 'format json', 'validate json'],
    relatedTools: ['json-formatter', 'json-schema-validator', 'json-diff'],
    body: `Developers reach for "JSON tools" dozens of times a day, but formatting and validation solve different problems. Knowing which you need saves time.

## Formatting

A [JSON Formatter](/tools/developer/json-formatter) takes minified or messy JSON and pretty-prints it with consistent indentation, so you can read a large payload from an API response or log line. It also flags syntax errors like a trailing comma.

## Validation

A [JSON Schema Validator](/tools/developer/json-schema-validator) goes further: it checks your JSON against a schema that defines required fields, types, and constraints. Use it when you need to guarantee a payload matches an API contract before sending it.

## Comparing two payloads

When you need to see what changed between two objects, a [JSON Diff](/tools/developer/json-diff) highlights added, removed, and changed keys line by line.

All three run entirely in your browser, so the payloads, tokens, and config you paste never touch a server.`,
  },
  {
    slug: 'convert-images-to-webp',
    title: 'How to Convert Images to WebP (and Why It Speeds Up Your Site)',
    description:
      'WebP images are typically 25–35% smaller than JPG or PNG at the same quality. Convert them in your browser with no upload.',
    date: '2026-07-14',
    keywords: ['convert to webp', 'webp converter', 'compress images', 'image optimization'],
    relatedTools: ['webp-converter', 'image-resizer', 'favicon-generator'],
    body: `Page speed is a ranking factor, and images are usually the heaviest thing on a page. Switching to WebP is one of the easiest wins.

## Why WebP

WebP supports both lossy and lossless compression and typically produces files **25–35% smaller** than an equivalent JPG or PNG, with no visible quality loss. Every modern browser supports it.

## Convert without uploading

1. Open the [WebP Converter](/tools/image/webp-converter).
2. Add your JPG or PNG images.
3. Choose a quality level.
4. Download the WebP output.

Because the conversion uses your browser's Canvas API, your images are never uploaded — useful for unreleased designs or personal photos.

## Resize first for even smaller files

If your image is larger than it needs to be, [resize it](/tools/image/resizer) before converting. Serving a 4000px image scaled down to 800px in CSS wastes bandwidth.`,
  },
];

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
