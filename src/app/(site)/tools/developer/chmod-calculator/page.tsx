import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'chmod-calculator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="chmod-calculator">
            <Client />
        </ToolPageWrapper>
    );
}
