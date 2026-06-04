import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'number-base-converter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="number-base-converter">
            <Client />
        </ToolPageWrapper>
    );
}
