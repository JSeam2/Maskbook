import { createFungibleToken } from '@masknet/web3-shared-base'
import { getTokenConstant } from '../constants/index.js'
import { ChainId, SchemaType } from '../types.js'

export function createNativeToken(chainId: ChainId) {
    return createFungibleToken<ChainId, SchemaType.Native>(
        chainId,
        SchemaType.Native,
        getTokenConstant(chainId, 'SOL_ADDRESS')!,
        'Solana',
        'SOL',
        9,
        'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    )
}
