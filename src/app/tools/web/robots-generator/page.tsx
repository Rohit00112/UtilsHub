import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('web', 'robots-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="web" slug="robots-generator">
            <Client />
        </ToolPageWrapper>
    );
}
