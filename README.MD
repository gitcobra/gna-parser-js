# GNA Parser
Converts GNA image to ImageData


## What GNA format is ##
GNA image format is used on "卒業(Sotsugyō)II 〜Neo Generation〜" that is an old Japanese PC (NEC PC-98) game released by JHV(Japan Home Video) in 1994.

## USAGE ##
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

## API ##
- `interface GNAImageData`
- `enum PalKeys {class1, class2, bustshot, kiba, obake, kissa, stage, level, op1, op2, op3}`
- `parseGNA(gnadat: ArrayBuffer, offset?: number ): GNAImageData`
- `getPalette(key: PalKeys): Uint32Array`
- `parsePalette(dv: DataView | Uint8Array, offset?: number): Uint32Array`
- `parseBETA(pdat: ArrayBuffer, offset?: number): GNAImageData`
- `parsePlain(pdat: ArrayBuffer, width?: number, height?: number, offset?: number): GNAImageData`
- `iteratePlainImages(buffer: ArrayBuffer, width?: number, height?: number, count?: number, offset?: number): Generator<GNAImageData>`
- `seekImages(buffer: ArrayBuffer, offset?: number): Generator<GNAImageData>`
- `convertToImageData(dat: GNAImageData, pal?: Uint32Array | PalKeys): ImageData`
- `convertADPtoWAVE(buff: ArrayBuffer | Buffer): ArrayBufferLike`
- `extract(buff: ArrayBuffer | Buffer, fname?: string, getAsRaw?: boolean): Generator<ImageData | GNAImageData>`

## DEMO ##
https://gitcobra.github.io/gna-parser/browser/

You can convert all game images to PNG format on the page.
