'use strict';

const supportedFormats = require('./supported-formats');

/**
 * Convert an object of camelCased keys and reasonable values to an array
 * of arguments that can be passed to zxing.
 * Throws an error on unknown options or options that don't make sense
 *
 * Example input:
 * {
 *   tryHarder: true,
 *   pureBarcode: true,
 *   productsOnly: true,
 *   multi: true,
 *   crop: { left: 10, top: 20, width: 30, height: 40 },
 *   possibleFormats: [ 'AZTEC', 'QR_CODE' ],
 * }
 */

module.exports = function (params) {
	if (!params) params = {};

	const keys = Object.keys(params);
	const output = [];
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (!params.hasOwnProperty(key)) continue;
		const value = params[key];

		switch (key) {
			case 'tryHarder':
				if (value) output.push('--try_harder');
				break;

			case 'pureBarcode':
				if (value) output.push('--pure_barcode');
				break;

			case 'productsOnly':
				if (value) output.push('--products_only');
				break;

			case 'multi':
				if (value) output.push('--multi');
				break;

			case 'crop':
				if (
					value.top === undefined || value.left === undefined
					|| value.width === undefined || value.height === undefined
				) {
					throw new Error('Expected { left, top, width, height } properties for "crop"');
				}
				if (value) output.push(`--crop=${value.left},${value.top},${value.width},${value.height}`);
				break;

			case 'possibleFormats':
				output.push(`--possible_formats=${
					value.map(f => {
						if (!supportedFormats[f]) {
							throw new Error('Unknown barcode format: ' + f);
						}
						return f;
					}).join(',')
				}`)
				break;

			default:
				throw new Error('Unknown option ' + key);
		}
	}

	return output;
}
