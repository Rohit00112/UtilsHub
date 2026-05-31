import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('web', 'utm-builder');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="web" slug="utm-builder">
            <Client />
        </ToolPageWrapper>
    );
}
