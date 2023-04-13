import { Icons } from '@masknet/icons'
import { ElementAnchor, Image, NetworkIcon, RetryHint } from '@masknet/shared'
import { EMPTY_LIST, EMPTY_OBJECT, type SocialAccount } from '@masknet/shared-base'
import { LoadingBase, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptors, useNonFungibleCollections } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Button, Stack, Typography, styled } from '@mui/material'
import { range } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import { useI18N } from '../../locales/i18n_generated.js'
import type { CollectibleGridProps } from '../../types.js'
import { useUserAssets } from '../Context/UserAssetsContext.js'
import { CollectibleItemSkeleton } from './CollectibleItem.js'
import { Collection, LazyCollection, type CollectionProps } from './Collection.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'

const AllButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    padding: 0,
    borderRadius: '50%',
    fontSize: 10,
    backgroundColor: theme.palette.maskColor.highlight,
    '&:hover': {
        backgroundColor: theme.palette.maskColor.highlight,
        boxShadow: 'none',
    },
}))

export const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 4, gap = 1.5 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        container: {
            boxSizing: 'border-box',
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
        },
        grid: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: gapIsNumber ? theme.spacing(gap) : gap,
            padding: gapIsNumber ? theme.spacing(0, gap, 0) : `0 ${gap} 0`,
            paddingRight: theme.spacing(1),
            boxSizing: 'border-box',
        },
        gridItem: {
            overflow: 'auto',
        },
        currentCollection: {
            display: 'flex',
            justifyContent: 'space-between',
            color: theme.palette.maskColor.main,
            margin: theme.spacing(0, gap, 1.5),
        },
        info: {
            display: 'flex',
            alignItems: 'center',
        },
        icon: {
            width: 24,
            height: 24,
            borderRadius: '100%',
            objectFit: 'cover',
        },
        backButton: {
            padding: theme.spacing(1, 0),
            width: 40,
            minWidth: 40,
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            color: theme.palette.maskColor.main,
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
        sidebar: {
            width: 24,
            flexShrink: 0,
            marginRight: theme.spacing(1.5),
        },
        networkButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            width: 24,
            minWidth: 24,
            height: 24,
            maxWidth: 24,
            padding: 0,
        },
        indicator: {
            position: 'absolute',
            right: -3,
            bottom: -1,
        },
    }
})

export interface CollectionListProps {
    socialAccount: SocialAccount<Web3Helper.ChainIdAll>
    gridProps?: CollectibleGridProps
}

export function CollectionList({ socialAccount, gridProps = EMPTY_OBJECT }: CollectionListProps) {
    const { address: account } = socialAccount
    const t = useI18N()
    const { classes } = useStyles(gridProps)

    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()

    const {
        value: allCollections = EMPTY_LIST,
        loading,
        error,
        retry,
    } = useNonFungibleCollections(socialAccount.pluginID, {
        account,
        allChains: true,
        sourceType: SourceType.SimpleHash,
    })

    const [currentCollectionId, setCurrentCollectionId] = useState<string>()
    const collections = useMemo(
        () => (chainId ? allCollections.filter((x) => x.chainId === chainId) : allCollections),
        [allCollections, chainId],
    )
    const currentCollection = allCollections.find((x) => x.id === currentCollectionId)

    const networks = useNetworkDescriptors(socialAccount.pluginID)

    const { getAssets, getVerifiedBy, loadAssets, loadVerifiedBy, isHiddenAddress } = useUserAssets()

    const handleCollectionRender = useCallback(
        (collection: Web3Helper.NonFungibleCollectionAll) => {
            loadAssets(collection)
            loadVerifiedBy(collection.id!)
        },
        [loadAssets, loadVerifiedBy],
    )

    const sidebar = (
        <div className={classes.sidebar}>
            <AllButton
                className={classes.networkButton}
                onClick={() => {
                    setChainId(undefined)
                    setCurrentCollectionId(undefined)
                }}>
                ALL
                {!chainId ? <Icons.BorderedSuccess className={classes.indicator} size={12} /> : null}
            </AllButton>
            {networks
                .filter((x) => x.isMainnet)
                .map((x) => (
                    <Button
                        variant="text"
                        key={x.chainId}
                        className={classes.networkButton}
                        disableRipple
                        onClick={() => {
                            setChainId(x.chainId)
                            setCurrentCollectionId(undefined)
                        }}>
                        <NetworkIcon
                            pluginID={socialAccount.pluginID}
                            chainId={x.chainId}
                            ImageIconProps={{ size: 24 }}
                        />
                        {chainId === x.chainId ? (
                            <Icons.BorderedSuccess className={classes.indicator} size={12} />
                        ) : null}
                    </Button>
                ))}
        </div>
    )

    if (!collections.length && loading && !error && account)
        return (
            <Box className={classes.container}>
                <Stack direction="row">
                    <Box sx={{ flexGrow: 1 }} width="100%">
                        <LoadingSkeleton className={classes.grid} />
                    </Box>
                    {sidebar}
                </Stack>
            </Box>
        )

    if (!collections.length && error && account)
        return (
            <Box className={classes.container}>
                <Box mt="200px" color={(theme) => theme.palette.maskColor.main}>
                    <RetryHint retry={retry} />
                </Box>
            </Box>
        )

    if ((!loading && !collections.length) || !account || isHiddenAddress)
        return (
            <Box className={classes.container}>
                <Stack direction="row">
                    <Box sx={{ flexGrow: 1 }} width="100%">
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            height={400}>
                            <Icons.EmptySimple size={32} />
                            <Typography
                                color={(theme) => theme.palette.maskColor.second}
                                fontSize="14px"
                                marginTop="12px">
                                {t.no_NFTs_found()}
                            </Typography>
                        </Box>
                    </Box>
                    {sidebar}
                </Stack>
            </Box>
        )

    const currentCollectionVerifiedBy = currentCollectionId ? getVerifiedBy(currentCollectionId) : []

    return (
        <Box className={classes.container}>
            <Stack direction="row">
                <Box sx={{ flexGrow: 1 }} width="100%">
                    {currentCollection ? (
                        <div className={classes.currentCollection}>
                            <Box className={classes.info}>
                                {currentCollection.iconURL ? (
                                    <Image className={classes.icon} size={24} src={currentCollection.iconURL} />
                                ) : null}
                                <Typography mx={1}>{currentCollection.name}</Typography>
                                {currentCollectionVerifiedBy.length ? (
                                    <ShadowRootTooltip
                                        title={t.verified_by({ marketplace: currentCollectionVerifiedBy.join(', ') })}>
                                        <Icons.NextIdPersonaVerified size={16} />
                                    </ShadowRootTooltip>
                                ) : null}
                            </Box>
                            <Button
                                variant="text"
                                className={classes.backButton}
                                onClick={() => setCurrentCollectionId(undefined)}>
                                <Icons.Undo size={16} />
                            </Button>
                        </div>
                    ) : null}
                    {currentCollection ? (
                        <ExpandedCollection
                            gridProps={gridProps}
                            owner={account}
                            pluginID={socialAccount.pluginID}
                            collection={currentCollection}
                            key={currentCollection.id}
                            assets={getAssets(currentCollection.id!).assets}
                            verifiedBy={getVerifiedBy(currentCollection.id!)}
                            loading={getAssets(currentCollection.id!).loading}
                            expanded
                            onRender={handleCollectionRender}
                        />
                    ) : (
                        <Box width="100%">
                            <Box className={classes.grid}>
                                {collections.map((collection) => {
                                    const assetsState = getAssets(collection.id!)
                                    return (
                                        <LazyCollection
                                            className={classes.gridItem}
                                            owner={account}
                                            pluginID={socialAccount.pluginID}
                                            collection={collection}
                                            key={collection.id}
                                            assets={assetsState.assets}
                                            verifiedBy={getVerifiedBy(collection.id!)}
                                            loading={assetsState.loading}
                                            onExpand={setCurrentCollectionId}
                                            onRender={handleCollectionRender}
                                        />
                                    )
                                })}
                            </Box>
                        </Box>
                    )}
                    {error ? <RetryHint hint={false} retry={retry} /> : null}
                </Box>
                {sidebar}
            </Stack>
        </Box>
    )
}

interface ExpandedCollectionProps extends CollectionProps {
    gridProps?: CollectibleGridProps
}

function ExpandedCollection({ gridProps = EMPTY_OBJECT, ...collectionProps }: ExpandedCollectionProps) {
    const { loadAssets, getAssets } = useUserAssets()
    const { classes, theme } = useStyles(gridProps)
    const { collection, assets } = collectionProps
    const id = collection.id!
    const { finished, loading } = getAssets(id)
    return (
        <>
            <Box width="100%">
                <Box className={classes.grid}>
                    <Collection className={classes.gridItem} {...collectionProps} />
                    {loading ? range(20).map((i) => <CollectibleItemSkeleton omitName key={i} />) : null}
                </Box>
            </Box>
            <ElementAnchor
                key={assets.length}
                callback={() => {
                    loadAssets(collection)
                }}>
                {finished ? null : <LoadingBase color={theme.palette.maskColor.main} />}
            </ElementAnchor>
        </>
    )
}
