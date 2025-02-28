import {
    setupLegacySettingsAtNonBackground,
    type KVStorageBackend,
    MaskMessages,
    setupMaskKVStorageBackend,
} from '@masknet/shared-base'
import { TelemetryID } from '@masknet/web3-telemetry'
import Services from './extension/service.js'
import { contentFetch } from './utils/fetcher.js'

Services.Helper.getTelemetryID().then((id) => (TelemetryID.value = id))
MaskMessages.events.telemetryIDReset.on((id) => (TelemetryID.value = id))

const memory: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(...args) {
        return Services.Settings.__kv_storage_read__('memory', ...args)
    },
    async setValue(...args) {
        await Services.Settings.__kv_storage_write__('memory', ...args)
    },
}
const indexedDB: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(...args) {
        return Services.Settings.__kv_storage_read__('indexedDB', ...args)
    },
    async setValue(...args) {
        await Services.Settings.__kv_storage_write__('indexedDB', ...args)
    },
}
setupMaskKVStorageBackend(indexedDB, memory)
setupLegacySettingsAtNonBackground(Services.Settings.getLegacySettingsInitialValue)

Reflect.set(globalThis, 'fetch', contentFetch)
