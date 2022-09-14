import { Box, Typography, Card, CardContent, Link, DialogContent, DialogActions } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'
import millify from 'millify'
import OpenInNew from '@mui/icons-material/OpenInNew'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { InjectedDialog } from '@masknet/shared'
import { InfoField } from './InformationCard.js'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        padding: 0,
        border: `solid 1px ${theme.palette.divider}`,
        margin: `${theme.spacing(2)} auto`,
    },
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
    },
    button: {
        width: '60%',
        minHeight: 39,
        margin: `${theme.spacing(1)} auto`,
    },
    link: {
        display: 'flex',
        color: 'inherit',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        textDecoration: 'none !important',
    },
    loading: {
        color: theme.palette.background.paper,
    },
}))

interface VoteConfirmDialogProps {
    open: boolean
    loading: boolean
    snapshot: string
    powerSymbol: string
    onClose: () => void
    onVoteConfirm: () => void
    choiceText: string
    power: number | undefined
}

export function VoteConfirmDialog(props: VoteConfirmDialogProps) {
    const { open, onClose, onVoteConfirm, choiceText, snapshot, powerSymbol, power = 0, loading } = props
    const { t } = useI18N()

    const { classes } = useStyles()
    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t('plugin_snapshot_vote_confirm_dialog_title')}
            disableBackdropClick>
            <DialogContent>
                <Box>
                    <Typography variant="h6" align="center">
                        {t('plugin_snapshot_vote_confirm_dialog_choice', { choiceText })}
                    </Typography>
                    <Typography variant="h6" align="center">
                        {t('plugin_snapshot_vote_confirm_dialog_warning')}
                    </Typography>
                </Box>
                <Card className={classes.card} variant="outlined">
                    <CardContent className={classes.content}>
                        <Box>
                            <InfoField title={t('plugin_snapshot_vote_choice')}>{choiceText}</InfoField>
                            <InfoField title={t('plugin_snapshot_info_snapshot')}>
                                <Link
                                    className={classes.link}
                                    target="_blank"
                                    rel="noopener"
                                    href={explorerResolver.blockLink(ChainId.Mainnet, Number.parseInt(snapshot, 10))}>
                                    {snapshot}
                                    <OpenInNew fontSize="small" />
                                </Link>
                            </InfoField>
                            <InfoField title={t('plugin_snapshot_vote_power')}>
                                {millify(power, { precision: 2, lowercase: true })} {powerSymbol.toUpperCase()}
                            </InfoField>
                        </Box>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <WalletConnectedBoundary
                    offChain
                    classes={{ connectWallet: classes.button, unlockMetaMask: classes.button }}>
                    <ActionButton
                        classes={{ root: classes.button }}
                        color="primary"
                        fullWidth
                        disabled={loading}
                        onClick={onVoteConfirm}
                        loading={loading}>
                        {t('plugin_snapshot_vote')}
                    </ActionButton>
                </WalletConnectedBoundary>
            </DialogActions>
        </InjectedDialog>
    )
}
