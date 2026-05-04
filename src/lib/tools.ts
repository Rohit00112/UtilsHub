export interface Tool {
  id: string;
  name: string;
  description: string;
  slug: string; // The URL path under /tools/[category]/[slug]
  categoryId: string;
  status: 'active' | 'planned';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 'pdf',
    name: 'PDF Tools',
    icon: '📄',
    description: 'Merge, split, compress, and compare PDF files.',
  },
  {
    id: 'text',
    name: 'Text Tools',
    icon: '✍️',
    description: 'Format, transform, and analyze text data.',
  },
  {
    id: 'image',
    name: 'Image Tools',
    icon: '🎨',
    description: 'Convert, resize, and edit images in your browser.',
  },
  {
    id: 'security',
    name: 'Security Tools',
    icon: '🔐',
    description: 'Encryption, hashing, and password utilities.',
  },
  {
    id: 'calculator',
    name: 'Calculators',
    icon: '🧮',
    description: 'Quick financial and mathematical calculations.',
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    icon: '💻',
    description: 'Formatters, generators, and testers for engineers.',
  },
  {
    id: 'special',
    name: 'Special Tools',
    icon: '💡',
    description: 'Unique utilities and niche file processors.',
  },
];

export const tools: Tool[] = [
  // PDF
  { id: 'pdf-compare', name: 'PDF Compare', description: 'Compare two PDF files for differences.', slug: 'compare', categoryId: 'pdf', status: 'active' },
  
  // Text
  { id: 'case-converter', name: 'Case Converter', description: 'Convert text between uppercase, lowercase, and more.', slug: 'case-converter', categoryId: 'text', status: 'active' },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and sentences.', slug: 'word-counter', categoryId: 'text', status: 'active' },
  { id: 'url-encoder', name: 'URL Encoder', description: 'Encode or decode URLs safely.', slug: 'url-encoder', categoryId: 'text', status: 'active' },
  { id: 'base64', name: 'Base64 Tool', description: 'Encode or decode text to Base64.', slug: 'base64', categoryId: 'text', status: 'active' },
  { id: 'diff-checker', name: 'Text Diff Checker', description: 'Compare two text blocks side-by-side.', slug: 'diff-checker', categoryId: 'text', status: 'active' },
  
  // Image
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Create favicons from any image.', slug: 'favicon-generator', categoryId: 'image', status: 'active' },
  { id: 'image-merger', name: 'Image Merger', description: 'Merge multiple images into one.', slug: 'merger', categoryId: 'image', status: 'active' },
  
  // Security
  { id: 'password-generator', name: 'Password Generator', description: 'Generate strong, secure passwords.', slug: 'password-generator', categoryId: 'security', status: 'active' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256 hashes.', slug: 'hash-generator', categoryId: 'security', status: 'active' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens.', slug: 'jwt-decoder', categoryId: 'security', status: 'active' },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs.', slug: 'qr-generator', categoryId: 'security', status: 'active' },
  
  // Calculator
  { id: 'emi-calculator', name: 'EMI Calculator', description: 'Calculate monthly loan installments.', slug: 'emi', categoryId: 'calculator', status: 'active' },
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate your Body Mass Index.', slug: 'bmi', categoryId: 'calculator', status: 'active' },
  { id: 'age-calculator', name: 'Age Calculator', description: 'Calculate your age in years, months, and days.', slug: 'age', categoryId: 'calculator', status: 'active' },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between common units of measure.', slug: 'unit-converter', categoryId: 'calculator', status: 'active' },
  
  // Developer
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Prettify and validate JSON data.', slug: 'json-formatter', categoryId: 'developer', status: 'active' },
  { id: 'xml-formatter', name: 'XML Formatter', description: 'Prettify and format XML files.', slug: 'xml-formatter', categoryId: 'developer', status: 'active' },
  { id: 'yaml-json', name: 'YAML ↔ JSON', description: 'Convert between YAML and JSON formats.', slug: 'yaml-json', categoryId: 'developer', status: 'active' },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions in real-time.', slug: 'regex-tester', categoryId: 'developer', status: 'active' },
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate random UUIDs (v4).', slug: 'uuid-generator', categoryId: 'developer', status: 'active' },
  { id: 'color-palette', name: 'Color Palette', description: 'Generate and explore color schemes.', slug: 'color-palette', categoryId: 'developer', status: 'active' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum', description: 'Generate placeholder text.', slug: 'lorem-ipsum', categoryId: 'developer', status: 'active' },
  { id: 'markdown-editor', name: 'Markdown Editor', description: 'Live preview Markdown editor.', slug: 'markdown-editor', categoryId: 'developer', status: 'active' },
  
  // Special
  { id: 'remove-duplicates', name: 'Remove Duplicates', description: 'Remove duplicate lines from text.', slug: 'remove-duplicates', categoryId: 'special', status: 'active' },
  { id: 'text-diff-special', name: 'Text Diff', description: 'Advanced text comparison utility.', slug: 'text-diff', categoryId: 'special', status: 'active' },
  { id: 'pdf-compare-special', name: 'PDF Compare', description: 'Professional PDF comparison tool.', slug: 'pdf-compare', categoryId: 'special', status: 'active' },
  { id: 'image-merger-special', name: 'Image Merger', description: 'Combine multiple images vertically or horizontally.', slug: 'image-merger', categoryId: 'special', status: 'active' },
  { id: 'favicon-creator-special', name: 'Favicon Creator', description: 'Premium favicon design tool.', slug: 'favicon-creator', categoryId: 'special', status: 'active' },
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
