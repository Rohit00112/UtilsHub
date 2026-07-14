import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('security', 'hmac-generator');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="security" slug="hmac-generator">
            <Client />
        </ToolPageWrapper>
    );
}
