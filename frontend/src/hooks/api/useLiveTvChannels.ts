import { getApi } from '@/api/getApi';
import { useQuery } from '@tanstack/react-query';
import { getLiveTvApi } from '@jellyfin/sdk/lib/utils/api/live-tv-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getRetryConfig } from '@/utils/authErrorHandler';
import { getUserId } from '@/utils/localstorageCredentials';

export type UseLiveTvChannelsOptions = {
    limit?: number;
    startIndex?: number;
};

export interface LiveTvChannelsResponse {
    items: Array<BaseItemDto>;
    totalCount: number;
}

export function useLiveTvChannels(
    options?: UseLiveTvChannelsOptions
): ReturnType<typeof useQuery<LiveTvChannelsResponse>> {
    return useQuery<LiveTvChannelsResponse>({
        queryKey: ['liveTvChannels', options?.startIndex, options?.limit],
        queryFn: async (): Promise<LiveTvChannelsResponse> => {
            const api = getApi();
            const liveTvApi = getLiveTvApi(api);
            const response = await liveTvApi.getLiveTvChannels({
                userId: getUserId() || undefined,
                startIndex: options?.startIndex ?? 0,
                limit: options?.limit ?? 100,
                enableImages: true,
                enableUserData: true,
                addCurrentProgram: true,
                sortBy: ['Name'],
            });
            return {
                items: response.data.Items || [],
                totalCount: response.data.TotalRecordCount || 0,
            };
        },
        ...getRetryConfig(),
    });
}
