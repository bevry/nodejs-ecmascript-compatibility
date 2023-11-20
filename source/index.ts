// Import
import Errlop from 'errlop'
import { versions as processVersions } from 'process'
import { until } from '@bevry/list'

// related
import {
	compareESVersionIdentifier,
	getESVersionsByDate,
	getESVersionsByNow,
} from '@bevry/ecmascript-versions'
import {
	preloadNodeReleases,
	getNodeReleaseInformation,
} from '@bevry/nodejs-releases'

/**
 * The default threshold.
 * It is this value because Node.js v14 supports 85% of ES2018, but 100% of ES2019 and ES2017
 * https://raw.githubusercontent.com/williamkapke/node-compat-table/gh-pages/results/v8/14.0.0.json
 */
export const THRESHOLD = 0.85

/** The default ECMAScript version fallback for the simpler API methods. */
export const FALLBACK: ESVersionIdentifier = 'ES5'

/**
 * A complete Node.js version number with optional feature flag.
 * @example `"4.9.1"`
 * @example `"4.9.1--harmony"`
 */
export type NodeCompatibilityVersionIdentifier = string

/** A complete version number, in the format of `"0.1.14"` */
export type NodeReleaseVersionIdentifier = string

/** A complete version number, in the format of `0.1.14` or `"0.1.14"` */
export type NodeReleaseVersionInput = string | number

/** A flag for Node.js that affects its ECMAScript compatibility. */
export type NodeReleaseVersionFlag = '' | '--es_staging' | '--harmony'

/**
 * A complete ECMAScript version identifier.
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
	/** The ECMAScript version identifier for this compatibility result. */
	esVersion: ESVersionIdentifier

	/** The Node.js version identifier this compatibility result is for. */
	nodeVersion: NodeReleaseVersionIdentifier

	/** The Node.js version flag this compatibility result is for. */
	nodeFlag: NodeReleaseVersionFlag

	/** The V8 version that this Node.js version used, which this compatibility result is for. */
	v8: string

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
	/** The Node.js version identifier this compatibility result is for. */
	nodeVersion: NodeReleaseVersionIdentifier

	/** The Node.js version flag this compatibility result is for. */
	nodeFlag: NodeReleaseVersionFlag

	/** The V8 version that this Node.js version used, which this compatibility result is for. */
	v8: string

	/**
	 * The ECMAScript versions that are considered compatible.
	 * Adds any missing ECMAScript versions that are compatible that the API forgot.
	 * ESNext is not included, as it is ambiguous.
	 * Sorted by oldest ratification date first.
	 */
	esVersionsCompatible: Array<ESVersionIdentifier>

	/**
	 * The ECMAScript versions that are passed the threshold.
	 * ESNext is not included, as it is ambiguous.
	 * Sorted by oldest ratification date first.
	 */
	esVersionsThreshold: Array<ESVersionIdentifier>

	/**
	 * The ECMAScript versions that were tested.
	 * ESNext is not included, as it is ambiguous.
	 * Sorted by oldest ratification date first.
	 */
	esVersionsTested: Array<ESVersionIdentifier>

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

type ESVersionResponse = {
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

/**
 * The raw feature compatibility API results of all ECMAScript versions against a specific Node.js version.
 * @example https://github.com/williamkapke/node-compat-table/blob/gh-pages/results/v8/4.9.1.json
 */
type ESResponse = {
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
	[esVersionIdentifier: string]: ESVersionResponse
}

// =================================
// Fetch

/**
 * Fetch the ECMAScript compatibility information for the specific Node.js version, defaulting to the current version with no flags.
 * Significant Node.js version numbers will be suffixed with `.0` until an absolute Node.js release version number is reached. For example, `12` => `12.0.0`, and `0.12` => `0.12.0`
 */
export async function fetchNodeVersionCompatibility(
	nodeVersion: string = processVersions.node,
	nodeFlag: NodeReleaseVersionFlag = '',
	threshold: number = THRESHOLD,
	fallback?: ESVersionIdentifier
): Promise<NodeCompatibilityResult> {
	// turn a significant Node.js version number into an absolute one
	const nodeVersionParts = nodeVersion.split('.')
	if (nodeVersion.split('.').length !== 3)
		nodeVersion = nodeVersionParts.concat('0', '0').slice(0, 3).join('.')

	// from from cache
	const nodeVersionIdentifier: NodeCompatibilityVersionIdentifier =
		nodeVersion + nodeFlag
	if (results.has(nodeVersionIdentifier)) {
		return results.get(nodeVersionIdentifier)!
	}

	// fetch from remote
	// e.g. https://raw.githubusercontent.com/williamkapke/node-compat-table/gh-pages/results/v8/4.9.1.json
	const url = `https://raw.githubusercontent.com/williamkapke/node-compat-table/gh-pages/results/v8/${nodeVersionIdentifier}.json`
	try {
		const resp = await fetch(url, {})
		const json: ESResponse = await resp.json()

		// threshold
		const esVersionsCompatible: Array<ESVersionIdentifier> = []
		const esVersionsThreshold: Array<ESVersionIdentifier> = []
		const esVersionsTested: Array<ESVersionIdentifier> = []

		// prepare
		const nodeCompatibility: Map<
			ESVersionIdentifier,
			ESVersionCompatibilityResult
		> = new Map()

		// esversions
		for (const [esVersionIdentifier, esVersionValue] of Object.entries(json)) {
			// ignore manual keys: _version
			if (esVersionIdentifier.startsWith('_')) continue

			// verify we are dealing with es version identifiers
			if (!esVersionIdentifier.startsWith('ES'))
				throw new Error(
					`The object key [${esVersionIdentifier}] was meant to represent an ECMAScript version identifier.`
				)

			// prepare
			const esVersionResponse = esVersionValue as ESVersionResponse
			const esVersionCompatibility: ESVersionCompatibilityResult = {
				esVersion: esVersionIdentifier,
				nodeVersion,
				nodeFlag,
				v8: json._engine,
				successful: esVersionResponse._successful,
				total: esVersionResponse._count,
				percent: esVersionResponse._percent,
				compatibility: new Map(),
			}

			// threshold
			esVersionsTested.push(esVersionIdentifier)

			// add to node compatibility
			nodeCompatibility.set(esVersionIdentifier, esVersionCompatibility)

			// esfeatures
			for (const [
				esFeatureIdentifier,
				esFeatureCompatibilityValue,
			] of Object.entries(esVersionResponse)) {
				// ignore manual keys: _successful, _count, _percent
				if (esFeatureIdentifier.startsWith('_')) continue
				// prepare
				const esFeatureCompatibilityResult =
					esFeatureCompatibilityValue as ESFeatureCompatibilityResult
				// apply
				esVersionCompatibility.compatibility.set(
					esFeatureIdentifier,
					esFeatureCompatibilityResult
				)
			}

			// apply
			nodeCompatibility.set(esVersionIdentifier, esVersionCompatibility)
		}

		// threshold
		// remove esnext, as sorting needs a non-ambiguous ratification date
		esVersionsTested
			.filter((i) => i.toLocaleLowerCase() !== 'esnext')
			.sort(compareESVersionIdentifier)
		esVersionsThreshold.push(
			...esVersionsTested.filter(
				(i) => nodeCompatibility.get(i)!.percent >= threshold
			)
		)
		esVersionsThreshold.sort(compareESVersionIdentifier) // for some strange reason, this is required
		// fetch all the versions by the release date
		const firstVersion = nodeVersion.replace(/^([0-9]+).+$/, '$1.0.0')
		await preloadNodeReleases()
		const release = getNodeReleaseInformation(firstVersion)
		const esVersionsReleased = getESVersionsByDate(release.date)
		// add the es versions that were released by then, and seem to be compatible
		for (const esVersionReleased of esVersionsReleased) {
			if (
				esVersionsTested.includes(esVersionReleased) &&
				esVersionsThreshold.includes(esVersionReleased) === false
			) {
				break
			}
			esVersionsCompatible.push(esVersionReleased)
		}

		// return
		const nodeCompatibilityResult: NodeCompatibilityResult = {
			nodeVersion,
			nodeFlag,
			v8: json._engine,
			compatibility: nodeCompatibility,
			// threshold
			esVersionsCompatible,
			esVersionsThreshold,
			esVersionsTested,
		}
		results.set(nodeVersionIdentifier, nodeCompatibilityResult)
		return nodeCompatibilityResult
	} catch (err: any) {
		if (fallback) {
			return {
				nodeVersion,
				nodeFlag,
				v8: '',
				compatibility: new Map(),
				// threshold
				esVersionsCompatible: until(getESVersionsByNow(), fallback, true),
				esVersionsThreshold: [],
				esVersionsTested: [],
			}
		}

		throw new Errlop(
			`Failed to fetch the compatibility information for the Node.js version from: ${url}`,
			err
		)
	}
}

/** Fetch the compatibility for multiple Node.js versions */
export async function fetchNodeVersionsCompatibility(
	versions: Array<string>,
	nodeFlag: NodeReleaseVersionFlag = '',
	threshold: number = THRESHOLD,
	fallback?: ESVersionIdentifier
): Promise<Array<NodeCompatibilityResult>> {
	return Promise.all(
		versions.map((version) =>
			fetchNodeVersionCompatibility(version, nodeFlag, threshold, fallback)
		)
	)
}

/**
 * Fetch the ECMAScript versions that are mutually compatible with all the Node.js versions.
 * To phrase another way, gets the lowest common denominator of compatible ECMAScript versions.
 * In practice, this will probably just get the ECMAScript versions of the oldest Node.js version that was mentioned.
 */
export async function fetchMutualCompatibleESVersionsForNodeVersions(
	versions: Array<string>,
	nodeFlag: NodeReleaseVersionFlag = '',
	threshold: number = THRESHOLD,
	fallback: ESVersionIdentifier = FALLBACK
): Promise<Array<ESVersionIdentifier>> {
	const esVersions = new Set<ESVersionIdentifier>()
	const allNodeCompat = await fetchNodeVersionsCompatibility(
		versions,
		nodeFlag,
		threshold,
		fallback
	)
	for (const nodeCompat of allNodeCompat) {
		if (esVersions.size) {
			// remove anything that isn't still present
			for (const esVersion of esVersions) {
				if (nodeCompat.esVersionsCompatible.includes(esVersion) === false) {
					esVersions.delete(esVersion)
				}
			}
		} else {
			// add initial
			for (const esVersion of nodeCompat.esVersionsCompatible) {
				esVersions.add(esVersion)
			}
		}
	}
	return Array.from(esVersions.values()).sort(compareESVersionIdentifier)
}

/**
 * Fetches the latest compatible ECMAScript version for each Node.js version, and remove duplicates.
 * Use this to know what unique ECMAScript compile targets you need to generate for, without generating any targets that are unnecessary.
 */
export async function fetchExclusiveCompatibleESVersionsForNodeVersions(
	versions: Array<string>,
	nodeFlag: NodeReleaseVersionFlag = '',
	threshold: number = THRESHOLD,
	fallback: ESVersionIdentifier = FALLBACK
): Promise<Array<ESVersionIdentifier>> {
	const esVersions = new Set<ESVersionIdentifier>()
	const allNodeCompat = await fetchNodeVersionsCompatibility(
		versions,
		nodeFlag,
		threshold,
		fallback
	)
	for (const nodeCompat of allNodeCompat) {
		for (const esVersion of nodeCompat.esVersionsCompatible.slice(-1)) {
			esVersions.add(esVersion)
		}
	}
	return Array.from(esVersions.values()).sort(compareESVersionIdentifier)
}

/**
 * Fetches all the ECMAScript versions were compatible with any of the Node.js versions.
 * In practice, this will probably just get the ECMAScript versions of the newest Node.js version that was mentioned.
 */
export async function fetchAllCompatibleESVersionsForNodeVersions(
	versions: Array<string>,
	nodeFlag: NodeReleaseVersionFlag = '',
	threshold: number = THRESHOLD,
	fallback: ESVersionIdentifier = FALLBACK
): Promise<Array<ESVersionIdentifier>> {
	const esVersions = new Set<ESVersionIdentifier>()
	const allNodeCompat = await fetchNodeVersionsCompatibility(
		versions,
		nodeFlag,
		threshold,
		fallback
	)
	for (const nodeCompat of allNodeCompat) {
		for (const esVersion of nodeCompat.esVersionsCompatible) {
			esVersions.add(esVersion)
		}
	}
	return Array.from(esVersions.values()).sort(compareESVersionIdentifier)
}
