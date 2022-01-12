import { ChainId } from '@masknet/web3-shared-evm'
import { ETHER, WNATIVE, WBTCe, DAIe, PNG, USDTe, USDCe, WNATIVE_ONLY } from './trader'
import type { ERC20AgainstToken, ERC20TokenCustomizedBase } from './types'

/**
 * Some tokens can only be swapped via certain pairs,
 * so we override the list of bases that are considered for these tokens.
 */
export const PANGOLIN_CUSTOM_BASES: ERC20TokenCustomizedBase = {}

export const PANGOLIN_BASE_AGAINST_TOKENS: ERC20AgainstToken = {
    ...WNATIVE_ONLY,
    [ChainId.Avalanche]: [WNATIVE, DAIe, PNG, USDTe, USDCe, ETHER, WBTCe].map((x) => x[ChainId.Avalanche]),
}
