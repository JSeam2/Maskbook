import React, { createContext, type ReactNode, useContext, useState, useMemo, type ProviderProps } from 'react'
import { isUndefined, omitBy } from 'lodash-es'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { compose, type MaskEvents, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useNetworkType } from './useNetworkType.js'
import { useProviderType } from './useProviderType.js'

interface EnvironmentContext<T extends NetworkPluginID = NetworkPluginID> {
    pluginID: T
}

interface NetworkContext<T extends NetworkPluginID = NetworkPluginID> {
    pluginID: T
    setPluginID: (pluginID: T) => void
}

interface ChainContextGetter<T extends NetworkPluginID = NetworkPluginID> {
    account?: string
    chainId?: Web3Helper.Definition[T]['ChainId']
    networkType?: Web3Helper.Definition[T]['NetworkType']
    providerType?: Web3Helper.Definition[T]['ProviderType']
    // If it's controlled, we prefer passed value over state inside
    controlled?: boolean
}

interface ChainContextSetter<T extends NetworkPluginID = NetworkPluginID> {
    setAccount?: (account: string) => void
    setChainId?: (chainId: Web3Helper.Definition[T]['ChainId']) => void
    setNetworkType?: (networkType: Web3Helper.Definition[T]['NetworkType']) => void
    setProviderType?: (providerType: Web3Helper.Definition[T]['ProviderType']) => void
}

const EnvironmentContext = createContext<EnvironmentContext>(null!)
EnvironmentContext.displayName = 'EnvironmentContext'

const NetworkContext = createContext<NetworkContext>(null!)
NetworkContext.displayName = 'NetworkContext'

const ChainContext = createContext<ChainContextGetter & ChainContextSetter>(null!)
ChainContext.displayName = 'ChainContext'

export function EnvironmentContextProvider({ value, children }: ProviderProps<EnvironmentContext>) {
    return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>
}

export function NetworkContextProvider({ value, children }: ProviderProps<NetworkPluginID>) {
    const [pluginID = value, setPluginID] = useState<NetworkPluginID>()
    const context = useMemo(
        () => ({
            pluginID,
            setPluginID,
        }),
        [pluginID],
    )
    return <NetworkContext.Provider value={context}>{children}</NetworkContext.Provider>
}

export function ChainContextProvider({ value, children }: ProviderProps<ChainContextGetter>) {
    const { pluginID } = useNetworkContext()
    const { controlled } = value

    const globalAccount = useAccount(pluginID)
    const globalChainId = useChainId(pluginID)
    const globalNetworkType = useNetworkType(pluginID)
    const globalProviderType = useProviderType(pluginID)
    const [_account, setAccount] = useState<string>()
    const [_chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [_networkType, setNetworkType] = useState<Web3Helper.NetworkTypeAll>()
    const [_providerType, setProviderType] = useState<Web3Helper.ProviderTypeAll>()

    const account = (controlled ? value.account : _account ?? value.account) ?? globalAccount
    const chainId = (controlled ? value.chainId : _chainId ?? value.chainId) ?? globalChainId
    const networkType = (controlled ? value.networkType : _networkType ?? value.networkType) ?? globalNetworkType
    const providerType = (controlled ? value.providerType : _providerType ?? value.providerType) ?? globalProviderType

    const context = useMemo(
        () => ({
            account,
            chainId,
            networkType,
            providerType,
            setAccount,
            setChainId,
            setNetworkType,
            setProviderType,
        }),
        [account, chainId, networkType, providerType],
    )
    return <ChainContext.Provider value={context}>{children}</ChainContext.Provider>
}

export function Web3ContextProvider({
    value,
    children,
}: ProviderProps<
    {
        pluginID: NetworkPluginID
        messages?: WebExtensionMessage<MaskEvents>
    } & ChainContextGetter
>) {
    const { pluginID, ...rest } = value
    return compose(
        (children) => <NetworkContextProvider value={pluginID} children={children} />,
        (children) => <ChainContextProvider value={rest} children={children} />,
        <>{children}</>,
    )
}

export function ActualNetworkContextProvider({ children }: { children: ReactNode | undefined }) {
    const { pluginID } = useContext(EnvironmentContext)
    const value = useMemo(
        () => ({
            pluginID,
            setPluginID: () => {
                throw new Error('Set pluginID is not allowed.')
            },
        }),
        [pluginID],
    )
    return <NetworkContext.Provider value={value} children={children} />
}

export function ActualChainContextProvider({ children }: { children: ReactNode | undefined }) {
    const account = useAccount()
    const chainId = useChainId()
    const networkType = useNetworkType()
    const providerType = useProviderType()
    const value = useMemo(
        () => ({
            account,
            chainId,
            networkType,
            providerType,
        }),
        [account, chainId, networkType, providerType],
    )
    return <ChainContext.Provider value={value} children={children} />
}

export function useEnvironmentContext(overrides?: EnvironmentContext) {
    const context = useContext(EnvironmentContext)
    return {
        ...context,
        ...omitBy(overrides, isUndefined),
    }
}

export function useNetworkContext<T extends NetworkPluginID = NetworkPluginID>(overrides?: T) {
    const context = useContext(NetworkContext)
    return {
        ...context,
        pluginID: (overrides ?? context.pluginID) as T,
    }
}

export function useChainContext<T extends NetworkPluginID = NetworkPluginID>(overrides?: ChainContextGetter<T>) {
    const context = useContext(ChainContext)
    return {
        ...context,
        ...omitBy(overrides, isUndefined),
    } as Required<ChainContextGetter<T> & ChainContextSetter<T>>
}
