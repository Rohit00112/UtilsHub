import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('developer', 'css-minifier');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="developer" slug="css-minifier">
            <Client />
        </ToolPageWrapper>
    );
}
