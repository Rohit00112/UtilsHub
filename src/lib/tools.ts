export interface ToolFaq {
  q: string;
  a: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  slug: string; // The URL path under /tools/[category]/[slug]
  categoryId: string;
  status: 'active' | 'planned';
  keywords?: string[];
  // Long-form SEO content (rendered below the tool UI)
  longDescription?: string;
  steps?: string[];
  useCases?: string[];
  faqs?: ToolFaq[];
  // IDs of related tools (rendered as a sidebar/footer rail)
  related?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  keywords?: string[];
}

export const categories: Category[] = [
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split, compress, and compare PDF files.',
    longDescription:
      'Process PDF files directly in your browser. Split a PDF into page ranges, compress to reduce file size, or compare two documents to find textual differences. Nothing is uploaded to a server — the files stay on your device.',
    keywords: ['PDF tools', 'split PDF', 'compress PDF', 'compare PDF', 'free PDF tools'],
  },
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Format, transform, and analyze text data.',
    longDescription:
      'Quick text utilities for everyday writing and data cleaning: convert case, count words, encode URLs and Base64, compare two text blocks, and remove duplicate lines. Each tool runs locally so pasted content never leaves your browser.',
    keywords: ['text tools', 'word counter', 'base64', 'text diff', 'URL encoder'],
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Convert, resize, and edit images in your browser.',
    longDescription:
      'Resize images, convert to WebP, generate favicons, and merge multiple images into one — all client-side using Canvas APIs. No upload, no quality loss from third-party services, no waiting on a queue.',
    keywords: ['image tools', 'WebP converter', 'image resizer', 'favicon generator', 'merge images'],
  },
  {
    id: 'security',
    name: 'Security Tools',
    description: 'Encryption, hashing, and password utilities.',
    longDescription:
      'Generate strong passwords, hash data with MD5/SHA-1/SHA-256/SHA-512, decode JWTs to inspect headers and payload claims, and create QR codes. Operations use the Web Crypto API where available and run in your browser.',
    keywords: ['security tools', 'JWT decoder', 'hash generator', 'password generator', 'QR code'],
  },
  {
    id: 'calculator',
    name: 'Calculators',
    description: 'Quick financial and mathematical calculations.',
    longDescription:
      'Common everyday calculators: monthly EMI for loans, GST tax breakdowns, BMI from height and weight, age from a date of birth, and unit conversions across length, weight, temperature, and more. Inputs are computed locally.',
    keywords: ['online calculators', 'EMI calculator', 'GST calculator', 'BMI calculator', 'unit converter', 'age calculator'],
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Formatters, generators, and testers for engineers.',
    longDescription:
      'Format JSON, XML, and Markdown; convert between YAML and JSON; test regular expressions; generate UUIDs and Lorem Ipsum; explore color palettes. Built for fast checks during code reviews, debugging, and content drafting.',
    keywords: ['developer tools', 'JSON formatter', 'UUID generator', 'regex tester', 'YAML to JSON'],
  },
  {
    id: 'web',
    name: 'Web Tools',
    description: 'SEO, URL, and site-publishing utilities.',
    longDescription:
      'Small browser-local helpers for shipping and debugging web pages: build campaign URLs, prepare crawl directives, inspect HTTP references, and generate metadata without sending inputs to a server.',
    keywords: ['web tools', 'UTM builder', 'SEO tools', 'robots.txt', 'HTTP status codes'],
  },
];

const commonFaqPrivacy: ToolFaq = {
  q: 'Is anything uploaded to a server?',
  a: 'No. Every UtilsHub tool runs entirely in your browser. The input you paste or the file you select stays on your device.',
};

const commonFaqFree: ToolFaq = {
  q: 'Is this tool free to use?',
  a: 'Yes. UtilsHub is free, with no sign-up, no ads, and no usage limits.',
};

export const tools: Tool[] = [
  // PDF
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into one ordered document.',
    slug: 'merger',
    categoryId: 'pdf',
    status: 'active',
    keywords: ['merge PDF', 'combine PDF files', 'PDF merger online', 'join PDFs'],
    longDescription:
      'Merge two or more PDF files into a single document directly in your browser. Arrange files in the order you want, preserve all pages, and download one combined PDF without uploading documents to a server.',
    steps: ['Upload two or more PDFs.', 'Arrange files from top to bottom in merge order.', 'Merge and download the combined PDF.'],
    useCases: ['Combine invoices into one monthly packet', 'Join scanned documents before emailing', 'Merge report sections exported from separate apps'],
    faqs: [
      { q: 'Can I reorder files before merging?', a: 'Yes. Use the move controls to arrange the PDFs before creating the merged output.' },
      { q: 'Does merging change page quality?', a: 'No. Pages are copied into a new PDF without rasterizing or down-sampling the content.' },
      commonFaqPrivacy,
    ],
    related: ['pdf-splitter', 'pdf-compressor', 'pdf-compare'],
  },
  {
    id: 'pdf-compare',
    name: 'PDF Compare',
    description: 'Compare two PDF files for textual differences.',
    slug: 'compare',
    categoryId: 'pdf',
    status: 'active',
    keywords: ['compare PDF', 'PDF diff', 'PDF compare online'],
    longDescription:
      'Compare two PDF documents and see textual differences highlighted inline. The tool extracts text from each PDF and runs a diff so you can spot edits between revisions of contracts, reports, or drafts without paid software.',
    steps: [
      'Upload the original PDF on the left.',
      'Upload the revised PDF on the right.',
      'Review the highlighted additions and deletions.',
    ],
    useCases: [
      'Spot edits between contract revisions',
      'Verify what changed in a published report',
      'Audit translated documents against the source',
    ],
    faqs: [
      { q: 'Does it compare images or only text?', a: 'It compares extracted text. Image content inside a PDF is not visually diffed.' },
      { q: 'Are scanned PDFs supported?', a: 'Only if the scan has been OCR-processed and the PDF contains real text layers. Pure image scans produce no extractable text.' },
      commonFaqPrivacy,
    ],
    related: ['pdf-merger', 'pdf-splitter', 'pdf-compressor', 'diff-checker'],
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter',
    description: 'Split a PDF into page ranges or individual files.',
    slug: 'splitter',
    categoryId: 'pdf',
    status: 'active',
    keywords: ['split PDF', 'PDF splitter', 'extract pages from PDF'],
    longDescription:
      'Split a multi-page PDF into smaller documents by page ranges (e.g., 1-3, 5, 8-10) or extract every page into its own file. Built with pdf-lib in the browser.',
    steps: [
      'Upload the PDF to split.',
      'Choose split by range or every page.',
      'Download the split output as a ZIP.',
    ],
    useCases: [
      'Extract a single chapter from a long PDF',
      'Send only the relevant pages of a contract',
      'Break a scanned bundle into one-file-per-document',
    ],
    faqs: [
      { q: 'What is the maximum file size?', a: 'There is no hard limit, but very large PDFs (hundreds of MB) may slow down your browser since processing is local.' },
      { q: 'Does splitting reduce quality?', a: 'No. Pages are copied byte-for-byte; there is no re-encoding.' },
      commonFaqPrivacy,
    ],
    related: ['pdf-merger', 'pdf-compressor', 'pdf-compare'],
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    description: 'Optimize PDF structure to reduce file size.',
    slug: 'compressor',
    categoryId: 'pdf',
    status: 'active',
    keywords: ['compress PDF', 'reduce PDF size', 'PDF optimizer'],
    longDescription:
      'Reduce a PDF\'s file size by re-saving it with optimized object streams and stripped metadata. Useful for email attachments that exceed size limits.',
    steps: [
      'Upload your PDF.',
      'Click compress and wait a few seconds.',
      'Download the smaller file.',
    ],
    useCases: [
      'Fit a PDF under an email attachment limit',
      'Reduce storage for archived documents',
      'Speed up downloads of shared PDFs',
    ],
    faqs: [
      { q: 'How much smaller will my PDF get?', a: 'Savings vary. Image-heavy PDFs typically shrink the most; text-only PDFs already near-optimal may not change much.' },
      { q: 'Is image quality reduced?', a: 'The current implementation focuses on structural optimization, not aggressive image down-sampling, so visual quality is preserved.' },
      commonFaqPrivacy,
    ],
    related: ['pdf-merger', 'pdf-splitter', 'pdf-compare'],
  },

  // Text
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between uppercase, lowercase, title case, and more.',
    slug: 'case-converter',
    categoryId: 'text',
    status: 'active',
    keywords: ['case converter', 'uppercase to lowercase', 'title case', 'sentence case'],
    longDescription:
      'Switch between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case in one click. Useful for cleaning copy, formatting headings, and normalizing identifiers.',
    steps: ['Paste your text.', 'Click the target case.', 'Copy the result.'],
    useCases: [
      'Normalize column headers in spreadsheets',
      'Convert pasted code identifiers between conventions',
      'Fix accidentally caps-locked text',
    ],
    faqs: [
      { q: 'Does it preserve formatting like line breaks?', a: 'Yes. Only the letter case changes; whitespace and punctuation are kept.' },
      commonFaqPrivacy,
      commonFaqFree,
    ],
    related: ['word-counter', 'remove-duplicates-lines'],
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs in real time.',
    slug: 'word-counter',
    categoryId: 'text',
    status: 'active',
    keywords: ['word counter', 'character counter', 'count words online'],
    longDescription:
      'Live counters for words, characters (with and without spaces), sentences, and paragraphs. Helpful for hitting essay word limits, drafting tweets, or estimating reading time.',
    steps: ['Paste or type text in the input box.', 'Watch the counters update as you type.'],
    useCases: ['Hit an essay or article word target', 'Stay within a 280-character tweet limit', 'Estimate reading time for content briefs'],
    faqs: [
      { q: 'How is reading time calculated?', a: 'Based on an average of about 200 words per minute.' },
      { q: 'Does it count punctuation as characters?', a: 'Yes. Both the with-spaces and without-spaces counts include punctuation.' },
      commonFaqPrivacy,
    ],
    related: ['case-converter', 'remove-duplicates-lines', 'diff-checker'],
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Turn titles or phrases into clean URL slugs.',
    slug: 'slug-generator',
    categoryId: 'text',
    status: 'active',
    keywords: ['slug generator', 'URL slug', 'SEO slug', 'permalink generator'],
    longDescription:
      'Generate URL-friendly slugs from titles, headings, filenames, or product names. Options let you pick separators, strip common stop words, remove accents, and limit the final length.',
    steps: ['Paste a title or phrase.', 'Adjust separator and cleanup options.', 'Copy the generated slug.'],
    useCases: ['Create blog post permalinks', 'Normalize product URLs', 'Prepare file-safe names for static assets'],
    faqs: [
      { q: 'Does it remove accents?', a: 'Yes. Accented Latin characters are normalized to their base characters before the slug is generated.' },
      { q: 'Can I keep underscores instead of dashes?', a: 'Yes. Choose dash or underscore as the separator.' },
      commonFaqPrivacy,
    ],
    related: ['case-converter', 'url-encoder', 'html-entities'],
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode or decode URLs and query strings safely.',
    slug: 'url-encoder',
    categoryId: 'text',
    status: 'active',
    keywords: ['URL encoder', 'URL decoder', 'percent encoding', 'encodeURIComponent'],
    longDescription:
      'Convert text to URL-safe percent-encoded form (encodeURIComponent), or decode an encoded URL back to readable text. Useful when constructing API requests or debugging redirects.',
    steps: ['Paste the text or encoded URL.', 'Pick encode or decode.', 'Copy the result.'],
    useCases: ['Build a safe API query string', 'Inspect what a redirect URL actually points to', 'Encode user input for inclusion in a URL'],
    faqs: [
      { q: 'What\'s the difference between encodeURI and encodeURIComponent?', a: 'encodeURI preserves reserved characters like / and ?, while encodeURIComponent escapes them. This tool uses encodeURIComponent for safety on query values.' },
      commonFaqPrivacy,
    ],
    related: ['base64', 'json-formatter'],
  },
  {
    id: 'html-entities',
    name: 'HTML Entity Encoder',
    description: 'Encode or decode HTML entities for safe markup display.',
    slug: 'html-entities',
    categoryId: 'text',
    status: 'active',
    keywords: ['HTML entity encoder', 'HTML entity decoder', 'escape HTML', 'decode HTML entities'],
    longDescription:
      'Escape reserved HTML characters like ampersands, angle brackets, quotes, and apostrophes so snippets can be displayed safely as text. Decode entities back into readable characters when inspecting copied markup or CMS content.',
    steps: ['Paste the HTML or entity-encoded text.', 'Choose encode or decode.', 'Copy the converted result.'],
    useCases: ['Show code snippets inside a web page', 'Decode copied CMS text', 'Escape template examples before publishing documentation'],
    faqs: [
      { q: 'Which characters are encoded?', a: 'The encoder escapes the reserved characters &, <, >, ", and \'. The decoder uses the browser to decode named and numeric entities.' },
      { q: 'Does this sanitize unsafe HTML?', a: 'No. It converts text representations. Do not treat the result as a full security sanitizer for untrusted HTML.' },
      commonFaqPrivacy,
    ],
    related: ['url-encoder', 'base64', 'markdown-editor'],
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode text to Base64 or decode Base64 back to text.',
    slug: 'base64',
    categoryId: 'text',
    status: 'active',
    keywords: ['Base64 encode', 'Base64 decode', 'Base64 converter', 'Base64URL', 'URL safe Base64'],
    longDescription:
      'Convert UTF-8 text to standard or URL-safe Base64, or decode Base64 back to its original text. Handy for debugging tokens, embedded payloads, config values, or Base64URL strings used in web-safe contexts.',
    steps: ['Paste text or a Base64 string.', 'Pick encode or decode and choose the output variant.', 'Copy the output.'],
    useCases: ['Inspect a Base64 JWT payload', 'Decode a data: URI', 'Encode a config value for storage', 'Create Base64URL strings for web-safe identifiers'],
    faqs: [
      { q: 'Does it handle Unicode (emoji, accents)?', a: 'Yes. Encoding goes through UTF-8 first so non-ASCII characters round-trip correctly.' },
      { q: 'Can it decode Base64URL?', a: 'Yes. Decode mode accepts standard Base64 and URL-safe Base64 with optional padding.' },
      { q: 'Can I decode an image data: URI?', a: 'You can decode the Base64 portion to its raw bytes, but rendering an image requires saving those bytes as a file.' },
      commonFaqPrivacy,
    ],
    related: ['url-encoder', 'jwt-decoder', 'hash-generator'],
  },
  {
    id: 'diff-checker',
    name: 'Text Diff Checker',
    description: 'Compare two text blocks side-by-side with highlighted changes.',
    slug: 'diff-checker',
    categoryId: 'text',
    status: 'active',
    keywords: ['text diff', 'compare text', 'text comparison tool'],
    longDescription:
      'See additions and deletions between two pieces of text by character, word, or line. Useful for proofreading, comparing config files pasted from two environments, or auditing edits to a draft.',
    steps: ['Paste the original on the left.', 'Paste the changed version on the right.', 'Switch between char, word, or line diff modes.'],
    useCases: ['Compare two config snippets', 'Audit changes in a contract draft', 'Spot edits in pasted code'],
    faqs: [
      { q: 'Which diff mode should I pick?', a: 'Use line diff for code or structured text, word diff for prose, and character diff for very short strings where every change matters.' },
      commonFaqPrivacy,
    ],
    related: ['pdf-compare', 'remove-duplicates-lines'],
  },
  {
    id: 'remove-duplicates-lines',
    name: 'Remove Duplicate Lines',
    description: 'Remove duplicate lines from text with case and whitespace options.',
    slug: 'remove-duplicate-lines',
    categoryId: 'text',
    status: 'active',
    keywords: ['remove duplicate lines', 'deduplicate text', 'unique lines'],
    longDescription:
      'Strip repeated lines from a list. Options control whether comparison is case-sensitive, whether to trim whitespace, and whether to keep the original order.',
    steps: ['Paste a list of lines.', 'Adjust options if needed.', 'Copy the deduplicated output.'],
    useCases: ['Clean a list of emails or IDs', 'Deduplicate log lines', 'Tidy a manually merged list'],
    faqs: [
      { q: 'Does it sort lines as well?', a: 'By default it preserves original order. You can enable sort if available.' },
      { q: 'What about empty lines?', a: 'Trim and skip-empty options control how blank lines are treated.' },
      commonFaqPrivacy,
    ],
    related: ['word-counter', 'diff-checker', 'case-converter'],
  },

  // Image
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Create favicons in multiple sizes from any image.',
    slug: 'favicon-generator',
    categoryId: 'image',
    status: 'active',
    keywords: ['favicon generator', 'create favicon', 'ICO generator'],
    longDescription:
      'Generate the standard set of favicon assets (16×16, 32×32, 48×48, plus apple-touch-icon) from a single source image. Download as a ZIP ready to drop into your site root.',
    steps: ['Upload a square source image (PNG recommended).', 'Preview the generated sizes.', 'Download the ZIP and add to your site.'],
    useCases: ['Quick favicon for a new project', 'Replace a stretched/blurry favicon', 'Generate the apple-touch-icon for iOS home screens'],
    faqs: [
      { q: 'What source size works best?', a: 'A square PNG of 512×512 or larger gives clean down-scaling at every size.' },
      { q: 'Where do the files go?', a: 'Place them in your site\'s public root and reference them via the appropriate <link rel="icon"> tags.' },
      commonFaqPrivacy,
    ],
    related: ['image-resizer', 'webp-converter'],
  },
  {
    id: 'image-merger',
    name: 'Image Merger',
    description: 'Merge multiple images vertically or horizontally into one.',
    slug: 'merger',
    categoryId: 'image',
    status: 'active',
    keywords: ['merge images', 'combine images', 'image stitching'],
    longDescription:
      'Stack multiple images into a single image, vertically or horizontally, with optional spacing and background color. Rendered to a Canvas in the browser.',
    steps: ['Upload two or more images.', 'Pick vertical or horizontal layout.', 'Download the merged PNG.'],
    useCases: ['Combine screenshots into a single shareable image', 'Build a quick comparison strip', 'Create a multi-panel social post'],
    faqs: [
      { q: 'How many images can I merge?', a: 'There is no hard limit. Very large totals may be slow because the merge happens in your browser.' },
      { q: 'What output format?', a: 'PNG, preserving transparency where present.' },
      commonFaqPrivacy,
    ],
    related: ['image-resizer', 'webp-converter'],
  },
  {
    id: 'webp-converter',
    name: 'WebP Converter',
    description: 'Convert JPG, PNG, or GIF to WebP with quality control.',
    slug: 'webp-converter',
    categoryId: 'image',
    status: 'active',
    keywords: ['WebP converter', 'JPG to WebP', 'PNG to WebP'],
    longDescription:
      'Convert raster images to WebP for smaller file sizes and faster page loads. Adjust quality between 1 and 100; batch convert multiple files at once.',
    steps: ['Upload one or more images.', 'Pick the WebP quality level.', 'Download converted files.'],
    useCases: ['Shrink hero images for faster page loads', 'Convert design exports for use on the web', 'Batch-convert a folder of PNGs'],
    faqs: [
      { q: 'What quality should I pick?', a: 'Quality 75–85 is typically indistinguishable from the original for photographic content while saving significant size.' },
      { q: 'Does WebP support transparency?', a: 'Yes, like PNG. Alpha channels are preserved.' },
      commonFaqPrivacy,
    ],
    related: ['image-resizer', 'image-merger', 'favicon-generator'],
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images by exact dimensions or percentage.',
    slug: 'resizer',
    categoryId: 'image',
    status: 'active',
    keywords: ['image resizer', 'resize image online', 'change image dimensions'],
    longDescription:
      'Resize images to specific pixel dimensions or a percentage of the original, with optional aspect-ratio locking. Output as PNG, JPEG, or WebP.',
    steps: ['Upload an image.', 'Enter target dimensions or a percentage.', 'Pick output format and download.'],
    useCases: ['Resize a hero image to fit a layout', 'Create thumbnails from full-size photos', 'Down-sample before uploading to a size-limited form'],
    faqs: [
      { q: 'Is the original aspect ratio preserved?', a: 'Yes by default. You can disable lock-aspect-ratio to stretch.' },
      { q: 'What about EXIF rotation?', a: 'The Canvas API normalizes orientation when drawing, so the output is correctly oriented.' },
      commonFaqPrivacy,
    ],
    related: ['webp-converter', 'image-merger', 'favicon-generator'],
  },

  // Security
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, random passwords with configurable character sets.',
    slug: 'password-generator',
    categoryId: 'security',
    status: 'active',
    keywords: ['password generator', 'strong password', 'random password'],
    longDescription:
      'Generate cryptographically random passwords up to any length you need, with optional uppercase, lowercase, numbers, and symbols. Uses the Web Crypto API for randomness — not Math.random().',
    steps: ['Pick a length.', 'Toggle character sets.', 'Click generate, then copy.'],
    useCases: ['Create a new account password', 'Generate an API secret or token seed', 'Rotate credentials during incident response'],
    faqs: [
      { q: 'Is the randomness really secure?', a: 'Yes. Generation uses crypto.getRandomValues, suitable for password and key material.' },
      { q: 'Does anything leave my browser?', a: 'No. Generation is fully local, and copying to clipboard is local OS behavior.' },
      commonFaqPrivacy,
    ],
    related: ['hash-generator', 'jwt-decoder'],
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes.',
    slug: 'hash-generator',
    categoryId: 'security',
    status: 'active',
    keywords: ['hash generator', 'MD5', 'SHA-256', 'SHA-512', 'hash online'],
    longDescription:
      'Compute cryptographic hashes for any text input. SHA-family hashes use the browser\'s Web Crypto API; MD5 is provided for legacy compatibility despite being broken for security use.',
    steps: ['Paste input text.', 'Pick the hash algorithm.', 'Copy the hex digest.'],
    useCases: ['Verify file integrity against a published hash', 'Check whether two inputs are identical without storing them', 'Compare expected vs. actual hash during debugging'],
    faqs: [
      { q: 'Why is MD5 still here if it\'s broken?', a: 'MD5 remains useful for non-security checksums (e.g., legacy file-integrity manifests). Do not use it where collision resistance matters.' },
      { q: 'Can I hash a file, not just text?', a: 'The current version focuses on text input. File hashing may come later.' },
      commonFaqPrivacy,
    ],
    related: ['password-generator', 'base64', 'jwt-decoder'],
  },
  {
    id: 'hmac-generator',
    name: 'HMAC Generator',
    description: 'Generate HMAC signatures with SHA-256, SHA-384, or SHA-512.',
    slug: 'hmac-generator',
    categoryId: 'security',
    status: 'active',
    keywords: ['HMAC generator', 'HMAC SHA-256', 'webhook signature', 'message authentication code'],
    longDescription:
      'Generate keyed HMAC signatures for text payloads using the browser Web Crypto API. Choose SHA-256, SHA-384, or SHA-512 and copy the signature as hex or Base64.',
    steps: ['Paste the message payload.', 'Enter the secret key and choose an algorithm.', 'Generate and copy the HMAC signature.'],
    useCases: ['Create webhook test signatures', 'Verify API signing examples', 'Generate message authentication codes for fixtures'],
    faqs: [
      { q: 'Is the secret sent anywhere?', a: 'No. The secret and message are processed locally in your browser with Web Crypto.' },
      { q: 'Is HMAC the same as hashing?', a: 'No. HMAC uses a secret key plus a hash function, which makes it suitable for authenticating messages.' },
      commonFaqPrivacy,
    ],
    related: ['hash-generator', 'jwt-decoder', 'password-generator'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens — header, payload, and signature.',
    slug: 'jwt-decoder',
    categoryId: 'security',
    status: 'active',
    keywords: ['JWT decoder', 'JSON web token', 'decode JWT online'],
    longDescription:
      'Paste a JWT to inspect its header and payload as formatted JSON. Useful when debugging authentication flows, checking token expiry, or verifying the audience and issuer claims.',
    steps: ['Paste a JWT (three dot-separated Base64URL parts).', 'Inspect the decoded header and payload.', 'Read the registered claims (exp, iat, iss, aud).'],
    useCases: ['Debug why an API returns 401', 'Confirm a token\'s expiry time', 'Inspect custom claims during integration testing'],
    faqs: [
      { q: 'Does it verify the signature?', a: 'No. Decoding does not require the signing key; verification does. This tool decodes only.' },
      { q: 'Is the token sent anywhere?', a: 'No. Decoding is a pure Base64URL + JSON parse operation, done locally.' },
      commonFaqPrivacy,
    ],
    related: ['base64', 'hash-generator', 'json-formatter'],
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text or URLs.',
    slug: 'qr-generator',
    categoryId: 'security',
    status: 'active',
    keywords: ['QR code generator', 'create QR code', 'QR code maker'],
    longDescription:
      'Generate QR codes from any text or URL with configurable size. Download the result as a PNG. Useful for sharing links at conferences, on slides, or in printed materials.',
    steps: ['Enter text or a URL.', 'Pick a size.', 'Download the PNG.'],
    useCases: ['Share a meeting link on a slide', 'Print on business cards', 'Add a Wi-Fi credential to a printed sign'],
    faqs: [
      { q: 'How much data can a QR code hold?', a: 'Up to several thousand characters, depending on encoding, but for scanability keep payloads short — ideally a URL.' },
      { q: 'Can I customize colors or add a logo?', a: 'The current version generates standard black-on-white codes. Custom styling may be added later.' },
      commonFaqPrivacy,
    ],
    related: ['url-encoder', 'password-generator'],
  },

  // Calculator
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    description: 'Calculate monthly loan EMI, total interest, and amortization schedule.',
    slug: 'emi',
    categoryId: 'calculator',
    status: 'active',
    keywords: ['EMI calculator', 'loan calculator', 'monthly installment'],
    longDescription:
      'Compute the Equated Monthly Installment for a loan given principal, annual interest rate, and term in months. See the breakdown of principal vs. interest each month in the amortization table.',
    steps: ['Enter loan amount, rate, and tenure.', 'Read the monthly EMI and total interest.', 'Expand the amortization table for the month-by-month breakdown.'],
    useCases: ['Compare two loan offers', 'Plan a home or car purchase budget', 'See how a higher down payment changes monthly outgo'],
    faqs: [
      { q: 'How is EMI calculated?', a: 'Using the standard formula EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where P is principal, r is the monthly interest rate, and n is the number of months.' },
      { q: 'Does it handle floating rates?', a: 'It assumes a fixed rate for the full term. For floating rates, recalculate when the rate changes.' },
    ],
    related: ['gst-calculator', 'bmi-calculator', 'unit-converter'],
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    description: 'Add or remove GST and split tax into CGST, SGST, IGST, and cess.',
    slug: 'gst',
    categoryId: 'calculator',
    status: 'active',
    keywords: ['GST calculator', 'CGST SGST calculator', 'IGST calculator', 'GST inclusive calculator', 'tax calculator India'],
    longDescription:
      'Calculate GST for tax-exclusive or tax-inclusive amounts. Choose standard GST rates, add optional compensation cess, and split the result into CGST + SGST for intra-state supplies or IGST for inter-state supplies.',
    steps: ['Enter the taxable or tax-inclusive amount.', 'Choose add GST or remove GST, then select the GST rate and supply type.', 'Review the taxable value, tax split, cess, and invoice total.'],
    useCases: ['Prepare an invoice total from a pre-tax amount', 'Extract taxable value from a GST-inclusive price', 'Split GST into CGST and SGST or IGST for accounting entries'],
    faqs: [
      { q: 'What is the difference between Add GST and Remove GST?', a: 'Add GST treats the entered amount as taxable value before tax. Remove GST treats it as an amount that already includes GST and backs out the taxable value.' },
      { q: 'Does it tell me which GST rate applies?', a: 'No. It calculates with the rate you enter. GST rates depend on the item, service, exemption, and notification, so confirm the applicable rate before invoicing.' },
      { q: 'When should I use CGST + SGST instead of IGST?', a: 'Use CGST + SGST for intra-state supplies and IGST for inter-state supplies. Confirm with your accountant for compliance-specific cases.' },
      commonFaqPrivacy,
    ],
    related: ['emi-calculator', 'unit-converter'],
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Calculate Body Mass Index from height and weight (metric or imperial).',
    slug: 'bmi',
    categoryId: 'calculator',
    status: 'active',
    keywords: ['BMI calculator', 'body mass index', 'BMI metric imperial'],
    longDescription:
      'Compute BMI from height and weight in metric (cm / kg) or imperial (ft+in / lb) units. Includes the standard WHO categories (underweight, healthy, overweight, obese).',
    steps: ['Pick metric or imperial.', 'Enter height and weight.', 'Read your BMI and category.'],
    useCases: ['Quick health check', 'Track changes over time', 'Reference value before a doctor\'s visit'],
    faqs: [
      { q: 'Is BMI accurate?', a: 'BMI is a population-level screening tool. It does not distinguish muscle from fat and is less informative for athletes or older adults.' },
      { q: 'What categories does it use?', a: 'WHO adult cutoffs: <18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, ≥30 obese.' },
    ],
    related: ['age-calculator', 'unit-converter'],
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate exact age in years, months, and days from a date of birth.',
    slug: 'age',
    categoryId: 'calculator',
    status: 'active',
    keywords: ['age calculator', 'calculate age from date of birth', 'age in days'],
    longDescription:
      'Enter a date of birth to get the precise age today in years, months, and days. Useful for forms that require exact age, school-eligibility checks, or just curiosity about days lived.',
    steps: ['Enter a date of birth.', 'Read the exact age below.'],
    useCases: ['Fill out a form that needs exact age', 'Check eligibility cutoff for a program', 'Plan a milestone birthday'],
    faqs: [
      { q: 'Does it handle leap years?', a: 'Yes. The calculation uses native Date arithmetic which accounts for leap years.' },
      { q: 'Can I calculate age at a future date?', a: 'The current version computes against today\'s date only.' },
    ],
    related: ['bmi-calculator', 'unit-converter'],
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between common units of length, weight, temperature, area, volume, time, speed, and data.',
    slug: 'unit-converter',
    categoryId: 'calculator',
    status: 'active',
    keywords: ['unit converter', 'metric imperial', 'convert units online'],
    longDescription:
      'Convert across eight categories of units in one place: length, weight, temperature, area, volume, time, speed, and digital data. Results update as you type.',
    steps: ['Pick a category.', 'Enter the input value.', 'Read the converted result.'],
    useCases: ['Convert a recipe between metric and imperial', 'Translate distances on a travel itinerary', 'Check disk size in MB vs. MiB'],
    faqs: [
      { q: 'Does it use MB or MiB for data?', a: 'Both binary (MiB, GiB) and decimal (MB, GB) units are available so you can pick the right one for your context.' },
      { q: 'What temperature scales are supported?', a: 'Celsius, Fahrenheit, and Kelvin.' },
    ],
    related: ['emi-calculator', 'age-calculator'],
  },

  // Developer
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, minify, and validate JSON data instantly.',
    slug: 'json-formatter',
    categoryId: 'developer',
    status: 'active',
    keywords: ['JSON formatter', 'JSON validator', 'JSON beautifier', 'JSON minify'],
    longDescription:
      'Paste JSON and prettify it with two-space indentation, or minify it onto a single line. Invalid JSON is flagged with a clear error so you can spot missing commas or brackets.',
    steps: ['Paste JSON.', 'Click Beautify or Minify.', 'Copy the result.'],
    useCases: ['Read a one-line API response', 'Strip whitespace before embedding JSON in code', 'Spot a syntax error in a config'],
    faqs: [
      { q: 'Does it support JSON5 or trailing commas?', a: 'No. It uses strict JSON.parse — only standard JSON is accepted.' },
      { q: 'What\'s the size limit?', a: 'Tens of MB usually work fine; very large payloads may slow your browser since parsing happens locally.' },
      commonFaqPrivacy,
    ],
    related: ['xml-formatter', 'yaml-json', 'jwt-decoder'],
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Prettify, minify, and format XML documents.',
    slug: 'xml-formatter',
    categoryId: 'developer',
    status: 'active',
    keywords: ['XML formatter', 'XML beautifier', 'XML pretty print'],
    longDescription:
      'Format XML with consistent indentation, or collapse it onto a single line. Useful for reading SOAP responses, RSS feeds, and configuration files.',
    steps: ['Paste XML.', 'Choose indentation.', 'Copy the formatted result.'],
    useCases: ['Read a SOAP response in plain text', 'Format an RSS feed for inspection', 'Clean up a config file before committing'],
    faqs: [
      { q: 'Does it validate XML structure?', a: 'It will report obvious syntax errors. It is not a full schema validator.' },
      commonFaqPrivacy,
    ],
    related: ['json-formatter', 'yaml-json'],
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON Converter',
    description: 'Convert between YAML and JSON in either direction.',
    slug: 'yaml-json',
    categoryId: 'developer',
    status: 'active',
    keywords: ['YAML to JSON', 'JSON to YAML', 'YAML converter'],
    longDescription:
      'Convert YAML to JSON, or JSON to YAML. Powered by js-yaml — keys, lists, and nested structures round-trip cleanly.',
    steps: ['Paste YAML or JSON.', 'Click the conversion direction.', 'Copy the result.'],
    useCases: ['Convert a CI config from YAML to JSON for tooling', 'Read an API JSON response in friendlier YAML', 'Migrate between two systems that prefer different formats'],
    faqs: [
      { q: 'Does it preserve comments?', a: 'No. JSON has no comments, so YAML comments are dropped on conversion.' },
      { q: 'What about YAML anchors?', a: 'They are resolved during parsing, so the JSON output is fully expanded.' },
      commonFaqPrivacy,
    ],
    related: ['json-formatter', 'xml-formatter'],
  },
  {
    id: 'csv-json',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV rows to JSON, or export JSON arrays back to CSV.',
    slug: 'csv-json',
    categoryId: 'developer',
    status: 'active',
    keywords: ['CSV to JSON', 'JSON to CSV', 'CSV converter', 'convert spreadsheet data'],
    longDescription:
      'Convert comma, semicolon, or tab-delimited data into formatted JSON, with support for quoted CSV fields and optional header rows. You can also convert JSON arrays or objects back into CSV for spreadsheets.',
    steps: ['Paste CSV or JSON input.', 'Choose the conversion direction and delimiter.', 'Copy the generated output.'],
    useCases: ['Turn exported spreadsheet rows into API fixtures', 'Convert JSON responses into spreadsheet-friendly CSV', 'Inspect delimiter-separated logs or reports'],
    faqs: [
      { q: 'Does it handle quoted commas?', a: 'Yes. Quoted fields and doubled quotes are parsed before conversion.' },
      { q: 'What JSON shapes convert to CSV?', a: 'Arrays of objects become header-based CSV, arrays of arrays stay row-based, and a single object becomes key/value rows.' },
      commonFaqPrivacy,
    ],
    related: ['json-formatter', 'yaml-json', 'xml-formatter'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test JavaScript regular expressions in real time with match groups.',
    slug: 'regex-tester',
    categoryId: 'developer',
    status: 'active',
    keywords: ['regex tester', 'regex playground', 'test regular expression'],
    longDescription:
      'Write a JavaScript regex with flags and see live matches highlighted in your test string, with capture groups broken out per match. Useful for designing validation patterns and parsing rules.',
    steps: ['Type a regex pattern and pick flags.', 'Paste a sample string.', 'Review matches and capture groups.'],
    useCases: ['Design a form-field validation pattern', 'Extract data from log lines', 'Verify a search-and-replace before applying'],
    faqs: [
      { q: 'Which regex dialect is supported?', a: 'JavaScript (ECMAScript). Some patterns from PCRE or .NET (e.g., named groups syntax differences, lookbehind in older engines) may not transfer directly.' },
      commonFaqPrivacy,
    ],
    related: ['json-formatter', 'lorem-ipsum'],
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate v1, v4, and v7 UUIDs with bulk and copy support.',
    slug: 'uuid-generator',
    categoryId: 'developer',
    status: 'active',
    keywords: ['UUID generator', 'GUID generator', 'UUID v4', 'UUID v7'],
    longDescription:
      'Generate one or many UUIDs in v1 (time-based), v4 (random), or v7 (time-ordered). Bulk-generate for seeding test data; copy individual values or download all at once.',
    steps: ['Pick a UUID version.', 'Choose how many to generate.', 'Copy or download.'],
    useCases: ['Seed unique IDs into test fixtures', 'Generate a key for a new database record', 'Create correlation IDs for log tracing'],
    faqs: [
      { q: 'Which version should I use?', a: 'v4 is the most common for general-purpose unique IDs. v7 is preferable when you need IDs that sort by creation time (better for database indexes).' },
      { q: 'Are these cryptographically random?', a: 'v4 and v7 use the standard random source provided by the uuid library, which delegates to crypto.getRandomValues in the browser.' },
      commonFaqPrivacy,
    ],
    related: ['password-generator', 'hash-generator'],
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps, ISO strings, and local dates.',
    slug: 'timestamp-converter',
    categoryId: 'developer',
    status: 'active',
    keywords: ['timestamp converter', 'Unix time converter', 'epoch converter', 'ISO date converter'],
    longDescription:
      'Convert Unix epoch values in seconds or milliseconds into readable local and UTC dates, or turn a picked local date into timestamps and ISO output. Useful when debugging logs, API payloads, cache headers, and scheduled jobs.',
    steps: ['Paste a timestamp or ISO date.', 'Choose auto-detect or a specific input format.', 'Copy the converted local, UTC, ISO, or Unix value.'],
    useCases: ['Read timestamps from API responses', 'Convert log times while debugging incidents', 'Generate epoch values for test data or scheduled jobs'],
    faqs: [
      { q: 'Does it support seconds and milliseconds?', a: 'Yes. Auto-detect handles common Unix seconds and milliseconds values, and you can force either format.' },
      { q: 'Which timezone is used for local dates?', a: 'Local output uses your browser timezone. UTC output is shown separately for portable values.' },
      commonFaqPrivacy,
    ],
    related: ['json-formatter', 'uuid-generator', 'regex-tester'],
  },
  {
    id: 'css-unit-converter',
    name: 'CSS Unit Converter',
    description: 'Convert px, rem, em, %, vw, and vh with live CSS context.',
    slug: 'css-unit-converter',
    categoryId: 'developer',
    status: 'active',
    keywords: ['CSS unit converter', 'px to rem', 'rem to px', 'vw calculator', 'em converter'],
    longDescription:
      'Convert common CSS length units using configurable root font size, parent font size, parent width, and viewport dimensions. Useful when translating design specs into responsive CSS values.',
    steps: ['Enter a value and source unit.', 'Adjust font, parent, or viewport context.', 'Copy the equivalent CSS unit you need.'],
    useCases: ['Convert pixel specs to rem values', 'Translate responsive widths into vw or percent', 'Compare em and rem behavior for component typography'],
    faqs: [
      { q: 'Why do rem and em need different font sizes?', a: 'rem uses the root font size, while em depends on the current element or parent context.' },
      { q: 'How are percent values calculated?', a: 'Percent output is relative to the parent size you provide.' },
      commonFaqPrivacy,
    ],
    related: ['color-palette', 'unit-converter', 'timestamp-converter'],
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Generate shades, tints, and HEX/RGB/HSL values from a base color.',
    slug: 'color-palette',
    categoryId: 'developer',
    status: 'active',
    keywords: ['color palette', 'color picker', 'HEX to RGB', 'color shades'],
    longDescription:
      'Pick a base color and see a strip of shades and tints with HEX, RGB, and HSL readouts. Useful for building lightweight design tokens or matching a brand color.',
    steps: ['Pick a color.', 'Inspect generated shades and tints.', 'Copy the HEX or RGB value you need.'],
    useCases: ['Build a quick palette for a side project', 'Generate hover/active states for a button color', 'Convert HEX to HSL for CSS custom properties'],
    faqs: [
      { q: 'Does it match Tailwind\'s palette?', a: 'No. It generates linear shades/tints from your input — not specific design-system palettes.' },
      commonFaqPrivacy,
    ],
    related: ['favicon-generator', 'image-resizer'],
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text by words, sentences, or paragraphs.',
    slug: 'lorem-ipsum',
    categoryId: 'developer',
    status: 'active',
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text generator'],
    longDescription:
      'Generate dummy text in classic Lorem Ipsum style, by word count, sentences, or paragraphs. Useful when designing layouts before real content is ready.',
    steps: ['Pick word, sentence, or paragraph mode.', 'Choose how many.', 'Copy the output.'],
    useCases: ['Mock copy in a layout draft', 'Stress-test a text container at different lengths', 'Generate test data for content fields'],
    faqs: [
      { q: 'Is Lorem Ipsum SEO-safe?', a: 'Don\'t ship it on production pages — Google can flag thin or placeholder content. Use only during design.' },
      commonFaqPrivacy,
    ],
    related: ['word-counter', 'markdown-editor'],
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    description: 'Live preview Markdown editor with copy-to-clipboard and HTML export.',
    slug: 'markdown-editor',
    categoryId: 'developer',
    status: 'active',
    keywords: ['markdown editor', 'markdown preview', 'markdown to HTML'],
    longDescription:
      'Write Markdown on the left, see rendered HTML on the right. Copy either side, or download the rendered HTML. Useful for drafting README files and blog posts.',
    steps: ['Write Markdown.', 'Toggle preview.', 'Copy or download.'],
    useCases: ['Draft a README outside your editor', 'Preview Markdown before pasting into a wiki', 'Export a quick HTML snippet from Markdown'],
    faqs: [
      { q: 'Which Markdown flavor?', a: 'GitHub-flavored Markdown via the marked library — supports tables, fenced code blocks, and task lists.' },
      { q: 'Is the HTML sanitized?', a: 'The preview renders the parsed output directly. Don\'t paste untrusted Markdown if you plan to publish the HTML elsewhere.' },
      commonFaqPrivacy,
    ],
    related: ['lorem-ipsum', 'word-counter', 'json-formatter'],
  },

  // Web
  {
    id: 'utm-builder',
    name: 'UTM Builder',
    description: 'Build campaign URLs with UTM parameters and custom query values.',
    slug: 'utm-builder',
    categoryId: 'web',
    status: 'active',
    keywords: ['UTM builder', 'campaign URL builder', 'utm_source', 'utm_campaign'],
    longDescription:
      'Create trackable campaign URLs by adding UTM source, medium, campaign, term, content, and custom query parameters to any base URL. Existing query strings are preserved and updated in place.',
    steps: ['Paste the destination URL.', 'Fill in UTM campaign fields.', 'Copy the generated tracking URL.'],
    useCases: ['Prepare newsletter links', 'Tag paid social campaigns', 'Create consistent analytics URLs for partner referrals'],
    faqs: [
      { q: 'Are existing query parameters preserved?', a: 'Yes. Existing parameters remain unless a UTM field uses the same key, in which case the new value replaces it.' },
      { q: 'Do I need every UTM field?', a: 'No. Source, medium, and campaign are the most common; term and content are optional.' },
      commonFaqPrivacy,
    ],
    related: ['url-encoder', 'slug-generator', 'timestamp-converter'],
  },
  {
    id: 'http-status',
    name: 'HTTP Status Codes',
    description: 'Search HTTP status codes with meanings and copyable status lines.',
    slug: 'http-status',
    categoryId: 'web',
    status: 'active',
    keywords: ['HTTP status codes', 'HTTP 404', 'HTTP 500', 'status code reference'],
    longDescription:
      'Search common HTTP status codes by number, phrase, or class. See what each code means, when to use it, and copy status lines for docs, tests, or mock responses.',
    steps: ['Search by code or phrase.', 'Filter by status class if needed.', 'Copy the status line you want.'],
    useCases: ['Pick the right API response code', 'Document mock server behavior', 'Debug browser and server logs'],
    faqs: [
      { q: 'Does this include every registered status code?', a: 'It focuses on common and widely useful HTTP status codes across the 1xx through 5xx classes.' },
      { q: 'Can I copy a status line?', a: 'Yes. Each row has a copy action for values like 404 Not Found.' },
      commonFaqPrivacy,
    ],
    related: ['utm-builder', 'json-formatter', 'timestamp-converter'],
  },
  {
    id: 'robots-generator',
    name: 'Robots.txt Generator',
    description: 'Generate robots.txt rules with sitemap and crawl-delay options.',
    slug: 'robots-generator',
    categoryId: 'web',
    status: 'active',
    keywords: ['robots.txt generator', 'SEO robots', 'crawl directives', 'sitemap directive'],
    longDescription:
      'Create a robots.txt file with user-agent, allow, disallow, sitemap, and crawl-delay directives. Useful when launching a site, blocking staging paths, or preparing SEO crawl rules.',
    steps: ['Enter user-agent and path rules.', 'Add sitemap and crawl-delay if needed.', 'Copy or download robots.txt.'],
    useCases: ['Block staging or admin paths', 'Point crawlers to your sitemap', 'Prepare launch-ready crawl directives'],
    faqs: [
      { q: 'Does robots.txt enforce access control?', a: 'No. It is a crawler instruction file, not a security boundary. Private content needs authentication.' },
      { q: 'Where should the file live?', a: 'Place robots.txt at the site root, for example https://example.com/robots.txt.' },
      commonFaqPrivacy,
    ],
    related: ['utm-builder', 'http-status', 'slug-generator'],
  },
  {
    id: 'meta-tags',
    name: 'Meta Tag Generator',
    description: 'Generate SEO, Open Graph, and Twitter card meta tags.',
    slug: 'meta-tags',
    categoryId: 'web',
    status: 'active',
    keywords: ['meta tag generator', 'Open Graph generator', 'Twitter card tags', 'SEO metadata'],
    longDescription:
      'Create copy-ready HTML meta tags for search engines, Open Graph previews, and Twitter cards. Enter title, description, canonical URL, image URL, and robots preferences to generate a clean head snippet.',
    steps: ['Enter page metadata.', 'Choose robots and card options.', 'Copy the generated HTML tags into your page head.'],
    useCases: ['Prepare metadata for a landing page', 'Create social preview tags for a blog post', 'Generate robots directives for one page'],
    faqs: [
      { q: 'Does this validate social previews?', a: 'No. It generates the tags. Use platform debuggers after publishing to verify crawled previews.' },
      { q: 'What title length is best?', a: 'Around 50 to 60 characters is a common target for search results, though display varies by query and device.' },
      commonFaqPrivacy,
    ],
    related: ['utm-builder', 'robots-generator', 'slug-generator'],
  },
  {
    id: 'sitemap-generator',
    name: 'Sitemap XML Generator',
    description: 'Generate sitemap.xml from a list of URLs.',
    slug: 'sitemap-generator',
    categoryId: 'web',
    status: 'active',
    keywords: ['sitemap generator', 'sitemap.xml', 'XML sitemap', 'SEO sitemap'],
    longDescription:
      'Generate a valid sitemap.xml document from one URL per line. Optionally include lastmod, changefreq, and priority fields, then copy or download the finished XML.',
    steps: ['Paste page URLs, one per line.', 'Choose sitemap metadata options.', 'Copy or download sitemap.xml.'],
    useCases: ['Prepare a small site sitemap', 'Generate XML for static pages', 'Create a quick sitemap for launch checks'],
    faqs: [
      { q: 'How many URLs can a sitemap contain?', a: 'Search engines commonly support up to 50,000 URLs per sitemap file, but this browser tool is intended for smaller manual lists.' },
      { q: 'Should every URL have lastmod?', a: 'Only include lastmod when you can provide a reliable modification date.' },
      commonFaqPrivacy,
    ],
    related: ['robots-generator', 'meta-tags', 'slug-generator'],
  },
];

export function getToolsByCategory(categoryId: string) {
  return tools.filter(tool => tool.categoryId === categoryId && tool.status === 'active');
}

export function getAllActiveTools() {
  return tools.filter(tool => tool.status === 'active');
}

export function getCategoryById(id: string) {
  return categories.find(cat => cat.id === id);
}

export function getToolBySlug(categoryId: string, slug: string) {
  return tools.find(tool => tool.categoryId === categoryId && tool.slug === slug);
}

export function getToolById(id: string) {
  return tools.find(tool => tool.id === id);
}

export function getRelatedTools(toolId: string, limit = 3) {
  const tool = getToolById(toolId);
  if (!tool) return [];
  const explicit = (tool.related || [])
    .map((id) => getToolById(id))
    .filter((t): t is Tool => Boolean(t && t.status === 'active' && t.id !== toolId));
  if (explicit.length >= limit) return explicit.slice(0, limit);
  // Fall back: fill remaining slots with same-category siblings
  const siblings = getToolsByCategory(tool.categoryId).filter(
    (t) => t.id !== toolId && !explicit.find((e) => e.id === t.id),
  );
  return [...explicit, ...siblings].slice(0, limit);
}
