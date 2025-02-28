import { forwardRef, useState } from 'react'
import { NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { WalletRiskWarning } from './WalletRiskWarning.js'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'

export interface WalletRiskWarningModalOpenProps {
    pluginID: NetworkPluginID
    account: string
}

export interface WalletRiskWarningModalProps {}

export const WalletRiskWarningModal = forwardRef<
    SingletonModalRefCreator<WalletRiskWarningModalOpenProps>,
    WalletRiskWarningModalProps
>((props, ref) => {
    const [account, setAccount] = useState('')
    const [pluginID, setPluginID] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setAccount(props.account)
            setPluginID(props.pluginID)
        },
    })

    if (!open) return null

    return <WalletRiskWarning account={account} pluginID={pluginID} open onClose={() => dispatch?.close()} />
})
