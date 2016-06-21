'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const path = require('path');

const zebraCrossing = require('..');

const imageDir = path.resolve(__dirname, 'images/');

describe('zxing', function () {
	it('works without options', function () {
		return expect( zebraCrossing(path.resolve(imageDir, '12345670.ean.gif')) )
			.to.become({
				type: 'PRODUCT',
				format: 'EAN_8',
				raw: Buffer.from('12345670'),
				parsed: Buffer.from('12345670'),
				points: [ [17, 50], [145, 50] ],
			})
	})

	it('resolves with an array when called with { multi: true }', function () {
		const parsed = zebraCrossing(path.resolve(imageDir, 'multi.png'), { multi: true });
		return Promise.all([
			expect(parsed).to.eventually.be.an('array'),
			expect(parsed).to.eventually.have.length(2),
			expect(zebraCrossing(path.resolve(imageDir, 'blank.png'), { multi: true })).to.become([]),
		])
	})

	it('rejects when called with an unknown option', function () {
		return expect( zebraCrossing(path.resolve(imageDir, 'foobar.aztec.gif'), { unknown: 'option' }) )
			.to.be.rejected;
	})

	it('resolves with null when an image does not contain a barcode', function () {
		return expect( zebraCrossing(path.resolve(imageDir, 'blank.png')) )
			.to.become(null);
	})

	it('rejects quickly when trying to access a non-accessible file', function () {
		this.timeout(10);
		return expect( zebraCrossing(path.resolve(imageDir, 'no-such-file.png')) )
			.to.be.rejected;
	})

})
