import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('web', 'color-contrast-checker');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="web" slug="color-contrast-checker">
            <Client />
        </ToolPageWrapper>
    );
}
