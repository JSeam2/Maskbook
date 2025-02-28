import { Typography } from '@mui/material'
import { isArray, sum } from 'lodash-es'
import { useState, useMemo, useEffect, cloneElement } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    typed: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
        '& > strong': {
            color: theme.palette.maskColor.highlight,
        },
    },
    endTyping: {
        opacity: 0.5,
    },
}))

export function OnboardingWriter() {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()

    const [index, setIndex] = useState(0)
    const words = useMemo(() => {
        return [
            <Typography key="identity">
                {t.persona_onboarding_creating_identity()}
                {t.identity()}
            </Typography>,
            <Typography key="account">
                {t.persona_onboarding_generating_accounts()}
                {t.accounts()}
            </Typography>,
            <Typography key="data">
                {t.persona_onboarding_encrypting_data()}
                {t.data()}
            </Typography>,
            <Typography key="ready">
                {t.persona_onboarding_ready()}
                {t.ready()}
            </Typography>,
        ]
    }, [])

    const charSize = useMemo(() => {
        return words.reduce((prev, current) => {
            if (!isArray(current.props.children)) return prev
            const size = sum(
                current.props.children.map((x: string) => {
                    return x.length
                }),
            )

            return prev + size
        }, 0)
    }, [words])

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => {
                if (prev > charSize) {
                    clearInterval(timer)
                    return prev
                }

                return prev + 1
            })
        }, 50)

        return () => {
            clearInterval(timer)
        }
    }, [charSize])

    const jsx = useMemo(() => {
        const newJsx = []
        let remain = index
        for (const fragment of words) {
            if (remain <= 0) break
            const size = sum(
                fragment.props.children.map((x: string) => {
                    return x.length
                }),
            )
            const take = Math.min(size, remain)

            remain -= take

            const [text, strongText] = fragment.props.children as string[]

            const props = {
                ...fragment.props,
                className: cx(classes.typed, remain !== 0 && fragment.key !== 'ready' ? classes.endTyping : undefined),
            }
            if (take < text.length) newJsx.push(cloneElement(fragment, props, [text.slice(0, take)]))
            else
                newJsx.push(
                    cloneElement(fragment, props, [
                        text,
                        <strong key={size}>{strongText.slice(0, take - text.length)}</strong>,
                    ]),
                )
        }

        return newJsx
    }, [words, index])

    return <>{jsx}</>
}
