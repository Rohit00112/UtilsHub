import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('calculator', 'age');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="calculator" slug="age">
            <Client />
        </ToolPageWrapper>
    );
}
