import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('pdf', 'splitter');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="pdf" slug="splitter">
            <Client />
        </ToolPageWrapper>
    );
}
