'use strict';

const expect = require('chai').expect;

const params = require('../lib/params');

describe('params', function () {
	it('returns [] when called with `undefined`', function () {
		expect(params()).to.deep.equal([]);
	})

	it('supports tryHarder', function () {
		expect(params({ tryHarder: true })).to.deep.equal([ '--try_harder' ]);
		expect(params({ tryHarder: 'yes' })).to.deep.equal([ '--try_harder' ]);
		expect(params({ tryHarder: 'false' })).to.deep.equal([ '--try_harder' ]);
		expect(params({ tryHarder: false })).to.deep.equal([ ]);
	})

	it('supports pureBarcode', function () {
		expect(params({ pureBarcode: true })).to.deep.equal([ '--pure_barcode' ]);
		expect(params({ pureBarcode: 'yes' })).to.deep.equal([ '--pure_barcode' ]);
		expect(params({ pureBarcode: 'false' })).to.deep.equal([ '--pure_barcode' ]);
		expect(params({ pureBarcode: false })).to.deep.equal([ ]);
	})

	it('supports productsOnly', function () {
		expect(params({ productsOnly: true })).to.deep.equal([ '--products_only' ]);
		expect(params({ productsOnly: 'yes' })).to.deep.equal([ '--products_only' ]);
		expect(params({ productsOnly: 'false' })).to.deep.equal([ '--products_only' ]);
		expect(params({ productsOnly: false })).to.deep.equal([ ]);
	})

	it('supports multi', function () {
		expect(params({ multi: true })).to.deep.equal([ '--multi' ]);
		expect(params({ multi: 'yes' })).to.deep.equal([ '--multi' ]);
		expect(params({ multi: 'false' })).to.deep.equal([ '--multi' ]);
		expect(params({ multi: false })).to.deep.equal([ ]);
	})

	it('supports crop', function () {
		expect(params({ crop: { top: 10, left: 20, width: 30, height: 40 } }))
			.to.deep.equal([ '--crop=20,10,30,40' ]);
		expect(() => params({ crop: true })).to.throw();
		expect(() => params({ crop: [ 10, 20, 30, 40 ] })).to.throw();
	})

	it('supports possibleFormats', function () {
		expect(params({ possibleFormats: [ 'EAN_13', 'QR_CODE', 'CODABAR' ] }))
			.to.deep.equal([ '--possible_formats=EAN_13,QR_CODE,CODABAR' ]);
	})

	it('throws when an unknown format is passed', function () {
		expect(() => params({ possibleFormats: [ 'UNKNOWN_FORMAT' ] }))
			.to.throw();
	})

	it('supports multiple options', function () {
		expect(params({ pureBarcode: true, possibleFormats: [ 'AZTEC', 'QR_CODE' ] }))
			.to.deep.equal([ '--pure_barcode', '--possible_formats=AZTEC,QR_CODE' ])
	})

	it('throws on unknown options', function () {
		expect(() => params({ noSuchOption: true })).to.throw();
	})
})
