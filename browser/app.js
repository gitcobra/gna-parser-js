var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as GNA from '../esm/gna.js';
/* @ts-ignore  # to suppress typescript errors */
var AnZip = function () { "object" == typeof exports && (module.exports = AnZip); for (var UseTA = "undefined" != typeof Uint8Array, A8 = UseTA ? Uint8Array : Array, CRC32Table = new (UseTA ? Uint32Array : Array)(256), i = 0; i < 256; i++) {
    for (var val = i, j = 0; j < 8; j++)
        val = 1 & val ? 3988292384 ^ val >>> 1 : val >>> 1;
    CRC32Table[i] = val;
} function strToUTF8(str) { var a = []; return encodeURIComponent(str).replace(/%(..)|(.)/g, function (m, $1, $2) { a.push($1 ? parseInt($1, 16) : $2.charCodeAt(0)); }), UseTA ? new A8(a) : a; } function getLE32(num) { return [255 & num, num >> 8 & 255, num >> 16 & 255, num >> 24 & 255]; } function AnZip() { this._d = {}, this._lfh = [], this._curLFHind = 0, this._cdh = [], this._cdhLen = 0, this._c = 0; } return AnZip.prototype = { add: function (path, dat) { if (!path)
        throw new Error("path is empty"); if (path = String(path).replace(/\\/g, "/"), /\/{2,}|\\|^\/|^[a-z]+:/i.test(path))
        throw new Error('invalid path. containing a drive letter, a leading slash, or empty directory name: "' + path + '"'); var size = 0, crc = 0; if (void 0 !== dat) {
        if (!/[^/]+$/.test(path))
            throw new Error('needs a file name: "' + path + '"');
        if (!((dat = "string" == typeof dat ? strToUTF8(dat) : dat) instanceof A8))
            try {
                if (!(dat.buffer || dat instanceof Array || dat instanceof ArrayBuffer || dat instanceof Buffer))
                    throw new Error;
                dat = new Uint8Array(dat.buffer || dat);
            }
            catch (e) {
                throw new Error("data must be one of type Array, TypedArray, ArrayBuffer, Buffer, or string.");
            }
        if (this.has(path))
            throw new Error("the file already exists: " + path);
        size = dat.length, crc = function (dat) { for (var crc = 4294967295, i = 0, len = dat.length; i < len; i++)
            crc = CRC32Table[255 & (crc ^ dat[i])] ^ crc >>> 8; return (4294967295 ^ crc) >>> 0; }(dat);
    } for (var d = new Date, date = getLE32(d.getFullYear() - 1980 << 25 | d.getMonth() + 1 << 21 | d.getDate() << 16 | d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() / 2), dirs = path.replace(/\/+$/, "").split("/"), pathstack = ""; dirs.length;) {
        pathstack += dirs.shift();
        var pathbin, pathLen, dsize, dup, isFile = dat && 0 === dirs.length;
        pathstack += isFile ? "" : "/", this._d[pathstack] || (this._d[pathstack] = !0, this._c++, pathLen = (pathbin = strToUTF8(pathstack)).length, dup = getLE32(dsize = isFile ? size : 0), this._lfh.push([80, 75, 3, 4]), dup = [10, 0, 0, 8, 0, 0].concat(date, getLE32(isFile ? crc : 0), dup, dup, [255 & pathLen, pathLen >> 8 & 255, 0, 0]), this._lfh.push(dup, pathbin), this._cdh.push([80, 75, 1, 2, 10, 0].concat(dup, [0, 0, 0, 0, 0, 0, isFile ? 0 : 16, 0, 0, 0], getLE32(this._curLFHind)), pathbin), this._cdhLen += 46 + pathLen, this._curLFHind += 30 + pathLen + dsize);
    } dat && this._lfh.push(dat); }, has: function (path) { return !!this._d[path.replace(/\/+$/, "")]; }, zip: function () { var ecd = [80, 75, 5, 6, 0, 0, 0, 0, 255 & this._c, this._c >> 8, 255 & this._c, this._c >> 8].concat(getLE32(this._cdhLen), getLE32(this._curLFHind), [0, 0]), arrayChain = this._lfh.concat(this._cdh, [ecd]); if (A8 === Array)
        output = [].concat.apply([], arrayChain);
    else
        for (var offset = 0, output = new A8(this._curLFHind + this._cdhLen + ecd.length), i = 0; i < arrayChain.length; i++) {
            var n = arrayChain[i];
            output.set(n, offset), offset += n.length;
        } return output; } }, AnZip; }();
/*
function playVoiceByImageName(filename) {
  let buff;
  let match = /(E_..01)CZ\.GNA/i.exec(filename);
  if( match )
    buff = soundMap.get(match[1]+'_2.ADP') || soundMap.get(match[1]+'_3.ADP');

  match = /(EV_..)(\d)\.GNA/i.exec(filename);
  if (match)
    buff = soundMap.get(match[1] + '0' + match[2] + '.ADP');

  match = /(M_..01)C.GNA/i.exec(filename);
  if (match)
    buff = soundMap.get(match[1] + '_1.ADP') || soundMap.get(match[1] + '_2.ADP');

  match = /(BEST|NOBEST).GNA/i.exec(filename);
  if (match)
    buff = soundMap.get('U_'+match[1] + '.ADP');

  match = /(SEA).GNA/i.exec(filename);
  if (match)
    buff = soundMap.get(match[1] + '.ADP');

  match = /KIBA0\.P/i.exec(filename);
  if (match)
    buff = soundMap.get('U_IS_K9.ADP');

  match = /KIBA1\.P/i.exec(filename);
  if (match)
    buff = soundMap.get('U_IN_K.ADP');

  match = /KIBA2\.P/i.exec(filename);
  if (match)
    buff = soundMap.get('U_SI_K.ADP');

  match = /KIBA3\.P/i.exec(filename);
  if (match)
    buff = soundMap.get('U_TA_K.ADP');

  match = /KIBA4\.P/i.exec(filename);
  if (match)
    buff = soundMap.get('U_YA_K.ADP');

  //if( buff )
  //  addWave(buff);
}
*/
const ADPtoGNApairMap = new Map([
    [/^(E_..01)_[\d]\.ADP/i, '$1CZ.GNA'],
    [/^(EV_..)0(\d)\.ADP/i, '$1$2.GNA'],
    [/^(M_..01)_\d\.ADP/i, '$1C.GNA'],
    [/^U_(BEST|NOBEST).ADP/i, '$1.GNA'],
    [/SEA\.ADP/i, 'SEA.GNA'],
    [/U_IS_K9\.ADP/i, 'KIBA0.P'],
    [/U_IN_K\.ADP/i, 'KIBA1.P'],
    [/U_SI_K\.ADP/i, 'KIBA2.P'],
    [/U_TA_K\.ADP/i, 'KIBA3.P'],
    [/U_YA_K\.ADP/i, 'KIBA4.P']
]);
const MessageLeftMargin = {
    IS: [0, 1, 0, 0, 1, 0, 0, 0, 0],
    IN: [1, 1, 0, 1, 0, 1, 0, 0, 0],
    SI: [1, 0, 1, 1, 1, 0, 0, 0, 0],
    TA: [1, 1, 1, 0, 0, 0, 1, 1, 0],
    YA: [1, 0, 1, 1, 1, 1, 1, 0, 1]
};
function parseMessageData(buffer) {
    const tdecoder = new TextDecoder('shift-jis');
    var list = tdecoder.decode(buffer).split(/\0\0/);
    if (list.length !== 135 && list.length !== 136)
        throw new Error(`unexpected ENDING.DAT: wrong length ${list.length}`);
    return list;
}
function sortEndMessages(messages, method) {
    // base 5chr * 9job * 3fav
    const Len = { chr: 5, job: 9, fav: 3 }; // length
    const Inc = { chr: 27, job: 3, fav: 1 }; // increment
    const Nam = ['IS', 'IN', 'SI', 'TA', 'YA'];
    const order = method.split('-');
    if (!/^(chr|job|fav),(chr|job|fav),(chr|job|fav)$/.test(order))
        throw new Error('unexpected method:' + method);
    const len1 = Len[order[0]];
    const len2 = Len[order[1]];
    const len3 = Len[order[2]];
    const inc1 = Inc[order[0]];
    const inc2 = Inc[order[1]];
    const inc3 = Inc[order[2]];
    const map = new Map();
    for (let o1 = 0; o1 < len1; o1++) {
        const i1 = inc1 * o1;
        for (let o2 = 0; o2 < len2; o2++) {
            const i2 = inc2 * o2;
            for (let o3 = 0; o3 < len3; o3++) {
                const index = i1 + i2 + inc3 * o3;
                const chr = index / 27 | 0;
                const name = Nam[chr];
                const fav = index % 3; // 0-2 fav level
                const job = index % 27 / 3 | 0; // job
                const label = name + ":" + fav + ":" + (/^『[^』]+』/.exec(messages[index]) || {})[0];
                map.set(label, String([name, chr, job, fav, index]));
            }
        }
    }
    return map;
}
function bufferToDataURI(buff, type) {
    type = type || 'image/png';
    let blob = new Blob([buff], { type: type });
    let src = (window.URL || window.webkitURL).createObjectURL(blob);
    return src;
}
function convertToPNG(img) {
    return UPNG.encode([img.data.buffer], img.width, img.height, 16);
}
function convertToPNGasync(img) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            setTimeout(() => resolve(convertToPNG(img)), 0);
        });
    });
}
function getGNAUnusedColors(gna) {
    let unusedColor = 0xFFFF; // 0b 1111 1111 1111 1111
    const dat = gna.data;
    dat.forEach(val => unusedColor &= ~(1 << val));
    const unusedList = [];
    for (let i = 0; i < 16; i++) {
        unusedList[i] = unusedColor & (1 << i);
    }
    return unusedList;
}
// components
const SoundPlayer = {
    template: `
    <div style="display:flex; flex-wrap: wrap;">
        <div>
          <select @change="onchange" ref="list" v-model="value">
              <option v-if="!sounds.size" disabled value=""><slot></slot></option>
              <option v-else value="" disabled>Choose a sound</option>
              <option v-for="[key, val] in [...sounds]">{{key}}</option>
          </select>
        </div>
        <div style="display:flex;">
          <div>
            <button @click="play" :disabled="!sounds.size">⏵</button>
            <button @click="stop" :disabled="!sounds.size">⏹</button>
          </div>
          <div>
            <span style="display:inline-block; text-align:center; width:1.5em; font-size:1em; cursor:pointer;" :style="'opacity:'+(sounds.size? 1 : 0.3)" @click="switchMute">{{isMute? '🔇':'🔈'}}</span>
            <input :disabled="!sounds.size" v-model.number="volumeDat" type="range" min="0" max="1" step="0.01" style="width:50px;">
          </div>
        </div>
    </div>
  `,
    emits: ['change', 'play', 'stop', 'vibrate'],
    props: {
        sounds: Map,
        default: String,
        mute: Boolean,
        volume: {
            type: String,
            default: '0.1',
        }
    },
    beforeCreate() {
        this.actx = new AudioContext();
        this.gainNode = this.actx.createGain();
        this.gainNode.connect(this.actx.destination);
        this.analyserNode = this.actx.createAnalyser();
        this.analdata = new Uint8Array(this.analyserNode.fftSize);
        this.currentAudio = null;
        this.id = 1;
        this.intervalId;
        this.vibrating = false;
    },
    mounted() {
        //this.volume = 0.1;
        this.volumeDat = this.volume;
        this.isMute = !!this.mute;
    },
    data() {
        return {
            isMute: false,
            value: '',
            volumeDat: 0.1,
        };
    },
    methods: {
        switchMute() {
            if (this.isMute = !this.isMute)
                this.gainNode.gain.value = 0;
            else
                this.gainNode.gain.value = this.volume;
        },
        onchange() {
            this.$emit('change', this.value);
            this.play();
        },
        play() {
            if (!this.value)
                return;
            const key = this.$refs.list.value;
            const wavebuf = this.sounds.get(key);
            this.actx.decodeAudioData(wavebuf.slice(0)).then(audioBuffer => {
                const audioSource = this.actx.createBufferSource();
                audioSource.buffer = audioBuffer;
                this.duration = audioBuffer.duration;
                this.startTime = this.actx.currentTime;
                audioSource.connect(this.analyserNode);
                this.analyserNode.connect(this.gainNode);
                if (this.currentAudio) {
                    this.vibrating = false;
                    this.currentAudio.stop();
                }
                this.currentAudio = audioSource;
                // listen end event
                const idForStop = this.id;
                audioSource.addEventListener('ended', () => {
                    this.$emit('stop', key, idForStop);
                    if (this.id === idForStop)
                        clearInterval(this.intervalId);
                });
                // check vibration
                clearInterval(this.intervalId);
                this.intervalId = this.intervalId = setInterval(() => {
                    const dat = this.analyserNode.getByteTimeDomainData(this.analdata);
                    let quiet = this.analdata.every(val => val === 128);
                    if (quiet && this.vibrating) {
                        this.vibrating = false;
                        this.$emit('vibrate', false);
                    }
                    else if (!quiet && !this.vibrating) {
                        this.vibrating = true;
                        this.$emit('vibrate', true);
                    }
                }, 100);
                // start
                this.$emit('play', key, this.id, this.duration);
                audioSource.start();
                this.id++;
            });
        },
        stop() {
            if (this.currentAudio) {
                this.currentAudio.stop();
                this.vibrating = false;
                this.$emit('vibrate', false);
            }
        },
        getTimeRate() {
            return (this.actx.currentTime - this.startTime) / this.duration;
        },
    },
    watch: {
        volume(val) {
            val = Number(val) || 0;
            this.volumeDat = val;
        },
        volumeDat(val) {
            this.gainNode.gain.value = val;
        },
        sounds: {
            handler() {
                if (!this.sounds.size)
                    this.value = '';
            },
            deep: true
        }
    }
};
const LogSmoothScroll = {
    template: `
    <div key="log" style="position:relative; border:1px dotted black; overflow-y:scroll; height:100px;" ref="logcontainer">
      <template v-for="(l, i) in log">
        <div v-if="hoge=/^___#ERROR___(.+)/.exec(l)" :key="'err'+i" style="color:red">{{hoge[1]}}</div>
        <div v-else :key="'log'+i">{{l}}</div>
      </template>
    </div>
  `,
    props: [
        'log'
    ],
    watch: {
        log: {
            handler() {
                cancelAnimationFrame(this.logScrollTimeoutId);
                this.logScrollTimeoutId = requestAnimationFrame(() => {
                    const div = this.$refs.logcontainer;
                    const rect = div.getBoundingClientRect();
                    this.leftScrollCount = 30;
                    this.scrollStart = div.scrollTop;
                    this.scrollAmount = div.scrollHeight - rect.height - div.scrollTop + 2;
                    this.scroll();
                });
            },
            deep: true
        }
    },
    methods: {
        scroll() {
            const div = this.$refs.logcontainer;
            div.scrollTop = this.scrollStart + this.scrollAmount * Math.sin((Math.PI / 2) * (1 - --this.leftScrollCount / 30)) | 0;
            if (this.leftScrollCount > 0)
                this.logScrollTimeoutId = requestAnimationFrame(this.scroll);
        },
    },
    data() {
        return {
            logScrollTimeoutId: -1,
            leftScrollCount: 0,
            scrollStart: 0,
            scrollAmount: 0,
            exparrow: 0,
        };
    }
};
// main file list
const imageMap = new Map();
const entireFileList = [];
const entireImageList = [];
const EmptyPalette = new Uint32Array(16);
let slideshowTimeoutId;
let slideshowList = [];
let bustshotList = [];
const VueApp = {
    components: {
        'log-smooth-scroll': LogSmoothScroll,
        'sound-player': SoundPlayer
    },
    mounted() {
        // set keyboard control
        document.addEventListener('keydown', (ev) => {
            if (ev.code === 'Escape') {
                this.disabled = false;
                if (this.currentSelectedEndMsg)
                    this.currentSelectedEndMsg = '';
                else if (this.currentSelectedFile)
                    this.currentSelectedFile = '';
                return;
            }
            // cancel if the event fired from input elements
            switch (ev.target.constructor) {
                case HTMLSelectElement:
                    if (ev.target === this.$refs.filelist) {
                        break;
                    }
                case HTMLInputElement:
                    return;
            }
            // control the app
            if (this.move(ev.code))
                ev.preventDefault();
        });
        // hook IntersectionObserver
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            const ev = new CustomEvent(entry.isIntersecting ? 'intersect' : 'unintersect', {
                detail: entry
            });
            entry.target.dispatchEvent(ev);
        }));
        // observe elements with "-observe-intersect" suffix on its ref attribute
        for (const prop in this.$refs) {
            if (/-intersect\b/.test(prop)) {
                observer.observe(this.$refs[prop]);
            }
        }
        document.ondragstart = (ev) => ev.preventDefault();
        document.ondragover = (ev) => ev.preventDefault();
        document.ondrop = (ev) => {
            ev.preventDefault();
            this.getFile(ev.dataTransfer.files);
        };
        document.onpaste = (ev) => {
            const datatrans = ev.clipboardData;
            const items = (datatrans.items);
            const list = [];
            for (let item of items) {
                list.push(item.getAsFile());
            }
            this.getFile(list);
        };
        this.reset();
        this.drawPal();
    },
    data() {
        return {
            disabled: false,
            imageMap,
            entireImageList,
            entireFileList,
            soundMap: new Map,
            endMessages: null,
            sortedEndMessages: new Map,
            progressCurrent: 0,
            progressTotal: 0,
            currentFile: null,
            currentImage: null,
            currentImageSrc: '',
            currentPalette: null,
            //currentPalVal: '',
            fileIndex: 0,
            entireImageIndex: 0,
            sublistIndex: 0,
            currentSelectedFile: '',
            currentSelectedPal: '',
            paletteLocked: false,
            currentSelectedEndMsg: '',
            currentSelectedSortMethod: 'fav-job-chr',
            currentSelectedSound: '',
            currentEndMessage: '',
            vibrating: false,
            currentPlayingVoiceDuration: 0,
            disableIMGTransition: false,
            log: [],
            endMsgSortMethods: {
                'fav-job-chr': 'sort by fav-job-chr',
                'fav-chr-job': 'sort by fav-chr-job',
                'chr-job-fav': 'sort by chr-job-fav',
                'chr-fav-job': 'sort by chr-fav-job',
                'job-chr-fav': 'sort by job-chr-fav',
                'job-fav-chr': 'sort by job-fav-chr',
            },
            ChrColors: [
                'royalblue', '#786567', '#e6b422', 'hotpink', 'chocolate'
            ],
            endMsgLeftPosition: 0,
            PalKeys: Object.fromEntries(Object.entries(GNA.PalKeys).filter(ary => !/^\d+$/.test(ary[0]))),
            closeButtonVis: 0,
            SPR: {},
            Temp: {},
            Tmpr: {},
            panelFileUrl: '',
            speaking: false,
        };
    },
    methods: {
        print(text) {
            this.log.push(text);
        },
        alert(text) {
            this.log.push('___#ERROR___' + text);
        },
        move(dir) {
            if (!this.imageMap.size)
                return;
            const item = this.currentFile; //entireFileList[this.fileIndex] || {};
            const currentSublist = item ? item.sublist : [];
            for (let retry = 2; retry--;) {
                switch (dir) {
                    case 'ArrowLeft':
                    case 'left':
                        if (this.entireImageIndex <= 0)
                            return true;
                        this.sublistIndex--;
                        this.entireImageIndex--;
                        if (this.sublistIndex < 0) {
                            dir = 'ArrowUp';
                            continue;
                        }
                        break;
                    case 'ArrowUp':
                    case 'up':
                        const isDirectedFromAllowLeft = this.sublistIndex < 0;
                        if (!isDirectedFromAllowLeft && this.entireImageIndex <= 0) {
                            this.entireImageIndex = 0;
                            this.fileIndex = 0;
                            this.sublistIndex = 0;
                            return true;
                        }
                        this.fileIndex--;
                        if (this.fileIndex < 0) {
                            this.fileIndex = 0;
                            this.sublistIndex = 0;
                            this.entireImageIndex = 0;
                        }
                        const item = entireFileList[this.fileIndex];
                        this.sublistIndex = isDirectedFromAllowLeft ? item.length - 1 : 0;
                        this.entireImageIndex = item.entireIndex + (isDirectedFromAllowLeft ? item.length - 1 : 0);
                        break;
                    case 'ArrowDown':
                    case 'down':
                        if (!this.currentFile) {
                            this.sublistIndex = 0;
                            this.entireImageIndex = 0;
                            this.fileIndex = 0;
                            break;
                        }
                        const isDirectedFromAllowRight = this.sublistIndex > currentSublist.length - 1;
                        if (!isDirectedFromAllowRight && this.entireImageIndex >= this.entireImageList.length - 1)
                            return true;
                        if (this.fileIndex >= this.imageMap.size - 1)
                            return true;
                        this.entireImageIndex += isDirectedFromAllowRight ? 0 : this.currentFile.length - this.sublistIndex;
                        this.fileIndex++;
                        this.sublistIndex = 0;
                        break;
                    case 'ArrowRight':
                    case 'right':
                        if (!this.currentFile) {
                            this.sublistIndex = 0;
                            this.entireImageIndex = 0;
                            this.fileIndex = 0;
                            break;
                        }
                        if (this.entireImageIndex >= this.entireImageList.length - 1)
                            return true;
                        this.sublistIndex++;
                        this.entireImageIndex++;
                        if (this.sublistIndex > currentSublist.length - 1) {
                            dir = 'ArrowDown';
                            continue;
                        }
                        break;
                    default:
                        return;
                }
                break;
            }
            // set this.currentFile so that cancel the currentSelectedFile's watcher and draw the image itself
            this.currentFile = entireFileList[this.fileIndex];
            this.currentImage = entireImageList[this.entireImageIndex];
            this.currentSelectedFile = this.currentFile.name;
            this.updateView();
            // prevent default if it's true
            return true;
        },
        draw(pngbuff, gnadat) {
            const src = pngbuff ? bufferToDataURI(pngbuff) : '';
            this.currentImageSrc = src;
            let left = 0;
            let top = 0;
            if (gnadat) {
                left = gnadat.offsetX >= 0 ? gnadat.offsetX : 0;
                top = gnadat.offsetY >= 0 ? gnadat.offsetY : 0;
            }
        },
        drawPal() {
            const palcanvas = this.$refs.palcanvas;
            palcanvas.width = 256;
            palcanvas.height = 16;
            let pal;
            if (this.currentSelectedPal !== '') {
                pal = GNA.getPalette(this.currentSelectedPal);
            }
            else {
                if (this.currentImage) {
                    pal = this.currentImage.gnadat.palette || GNA.getPalette(this.currentImage.gnadat.recommendedPalKey);
                }
                else {
                    pal = EmptyPalette;
                }
            }
            this.currentPalette = pal;
            const transp = this.currentImage ? this.currentImage.gnadat.transparent : -1;
            const unusedcol = this.currentImage ? this.currentImage.unusedColors : [];
            const ctx2 = palcanvas.getContext('2d');
            for (let i = 0; i < 16; i++) {
                //ctx2.clearRect(i * 16, 0, 16, 16);
                ctx2.fillStyle = '#' + (0x1000000 + pal[i]).toString(16).substring(1);
                ctx2.fillRect(i * 16, 0, 16, 16);
                ctx2.font = '9px Monospace';
                ctx2.fillStyle = 'white';
                ctx2.strokeStyle = 'black';
                ctx2.strokeText(i.toString(16).toUpperCase(), i * 16 + 6, 11);
                ctx2.fillText(i.toString(16).toUpperCase(), i * 16 + 6, 11);
                if (transp >= 0 && transp === i) {
                    /*
                    ctx2.save();
                    ctx2.beginPath();
                    ctx2.arc(i*16+8, 8, 5, 0, Math.PI*2, false);
                    ctx2.strokeStyle = 'red';
                    ctx2.lineWidth = 4;
                    ctx2.stroke();
                    ctx2.fillStyle = 'white'
                    ctx2.fill();
                    ctx2.restore();
                    */
                    ctx2.beginPath();
                    ctx2.strokeStyle = 'red';
                    ctx2.lineWidth = 1;
                    ctx2.rect(i * 16 + 1, 1, 14, 14);
                    ctx2.closePath();
                    ctx2.stroke();
                    ctx2.lineWidth = 0.5;
                    ctx2.strokeStyle = 'white';
                    ctx2.rect(i * 16 + 2, 2, 12, 12);
                    ctx2.stroke();
                }
                if (unusedcol[i]) {
                    //ctx2.rect(i * 16, 0, 16, 16);
                    ctx2.beginPath();
                    ctx2.lineCap = 'round';
                    ctx2.lineJoin = 'round';
                    ctx2.moveTo(i * 16 + 5, 5);
                    ctx2.lineTo(i * 16 + 11, 11);
                    ctx2.moveTo(i * 16 + 5, 11);
                    ctx2.lineTo(i * 16 + 11, 5);
                    ctx2.closePath();
                    ctx2.strokeStyle = 'white';
                    ctx2.lineWidth = 3;
                    ctx2.stroke();
                    ctx2.strokeStyle = 'red';
                    ctx2.lineWidth = 1;
                    ctx2.stroke();
                }
            }
        },
        updateView() {
            if (this.currentImage) {
                let buffer = this.currentImage.buffer;
                const gnadat = this.currentImage.gnadat;
                if (this.paletteLocked && this.currentSelectedPal !== '') {
                    if (gnadat.palette || this.currentSelectedPal !== gnadat.recommendedPalKey) {
                        const img = GNA.convertToImageData(this.currentImage.gnadat, this.currentSelectedPal);
                        buffer = convertToPNG(img);
                    }
                }
                else
                    this.currentSelectedPal = gnadat.palette ? '' : gnadat.recommendedPalKey;
                this.drawPal();
                this.draw(buffer, this.currentImage.gnadat);
            }
            this.updateInfo();
        },
        getDataUrl(name, index = 0) {
            return bufferToDataURI(this.imageMap.get(name).sublist[index].buffer);
        },
        reset() {
            this.imageMap.clear();
            this.currentSelectedFile = '';
            entireFileList.length = 0;
            entireImageList.length = 0;
            this.entireImageIndex = 0;
            this.fileIndex = 0;
            this.sublistIndex = 0;
            this.currentFile = null;
            this.currentImage = null;
            this.currentImageSrc = '';
            this.currentSelectedEndMsg = '';
            this.currentEndMessage = '';
            this.log[0] = 'reseted';
            this.log.length = 1;
            this.endMessages = null;
            //print('reseted');
            this.clearSlideshow();
            this.soundMap.clear();
            this.sortedEndMessages.clear();
            this.SPR = {
                CHARA: null,
                KISSA: null,
                SDS: null,
                SDN: null,
                SD: null,
                OBAKE3: null,
                ALICE: null,
                SAILOR: null,
                KIBA: null,
            };
            this.Temp = {};
            this.Info = {};
            this.updateInfo();
        },
        getFile(file) {
            if (this.disabled) {
                alert('wait for the current converting process');
                return;
            }
            let list;
            if (file instanceof Event) {
                list = file.target.files;
            }
            else if (file instanceof File) {
                list = [file];
            }
            else if (file instanceof FileList || file instanceof Array)
                list = file;
            else {
                this.print('could not find any file');
                return;
            }
            this.startToConvert(list);
            /*
            const element = document.getElementById('control')!;
            const rect = element.getBoundingClientRect()
            const currentScrolledHeight = window.pageYOffset || document.documentElement.scrollTop;
            const position = window.innerHeight * 0.9;
            window.scrollTo({ top: rect.bottom + currentScrolledHeight - position/2|0, behavior: "smooth" });
            */
        },
        listenVibration(vibe) {
            this.vibrating = vibe;
        },
        onPlay(value, id, duration) {
            const buff = this.soundMap.get(value);
            this.currentSelectedEndMsg = '';
            this.currentPlayingVoiceDuration = duration;
            let gnaname;
            for (const [key, rep] of ADPtoGNApairMap) {
                if (!key.test(value))
                    continue;
                gnaname = value.replace(key, rep);
                if (!this.imageMap.has(gnaname)) {
                    this.alert(`needs ${gnaname}`);
                    break;
                }
                this.currentSelectedFile = gnaname;
                break;
            }
            if (!gnaname)
                this.alert(`unknown ADP name: ${value}`);
            this.speaking = id;
        },
        onStop(key, id) {
            if (this.speaking === id)
                this.speaking = false;
            this.Temp.vsliderkey = Math.random();
        },
        onChangePalette() {
            this.drawPal();
            if (this.currentImage) {
                this.disableIMGTransition = true;
                const img = GNA.convertToImageData(this.currentImage.gnadat, this.currentPalette);
                const png = convertToPNG(img);
                this.draw(png, this.currentImage.gnadat);
                this.$nextTick(() => this.disableIMGTransition = false);
            }
        },
        saveAllAsZip() {
            if (this.disabled) {
                alert('currently loading images');
                return;
            }
            if (this.imageMap.size === 0 && this.soundMap.size === 0) {
                alert('load any file first');
                return;
            }
            const anzip = new AnZip();
            const text = [];
            // images
            let count = 0;
            const list = [...this.imageMap.entries()].sort();
            for (const [key, item] of list) {
                const fileName = item.name;
                const sublist = item.sublist;
                let subindex = 0;
                for (const subitem of sublist) {
                    const gna = subitem.gnadat;
                    const buffer = subitem.buffer;
                    const subfilename = fileName + '.' + String(subindex++).padStart(3, '0') + '.png';
                    anzip.add('g2gna/images/' + subfilename, buffer);
                    text.push(`[${count}]`);
                    text.push(`name:${subfilename}`);
                    text.push(`width:${gna.width}`);
                    text.push(`height:${gna.height}`);
                    text.push(`offsetx:${gna.offsetX}`);
                    text.push(`offsety:${gna.offsetY}`);
                    text.push(`gnatype:${gna.gnaType}`);
                    text.push(`palette:${gna.palette ? 'individual' : GNA.PalKeys[gna.recommendedPalKey]}`);
                    text.push(`transparent:${gna.transparent}`);
                    //text.push(`voice:${'voice file name'}`, '');
                    count++;
                }
            }
            // sounds
            for (const [key, buff] of this.soundMap) {
                anzip.add('g2gna/sounds/' + key + '.wav', buff);
            }
            // status.txt
            anzip.add('g2gna/status.txt', text.join('\r\n'));
            const blob = new Blob([anzip.zip()], { type: "application/zip" });
            var src = (window.URL || window.webkitURL).createObjectURL(blob);
            let a = document.createElement('a');
            a.href = src;
            a.setAttribute('download', 'G2_GNAImages.zip');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        selectLatestFileValue() {
            const opts = this.$refs.filelist.options;
            this.currentSelectedFile = opts[opts.length - 1].value;
        },
        getImgPosition(margin = 0) {
            let left = margin;
            let top = margin;
            const gnadat = (this.currentImage || {}).gnadat;
            if (gnadat) {
                left += gnadat.offsetX >= 0 ? gnadat.offsetX : 0;
                top += gnadat.offsetY >= 0 ? gnadat.offsetY : 0;
            }
            return {
                position: 'absolute',
                left: left + 'px',
                top: top + 'px',
            };
        },
        startToConvert(filelist) {
            return __awaiter(this, void 0, void 0, function* () {
                this.disabled = true;
                let count = 0;
                let newFileName = '';
                let newFileCount = 0;
                let newImageCount = 0;
                let newSoundCount = 0;
                let newEndingDat = 0;
                let prevPreviewedTime = 0;
                this.progressCurrent = 0;
                this.progressTotal = filelist.length;
                for (const file of filelist) {
                    count++;
                    this.progressCurrent++;
                    if (!file)
                        continue;
                    const fileName = file.name.toUpperCase();
                    if (this.imageMap.has(fileName)) {
                        this.print(`already loaded ${fileName}`);
                        continue;
                    }
                    this.print(`parsing (${count}/${filelist.length}) ${fileName}`);
                    const buffer = yield file.arrayBuffer();
                    if (!this.disabled) // cancel converting
                        break;
                    // ADPCM
                    if (/\.ADP$/i.test(fileName)) {
                        if (!this.soundMap.has(fileName)) {
                            const wave = GNA.convertADPtoWAVE(buffer);
                            this.soundMap.set(fileName, wave.slice(0));
                            this.print(`converted ADP to WAVE`);
                            newSoundCount++;
                        }
                        continue;
                    }
                    // ENDING.DAT
                    if (/^ENDING\.DAT$/i.test(fileName)) {
                        try {
                            this.endMessages = parseMessageData(buffer);
                        }
                        catch (e) {
                            this.alert(e);
                            continue;
                        }
                        this.sortedEndMessages = sortEndMessages(this.endMessages, this.currentSelectedSortMethod);
                        this.print(`loaded ENDING.DAT`);
                        newEndingDat++;
                        continue;
                    }
                    // GNA images
                    let sublist = [];
                    let imgcachelist = [];
                    const genimgs = GNA.extract(buffer, fileName, true);
                    for (const gnadat of genimgs) {
                        let imgdata = GNA.convertToImageData(gnadat);
                        imgcachelist.push(imgdata); // must clear at the end
                        this.print(`converting to PNG: ${sublist.length}`);
                        const pngbuffer = yield convertToPNGasync(imgdata);
                        if (!this.disabled)
                            break;
                        newImageCount++;
                        const unusedColors = getGNAUnusedColors(gnadat);
                        if (sublist.length > 0) {
                            this.progressTotal++;
                            this.progressCurrent++;
                        }
                        const item = { fileName, index: sublist.length, buffer: pngbuffer, gnadat, unusedColors };
                        sublist.push(item);
                    }
                    // update list
                    if (this.disabled && sublist.length > 0) {
                        const newfile = {
                            name: fileName,
                            index: this.imageMap.size,
                            entireIndex: entireImageList.length,
                            length: sublist.length,
                            sublist
                        };
                        newFileCount++;
                        this.imageMap.set(fileName, newfile);
                        entireFileList.push(newfile);
                        entireImageList.push(...sublist);
                        this.addGimmickResources(fileName, imgcachelist);
                        if (!newFileName)
                            newFileName = fileName;
                        const time = new Date().getTime();
                        if (time > prevPreviewedTime + 500) {
                            //this.$nextTick( () => this.draw(sublist[sublist.length*Math.random()|0].buffer) );
                            this.$nextTick(() => this.selectLatestFileValue());
                            prevPreviewedTime = time;
                        }
                    }
                }
                // end convert
                this.disabled = false;
                this.print(`${filelist.length} files done. found ${newFileCount} new files and ${newImageCount} new images and ${newSoundCount} sounds${newEndingDat ? ' also ENDING.DAT' : ''}`);
                this.print(`currently loaded ${this.imageMap.size} files, ${entireImageList.length} images, ${this.soundMap.size} sounds.`);
                this.$refs.fileinput.value = '';
                if (newFileName) {
                    //this.currentSelectedFile = newFileName;
                    this.selectLatestFileValue();
                    if (slideshowList.length || bustshotList.length) {
                        this.startSlideShow();
                    }
                    //if( this.Temp.bustshots && this.Temp.bustshots.length ) {
                    //  this.Temp.bustshotsrc = this.getDataUrl(this.Temp.bustshots[this.Temp.bustshots.length * Math.random()|0]);
                    //}
                }
            });
        },
        addGimmickResources(fileName, imgdataCache) {
            // add sprites
            const Sprites = ['CHARA', 'KISSA', 'SDS', 'SDN', 'SD', 'OBAKE1', 'OBAKE3', 'ALICE', 'SAILOR', 'KIBA0', 'KIBA1', 'KIBA2', 'KIBA3', 'KIBA4'];
            const P = Sprites.find(val => val + '.P' === fileName);
            if (P) {
                this.SPR[P] = Object.assign({}, this.imageMap.get(fileName).sublist.map(item => bufferToDataURI(item.buffer)));
                const list = imgdataCache;
                // create APNGs
                if (P === 'CHARA') {
                    const tea = bufferToDataURI(UPNG.encode(list.slice(20, 33).map(item => item.data.buffer), 16, 16, 16, new Array(13).fill(100)));
                    const floppy = bufferToDataURI(UPNG.encode(list.slice(33, 46).map(item => item.data.buffer), 16, 16, 16, new Array(13).fill(100)));
                    const hiyoko = bufferToDataURI(UPNG.encode(list.slice(62, 64).map(item => item.data.buffer), 16, 16, 16, new Array(2).fill(300)));
                    Object.assign(this.SPR.CHARA, { tea, floppy, hiyoko });
                }
                if (/KIBA\d/.test(P)) {
                    const klist = this.SPR[P];
                    delete this.SPR[P];
                    this.SPR.KIBA = this.SPR.KIBA || [];
                    this.SPR.KIBA.push(klist);
                    klist.walk = bufferToDataURI(UPNG.encode(list.slice(0, 2).map(item => item.data.buffer), 112, 128, 16, new Array(2).fill(300)));
                    //update current kibachr
                    this.Temp.kibachr = Math.random() * this.SPR.KIBA.length | 0;
                    this.Temp.kibasrc = this.SPR.KIBA[this.Temp.kibachr].walk;
                }
                return;
            }
            // add slideshow images
            const PanelImages = ['EV_IN1.GNA', 'EV_IN2.GNA', 'EV_IN5.GNA', 'EV_IS1.GNA', 'EV_SI5.GNA', 'EV_TA3.GNA', 'EV_YA2.GNA', 'EV_YA3.GNA', 'E_IN09CZ.GNA', 'E_IN06CZ.GNA', 'E_IN03CZ.GNA', 'E_IN02CZ.GNA', 'E_YA06CZ.GNA', 'E_YA07CZ.GNA', 'E_YA08CZ.GNA', 'E_YA09CZ.GNA', 'E_YA04CZ.GNA', 'E_YA02CZ.GNA', 'E_YA01CZ.GNA', 'E_TA09CZ.GNA', 'E_TA04CZ.GNA', 'E_TA05CZ.GNA', 'E_TA06CZ.GNA', 'E_TA08CZ.GNA', 'E_TA02CZ.GNA', 'E_TA01CZ.GNA', 'E_SI08CZ.GNA', 'E_SI05CZ.GNA', 'E_SI06CZ.GNA', 'E_SI02CZ.GNA', 'E_IS07CZ.GNA', 'E_SI01CZ.GNA', 'E_IS09CZ.GNA', 'E_IS05CZ.GNA', 'E_IS06CZ.GNA', 'E_IS02CZ.GNA', 'E_IS01CZ.GNA'];
            if (PanelImages.indexOf(fileName) !== -1) {
                const name = fileName;
                if (this.imageMap.has(name)) {
                    //this.panelFileUrl = this.getDataUrl(name);
                    if (slideshowList.indexOf(name) === -1)
                        slideshowList.push(name);
                }
                return;
            }
            // bustshots
            if (/M_[A-Z]{2}\d{2}C\.GNA/.test(fileName)) {
                const name = fileName;
                if (this.imageMap.has(name)) {
                    if (bustshotList.indexOf(name) === -1)
                        bustshotList.push(name);
                }
            }
        },
        startSlideShow() {
            clearInterval(slideshowTimeoutId);
            let list = slideshowList.concat();
            let list2 = bustshotList.concat();
            const callback = () => {
                if (slideshowList.length) {
                    const index = list.length * Math.random() | 0;
                    const name = list.splice(index, 1)[0];
                    this.panelFileUrl = this.getDataUrl(name);
                    if (list.length === 0)
                        list = slideshowList.concat();
                }
                if (bustshotList.length) {
                    const index = list2.length * Math.random() | 0;
                    const name = list2.splice(index, 1)[0];
                    this.Temp.bustshotsrc = this.getDataUrl(name);
                    if (list2.length === 0)
                        list2 = bustshotList.concat();
                }
            };
            callback();
            if (slideshowList.length > 1 || bustshotList.length > 1)
                slideshowTimeoutId = window.setInterval(callback, 16000);
        },
        clearSlideshow() {
            clearInterval(slideshowTimeoutId);
            slideshowList.length = 0;
            bustshotList.length = 0;
            this.panelFileUrl = '';
            this.Temp.bustshotsrc = '';
        },
        updateInfo() {
            if (this.currentImage) {
                const gdat = this.currentImage.gnadat;
                this.Info.name = this.currentImage.fileName + '.' + this.currentImage.index;
                this.Info.width = gdat.width;
                this.Info.height = gdat.height;
                this.Info.offsetX = gdat.offsetX;
                this.Info.offsetY = gdat.offsetY;
                this.Info.type = gdat.gnaType;
                this.Info.pal = gdat.palette ? 'individual' : GNA.PalKeys[gdat.recommendedPalKey];
                this.Info.transp = gdat.transparent;
            }
            else {
                this.Info.name = '';
                this.Info.width = '';
                this.Info.height = '';
                this.Info.offsetX = '';
                this.Info.offsetY = '';
                this.Info.type = '';
                this.Info.pal = '';
                this.Info.transp = '';
            }
        },
        getSpeaker() {
            const exec = /_(IS|IN|SI|TA|YA)/.exec(this.currentSelectedSound);
            let num;
            if (exec) {
                num = ['IS', 'IN', 'SI', 'TA', 'YA'].indexOf(exec[1]);
            }
            if (!(num >= 0))
                num = Math.random() * 5 | 0;
            return num;
        },
        getEndingSDNSprite() {
            if (!this.SPR.SDN || !this.currentEndMessage)
                return 0;
            const { chr, job, fav } = this.currentEndInfo;
            let sdnidx = chr * 11;
            if (job === 8)
                sdnidx += 7;
            else if (job === 1 && fav === 0)
                sdnidx += 2; // marry
            else if (job === 2)
                sdnidx += 6; // failure
            else
                sdnidx += [1, 0, 3][fav];
            return this.SPR.SDN[sdnidx];
        },
        updateAliceOrder() {
            const order = [];
            const numbers = [0, 1, 2, 3, 4];
            const queen = numbers.splice(Math.random() * 5 | 0, 1)[0];
            order[queen] = {
                src: this.SPR.ALICE[5 + queen],
                left: 160,
                top: -12,
                zIndex: 1,
            };
            const alice = numbers.splice(Math.random() * 4 | 0, 1)[0];
            order[alice] = {
                src: this.SPR.ALICE[0 + alice],
                left: 48,
                top: 0,
                zIndex: 3,
            };
            let trump = numbers.splice(Math.random() * 3 | 0, 1)[0];
            order[trump] = {
                src: this.SPR.ALICE[10 + trump],
                left: 0,
                top: -6,
                zIndex: 2,
            };
            trump = numbers.splice(Math.random() * 2 | 0, 1)[0];
            order[trump] = {
                src: this.SPR.ALICE[10 + trump],
                left: 96,
                top: -6,
                zIndex: 2,
            };
            trump = numbers.splice(0, 1)[0];
            order[trump] = {
                src: this.SPR.ALICE[10 + trump],
                left: 224,
                top: -6,
                zIndex: 2,
            };
            return order;
        },
    },
    watch: {
        currentSelectedFile(newname, old) {
            const item = this.imageMap.get(this.currentSelectedFile);
            if (!item) {
                //throw new Error('unexpected file name:' + this.currentSelectedFile);
                this.currentFile = null;
                this.currentImage = null;
                this.currentImageSrc = '';
                this.fileIndex = 0;
                this.entireImageIndex = 0;
                this.sublistIndex = 0;
            }
            else {
                if (this.currentFile === item)
                    return;
                this.currentFile = item;
                this.fileIndex = item.index;
                this.entireImageIndex = item.entireIndex;
                this.sublistIndex = 0;
                this.currentImage = this.entireImageList[this.entireImageIndex];
                //this.draw(this.currentImage.buffer, this.currentImage.gnadat);
            }
            this.updateView();
        },
        currentSelectedEndMsg() {
            const ind = String(this.currentSelectedEndMsg).split(',');
            const initial = ind[0];
            const chr = Number(ind[1]);
            const job = Number(ind[2]);
            const fav = Number(ind[3]);
            const index = Number(ind[4]);
            if (!/IS|IN|SI|TA|YA/i.test(initial) || !/^\d+$/.test(String(job)) || !this.endMessages[index]) {
                if (this.currentSelectedEndMsg !== '') {
                    this.alert('load ENDING.DAT properly');
                    console.log('unexpected currentSelectedEndMsg: ' + this.currentSelectedEndMsg);
                }
                this.currentEndMessage = '';
                return;
            }
            let msg = this.endMessages[index];
            this.endMsgLeftPosition = MessageLeftMargin[initial][job]; // * 336;
            this.currentEndMessage = msg.replace(/\0/g, '\r\n');
            this.currentEndInfo = {
                name: initial, chr, job, fav
            };
            const imageName = 'E_' + initial + String(job + 1).padStart(2, '0') + 'CZ.GNA';
            if (this.imageMap.has(imageName)) {
                this.currentSelectedFile = imageName;
            }
            else {
                this.currentSelectedFile = '';
                this.alert(`can't find "${imageName}"`);
            }
        },
        currentSelectedSortMethod() {
            this.sortedEndMessages = sortEndMessages(this.endMessages, this.currentSelectedSortMethod);
        },
    },
};
const app = Vue.createApp(VueApp).mount(document.body);
// @ts-ignore
//window.app = app;
//# sourceMappingURL=app.js.map