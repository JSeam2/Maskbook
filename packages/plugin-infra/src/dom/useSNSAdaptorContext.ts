import { ValueRefWithReady } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import type { Plugin } from '../types.js'

export const SNSAdaptorContextRef = new ValueRefWithReady<
    Omit<Plugin.SNSAdaptor.SNSAdaptorContext, 'createKVStorage'>
>()

export function useSNSAdaptorContext() {
    return useValueRef(SNSAdaptorContextRef)
}
