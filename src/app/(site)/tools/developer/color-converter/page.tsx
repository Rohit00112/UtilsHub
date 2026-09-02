import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'color-converter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="color-converter">
            <Client />
        </ToolPageWrapper>
    );
}
