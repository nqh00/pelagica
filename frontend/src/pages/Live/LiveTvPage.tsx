import Page from '../Page';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid2x2, ListTree } from 'lucide-react';
import LiveTvGuide from './LiveTvGuide';
import LiveTvChannels from './LiveTvChannels';

const LivetvPage = () => {
    const { t } = useTranslation(['live', 'common']);

    return (
        <Page title={t('live:title')} requiresAuth className="flex-1">
            <Tabs defaultValue="channels">
                <TabsList>
                    <TabsTrigger value="channels">
                        <Grid2x2 className="h-4 w-4" />
                        {t('live:tab_channels')}
                    </TabsTrigger>
                    <TabsTrigger value="guide">
                        <ListTree className="h-4 w-4" />
                        {t('live:tab_guide')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="channels">
                    <LiveTvChannels />
                </TabsContent>

                <TabsContent value="guide">
                    <LiveTvGuide />
                </TabsContent>
            </Tabs>
        </Page>
    );
};

export default LivetvPage;
