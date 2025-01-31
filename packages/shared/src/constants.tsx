import type { ReactNode } from 'react'
import { Icons, type GeneratedIcon } from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<EnhanceableSite | string, ReactNode> = {
    [EnhanceableSite.Twitter]: <Icons.TwitterColored />,
    [EnhanceableSite.Facebook]: <Icons.FacebookColored />,
    [EnhanceableSite.Minds]: <Icons.Minds />,
    [EnhanceableSite.Instagram]: <Icons.InstagramColored />,
    [EnhanceableSite.OpenSea]: <Icons.OpenSeaColored />,
    [EnhanceableSite.Mirror]: <Icons.Mirror />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<EnhanceableSite | string, GeneratedIcon | null> = {
    [EnhanceableSite.Twitter]: Icons.TwitterRound,
    [EnhanceableSite.Facebook]: Icons.FacebookRound,
    [EnhanceableSite.Minds]: Icons.MindsRound,
    [EnhanceableSite.Instagram]: Icons.InstagramRoundColored,
    [EnhanceableSite.OpenSea]: Icons.OpenSeaColored,
    [EnhanceableSite.Mirror]: Icons.Mirror,
    [EnhanceableSite.Localhost]: null,
}
