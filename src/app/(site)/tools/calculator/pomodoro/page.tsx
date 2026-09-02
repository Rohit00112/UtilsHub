import { createToolMetadata } from '@/lib/seo';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import Client from './Client';

export const metadata = createToolMetadata('calculator', 'pomodoro');

export default function Page() {
    return (
        <ToolPageWrapper categoryId="calculator" slug="pomodoro">
            <Client />
        </ToolPageWrapper>
    );
}
