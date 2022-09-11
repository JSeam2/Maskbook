import { useI18N } from '../../utils/index.js'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { PopoverListTrigger } from './PopoverListTrigger.js'
import { useState } from 'react'
import { PopoverListItem } from './PopoverListItem.js'
import { E2EUnavailableReason } from './CompositionUI.js'
import { Icons } from '@masknet/icons'
import { EncryptionTargetType } from '@masknet/shared-base'
import { unreachable } from '@dimensiondev/kit'
import { ConnectPersonaBoundary } from '../shared/ConnectPersonaBoundary.js'

const useStyles = makeStyles()((theme) => ({
    optionTitle: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.text.secondary,
        marginRight: 12,
    },
    popper: {
        overflow: 'visible',
        boxShadow: '0px 0px 16px 0px rgba(101, 119, 134, 0.2)',
        borderRadius: 4,
    },
    popperText: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        background: theme.palette.divider,
        margin: '8px 0',
    },
    mainTitle: {
        fontSize: 14,
        color: theme.palette.text.primary,
        fontWeight: 700,
    },
    subTitle: {
        fontSize: 14,
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    paper: {
        width: 280,
        padding: 12,
        boxSizing: 'border-box',
    },
    flex: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 4,
        boxSizing: 'border-box',
    },
    create: {
        fontSize: 14,
        cursor: 'pointer',
        fontWeight: 700,
        color: theme.palette.primary.main,
    },
    rightIcon: {
        marginLeft: 'auto',
    },
    pointer: {
        cursor: 'pointer',
    },
}))

export interface EncryptionTargetSelectorProps {
    target: EncryptionTargetType
    e2eDisabled: E2EUnavailableReason | undefined
    onChange(v: EncryptionTargetType): void
    selectedRecipientLength: number
}
export function EncryptionTargetSelector(props: EncryptionTargetSelectorProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const e2eDisabledMessage =
        props.e2eDisabled && props.e2eDisabled !== E2EUnavailableReason.NoLocalKey ? (
            <div className={classes.flex}>
                <Typography className={classes.mainTitle}>{t('persona_required')}</Typography>
                <ConnectPersonaBoundary
                    customHint
                    handlerPosition="top-right"
                    enableVerify={false}
                    createConfirm={false}>
                    {(s) => {
                        if (!s.hasPersona) return <Typography className={classes.create}>{t('create')}</Typography>
                        // TODO: how to handle verified
                        if (!s.connected || !s.verified)
                            return <Typography className={classes.create}>{t('connect')}</Typography>

                        return null
                    }}
                </ConnectPersonaBoundary>
            </div>
        ) : null
    const noLocalKeyMessage = props.e2eDisabled === E2EUnavailableReason.NoLocalKey && (
        <div className={classes.flex}>
            <Typography className={classes.mainTitle}>{t('compose_no_local_key')}</Typography>
        </div>
    )

    const selectedTitle = () => {
        const selected = props.target
        const shareWithNum = props.selectedRecipientLength
        if (selected === EncryptionTargetType.E2E)
            return shareWithNum > 1
                ? t('compose_shared_friends_other', { count: shareWithNum })
                : t('compose_shared_friends_one')
        else if (selected === EncryptionTargetType.Public) return t('compose_encrypt_visible_to_all')
        else if (selected === EncryptionTargetType.Self) return t('compose_encrypt_visible_to_private')
        unreachable(selected)
    }
    return (
        <>
            <Typography className={classes.optionTitle}>{t('post_dialog_visible_to')}</Typography>

            <PopoverListTrigger
                selected={props.target}
                selectedTitle={selectedTitle()}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                onChange={props.onChange}>
                <PopoverListItem
                    onItemClick={() => props.onChange(EncryptionTargetType.Public)}
                    value={EncryptionTargetType.Public}
                    title={t('compose_encrypt_visible_to_all')}
                    subTitle={t('compose_encrypt_visible_to_all_sub')}
                />
                <div className={classes.divider} />
                <PopoverListItem
                    onItemClick={() => props.onChange(EncryptionTargetType.Self)}
                    disabled={!!props.e2eDisabled}
                    value={EncryptionTargetType.Self}
                    title={t('compose_encrypt_visible_to_private')}
                    subTitle={t('compose_encrypt_visible_to_private_sub')}
                />
                {e2eDisabledMessage}
                {noLocalKeyMessage}
                <div className={classes.divider} />
                <PopoverListItem
                    onItemClick={() => {
                        props.onChange(EncryptionTargetType.E2E)
                        setAnchorEl(null)
                    }}
                    itemTail={<Icons.RightArrow className={classes.rightIcon} />}
                    disabled={!!props.e2eDisabled}
                    value={EncryptionTargetType.E2E}
                    title={t('compose_encrypt_visible_to_share')}
                    subTitle={t('compose_encrypt_visible_to_share_sub')}
                />
                {e2eDisabledMessage}
                {noLocalKeyMessage}
            </PopoverListTrigger>
        </>
    )
}
