import { useCallback } from 'react'
import { IconButton, MenuItem } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useMenu } from '@masknet/shared'
import { useModal } from '../DashboardDialogs/Base.js'
import {
    DashboardWalletHideTokenConfirmDialog,
    DashboardWalletTransferDialogNFT,
} from '../DashboardDialogs/Wallet/index.js'
import { useChainIdValid } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Wallet } from '@masknet/shared-base'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material'
import { useI18N } from '../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ActionsBarNFT_Props extends withClasses<'more'> {
    wallet: Wallet
    asset: Web3Helper.NonFungibleAssetAll
}

export function ActionsBarNFT(props: ActionsBarNFT_Props) {
    const { wallet, asset } = props

    const { t } = useI18N()
    const { classes } = useStyles(undefined, { props })

    const chainIdValid = useChainIdValid()

    const [transferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogNFT)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        asset.schema === SchemaType.ERC721 ? (
            <MenuItem
                key="transfer"
                disabled={!chainIdValid}
                onClick={() => openTransferDialogOpen({ token: asset as NonFungibleAsset<ChainId, SchemaType> })}>
                {t('transfer')}
            </MenuItem>
        ) : null,
        <MenuItem
            key="hide"
            onClick={() =>
                openHideTokenConfirmDialog({ wallet, token: asset as NonFungibleAsset<ChainId, SchemaType> })
            }>
            {t('hide')}
        </MenuItem>,
    )

    const onClickButton = useCallback(
        (ev: React.MouseEvent<HTMLButtonElement>) => {
            ev.preventDefault()
            openMenu(ev)
        },
        [openMenu],
    )

    return (
        <>
            <IconButton className={classes.more} size="small" onClick={onClickButton}>
                <MoreHorizIcon />
            </IconButton>
            {menu}
            {hideTokenConfirmDialog}
            {transferDialog}
        </>
    )
}
