'use strict';

const expect = require('chai').expect;

const parse = require('../lib/parse-result');

const none = Buffer.from('file:///path/single.png: No barcode found');

const single = Buffer.from(
`file:///path/single.png (format: QR_CODE, type: TEXT):
Raw result:
This is the raw result
Parsed result:
This is the parsed result
Found 3 result points.
  Point 0: (774.0,461.0)
  Point 1: (774.0,405.0)
  Point 2: (830.0,405.0)
`);
const singleWin = Buffer.from(single.toString().replace(/\n/g, '\r\n'));

const multi = Buffer.from(
`file:///path/multi.png (format: QR_CODE, type: TEXT):
Raw result:
Raw0
Parsed result:
Parsed0
Found 3 result points.
  Point 0: (774.0,461.0)
  Point 1: (774.0,405.0)
  Point 2: (830.0,405.0)
file:///path/multi.png (format: PDF_417, type: TEXT):
Raw result:
Raw1
Parsed result:
Parsed1
Found 8 result points.
  Point 0: (105.0,107.0)
  Point 1: (105.0,151.0)
  Point 2: (345.0,107.0)
  Point 3: (345.0,151.0)
  Point 4: (139.0,107.0)
  Point 5: (139.0,151.0)
  Point 6: (309.0,107.0)
  Point 7: (309.0,151.0)
`);

describe('parseResult', function () {
	it('parses single results', function () {
		expect(parse(single))
			.to.deep.equal([ {
				raw: Buffer.from('This is the raw result'),
				parsed: Buffer.from('This is the parsed result'),
				format: 'QR_CODE',
				type: 'TEXT',
				points: [ [774.0,461.0], [774.0,405.0], [830.0,405.0] ],
			} ])
	})
	it('parses single results with Windows line endings (\\r\\n)', function () {
		expect(parse(singleWin))
			.to.deep.equal([ {
				raw: Buffer.from('This is the raw result'),
				parsed: Buffer.from('This is the parsed result'),
				format: 'QR_CODE',
				type: 'TEXT',
				points: [ [774.0,461.0], [774.0,405.0], [830.0,405.0] ],
			} ])
	})
	it('parses multiple results', function () {
		expect(parse(multi)).to.deep.equal([
			{
				raw: Buffer.from('Raw0'),
				parsed: Buffer.from('Parsed0'),
				format: 'QR_CODE',
				type: 'TEXT',
				points: [ [774.0,461.0], [774.0,405.0], [830.0,405.0] ],
			},
			{
				raw: Buffer.from('Raw1'),
				parsed: Buffer.from('Parsed1'),
				format: 'PDF_417',
				type: 'TEXT',
				points: [ [ 105.0, 107.0 ], [ 105.0, 151.0 ], [ 345.0, 107.0 ], [ 345.0, 151.0 ],
					[ 139.0, 107.0 ], [ 139.0, 151.0 ], [ 309.0, 107.0 ], [ 309.0, 151.0 ] ],
			},
		])
	})
})
