// Import
import Errlop from 'errlop'
import fetch from 'node-fetch'
import { versions as processVersions } from 'process'

/**
 * A complete Node.js version number with optional feature flag.
 * @example `"4.9.1"`
 * @example `"4.9.1--harmony"`
 */
export type NodeCompatibilityVersionIdentifier = string

/** A complete version number, in the format of `0.1.14` or `"0.1.14"` */
export type NodeReleaseVersionInput = string | number

/** A flag for Node.js that affects its ECMAScript compatibility. */
export type NodeReleaseVersionFlag = '' | '--es_staging' | '--harmony'

/**
 * A complete ECMAScript edition/version identifier .
 * @example `"ES2015"` or `"ES5"`
 */
export type ESVersionIdentifier = string

/**
 * A complete ECMAScript feature identifier.
 * @example `"candidate (stage 3)›.at() method on the built-in indexables›Array.prototype.at()"`
 */
export type ESFeatureIdentifier = string

/**
 * The result of compatibility of an ECMAScript feature.
 * Only `true` indicates support.
 * @example `"arr.at is not a function"` for errors
 * @example `true` for supported
 * @example `false` for unsupported
 */
export type ESFeatureCompatibilityResult = boolean | string

/** The compatibility results of a specific ECMAScript version. */
interface ESVersionCompatibilityResult {
	/** How many features were successful within this ECMAScript version? */
	successful: number

	/** How many features were tested within this ECMAScript version? */
	total: number

	/** What percentage of features passed within this ECMAScript version? */
	percent: number

	/**
	 * The compatibility details for each ECMAScript feature.
	 * A sort order is not enforced, and depends upon whatever the API returned.
	 */
	compatibility: Map<ESFeatureIdentifier, ESFeatureCompatibilityResult>
}

/**
 * The feature compatibility results of all ECMAScript versions against a specific Node.js version.
 */
export interface NodeCompatibilityResult {
	/** The Node.js version number this compatibility result is for. */
	version: NodeCompatibilityVersionIdentifier

	/** The V8 version of this Node.js version and flag, that this compatibility result is for. */
	v8: string

	/**
	 * The compatibility details for each ECMAScript version.
	 * A sort order is not enforced, and depends upon whatever the API returned.
	 */
	compatibility: Map<ESVersionIdentifier, ESVersionCompatibilityResult>
}

/**
 * For each Node.js compatibility version identifier,
 * give us its compatibility results for each ECMAScript identifier.
 * A sort order is not enforced, and depends upon whatever the API returned.
 */
type NodeCompatibilityResults = Map<
	NodeCompatibilityVersionIdentifier,
	NodeCompatibilityResult
>

/**
 * The fetched compatibility results of all ECMAScript versions against the Node.js versions that we have fetched so far.
 * A sort order is not enforced, and depends upon whatever the API returned.
 */
const results: NodeCompatibilityResults = new Map<
	NodeCompatibilityVersionIdentifier,
	NodeCompatibilityResult
>()

/**
 * The raw feature compatibility API results of all ECMAScript versions against a specific Node.js version.
 * @example https://github.com/williamkapke/node-compat-table/blob/gh-pages/results/v8/4.9.1.json
 */
type Response = {
	/**
	 * Node.js version and flag
	 * @example `8.9.2`
	 * @example `8.9.2--harmony`
	 */
	_version: NodeCompatibilityVersionIdentifier
	/**
	 * V8 version
	 * @example `v8 6.1.534.48`
	 */
	_engine: string
} & {
	[esVersionIdentifier: string]: {
		/** How many features were successful within this ECMAScript version? */
		_successful: number
		/** How many features were tested within this ECMAScript version? */
		_count: number
		/** What percentage of features passed within this ECMAScript version? */
		_percent: number
	} & {
		/** Mapping of the feature key to whether or not it is supported, or what error occurred. Only `true` means it is supported. */
		[esFeatureIdentifier: string]: ESFeatureCompatibilityResult
	}
}

// =================================
// Fetch

/** Fetch the ECMAScript compatibility information for the specific Node.js version, defaulting to the current version with no flags. */
export async function fetchNodeVersionCompatibility(
	nodeVersion: string = processVersions.node,
	nodeFlag: NodeReleaseVersionFlag = ''
): Promise<NodeCompatibilityResult> {
	// from from cache
	const nodeVersionIdentifier = nodeVersion + nodeFlag
	if (results.has(nodeVersionIdentifier)) {
		return results.get(nodeVersionIdentifier)!
	}

	// fetch from remote
	// e.g. https://raw.githubusercontent.com/williamkapke/node-compat-table/gh-pages/results/v8/4.9.1.json
	const url = `https://raw.githubusercontent.com/williamkapke/node-compat-table/gh-pages/results/v8/${nodeVersionIdentifier}.json`
	try {
		const resp = await fetch(url, {})
		const json = (await resp.json()) as Response

		// prepare
		const nodeCompatibilityResult: NodeCompatibilityResult = {
			version: json._version,
			v8: json._engine,
			compatibility: new Map(),
		}

		// esversions
		for (const [esVersionIdentifier, esVersionResponse] of Object.entries(
			json
		)) {
			// ignore manual keys: _version
			if (esVersionIdentifier.startsWith('_')) continue

			// verify we are dealing with es version identifiers
			if (!esVersionIdentifier.startsWith('ES'))
				throw new Error(
					`The object key [${esVersionIdentifier}] was meant to represent an ECMAScript version identifier.`
				)

			// prepare
			const esVersionCompatibility: ESVersionCompatibilityResult = {
				successful: esVersionResponse._successful,
				total: esVersionResponse._count,
				percent: esVersionResponse._percent,
				compatibility: new Map(),
			}

			// esfeatures
			for (const [
				esFeatureIdentifier,
				esFeatureCompatibilityResult,
			] of Object.entries(esVersionResponse)) {
				// ignore manual keys: _successful, _count, _percent
				if (esFeatureIdentifier.startsWith('_')) continue
				// apply
				esVersionCompatibility.compatibility.set(
					esFeatureIdentifier,
					esFeatureCompatibilityResult
				)
			}

			// apply
			nodeCompatibilityResult.compatibility.set(
				esVersionIdentifier,
				esVersionCompatibility
			)
		}

		//  apply
		results.set(nodeVersionIdentifier, nodeCompatibilityResult)

		// return
		return nodeCompatibilityResult
	} catch (err) {
		throw new Errlop(
			`Failed to fetch the compatibility information for the Node.js version from: ${url}`,
			err
		)
	}
}

/** Fetch the compatibility for multiple Node.js versions */
export async function fetchNodeVersionsCompatibility(
	versions: Array<string>,
	NodeReleaseVersionFlag: NodeReleaseVersionFlag = ''
): Promise<Array<NodeCompatibilityResult>> {
	return Promise.all(
		versions.map((version) =>
			fetchNodeVersionCompatibility(version, NodeReleaseVersionFlag)
		)
	)
}
