import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('image', 'background-remover');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="image" slug="background-remover">
            <Client />
        </ToolPageWrapper>
    );
}
