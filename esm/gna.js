/*
  GNA image format

  byte order: 16bit little endian
  header:
    h00-05: GNA signature (67,6E,61,00,0E)
    h06-07: image mode (1)transparent image with no palette (2)full-screen image with indivisual palette (3) black screen?
    h08-09: offset X
    h0A-0B: offset Y
    h0C-0D: width(*8)
    h0E-0F: height
    h10-11: transparent color
    h12-13: data size (* not pixel size. rounded up the first hexadecimal digit and shifted right by 4 bit)

    mode1:
    h14-**: data

    mode2:
    h14-43: palette data. 1 color by 3 bytes. R,G,B (0F,0F,0F)
    h44-**: data

  data:
    ピクセルの出力方法
      ピクセルの左上から真下へ横8ピクセルずつ最下位ビットのみ出力し、heightに達したら上に戻り対象を一つ上のビットへ移しOR演算で繰り返す
      これを計4回行う事で4ビット16色を表現する。
      1列4往復が終了したら8ピクセル右へ移動し、widthを超えるかdata終了までこれを繰り返す。

    対象ビット桁の順番
      1: 0001 | 2: 0010 |  3: 0100 | 4: 1000

    走査方法:
      dataを 1:コマンド 2:反復回数、[3:パターン(コマンド0x00,0x10のみ)] の順で1セットとし繰返し読み込む
      1バイトを8ビットの0,1パターンとし、対象ビットに対し一度に横8ピクセルずつ出力する

      コマンドと反復回数の読み込み方法:
        最小1、最大で3バイト読み込む
        0xAa 0xbb 0xcc の3バイトの並びを例に説明する
          Aの値でコマンドを決定し、残りを反復回数として解釈する
          aが0x1以上0xF以下の場合:    0x0a回
          aが0x0でbbが0x10以上の場合: 0xbb回
          aが0x0でbbが0x0F以下の場合: 0xbbcc回

    コマンド一覧:
      パターン出力
      0x0*: 後続の1バイトをパターンとして反復回数出力する
      0x1*: 反復回数*バイトの後続データを連続してパターンとして出力する

      コピー #unused?
      0x2*: 左隣列から同カラービットのパターンをheightに達するまでコピー。1バイトのみのコマンドで反復指定はなく、下位4ビットも無視される。

      チェック柄パターン出力
      ※一度に付き2ドットheight出力するため、出力データは反復回数*2となる
      0x3*: outputs check pattern 1
      0x4*: outputs check pattern 2
      0x5*: outputs check pattern 3
      0x6*: outputs check pattern 4
      0x7*: outputs check pattern 5

      特定カラービットからコピー
      特定のカラービットパターンを同列同位置から下へ向かって反復回数コピー、又は反転コピー
      ※対象ビット桁が処理前だった場合、前列(左隣)から読み取る
      0x8*: 対象ビット桁1(0001)? 1 : 0
      0x9*: 対象ビット桁2(0010)? 1 : 0
      0xA*: 対象ビット桁3(0100)? 1 : 0
      0xB*: 対象ビット桁1(0001)? 0 : 1 (反転)
      0xC*: 対象ビット桁2(0010)? 0 : 1 (反転)
      0xD*: 対象ビット桁3(0100)? 0 : 1 (反転)

      #unused?
      0xE*: 0x20と同じ?
      0xF*: 0x20と同じ?
*/
const CheckPattern = {
    3: 0x5500,
    4: 0xAA00,
    5: 0x55FF,
    6: 0xAAFF,
    7: 0xAA55,
};
const CopyPattern = {
    0x8: [1, 0xF],
    0x9: [2, 0xF],
    0xA: [4, 0xF],
    0xB: [1, 0x0],
    0xC: [2, 0x0],
    0xD: [4, 0x0]
};
export function parseGNA(gnadat, offset = 0) {
    const dv = new DataView(gnadat, offset);
    const dat = new Uint8Array(gnadat, offset);
    const bufferSize = gnadat.byteLength;
    const signature = String(dat.subarray(0, 5));
    if (signature !== String([0x67, 0x6E, 0x61, 0x00, 0x0E]))
        throw new Error(`wrong GNA signature: "${signature}"`);
    const gnaType = dv.getUint16(6, true);
    const offsetX = dv.getUint16(8, true);
    const offsetY = dv.getUint16(0x0A, true);
    const width = dv.getUint16(0x0C, true); // * 8
    const height = dv.getUint16(0x0E, true);
    const transparent = dv.getInt16(0x10, true);
    const dataSize = dv.getUint16(0x12, true) << 4;
    //console.log({ gnaType, offsetX, offsetY, width, height, transparent, dataSize });
    let pal;
    let datStartAt = 0;
    switch (gnaType) {
        case 2:
            pal = parsePalette(dv, 0x14);
            datStartAt = 0x44;
            break;
        case 1:
        case 3: // irregular
        case 0: // irregular
            datStartAt = 0x14;
            break;
        default:
            throw new Error(`unknown GNA Type (usually 1 or 2): ${gnaType}`);
    }
    const pix = new Uint8Array(width * 8 * height);
    let index = datStartAt;
    const commands = [];
    for (let column = 0; column < width; column++) {
        // parse 4bit color per 8 dot pattern * height (bit order: (0b)0001 -> 0010 -> 0100 -> 1000)
        for (let bit = 1; bit <= 8; bit <<= 1) {
            if (index >= bufferSize || index >= dataSize + datStartAt)
                break;
            for (let y = 0; y < height;) {
                const com = dv.getUint8(index++); // get next command
                const comid = com >> 4;
                const comarg = com & 0xF;
                // calculate command length
                let comlength = comarg;
                let pat = '';
                switch (comid) {
                    // copy from left column ( no parameter, repeat until reach height )
                    case 0x2:
                    case 0xE:
                    case 0xF:
                        comlength = height - y;
                        break;
                    // read successive bytes
                    default:
                        let byte1 = comarg;
                        let byte2 = 0;
                        let byte3 = 0;
                        if (byte1 === 0) {
                            //byte1 <<= 8;
                            byte2 = dv.getUint8(index++);
                            if (byte2 < 0x10) {
                                byte1 <<= 8;
                                byte2 <<= 8;
                                byte3 = dv.getUint8(index++);
                            }
                        }
                        comlength = byte1 | byte2 | byte3;
                        if (!(comlength >= 1))
                            throw new Error(`unexpected comlength: ${comlength}`);
                        if (comlength + y > height) {
                            console.log('comlength exceeded height: ${comlength}');
                            comlength = height - y;
                        }
                }
                // process commands
                switch (comid) {
                    // output normal pattern
                    case 0x0: {
                        const pattern = dv.getUint8(index++);
                        pat = pattern.toString(16);
                        if (pattern === 0) {
                            y += comlength;
                            break;
                        }
                        for (let i = 0; i < comlength; i++) {
                            for (let x = 0; x < 8; x++) {
                                if (pattern >> (7 - x) & 0x1) {
                                    let j = column * 8 + width * 8 * y + x;
                                    pix[j] |= bit;
                                }
                            }
                            y++;
                        }
                        break;
                    }
                    // successive patterns
                    case 1: {
                        for (let i = 0; i < comlength; i++) {
                            const pattern = dv.getUint8(index++);
                            for (let x = 0; x < 8; x++) {
                                if (pattern >> (7 - x) & 0x1) {
                                    let j = column * 8 + width * 8 * y + x;
                                    pix[j] |= bit;
                                }
                            }
                            y++;
                        }
                        break;
                    }
                    // put check patterns
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7: {
                        const checkpat = CheckPattern[comid];
                        for (let i = 0; i < comlength; i++) {
                            for (let j = 0; j < 2; j++) {
                                const p = (checkpat >> 8 - j * 8) & 0xFF;
                                for (let x = 0; x < 8; x++) {
                                    if (p >> 7 - x & 0x1) {
                                        let pind = column * 8 + width * 8 * y + x;
                                        pix[pind] |= bit;
                                    }
                                }
                                y++;
                            }
                        }
                        break;
                    }
                    // duplicate patterns from specified previous bit
                    case 0x8: // 0001
                    case 0x9: // 0010
                    case 0xA: // 0100
                    case 0xB: // 0001 (flip)
                    case 0xC: // 0010 (flip)
                    case 0xD: { // 0100 (flip)
                        const copyBit = CopyPattern[comid][0];
                        const output = CopyPattern[comid][1];
                        const leftside = (copyBit >= bit) ? -8 : 0;
                        for (let i = 0; i < comlength; i++) {
                            for (let x = 0; x < 8; x++) {
                                const pind = column * 8 + width * 8 * y + x;
                                const prevcol = pix[pind + leftside];
                                pix[pind] |= (prevcol & copyBit ? output : ~output) & bit;
                            }
                            y++;
                        }
                        break;
                    }
                    // copy from the left column (no parameter)
                    case 0x2:
                    case 0xE:
                    case 0xF: {
                        for (; y < height; y++) {
                            for (let x = 0; x < 8; x++) {
                                const pind = column * 8 + width * 8 * y + x;
                                const leftCol = pix[pind];
                                pix[pind] |= leftCol & bit;
                            }
                        }
                        break;
                    }
                    default:
                        throw new Error('unexpected error: ' + com.toString(16));
                }
                commands.push({ id: comid, bit, len: comlength * (comid >= 3 && comid <= 7 ? 2 : 1), pattern: pat, index, column, y });
                if (comid === 0x2 || comid === 0xF || comid === 0xE) {
                    console.log({ comid, comarg, pat });
                }
            }
        }
    }
    return {
        data: pix,
        length: index,
        gnaType,
        offsetX: offsetX * 8,
        offsetY,
        width: width * 8,
        height,
        transparent,
        gnaSize: dataSize,
        palette: pal,
        //commands
        _commands: commands
    };
}
/**
 * Palette Key Names
 * @enum {number}
 */
export var PalKeys;
(function (PalKeys) {
    PalKeys[PalKeys["class1"] = 0] = "class1";
    PalKeys[PalKeys["class2"] = 1] = "class2";
    PalKeys[PalKeys["bustshot"] = 2] = "bustshot";
    PalKeys[PalKeys["kiba"] = 3] = "kiba";
    PalKeys[PalKeys["obake"] = 4] = "obake";
    PalKeys[PalKeys["kissa"] = 5] = "kissa";
    PalKeys[PalKeys["stage"] = 6] = "stage";
    PalKeys[PalKeys["level"] = 7] = "level";
    PalKeys[PalKeys["op1"] = 8] = "op1";
    PalKeys[PalKeys["op2"] = 9] = "op2";
    PalKeys[PalKeys["op3"] = 10] = "op3";
})(PalKeys || (PalKeys = {}));
const Palettes = new Map([
    // class room
    [PalKeys.class1, new Uint32Array([0, 16768443, 16759705, 12285798, 15641207, 3377220, 12303291, 8943479, 4491519, 7816396, 15602073, 16755387, 7855377, 10070783, 16777062, 16777215])],
    [PalKeys.class2, new Uint32Array([0, 16768443, 16759705, 12285798, 15641207, 3377220, 12303291, 8943479, 102, 7816396, 15602073, 16755387, 7855377, 10070783, 16777062, 16777215])],
    // with bust shot characters (teachers' office, street)
    [PalKeys.bustshot, new Uint32Array([0, 16768443, 16759705, 12285798, 15641207, 3377220, 11141239, 8943479, 102, 7816396, 15602073, 16755387, 7855377, 10070783, 16777062, 16777215])],
    [PalKeys.kiba, new Uint32Array([0, 16768443, 16711935, 8930372, 16759705, 8939110, 11180441, 43571, 12307711, 7825151, 16724889, 16751018, 14522760, 14518340, 16772710, 16777215])],
    [PalKeys.obake, new Uint32Array([0, 15649962, 14522743, 10048836, 15636804, 3377220, 12298922, 7824998, 5588036, 6702284, 15602022, 16751018, 7855377, 10070783, 16777062, 16777215])],
    [PalKeys.kissa, new Uint32Array([0, 16768443, 16759705, 12285798, 15641207, 3377220, 12303291, 8943479, 4491519, 7816396, 15602073, 16755387, 7855377, 10070783, 16777062, 16777215])],
    [PalKeys.stage, new Uint32Array([0, 16768443, 16759705, 12281429, 15636821, 4491315, 12294553, 6706517, 7846911, 7812078, 16724838, 16751018, 11197747, 4465288, 16772676, 16777215])],
    [PalKeys.level, new Uint32Array([0, 10066380, 12259703, 8956569, 16751035, 16750933, 16772795, 12281446, 1157870, 4487014, 6723925, 16711680, 10074999, 3355528, 16776960, 16777215])],
    // title logo palettes
    [PalKeys.op1, new Uint32Array([0, 16777215, 16777164, 16772761, 15649894, 14527061, 5588087, 8939178, 10062011, 13417454, 7851127, 4469589, 3351057, 7824947, 5588002, 16777215])],
    [PalKeys.op2, new Uint32Array([0, 16777215, 15658751, 13421823, 10066431, 6711039, 5588087, 8939178, 10062011, 13417454, 7851127, 4469589, 3351057, 7824947, 5588002, 16777215])],
    [PalKeys.op3, new Uint32Array([0, 16777215, 16768443, 16759688, 16750933, 15628100, 5588087, 8939178, 10062011, 13417454, 7851127, 4469589, 3351057, 7824947, 5588002, 16777215])],
]);
const PaletteFileTable = new Map([
    [/^SD[NS]?\.P|\.EXE$|^TOURNEY\.GNA|^SAKURA|^BINSEN|^SEKIBAN|^CHARA\.P|^G2FRAME/i, PalKeys.class1],
    [/KIBA\d+\.P|KIBALOSE\.GNA|KIBAWIN\.GNA/i, PalKeys.kiba],
    [/OBAKE.+\.P/i, PalKeys.obake],
    [/KISSA\.P/i, PalKeys.kissa],
    [/^LOMIO.*\.(P|GNA)$|ALICE\.P|SAILOR\.P|ALICE_B\.GNA/i, PalKeys.stage],
    [/LEVEL[1-9]+\.GNA/i, PalKeys.level],
    [/^M_.+\.GNA|^G2FS_/i, PalKeys.bustshot],
]);
//const parsedPalettes: Map<PalKeys, Uint32Array> = new Map;
export function getPalette(key) {
    if (!Palettes.has(key))
        throw new Error(`unexpected Palette key "${key}"  keylist: ${Palettes.keys()}`);
    return Palettes.get(key);
    /*
    if( parsedPalettes.has(key) )
      return parsedPalettes.get(key)!;
  
    const pal = parsePalette(new DataView((<Uint8Array>Palettes.get(key)).buffer));
    parsedPalettes.set(key, pal);
    return pal;
    */
}
export function parsePalette(dv, offset = 0) {
    const pal = new Uint32Array(16);
    if (dv instanceof Uint8Array)
        dv = new DataView(dv.buffer, offset);
    for (let i = 0; i < 16; i++) {
        let r = dv.getUint8(offset + i * 3);
        r = r << 4 | r;
        let g = dv.getUint8(offset + i * 3 + 1);
        g = g << 4 | g;
        let b = dv.getUint8(offset + i * 3 + 2);
        b = b << 4 | b;
        pal[i] = r << 16 | g << 8 | b;
        //console.log( r, g, b );
    }
    return pal;
}
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
export function parseBETA(pdat, offset = 0) {
    const dv = new DataView(pdat, offset);
    const dat = new Uint8Array(pdat, offset);
    const signature = String(dat.subarray(0, 4));
    if (signature !== String([0x62, 0x65, 0x74, 0x61])) // "beta"
        throw new Error(`wrong beta signature: "${signature}"`);
    const offsetX = dv.getUint16(4, true); // offset x
    const offsetY = dv.getUint16(6, true); // offset y
    const width = dv.getUint16(0x08, true); // * 8
    const height = dv.getUint16(0x0A, true);
    const hoge1 = dv.getUint16(0x0C, true); // always 2?
    const hoge2 = dv.getUint16(0x0E, true); // always FFFF?
    const transparent = dv.getInt16(0x10, true);
    const pix = new Uint8Array(width * 8 * height);
    let index = 0;
    const length = width * 8 * height / 2;
    let bit = 0;
    let pindex = 0;
    for (let i = 0x20; i < length + 0x20; i++) {
        let d = dat[i];
        for (let j = 0; j < 8; j++) {
            pix[pindex + j] |= (d >> 7 - j & 0x1) << (bit);
        }
        if (++bit > 3) {
            bit = 0;
            pindex += 8;
        }
    }
    return {
        data: pix,
        length,
        gnaSize: -1,
        gnaType: -1,
        offsetX: offsetX * 8,
        offsetY,
        width: width * 8,
        height,
        transparent,
        palette: null,
        _commands: null
    };
}
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
export function parsePlain(pdat, width = 8, height = 64, offset = 0) {
    const dv = new DataView(pdat, offset);
    const dat = new Uint8Array(pdat, offset);
    //const pal = parsePalette(new DataView(KibaPalette.buffer));
    const pix = new Uint8Array(width * 8 * height);
    const pixLen = pix.byteLength;
    let index = 0;
    const byteLen = width * height;
    let bit = 0;
    let pindex = 0;
    let i = 0;
    for (let bit = 0; bit <= 3; bit++) {
        for (let pi = 0; pi < pixLen / 8; pi++) {
            let d = dat[i++];
            for (let j = 0; j < 8; j++) {
                pix[pi * 8 + j] |= (d >> 7 - j & 0x1) << (bit);
            }
        }
    }
    return {
        data: pix,
        length: byteLen * 4,
        gnaSize: -1,
        palette: null,
        gnaType: -1,
        offsetX: -1,
        offsetY: -1,
        width: width * 8,
        height,
        transparent: 7,
        _commands: null
    };
}
export function* iteratePlainImages(buffer, width = 14, height = 128, count, offset = 0) {
    count = count || (buffer.byteLength - offset) / (width * height * 4) | 0;
    for (let i = 0; i < count; i++) {
        const result = parsePlain(buffer, width, height, offset);
        offset += result.length;
        yield result;
    }
}
/**
* seeks and picks GNA images or BETA images from buffer
* @param {ArrayBuffer} pdat
* @param {number} [offset=0]
* @return {*}  {Object}
*/
export function* seekImages(buffer, offset = 0) {
    const dv = new DataView(buffer);
    const dat = new Uint8Array(buffer);
    const length = buffer.byteLength;
    const Signs = {
        'gna': [0x67, 0x6E, 0x61, 0x00, 0x0E],
        'beta': [0x62, 0x65, 0x74, 0x61]
    };
    for (let i = 0; i < length; i++) {
        const firstBin = dat[i];
        for (const name in Signs) {
            const s = Signs[name];
            if (firstBin !== s[0])
                continue;
            let j = 1;
            for (; j < s.length; j++) {
                if (s[j] !== dat[i + j])
                    break;
            }
            if (j !== s.length)
                continue;
            // found signature
            try {
                let result = null;
                switch (name) {
                    case 'gna':
                        result = parseGNA(buffer, i);
                        break;
                    case 'beta':
                        result = parseBETA(buffer, i);
                        break;
                }
                //console.log(`found at ${i.toString(16)}, next start:${(i + result.length).toString(16)}`);
                if (result) {
                    yield result;
                    i += result.length - 1;
                }
            }
            catch (e) {
                console.log(e + ` offset: ${i.toString(16)}`);
            }
            break;
        }
    }
}
/**
 *
 * picks proper images and palettes automatically by file name
 * @export
 * @param {ArrayBuffer | Buffer} buff
 * @param {string} [fname=''] file name to decide palette and parsing method
 * @param {boolean} [getAsRaw] returns as a 16 colors bit map
 * @return {ImageData | GNAImageData} {Generator<[Uint32Array, ImageData, GNAImageData, string]>}
 */
export function* extract(buff, fname = '', getAsRaw = false) {
    let palkey;
    let foundPalette;
    for (const [re, pkey] of PaletteFileTable) {
        if (re.test(fname)) {
            palkey = pkey;
            foundPalette = true;
            break;
        }
    }
    if (typeof palkey === 'undefined')
        palkey = PalKeys.class2;
    // create palette
    const selectedPalette = getPalette(palkey);
    // patch for "E_YA01CZ.GNA"
    // 最初のデータのビットパターンが何故かFFではなく7Fになっており左端に黄色い縦線が入るためFFに修正
    if (/E_YA01CZ\.GNA/i.test(fname)) {
        const dv = new DataView(buff);
        if (dv.getUint32(0x44) === 0x0001907F)
            dv.setUint32(0x44, 0x000190FF);
    }
    // kiba[0-9].p はヘッダの存在しないプレーンデータが先頭にあるため特別なパースが必要
    if (/^KIBA.+\.P$/i.test(fname)) {
        for (const dat of iteratePlainImages(buff)) {
            dat.recommendedPalKey = PalKeys.kiba;
            yield getAsRaw ? dat : convertToImageData(dat);
        }
    }
    let count = 0;
    for (const dat of seekImages(buff)) {
        count++;
        if (!dat.palette) {
            dat.recommendedPalKey = palkey;
            if (!foundPalette)
                console.log('"' + fname + `" is unexpected file name, using "${PalKeys[palkey]}" palette.`);
        }
        // CHARA.Pは一部だけKIBAパレットを使用しているため特別にkibaパレットを用意する
        if (/CHARA\.P/i.test(fname) && count >= 47 && count <= 60) {
            dat.recommendedPalKey = PalKeys.kiba;
        }
        yield getAsRaw ? dat : convertToImageData(dat);
        // タイトル画像はパレットが複数用意されてるようなので一応それも出力
        if (/^NEOTITLE\.GNA/i.test(fname)) {
            for (const pkey of [PalKeys.op1, PalKeys.op2, PalKeys.op3]) {
                Object.assign(dat, { recommendedPalKey: pkey });
                yield getAsRaw ? dat : convertToImageData(dat);
            }
        }
    }
}
export function convertToImageData(dat, pal) {
    const pix = dat.data;
    const { width, height, transparent } = dat;
    // check palette
    let palette = dat.palette;
    if (typeof pal !== 'undefined') {
        if (pal instanceof Uint32Array)
            palette = pal;
        else
            palette = getPalette(pal);
    }
    else {
        let recpal = dat.recommendedPalKey;
        if (recpal >= 0)
            palette = getPalette(recpal);
    }
    if (!palette)
        throw new Error('the gna does not have a palette. specify any palette.');
    let imgdat;
    if (typeof ImageData !== 'undefined')
        imgdat = new ImageData(width, height);
    else {
        imgdat = { width, height, data: new Uint8ClampedArray(width * height * 4) };
    }
    let idat = imgdat.data;
    for (let y = 0; y < dat.height; y++) {
        for (let x = 0; x < dat.width; x++) {
            const c = pix[width * y + x];
            const p = palette[c];
            idat[y * width * 4 + x * 4] = p >> 16;
            idat[y * width * 4 + x * 4 + 1] = p >> 8 & 0xFF;
            idat[y * width * 4 + x * 4 + 2] = p & 0xFF;
            idat[y * width * 4 + x * 4 + 3] = transparent === c ? 0 : 0xFF;
        }
    }
    return imgdat;
}
export function convertADPtoWAVE(buff) {
    const length = buff.byteLength;
    const outbuff = new Uint8Array(44 + length);
    // header
    const dv = new DataView(outbuff.buffer);
    outbuff.set([...'RIFF'].map(s => s.charCodeAt(0)), 0);
    dv.setUint32(4, length + 32, true); // chunk size
    outbuff.set([...'WAVE'].map(s => s.charCodeAt(0)), 8);
    outbuff.set([...'fmt '].map(s => s.charCodeAt(0)), 12);
    dv.setUint32(16, 16, true); // fmt chunk size
    dv.setUint16(20, 1, true); // format
    dv.setUint16(22, 1, true); // channel
    dv.setUint32(24, 8000, true); // sampling rate
    dv.setUint32(28, 8000, true); // data rate
    dv.setUint16(32, 1, true); // data block size
    dv.setUint16(34, 8, true); // bits per sample
    outbuff.set([...'data'].map(s => s.charCodeAt(0)), 36);
    dv.setUint32(40, length, true); // data length
    //outbuff.set(new Uint8Array(buff), 44);
    // data:
    // signed int8(ADP) => unsigned int8
    const source = new Int8Array(buff);
    for (let i = 0, l = source.length; i < l; i++) {
        let val = source[i];
        outbuff[44 + i] = val + 128;
    }
    return outbuff.buffer;
}
//# sourceMappingURL=gna.js.map