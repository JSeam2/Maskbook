import type { Configuration } from 'webpack'
import { join, isAbsolute, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = fileURLToPath(dirname(import.meta.url))

export interface BuildFlags {
    engine: 'chromium' | 'firefox' | 'safari'
    /** @default 2 */
    manifest?: 2 | 3
    mode: 'development' | 'production'
    /** @default 'stable' */
    channel?: 'stable' | 'beta' | 'insider'
    /** @default false */
    profiling?: boolean
    /** @default true in development */
    hmr?: boolean
    /** @default true in development and hmr is true */
    reactRefresh?: boolean
    /** @default false */
    readonlyCache?: boolean
    /** @default false */
    reproducibleBuild?: boolean
    outputPath?: string
    /** @default true */
    devtools?: boolean
    /** @default "vscode://file/{path}:{line}" */
    devtoolsEditorURI?: string
    /** @default true */
    sourceMapPreference?: boolean | string
    /** @default true */
    sourceMapHideFrameworks?: boolean | undefined
}
export type NormalizedFlags = Required<BuildFlags>
export function normalizeBuildFlags(flags: BuildFlags): NormalizedFlags {
    const {
        mode,
        profiling = false,
        engine,
        manifest = 2,
        readonlyCache = false,
        channel = 'stable',
        devtoolsEditorURI = 'vscode://file/{path}:{line}',
        sourceMapHideFrameworks = true,
    } = flags
    let {
        hmr = mode === 'development',
        reactRefresh = hmr,
        reproducibleBuild = false,
        devtools = mode === 'development' || channel !== 'stable',
        sourceMapPreference = mode === 'development',
        outputPath = join(__dirname, '../../../', mode === 'development' ? 'dist' : 'build'),
    } = flags
    if (!isAbsolute(outputPath)) outputPath = join(__dirname, '../../../', outputPath)

    // Firefox requires reproducible build when reviewing the uploaded source code.
    if (engine === 'firefox' && mode === 'production') reproducibleBuild = true

    // CSP of Twitter bans connection to the HMR server and blocks the app to start.
    if (engine === 'firefox') hmr = false

    if (mode === 'production') hmr = false
    if (!hmr) reactRefresh = false

    return {
        mode,
        channel,
        outputPath,
        // Runtime
        manifest,
        engine,
        // DX
        hmr,
        reactRefresh,
        sourceMapPreference,
        sourceMapHideFrameworks,
        devtools,
        devtoolsEditorURI,
        // CI / profiling
        profiling,
        readonlyCache,
        reproducibleBuild,
    }
}

export interface ComputedFlags {
    lockdown: boolean
    sourceMapKind: Configuration['devtool']
    reactProductionProfiling: boolean
}

export function computedBuildFlags(flags: Required<BuildFlags>): ComputedFlags {
    const lockdown = flags.engine === 'chromium'

    let sourceMapKind: Configuration['devtool'] = false
    if (flags.mode === 'production') sourceMapKind = 'source-map'

    if (flags.sourceMapPreference) {
        if (flags.manifest === 3) sourceMapKind = 'inline-cheap-source-map'
        else sourceMapKind = 'eval-cheap-source-map'

        if (flags.mode === 'production') sourceMapKind = 'source-map'
        if (typeof flags.sourceMapPreference === 'string') sourceMapKind = flags.sourceMapPreference
        if (process.env.CI) sourceMapKind = false
    }

    const reactProductionProfiling = flags.mode === 'production' && flags.profiling
    return { sourceMapKind, lockdown, reactProductionProfiling }
}

export function computeCacheKey(flags: Required<BuildFlags>, computedFlags: ComputedFlags) {
    return [
        '1',
        'node' + process.version,
        flags.mode,
        computedFlags.reactProductionProfiling, // it will affect module resolution of react-dom
        flags.devtools, // it will affect module resolution of react-refresh-webpack-plugin/client/ReactRefreshEntry.js
        flags.reactRefresh, // it will affect all TSX files
    ].join('-')
}
