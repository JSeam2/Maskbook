import { BindingProof, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { first, noop } from 'lodash-es'
import {
    createContext,
    Dispatch,
    FC,
    memo,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react'
import { PFP_TYPE, SelectTokenInfo } from '../../types.js'
import { isValidAddress } from '@masknet/web3-shared-evm'
import type { SocialIdentity } from '@masknet/web3-shared-base'

interface AvatarManagementContextOptions {
    targetAccount: string
    setTargetAccount: (account: string) => void
    // TODO: PFP_TYPE.background is unused
    pfpType: PFP_TYPE
    proof: BindingProof | undefined
    setProof: Dispatch<SetStateAction<BindingProof | undefined>>
    proofs: BindingProof[]
    setProofs: Dispatch<SetStateAction<BindingProof[]>>
    tokenInfo: Web3Helper.NonFungibleTokenAll | undefined
    setTokenInfo: Dispatch<SetStateAction<Web3Helper.NonFungibleTokenAll | undefined>>
    selectedTokenInfo: SelectTokenInfo | undefined
    setSelectedTokenInfo: Dispatch<SetStateAction<SelectTokenInfo | undefined>>
}

export const AvatarManagementContext = createContext<AvatarManagementContextOptions>({
    targetAccount: '',
    setTargetAccount: noop,
    pfpType: PFP_TYPE.PFP,
    proof: undefined,
    setProof: noop,
    proofs: EMPTY_LIST,
    setProofs: noop,
    tokenInfo: undefined,
    setTokenInfo: noop,
    selectedTokenInfo: undefined,
    setSelectedTokenInfo: noop,
})

interface Props extends PropsWithChildren<{ socialIdentity?: SocialIdentity }> {}

export const AvatarManagementProvider: FC<Props> = memo(({ children, socialIdentity }) => {
    const nextIDWallets = useMemo(
        () =>
            socialIdentity?.binding?.proofs.filter(
                (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
            ) ?? EMPTY_LIST,
        [socialIdentity],
    )

    const nextIDPersonas = useMemo(
        () =>
            socialIdentity?.binding?.proofs.filter(
                (x) => x.identity.toLowerCase() === socialIdentity.identifier?.userId.toLowerCase(),
            ) ?? EMPTY_LIST,
        [socialIdentity],
    )

    const [proof, setProof] = useState<BindingProof>()
    const [proofs, setProofs] = useState<BindingProof[]>(EMPTY_LIST)
    const [tokenInfo, setTokenInfo] = useState<Web3Helper.NonFungibleTokenAll>()
    const { account } = useChainContext()
    const [selectedAccount, setSelectedAccount] = useState(nextIDWallets[0]?.identity || account)
    const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()

    const contextValue: AvatarManagementContextOptions = useMemo(() => {
        setProof(first(nextIDPersonas))
        setProofs(nextIDWallets)
        return {
            pfpType: PFP_TYPE.PFP,
            targetAccount: selectedAccount,
            setTargetAccount: setSelectedAccount,
            proof,
            setProof,
            proofs,
            setProofs,
            tokenInfo,
            setTokenInfo,
            selectedTokenInfo,
            setSelectedTokenInfo,
        }
    }, [selectedAccount, proof, proofs, tokenInfo, selectedTokenInfo, nextIDPersonas, nextIDWallets])

    return <AvatarManagementContext.Provider value={contextValue}>{children}</AvatarManagementContext.Provider>
})

AvatarManagementProvider.displayName = 'AvatarManagementProvider'

export function useAvatarManagement() {
    return useContext(AvatarManagementContext)
}
