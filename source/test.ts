// external
import { equal, deepEqual } from 'assert-helpers'
import kava from 'kava'
import { join } from 'path'
import { fromJSON, toJSON, readJSON, writeJSON } from '@bevry/json'

// esm workaround
import filedirname from 'filedirname'
const [_filename, _dirname] = filedirname()

// join
// import {
// 	preloadNodeReleases,
// 	getNodeReleaseIdentifiers,
// } from '@bevry/nodejs-releases'

// local
import {
	NodeCompatibilityVersionIdentifier,
	fetchNodeVersionCompatibility,
} from './index.js'

// prepare
const fixtures = join(_dirname, '../test-fixtures')

// Test
kava.suite('@bevry/nodejs-ecmascript-compatibility', function (suite, test) {
	test('manual', function (done) {
		const version = '4.9.1'
		const file = join(fixtures, version + '.json')
		// fetch
		fetchNodeVersionCompatibility(version)
			.then(function (result) {
				readJSON(file)
					.then((expected) => {
						// check
						deepEqual(result, expected, `${version} result matched fixture`)
						done()
					})
					.catch((err) => {
						// write
						writeJSON(file, result).finally(() => done(err))
					})
			})
			.catch(done)
	})
	// suite('fetch all node versions', function (suite, test, done) {
	// 	// @ts-ignore
	// 	this.setConfig({ abortOnError: false })
	// 	// prep missing
	// 	const oldMissing = new Set<NodeCompatibilityVersionIdentifier>()
	// 	const nowMissing = new Set<NodeCompatibilityVersionIdentifier>()
	// 	const newMissing = new Set<NodeCompatibilityVersionIdentifier>()
	// 	const newFound = new Set<NodeCompatibilityVersionIdentifier>()
	// 	const missingFile = join(fixtures, 'missing.json')
	// 	// fetch missing
	// 	readJSON(missingFile)
	// 		.then((data: any) => {
	// 			for (const version of data) {
	// 				oldMissing.add(version)
	// 			}
	// 		})
	// 		.then(() => preloadNodeReleases())
	// 		.then(() => {
	// 			const versions = getNodeReleaseIdentifiers()
	// 			for (const version of versions) {
	// 				test(version, function (done) {
	// 					fetchNodeVersionCompatibility(version)
	// 						.then(() => {
	// 							// found
	// 							if (oldMissing.has(version)) {
	// 								newFound.add(version)
	// 								console.log('this version is newly found', version)
	// 							} else {
	// 								console.log('this version is known found', version)
	// 							}
	// 							done()
	// 						})
	// 						.catch((err) => {
	// 							// missing
	// 							nowMissing.add(version)
	// 							if (oldMissing.has(version)) {
	// 								console.log('this version is known missing', version)
	// 								done()
	// 								return
	// 							} else {
	// 								newMissing.add(version)
	// 								console.log('this version is newly missing', version)
	// 								done(err)
	// 								return
	// 							}
	// 						})
	// 				})
	// 			}
	// 		})
	// 		.then(() => {
	// 			test('check changes', function (done) {
	// 				if (newFound.size) {
	// 					console.log('these versions were newly found', newFound)
	// 				}
	// 				if (newMissing.size) {
	// 					console.log('these versions are newly missing', newMissing)
	// 				}
	// 				if (nowMissing.size !== oldMissing.size) {
	// 					writeJSON(missingFile, nowMissing)
	// 						.then(() => done(new Error('there were newly missing versions')))
	// 						.catch(done)
	// 					return
	// 				} else {
	// 					done()
	// 					return
	// 				}
	// 			})
	// 		})
	// 		.then(() => done())
	// 		.catch(done)
	// })
})
