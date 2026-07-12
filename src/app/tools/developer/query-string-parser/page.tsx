import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';
export const metadata = createToolMetadata('developer', 'query-string-parser');
export default function Page() { return <ToolPageWrapper categoryId="developer" slug="query-string-parser"><Client /></ToolPageWrapper>; }
