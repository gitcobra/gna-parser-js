#!/usr/bin/env node
const fs = require('fs').promises;
const sharp = require('sharp');
const GNA = require('../cjs/gna.js');

main();

function main() {

  const args = process.argv.slice(2);
  const inputPath = args.shift();
  if( !inputPath ) {
    showUsage();
    return;
  }

  fs.readFile(String(inputPath)).then(buff => {
    buff = buff.buffer;
    const fileName = inputPath.replace(/^.+[\/\\](?=[^\\/]+$)/, '');
    let num = 0;
    const outputName = inputPath + '.' + String(num).padStart(3, '0') + '.png';
    for (const imgdat of GNA.extract(buff, fileName) ) {
      const png = sharp(imgdat.data, {
        raw: {
          width: imgdat.width,
          height: imgdat.height,
          channels: 4
        }
      }).png({
        palette: true,
        color: 16
      }).toFile(outputName);
      console.log('converted: ' + outputName);
      num++;
    }

    if( num )
      console.log(num+' images have extracted.');
    else
      console.log('could not find any GNA images.');

  }).catch(e => {
    console.log(e);
  });

}

function showUsage() {
  console.log('Convert GNA to PNG')
  console.log('USAGE: gnaparser <FileName>');
}
