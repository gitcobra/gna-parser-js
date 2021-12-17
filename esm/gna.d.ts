/// <reference types="node" />
export interface GNAImageData {
    data: Uint8Array;
    palette: Uint32Array | null;
    recommendedPalKey?: PalKeys;
    length: number;
    width: number;
    height: number;
    gnaType: number;
    gnaSize: number;
    offsetX: number;
    offsetY: number;
    transparent: number;
    _commands: Object | null;
}
export declare function parseGNA(gnadat: ArrayBuffer, offset?: number): GNAImageData;
/**
 * Palette Key Names
 * @enum {number}
 */
export declare enum PalKeys {
    class1 = 0,
    class2 = 1,
    bustshot = 2,
    kiba = 3,
    obake = 4,
    kissa = 5,
    stage = 6,
    level = 7,
    op1 = 8,
    op2 = 9,
    op3 = 10
}
export declare function getPalette(key: PalKeys): Uint32Array;
export declare function parsePalette(dv: DataView | Uint8Array, offset?: number): Uint32Array;
/**
 * parseBETA: parse uncompressed pixel data (非圧縮ベタデータ)
 *  header: (little endian)
 *    h00-03: signature "beta"
 *    h04-05: offset X?
 *    h06-07: offset Y?
 *    h08-09: width
 *    h0A-0B: height
 *    h0C-0D: always 0x0200?
 *    h0E-0F: always 0xFFFF?
 *    h10-11: transparent color
 *    h12-19: always 0?
 *    h20-**: data
 *  data:
 *    1: 1バイトを8ドットのビットパターンとする
 *    2: 横8ピクセルに対して下位ビットから4回OR出力し16色を表現する
 *    3: これをピクセル左上から8ドットずつ右へデータ終端まで繰り返す
 *
 * @export
 * @param {ArrayBuffer} pdat
 * @param {number} [offset=0]
 * @return {*}  {Object}
 */
export declare function parseBETA(pdat: ArrayBuffer, offset?: number): GNAImageData;
/**
 * parsePlain:
 * 非圧縮データ (KIBA[0-9].Pのみ?) betaとはカラービットごとのパースの仕方が異なる
 * ヘッダはなくファイル先頭から特定位置まで16色ピクセルデータに変換する
 * 1: 1バイトを8ドットのビットパターンとする
 * 2: 左上から右へ、データ終端まで8ドットずつ対象ビットにOR出力する
 * 3: これを下位ビットから4回繰返し4ビット16色を表現する
 * @export
 * @param {ArrayBuffer} pdat
 * @param {number} [width=8]
 * @param {number} [height=64]
 * @param {number} [offset=0]
 * @return {*}
 */
export declare function parsePlain(pdat: ArrayBuffer, width?: number, height?: number, offset?: number): GNAImageData;
export declare function iteratePlainImages(buffer: ArrayBuffer, width?: number, height?: number, count?: number, offset?: number): Generator<GNAImageData>;
/**
* seeks and picks GNA images or BETA images from buffer
* @param {ArrayBuffer} pdat
* @param {number} [offset=0]
* @return {*}  {Object}
*/
export declare function seekImages(buffer: ArrayBuffer, offset?: number): Generator<GNAImageData>;
/**
 *
 * picks proper images and palettes automatically by file name
 * @export
 * @param {ArrayBuffer | Buffer} buff
 * @param {string} [fname=''] file name to decide palette and parsing method
 * @param {boolean} [getAsRaw] returns as a 16 colors bit map
 * @return {ImageData | GNAImageData} {Generator<[Uint32Array, ImageData, GNAImageData, string]>}
 */
export declare function extract(buff: ArrayBuffer | Buffer, fname?: string, getAsRaw?: boolean): Generator<ImageData | GNAImageData>;
export declare function convertToImageData(dat: GNAImageData, pal?: Uint32Array | PalKeys): ImageData;
export declare function convertADPtoWAVE(buff: ArrayBuffer | Buffer): ArrayBufferLike;
