'use strict';

const fs = require('fs');
const tmp = require('tmp');
const path = require('path');
const spawn = require('child_process').spawn;
const params = require('./lib/params');
const parseResult = require('./lib/parse-result');

const corePath = path.resolve(__dirname, 'jar/', 'core-3.1.0.jar');
const javasePath = path.resolve(__dirname, 'jar/', 'javase-3.1.0.jar');

const FORMAT = require('./lib/supported-formats.js');

function access(filepath, mode) {
	if (!mode) mode = fs.F_OK;
	return new Promise((resolve, reject) => {
		fs.access(filepath, mode, err => {
			if (err) reject(err);
			else resolve(filepath);
		})
	})
}

function writeBufferToTemporaryFile(buffer) {
	return new Promise((resolve, reject) => {
		tmp.file((err, path, fd) => {
			if (err) return reject(err);
			fs.write(fd, buffer, 0, buffer.length, err => {
				if (err) return reject(err);
				return resolve(path);
			})
		})
	});
}

function read(file, options) {
	let ensureFile;
	if (Buffer.isBuffer(file)) {
		ensureFile = writeBufferToTemporaryFile(file);
	} else {
		ensureFile = access(file, fs.R_OK);
	}
	// Check if the file is readable before handing the path off to zxing,
	// because it will take ages otherwise.
	return ensureFile.then((filepath) => new Promise((resolve, reject) => {
		const args = [
			'-cp',
			javasePath + ':' + corePath,
			'com.google.zxing.client.j2se.CommandLineRunner',
			filepath,
		].concat(params(options));

		const java = spawn('java', args);

		const stdout = [];
		const stderr = [];

		let isOpen = true;
		let closeTimeout;
		java.stdout.on('data', data => {
			if (!isOpen) return;
			clearTimeout(closeTimeout);
			stdout.push(data);
			closeTimeout = setTimeout(close, 20);
		})

		java.stderr.on('data', data => {
			if (!isOpen) return;
			stderr.push(data);
		})

		function close() {
			isOpen = false;
			const output = Buffer.concat(stdout);
			const parsed = parseResult(output);
			if (!options || !options.multi) resolve(parsed[0] || null);
			else resolve(parsed);
		}

		java.on('close', code => {
			if (!isOpen) return;
			if (code !== 0 || stderr.length) reject(new Error(`Exited with status code ${code}`, Buffer.concat(stderr)))
		})
	}))
}
module.exports = { read, FORMAT };
