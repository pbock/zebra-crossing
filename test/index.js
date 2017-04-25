'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const path = require('path');
const fs = require('fs');

const ZebraCrossing = require('..');

const imageDir = path.resolve(__dirname, 'images/');

const eanPath = path.resolve(imageDir, '12345670.ean.gif');
const eanData = {
	type: 'PRODUCT',
	format: 'EAN_8',
	raw: Buffer.from('12345670'),
	parsed: Buffer.from('12345670'),
	points: [ [17, 50], [145, 50] ],
};

describe('ZebraCrossing', function () {
	it('has a read() method', function () {
		expect(ZebraCrossing.read).to.be.a('function');
	})

	it('has a FORMAT property', function () {
		expect(ZebraCrossing.FORMAT).to.be.an('object');
		expect(Object.keys(ZebraCrossing.FORMAT)).to.have.length.above(0);
		Object.keys(ZebraCrossing.FORMAT).forEach(key => {
			expect(key).to.match(/^[A-Z0-9_]+$/);
			expect(ZebraCrossing.FORMAT[key]).to.be.a('string');
		})
	})

	describe('#read()', function () {
		const read = ZebraCrossing.read;
		it('works without options', function () {
			return expect( read(eanPath) )
				.to.become(eanData)
		})

		it('supports buffers', function () {
			return expect( read(fs.readFileSync(eanPath)) )
				.to.become(eanData)
		})

		it('resolves with an array when called with { multi: true }', function () {
			const parsed = read(path.resolve(imageDir, 'multi.png'), { multi: true });
			return Promise.all([
				expect(parsed).to.eventually.be.an('array'),
				expect(parsed).to.eventually.have.length(2),
				expect(read(path.resolve(imageDir, 'blank.png'), { multi: true })).to.become([]),
			])
		})

		it('rejects when called with an unknown option', function () {
			return expect( read(path.resolve(imageDir, 'foobar.aztec.gif'), { unknown: 'option' }) )
				.to.be.rejected;
		})

		it('resolves with null when an image does not contain a barcode', function () {
			return expect( read(path.resolve(imageDir, 'blank.png')) )
				.to.become(null);
		})

		it('supports the possibleFormats parameter', function () {
			return Promise.all([
				expect( read(path.resolve(imageDir, 'foobar.aztec.gif'), { possibleFormats: [ 'QR_CODE' ] }) )
					.to.become(null),
				expect( read(path.resolve(imageDir, 'foobar.aztec.gif'), { possibleFormats: [ 'AZTEC' ] }) )
					.not.to.become(null),
			])
		})

		it('rejects quickly when trying to access a non-accessible file', function () {
			this.timeout(10);
			return expect( read(path.resolve(imageDir, 'no-such-file.png')) )
				.to.be.rejected;
		})
	});
})
