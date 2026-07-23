# FreeWebTools

[FreeWebTools](https://freewebtools.app/) is an open-source collection of focused
browser utilities for PDFs, images, text, developers, security, APIs, and
calculations.

## Features

- Free to use without an account or usage quota.
- Most inputs are processed locally with browser APIs.
- Server-rendered tool documentation, guides, metadata, and structured data.
- Responsive light and dark interfaces.
- Consent-gated AdSense and analytics scripts.

API tools connect directly from the browser to the URL selected by the user. The
optional PDF editor uses a configured Collabora/WOPI service; its files are not
browser-local.

## Tool categories

- PDF
- Text
- Image
- Security
- Calculators
- Developer
- API and network
- Web

## Local development

### Prerequisites
- Node.js 18+
- npm (standard package manager)

### Installation

```bash
git clone https://github.com/Rohit00112/UtilsHub.git

cd UtilsHub
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Processing**: Browser APIs, pdf-lib, pdfjs, JSZip, and Web Crypto
- **Deployment**: OpenNext on Cloudflare

## License

MIT

## Contributing

Issues and pull requests are welcome. Technical claims and corrections should
include a primary source or reproducible test when possible.
