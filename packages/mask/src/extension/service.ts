// Notice, this module itself is not HMR ready.
// If you change this file to add a new service, you need to reload.
// This file should not rely on any other in-project files unless it is HMR ready.
import {
    AsyncCall,
    AsyncGeneratorCall,
    type AsyncCallOptions,
    type CallbackBasedChannel,
    type EventBasedChannel,
    type AsyncVersionOf,
    type AsyncGeneratorVersionOf,
} from 'async-call-rpc/full'
import { WebExtensionMessage, MessageTarget, assertNotEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { serializer } from '@masknet/shared-base'
import type {
    BackupService,
    CryptoService,
    GeneratorServices as GeneratorServicesType,
    HelperService,
    IdentityService,
    SettingsService,
    SiteAdaptorService,
    ThirdPartyPluginService,
    Services as ServicesType,
} from '../../background/services/types.js'
assertNotEnvironment(Environment.ManifestBackground)

const message = new WebExtensionMessage<Record<string, any>>({ domain: '$' })
const log: AsyncCallOptions['log'] = {
    type: 'pretty',
    requestReplay: process.env.NODE_ENV === 'development',
    sendLocalStack: process.env.NODE_ENV === 'development',
}

export const Services: ServicesType = {
    Crypto: add<CryptoService>('Crypto'),
    Identity: add<IdentityService>('Identity'),
    Backup: add<BackupService>('Backup'),
    Helper: add<HelperService>('Helper'),
    SiteAdaptor: add<SiteAdaptorService>('SiteAdaptor'),
    SocialNetwork: add<SiteAdaptorService>('SiteAdaptor'),
    Settings: add<SettingsService>('Settings'),
    ThirdPartyPlugin: add<ThirdPartyPluginService>('ThirdPartyPlugin'),
}
export default Services
export const GeneratorServices: AsyncGeneratorVersionOf<GeneratorServicesType> = add('GeneratorServices', true) as any

/**
 * Helper to add a new service to Services.* / GeneratorServices.* namespace.
 * @param key Name of the service. Used for better debugging.
 * @param generator Is the service is a generator?
 */
function add<T extends object>(key: string, generator = false): AsyncVersionOf<T> {
    const channel: EventBasedChannel | CallbackBasedChannel = message.events[key].bind(MessageTarget.Broadcast)

    const RPC = (generator ? AsyncGeneratorCall : AsyncCall) as any as typeof AsyncCall
    const service = RPC<T>(null, {
        key,
        serializer,
        log,
        channel,
        strict: false,
        thenable: false,
    })
    Reflect.set(globalThis, key + 'Service', service)
    return service
}
