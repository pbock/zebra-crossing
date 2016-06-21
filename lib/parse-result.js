'use strict';

const FILE_NAME = 'FILE_NAME';
const RESULT_HEADER = 'RESULT_HEADER';
const RESULT_BODY = 'RESULT_BODY';
const RESULT_POINTS = 'RESULT_POINTS';
const UNKNOWN = 'UNKNOWN';

/**
 * Parse the output of zxing's CLI into an array of objects
 * See test/parse-result.js for examples
 */
module.exports = function parse(input) {
	const output = [];
	const lines = input.toString().trim().split('\n');
	let currentResult = {};
	let mode = FILE_NAME;
	let lineBuffer = [];
	let resultType;
	let remainingResultPoints;

	let line;
	while ((line = lines.shift())) {
		if (mode === FILE_NAME) {
			if (line.substr(-16) === 'No barcode found') continue;
			const match = line.match(/\(format: (.*?), type: (.*?)\)/);
			currentResult.format = match[1];
			currentResult.type = match[2];

			mode = UNKNOWN;
		} else if (mode === UNKNOWN) {
			let match;
			if (line === 'Raw result:') {
				if (lineBuffer.length) currentResult[resultType] = Buffer.from(lineBuffer.join('\n'));
				resultType = 'raw';
				lineBuffer = [];
			} else if (line === 'Parsed result:') {
				if (lineBuffer.length) currentResult[resultType] = Buffer.from(lineBuffer.join('\n'));
				resultType = 'parsed';
				lineBuffer = [];
			} else if ((match = line.match(/^Found (\d+) result points.$/))) {
				if (lineBuffer.length) currentResult[resultType] = Buffer.from(lineBuffer.join('\n'));
				resultType = 'parsed';
				lineBuffer = [];

				mode = RESULT_POINTS;
				currentResult.points = [];
				remainingResultPoints = +match[1];
			} else {
				lineBuffer.push(line);
			}
		} else if (mode === RESULT_POINTS) {
			const match = line.match(/Point (\d+): \((-?[\d.]+?),(-?[\d.]+?)\)$/);
			const i = +match[1];
			const x = +match[2];
			const y = +match[3];
			currentResult.points[i] = [x, y];
			if (--remainingResultPoints === 0) {
				output.push(currentResult);
				currentResult = {};
				mode = FILE_NAME;
			}
		}
	}
	return output;
}
