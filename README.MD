# GNA-Parser-JS
Converts GNA image file to ImageData


## GNA format image
GNA is an image file extension that is used on old Japanese PC (NEC PC-98) game "卒業(Sotsugyō)II 〜Neo Generation〜" released by JHV(Japan Home Video) in 1994.

This JavaScript code parses the GNA files and outputs them as ImageData.

## USAGE
Browser:
```
import * as GNA from './esm/gna.js';

async function test( file ) { //<File> (GNA file)
  const buffer = await file.arrayBuffer();
  const fileName = file.name;

  // generator
  cosnt gen = GNA.extract(buffer, fileName);

  // iterate to get an ImageData
  const imgList = [];
  for( const imgdat of gen ) {
    imgList.push(imgdat); // ImageData
  }

  return imgList;
}
```

Node:
```
const GNA = require('./cjs/gna.js');
...
```

## API
- `extract(buff: ArrayBuffer | Buffer, fname?: string, getAsRaw?: boolean): Generator<ImageData | GNAImageData>`
- `interface GNAImageData`
- `enum PalKeys {class1, class2, bustshot, kiba, obake, kissa, stage, level, op1, op2, op3}`
- `parseGNA(gnadat: ArrayBuffer, offset?: number ): GNAImageData`
- `parseBETA(pdat: ArrayBuffer, offset?: number): GNAImageData`
- `parsePlain(pdat: ArrayBuffer, width?: number, height?: number, offset?: number): GNAImageData`
- `iteratePlainImages(buffer: ArrayBuffer, width?: number, height?: number, count?: number, offset?: number): Generator<GNAImageData>`
- `seekImages(buffer: ArrayBuffer, offset?: number): Generator<GNAImageData>`
- `convertADPtoWAVE(buff: ArrayBuffer | Buffer): ArrayBufferLike`

## DEMO
https://gitcobra.github.io/gna-parser-js/browser/
