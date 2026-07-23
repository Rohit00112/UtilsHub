export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. '2026-07-14'. */
  date: string;
  /** ISO date of the latest substantive review. */
  updatedDate?: string;
  keywords?: string[];
  /** IDs of tools referenced by this post, rendered as a related-tools rail. */
  relatedTools?: string[];
  /** Markdown body. */
  body: string;
  /** Single primary category, e.g. 'PDF', 'Developer', 'Security', 'Image', 'Text'. */
  category: string;
  /** Freeform tags used for client-side search filtering. */
  tags?: string[];
}

// Practical guides that answer a specific question and link to the relevant tools.
export const posts: BlogPost[] = [
  {
    slug: 'how-to-merge-pdf-files-free',
    title: 'How to Merge PDF Files for Free (Without Uploading Them)',
    description:
      'Combine PDF files in your browser without installing software or uploading documents to a processing server.',
    date: '2026-07-14',
    updatedDate: '2026-07-23',
    category: 'PDF',
    tags: ['pdf', 'merge'],
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'free pdf merger'],
    relatedTools: ['pdf-merger', 'pdf-splitter', 'pdf-compressor'],
    body: `You can combine PDFs **entirely in your browser**, so contracts, invoices, and statements stay on your device. The process takes four steps and does not require an account.

## Why browser-based merging is safer

When a website processes your PDF on its own servers, the document is transmitted and may be stored temporarily on a machine you do not control. For signed agreements, financial records, or medical documents, local processing removes that transfer. A browser-based tool uses your device's processing power, so the file stays local.

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
      'A JSON formatter improves readability. A validator checks syntax or a schema. Compare the two and choose the right tool.',
    date: '2026-07-14',
    updatedDate: '2026-07-23',
    category: 'Developer',
    tags: ['json', 'validation'],
    keywords: ['json formatter', 'json validator', 'format json', 'validate json'],
    relatedTools: ['json-formatter', 'json-schema-validator', 'json-diff'],
    body: `Formatting and validation solve different JSON problems. A formatter helps you read a payload; a validator checks whether the data follows required rules.

## Formatting

A [JSON Formatter](/tools/developer/json-formatter) takes minified or messy JSON and pretty-prints it with consistent indentation, so you can read a large payload from an API response or log line. It also flags syntax errors like a trailing comma.

## Validation

A [JSON Schema Validator](/tools/developer/json-schema-validator) goes further: it checks your JSON against a schema that defines required fields, types, and constraints. Use it when you need to guarantee a payload matches an API contract before sending it.

## Comparing two payloads

When you need to see what changed between two objects, a [JSON Diff](/tools/developer/json-diff) highlights added, removed, and changed keys line by line.

All three run entirely in your browser, so the payloads, tokens, and configuration you paste never touch a processing server.

## Reference

- [JSON Schema specification](https://json-schema.org/specification)`,
  },
  {
    slug: 'convert-images-to-webp',
    title: 'How to Convert Images to WebP',
    description:
      'Convert JPG and PNG images to WebP in your browser. Learn when WebP reduces file size and how to avoid serving oversized images.',
    date: '2026-07-14',
    updatedDate: '2026-07-23',
    category: 'Image',
    tags: ['webp', 'image', 'optimization'],
    keywords: ['convert to webp', 'webp converter', 'compress images', 'image optimization'],
    relatedTools: ['webp-converter', 'image-resizer', 'favicon-generator'],
    body: `Converting a large JPG or PNG to WebP can reduce its transfer size without changing its display dimensions. That makes WebP useful when images account for a large share of a page's downloaded bytes.

## Why WebP

WebP supports lossy and lossless compression as well as transparency. Google's WebP documentation reports that lossy WebP images are **25–34% smaller than comparable JPEG images**, while lossless WebP images are **26% smaller than comparable PNG images**. Your result will depend on the source image and quality setting.

## Convert without uploading

1. Open the [WebP Converter](/tools/image/webp-converter).
2. Add your JPG or PNG images.
3. Choose a quality level.
4. Download the WebP output.

Because the conversion uses your browser's Canvas API, your images are not uploaded to a FreeWebTools processing server. That is useful for unreleased designs or personal photos.

## Resize first for even smaller files

If your image is larger than it needs to be, [resize it](/tools/image/resizer) before converting. Serving a 4000px image scaled down to 800px in CSS wastes bandwidth.

## Reference

- [Google WebP documentation](https://developers.google.com/speed/webp)`,
  },
  {
    slug: 'sha256-vs-md5',
    title: 'SHA-256 vs MD5: Which Hashing Algorithm Should You Use?',
    description:
      'MD5 is fast but cryptographically broken. SHA-256 is the modern standard. Learn the difference, when each applies, and how to generate both in your browser.',
    date: '2026-07-15',
    updatedDate: '2026-07-23',
    category: 'Security',
    tags: ['hashing', 'security'],
    keywords: ['sha256 vs md5', 'md5 vs sha256', 'hash algorithm comparison', 'md5 generator', 'sha256 generator', 'cryptographic hash'],
    relatedTools: ['hash-generator', 'hmac-generator', 'password-generator'],
    body: `MD5 and SHA-256 both turn an input into a fixed-length digest, but they do not provide the same security. Use SHA-256 for security-sensitive work. Reserve MD5 for legacy, non-adversarial checksums.

## What is a hash function?

A hash function maps any input, such as a string or file, to a fixed-length digest. The same input always produces the same output, and a small input change should produce a substantially different digest. This behavior makes hashes useful for integrity checks and comparisons.

## MD5: fast, but broken for security

MD5 was published in 1992 and produces a 128-bit (32 hex character) digest. It was widely adopted for checksums and password storage, but researchers discovered serious weaknesses:

- **Collision attacks**: Two different inputs can produce the same MD5 digest. This was demonstrated in practice in 2004 and is now trivially achievable.
- **Pre-image attacks**: While harder, the small digest size (128 bits) makes MD5 weaker than modern standards.
- **Speed as a liability**: MD5 is fast, which is useful for checksums but unsuitable for password hashing because attackers can test guesses quickly.

**When MD5 is still acceptable:**
- Non-security file checksums where collision resistance does not matter (e.g., detecting accidental corruption, not tampering)
- Legacy systems you cannot migrate yet
- Cache-key generation where speed matters and security does not

**When MD5 is not acceptable:**
- Password storage (use bcrypt, scrypt, or Argon2 instead)
- Digital signatures
- Any context where an attacker might benefit from a collision

## SHA-256: the modern standard

SHA-256 is part of the SHA-2 family, published by NIST in 2001, and produces a 256-bit (64 hex character) digest. It remains unbroken as of 2026:

- **No known collision attacks** for the full SHA-256 algorithm
- **Larger digest** (256 bits vs. 128 bits) means vastly more resistant to brute force
- **Widely used** in TLS certificates, Bitcoin, code signing, and HMAC signatures
- **Slower than MD5** for checksums, but fast enough for most uses

SHA-256 is the right default for anything security-sensitive. Its sibling SHA-512 offers a larger digest (512 bits) and can be faster on 64-bit hardware.

## SHA-1: the one in between

SHA-1 (160 bits) is stronger than MD5 but also broken for cryptographic purposes. A practical collision was demonstrated in 2017. Avoid it for new designs and migrate away from it in existing ones.

## Quick comparison

| | MD5 | SHA-1 | SHA-256 | SHA-512 |
|---|---|---|---|---|
| Digest size | 128 bit | 160 bit | 256 bit | 512 bit |
| Collisions found | Yes | Yes | No | No |
| Suitable for new security use | No | No | Yes | Yes |
| Speed (relative) | Fastest | Fast | Moderate | Fast on 64-bit |

## Generating hashes in your browser

The [Hash Generator](/tools/security/hash-generator) computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 from any text input. The SHA-family hashes use the browser's Web Crypto API (the same cryptographic primitive TLS relies on), while MD5 is provided for legacy compatibility. Nothing you enter is uploaded.

For keyed authentication codes, where you need to prove integrity and origin, use the [HMAC Generator](/tools/security/hmac-generator) with SHA-256 or SHA-512.

## Which should you use?

Use SHA-256 or a stronger suitable algorithm for security-sensitive work. Use MD5 only for non-security checksums in legacy contexts where collision resistance is not required.

## References

- [RFC 6151: Updated Security Considerations for MD5](https://www.rfc-editor.org/rfc/rfc6151)
- [NIST Secure Hash Standard, FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)`,
  },
  {
    slug: 'base64-encoding-explained',
    title: 'Base64 Encoding Explained: How It Works and When to Use It',
    description:
      'Base64 turns binary data into printable ASCII text. Learn why it exists, how to encode and decode it, and where you encounter it every day in web development.',
    date: '2026-07-15',
    updatedDate: '2026-07-23',
    category: 'Developer',
    tags: ['base64', 'encoding'],
    keywords: ['base64 encoding explained', 'what is base64', 'base64 encode decode', 'base64 tutorial', 'base64url', 'base64 javascript'],
    relatedTools: ['base64', 'url-encoder', 'jwt-decoder'],
    body: `Base64 represents binary data with printable ASCII characters. You will see it in JWTs, data URIs, HTTP authentication headers, and email attachments. It solves a compatibility problem; it does not provide secrecy.

## What problem does Base64 solve?

Many protocols and formats were designed to handle **text only**, including email, URLs, JSON, XML, and HTTP headers. Much of the data we transmit is **binary**, including images, compiled code, cryptographic keys, and PDF files.

Base64 solves this by encoding binary data as a sequence of 64 printable ASCII characters. The resulting string can safely pass through any text-based system without corruption.

## How Base64 encoding works

Base64 takes your binary input three bytes at a time (24 bits) and splits it into four 6-bit groups. Each 6-bit group is then mapped to one of 64 characters from this alphabet:

\`\`\`
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
\`\`\`

If the input length is not a multiple of three, padding characters (\`=\`) are added to make the output length a multiple of four.

**Example:**

Input: \`Hi\` (2 bytes: \`0x48 0x69\`)

Binary: \`01001000 01101001\` → padded to 3 bytes with a zero byte → \`010010 000110 100100 000000\`

Mapped: \`S G k =\` → \`SGk=\`

## Base64 is encoding, not encryption

**Base64 is not encryption.** It provides no security or confidentiality. Anyone can decode it. Its purpose is format compatibility: making binary data safe to put in a text field.

Never use Base64 to "hide" sensitive data.

## Base64URL: the URL-safe variant

Standard Base64 uses \`+\` and \`/\`, which have special meaning in URLs. **Base64URL** replaces them with \`-\` and \`_\`, making the output safe to use directly in a URL path or query string without percent-encoding.

You see Base64URL in:
- **JWT tokens** (all three parts are Base64URL-encoded)
- **PKCE code challenges** in OAuth 2.0
- **URL-safe identifiers**

## Where you encounter Base64 every day

| Context | What is Base64-encoded |
|---|---|
| JWT tokens | Header and payload (Base64URL) |
| data: URIs | The image or font binary |
| HTTP Basic Auth | \`username:password\` |
| MIME email attachments | The file binary |
| Inline SVG in CSS | The SVG source |
| Web Crypto API output | Keys and signatures |

## Encoding and decoding in JavaScript

\`\`\`javascript
// Encode (browser)
btoa('Hello, World!')      // "SGVsbG8sIFdvcmxkIQ=="

// Decode (browser)
atob('SGVsbG8sIFdvcmxkIQ==')  // "Hello, World!"

// For non-ASCII / Unicode, go through UTF-8 first
const encoded = btoa(unescape(encodeURIComponent('café')));
const decoded = decodeURIComponent(escape(atob(encoded)));
\`\`\`

For Base64URL in modern environments:

\`\`\`javascript
// Node.js 16+ / modern browsers
Buffer.from('Hello').toString('base64url');  // "SGVsbG8"
\`\`\`

## Encoding overhead

Base64 expands data by approximately **33%** — every 3 bytes of input becomes 4 characters of output. For very large files, this overhead is worth considering.

## Try it in your browser

The [Base64 Encoder / Decoder](/tools/text/base64) handles both standard Base64 and Base64URL, supports full Unicode through UTF-8, and runs entirely in your browser, so tokens and secrets you paste are not uploaded to a FreeWebTools processing server.

If you are inspecting a JWT token, the [JWT Decoder](/tools/security/jwt-decoder) decodes all three parts at once and formats the header and payload as readable JSON.

## Reference

- [RFC 4648: Base-N Encodings](https://www.rfc-editor.org/rfc/rfc4648)`,
  },
  {
    slug: 'how-to-minify-css',
    title: 'How to Minify CSS: A Practical Guide',
    description:
      'CSS minification removes whitespace and comments to shrink stylesheet file size, speeding up page loads. Learn what it does, how much it saves, and how to automate it.',
    date: '2026-07-15',
    updatedDate: '2026-07-23',
    category: 'Developer',
    tags: ['css', 'minify', 'performance'],
    keywords: ['how to minify css', 'css minification', 'minify css online', 'css optimizer', 'reduce css file size', 'css performance'],
    relatedTools: ['css-minifier', 'css-unit-converter', 'json-formatter'],
    body: `CSS minification removes bytes that a browser does not need. It is a small, repeatable production optimization that most build tools can apply automatically.

## What is CSS minification?

Minification removes everything from a CSS file that the browser does not need to render it:

- **Whitespace**: spaces, tabs, and newlines between rules and declarations
- **Comments**: \`/* ... */\` blocks
- **Redundant semicolons**: the last semicolon before a closing \`}\` is optional in CSS
- **Unnecessary whitespace in values**: \`margin: 0px 0px 0px 0px\` can stay, but spaces around \`:\`, \`;\`, and \`{\` can go

For basic whitespace and comment removal, the rendered result should stay the same while the file size changes.

## How much can it save?

Savings depend on the source. Measure the original and minified byte counts instead of assuming a fixed percentage. Files with comments and generous spacing usually shrink more; already-minified files may barely change. CSS can delay rendering, so reducing its transfer and parse cost is useful, but the effect depends on compression, caching, and the rest of the page.

## What minification does not do

Basic minification is safe and lossless. It does **not**:

- Change property values or merge shorthand properties
- Remove duplicate rules (a separate optimization called "de-duplication")
- Vendor-prefix properties or apply autoprefixer transforms
- Tree-shake unused rules (that requires PurgeCSS or a similar tool)

If you want those optimizations, combine minification with a build step that includes PostCSS, PurgeCSS, or Lightning CSS.

## How to minify CSS

### Option 1: Quick online tool

Paste your stylesheet into the [CSS Minifier](/tools/developer/css-minifier) and copy the compressed output. It runs entirely in your browser, so your proprietary styles are not uploaded to a FreeWebTools processing server.

### Option 2: Build pipeline (recommended for production)

Add minification to your build step so it happens automatically on every deploy:

**Vite / Rollup**
Vite minifies CSS by default in production builds using esbuild. No configuration needed.

**webpack with css-minimizer-webpack-plugin**
\`\`\`bash
npm install css-minimizer-webpack-plugin --save-dev
\`\`\`
\`\`\`javascript
// webpack.config.js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
};
\`\`\`

**PostCSS with cssnano**
\`\`\`bash
npm install cssnano postcss-cli --save-dev
\`\`\`
\`\`\`json
// postcss.config.json
{ "plugins": { "cssnano": {} } }
\`\`\`

**Next.js**
Next.js minifies CSS automatically in \`next build\` using SWC. No extra configuration needed.

## Should you minify in development?

No. Keep your original formatted CSS in development for readability and debuggability. Minify only in production builds. Most bundlers handle this automatically with \`NODE_ENV=production\`.

## Checking the result

After minifying, verify in DevTools that:
1. The minified file loads without errors
2. Styles render identically to the original
3. The file size is smaller (check the Network tab)

The [CSS Minifier](/tools/developer/css-minifier) also shows you the exact byte reduction and percentage saved so you can confirm the optimization is worth it before committing to a build change.`,
  },
  {
    slug: 'url-encoding-explained',
    title: 'URL Encoding Explained: encodeURIComponent, encodeURI, and Percent-Encoding',
    description:
      'URL encoding replaces unsafe characters with % sequences. Learn when to use encodeURIComponent vs encodeURI, how percent-encoding works, and common pitfalls.',
    date: '2026-07-15',
    updatedDate: '2026-07-23',
    category: 'Developer',
    tags: ['url', 'encoding'],
    keywords: ['url encoding explained', 'percent encoding', 'encodeURIComponent vs encodeURI', 'url encode decode', 'url encoding javascript', 'what is url encoding'],
    relatedTools: ['url-encoder', 'base64', 'query-string-parser'],
    body: `Percent-encoding represents characters that cannot be used literally in a particular part of a URL. In JavaScript, the practical choice is usually between \`encodeURIComponent\` for a value and \`encodeURI\` for a complete URL.

## What is percent-encoding?

Percent-encoding replaces an unsafe character with a \`%\` followed by its two-digit hexadecimal code point. For example:

| Character | Encoded |
|---|---|
| space | \`%20\` |
| \`&\` | \`%26\` |
| \`=\` | \`%3D\` |
| \`#\` | \`%23\` |
| \`+\` | \`%2B\` |
| é | \`%C3%A9\` (UTF-8: two bytes) |

Non-ASCII characters are encoded through UTF-8 first, which is why accented characters produce multi-byte sequences.

## Why does it matter?

URLs have a defined syntax: \`scheme://host/path?query#fragment\`. Characters like \`?\`, \`&\`, \`=\`, and \`#\` are **reserved** because they delimit parts of the URL. If your data contains those characters, encode them so they are not interpreted as structure.

**Example:** A search query "cats & dogs" in a URL:

Without encoding: \`/search?q=cats & dogs\` — the \`&\` looks like a second query parameter

With encoding: \`/search?q=cats%20%26%20dogs\` — unambiguously one parameter

## encodeURI vs encodeURIComponent

JavaScript provides two built-in encoding functions, and choosing the wrong one is a common mistake.

### encodeURI

Encodes a **complete URL**. It leaves reserved characters (those with structural meaning in a URL) unencoded because they are expected to be present:

Characters **not** encoded by \`encodeURI\`:
\`A-Z a-z 0-9 - _ . ! ~ * ' ( ) ; , / ? : @ & = + $ #\`

\`\`\`javascript
encodeURI('https://example.com/path?q=hello world')
// → 'https://example.com/path?q=hello%20world'
// Note: ? and = are left as-is because they are structural
\`\`\`

### encodeURIComponent

Encodes a **value within a URL** — a query parameter value, a path segment, or any piece of data you are inserting. It escapes reserved characters because they should not be interpreted structurally inside a value:

Characters **not** encoded by \`encodeURIComponent\`:
\`A-Z a-z 0-9 - _ . ! ~ * ' ( )\`

\`\`\`javascript
encodeURIComponent('cats & dogs')
// → 'cats%20%26%20dogs'
// Note: & is encoded because it has structural meaning in query strings

// Building a query string safely:
const q = encodeURIComponent(userInput);
const url = \`/search?q=\${q}\`;
\`\`\`

Use \`encodeURIComponent\` for a value you embed in a URL. Use \`encodeURI\` when you have a complete URL and need to encode characters such as spaces without encoding its structural separators.

## The \`+\` vs \`%20\` confusion

In HTML form submissions (\`application/x-www-form-urlencoded\`), spaces are encoded as \`+\` rather than \`%20\`. Some server frameworks decode \`+\` back to a space in query strings. In URL path segments, \`+\` must be \`%20\`.

When in doubt, use \`%20\`; it is unambiguous.

## Decoding in JavaScript

\`\`\`javascript
decodeURIComponent('cats%20%26%20dogs')  // 'cats & dogs'
decodeURI('https://example.com/path%20with%20spaces')
// 'https://example.com/path with spaces'
\`\`\`

## Common pitfalls

1. **Double-encoding**: Encoding an already-encoded string turns \`%20\` into \`%2520\`. Always decode before re-encoding.
2. **Forgetting non-ASCII**: Characters outside ASCII need UTF-8 encoding first. \`encodeURIComponent\` handles this automatically.
3. **Using \`encodeURI\` for values**: If a user types \`a=b\` into a search field, \`encodeURI\` leaves the \`=\` unencoded, breaking the query string.

## Try it in your browser

The [URL Encoder / Decoder](/tools/text/url-encoder) encodes or decodes any text using \`encodeURIComponent\`, handles full Unicode, and runs entirely in your browser. Nothing you paste is uploaded to a FreeWebTools processing server.

## Reference

- [RFC 3986: Uniform Resource Identifier syntax](https://www.rfc-editor.org/rfc/rfc3986)`,
  },
  {
    slug: 'jwt-tokens-explained',
    title: 'JWT Tokens Explained: Structure, Claims, and How to Debug Them',
    description:
      'A JSON Web Token has three Base64URL-encoded parts. Learn what each part contains, how to read claims like exp and iss, and how to debug 401 errors.',
    date: '2026-07-15',
    updatedDate: '2026-07-23',
    category: 'Security',
    tags: ['jwt', 'auth', 'security'],
    keywords: ['jwt token explained', 'how to decode jwt', 'jwt claims', 'jwt header payload', 'debug jwt', 'json web token guide'],
    relatedTools: ['jwt-decoder', 'base64', 'hash-generator'],
    body: `A JSON Web Token (JWT) contains three dot-separated parts: a header, a claims payload, and a signature. You can decode the header and payload without a secret key, but decoding does not verify that the token is trustworthy.

## What a JWT looks like

A JWT is three Base64URL-encoded strings joined by dots:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

The three parts are:

1. **Header** — algorithm and token type
2. **Payload** — claims about the user or session
3. **Signature** — cryptographic proof of integrity

## The header

The header is a JSON object encoded as Base64URL:

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

\`alg\` tells you the signing algorithm. Common values:
- \`HS256\` — HMAC with SHA-256 (symmetric, shared secret)
- \`RS256\` — RSA with SHA-256 (asymmetric, public/private key)
- \`ES256\` — ECDSA with P-256 (asymmetric, compact)

## The payload: registered claims

The payload contains **claims** — statements about the subject. The JWT specification defines several registered claim names:

| Claim | Name | Meaning |
|---|---|---|
| \`sub\` | Subject | Who the token is about (user ID) |
| \`iss\` | Issuer | Who issued the token (auth server URL) |
| \`aud\` | Audience | Who the token is intended for |
| \`exp\` | Expiration | Unix timestamp after which the token is invalid |
| \`iat\` | Issued At | Unix timestamp when the token was created |
| \`nbf\` | Not Before | Unix timestamp before which the token is not valid |
| \`jti\` | JWT ID | Unique identifier for this token |

Applications can also add custom claims for any additional context (user role, tenant ID, permissions, etc.).

## Reading the exp claim

The \`exp\` (expiration) claim is a Unix timestamp — seconds since January 1, 1970 UTC. A token with \`"exp": 1720000000\` expired at that point in time. To check manually:

\`\`\`javascript
const exp = 1720000000;
const isExpired = Date.now() / 1000 > exp;
console.log(isExpired ? 'Token expired' : 'Token valid');
\`\`\`

## The signature

The signature is computed by the server using the header, payload, and a secret key:

\`\`\`
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
\`\`\`

**A valid signature proves the signed content has not changed.** If anyone modifies the header or payload, verification fails. Verification requires the correct secret or public key and an explicit algorithm policy.

## JWT is encoded, not encrypted

**The payload is readable by anyone who has the token.** Base64URL is an encoding, not encryption. Never put passwords, payment card data, or secrets in a JWT payload.

## Debugging a 401 Unauthorized error

When an API returns 401, decode the JWT your client is sending:

1. Is the token present in the Authorization header? (Check DevTools → Network)
2. Is it expired? Check \`exp\` against the current timestamp.
3. Is the audience (\`aud\`) correct for this API?
4. Is the issuer (\`iss\`) what the server expects?
5. Is the signature algorithm (\`alg\`) supported?

The [JWT Decoder](/tools/security/jwt-decoder) decodes any token instantly, formats the header and payload as readable JSON, and tells you if the token has expired. It runs entirely in your browser so your live tokens are never transmitted.

## JWTs vs sessions

| | JWT | Server session |
|---|---|---|
| Storage | Client (cookie or localStorage) | Server (database or memory) |
| Stateless | Yes | No |
| Revocable | Hard (requires blocklist) | Easy (delete session) |
| Payload visible to holder | Yes | No |
| Good for | APIs, microservices, mobile | Traditional web apps |

JWTs can support stateless validation, which can suit distributed systems and APIs. The tradeoff is that revoking a token before it expires usually requires additional state or short token lifetimes.

## Reference

- [RFC 7519: JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519)`,
  },
];

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Word count of a markdown body (rough — splits on whitespace). */
export function wordCount(body: string): number {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimated reading time in minutes (220 wpm, min 1). */
export function readingTime(post: BlogPost): number {
  return Math.max(1, Math.ceil(wordCount(post.body) / 220));
}

/** Lightweight post shape for cards/search — excludes the heavy markdown body. */
export interface BlogCardData {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags?: string[];
  readingMinutes: number;
}

/** Project a post to card data (computes reading time, drops body). */
export function toCardData(post: BlogPost): BlogCardData {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    tags: post.tags,
    readingMinutes: readingTime(post),
  };
}

/** URL slug for a category name, e.g. 'PDF' -> 'pdf', 'Developer' -> 'developer'. */
export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Resolve a category slug back to its canonical name, or undefined if none match. */
export function categoryFromSlug(slug: string): string | undefined {
  return getAllCategories().find((c) => categorySlug(c.name) === slug)?.name;
}

/** Unique categories with post counts, ordered by count desc then name. */
export function getAllCategories(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
}

/** Posts in a category (by canonical name), newest first. */
export function getPostsByCategory(name: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === name);
}

/** Posts having a tag, newest first. */
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) => p.tags?.includes(tag));
}

/** Posts shown per page in the blog index grid (page 1 also shows a hero above the grid). */
export const BLOG_PER_PAGE = 12;

/**
 * Total number of blog index pages. Page 1 holds the hero + BLOG_PER_PAGE grid posts;
 * each later page holds BLOG_PER_PAGE. `restLength` = total posts minus the hero.
 */
export function blogIndexTotalPages(restLength: number): number {
  return Math.max(1, 1 + Math.ceil(Math.max(0, restLength - BLOG_PER_PAGE) / BLOG_PER_PAGE));
}

/** Slice items for a 1-indexed page. */
export function paginate<T>(
  items: T[],
  page: number,
  perPage = BLOG_PER_PAGE,
): { items: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const clamped = Math.min(Math.max(1, page), totalPages);
  const start = (clamped - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: clamped, totalPages };
}
