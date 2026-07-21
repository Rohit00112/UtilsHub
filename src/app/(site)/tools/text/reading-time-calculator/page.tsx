import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('text', 'reading-time-calculator');

export default function Page() {
  return (
    <ToolPageWrapper categoryId="text" slug="reading-time-calculator">
      <Client />
    </ToolPageWrapper>
  );
}
