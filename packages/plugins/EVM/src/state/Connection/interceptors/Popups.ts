import { isUndefined, omitBy } from 'lodash-es'
import { ErrorEditor, Middleware, ConnectionContext, TransactionOptions } from '@masknet/web3-shared-evm'
import { ExtensionSite, getSiteType, isEnhanceableSiteType } from '@masknet/shared-base'
import { SharedContextSettings } from '../../../settings/index.js'

export class Popups implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        // Draw the Popups up and wait for user confirmation before publishing risky requests on the network
        if (context.risky && context.writeable) {
            const options = omitBy<TransactionOptions>(
                {
                    owner: context.owner,
                    identifier: context.identifier?.toText(),
                    popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                    paymentToken: context.paymentToken,
                },
                isUndefined,
            )
            const response = await SharedContextSettings.value.send(context.request, options)
            const editor = ErrorEditor.from(null, response)

            if (editor.presence) {
                context.abort(editor.error)
            } else {
                context.write(response.result)
            }
        }
        await next()
    }
}
