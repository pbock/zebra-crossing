ZebraCrossing
=============

ZebraCrossing is a wrapper around the [zxing][zxing] CLI. It supports all sensible options of the zxing CLI and lets you pass buffers as well as file paths (but see the [note on this][fp-note]).

It's still not fast, it still a bit hacky, it's still your best bet for reading barcodes.

```js
const ZebraCrossing = require('zebra-crossing');
ZebraCrossing.read(fs.readFileSync('image.png'), { pureBarcode: true })
	.then(data => console.log(data));
```

Example output:

```js
{
	raw: Buffer.from('Hello world!'),
	parsed: Buffer.from('Hello world!'),
	format: 'QR_CODE',
	type: 'TEXT',
	points: [ [774.0,461.0], [774.0,405.0], [830.0,405.0] ]
}
```

## Requirements

The dirty work of actually parsing the barcodes is done by [zxing], a Java library, so you'll need to have a [Java Runtime Environment][jre] installed.

## API

ZebraCrossing only has one method: `read(file<String|Buffer>, [options])`.

If `file` is a string, it will be assumed to be a file path that will be passed to zxing.
If `file` is a buffer, its contents will be written to a temporary file whose path will be passed to zxing.

`options` can be an object like this:

```js
{
  // Use the TRY_HARDER hint
  tryHarder: true,
  // Image is a direct monochrome image of a barcode, not a photo
  pureBarcode: true,
  // Only read retail barcodes (EAN and UPC)
  productsOnly: true,
  // Find multiple barcodes in the same image
  multi: true,
  // Crop by the specified pixel values before searching for barcodes
  crop: { left: 10, top: 20, width: 30, height: 40 },
  // Only search for the specified barcode formats
  // See ZebraCrossing.FORMAT for supported formats
  possibleFormats: [ 'AZTEC', 'QR_CODE' ],
}
```

`ZebraCrossing.read()` returns a Promise that resolves with a `{ raw, parsed, format, type, points }` object if a barcode was found or `null` if none was found. If `multi: true` was set in the options, it resolves with an array of result objects, or the empty array if no barcodes were found.


## A note on file paths

Because zxing's CLI only accepts file paths, buffers are written to a temporary file on disk before they're parsed. This means that you should *always* pass a file path if you can. Accepting buffers is just for your convenience.



[zxing]: https://github.com/zxing/zxing
[fp-note]: #a-note-on-file-paths
[jre]: http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html
