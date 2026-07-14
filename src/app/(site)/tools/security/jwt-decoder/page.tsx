import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('security', 'jwt-decoder');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="security" slug="jwt-decoder">
            <Client />
        </ToolPageWrapper>
    );
}
