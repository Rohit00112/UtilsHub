import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'css-unit-converter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="css-unit-converter">
            <Client />
        </ToolPageWrapper>
    );
}
