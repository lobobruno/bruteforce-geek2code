const fs = require('fs');
const EOL = require('os').EOL;

const splitToChunks = (array, parts) => {
  let result = [];
  let copy = [...array];
  for (let i = parts; i > 0; i--) {
    result.push(copy.splice(0, Math.ceil(copy.length / i)));
  }
  return result;
};
const wordGen = (prefix, letters) => letters.map((e) => prefix + '' + e);

const passGen = async (possibleFirstLetters, passLength, allChars, tid) => {
  let passwords = [];
  for (let i in possibleFirstLetters) {
    let firstLetter = possibleFirstLetters[i];
    let words = [];
    while (words.length == 0 || words[0].length < passLength) {
      if (!words.length) words = wordGen(firstLetter, allChars);
      else words = words.map((e) => wordGen(e, allChars)).flat();
    }
    passwords.push(words);
  }
  return passwords.flat();
};

const savePasses = (passes) => {
  const filepath = 'passes.csv';
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
  const file = fs.createWriteStream(filepath);

  file.on('error', function (err) {
    console.log(err);
  });
  passes.forEach(function (v) {
    file.write(v + EOL);
  });
  file.end();
};
const passGenThreads = async (
  threadsQtd = 1,
  passLength,
  allChars,
  save = false
) => {
  //const comb = Math.pow(allChars.length, passLength);
  console.log(`\n\nGenerating words with ${passLength} char each!`);
  console.log(`Using ${threads} threads`);

  const startTime = new Date();
  const splitLetters = splitToChunks(allChars, Math.max(1, threadsQtd));
  let passes = [];
  for (let i in splitLetters) {
    passes.push(passGen(splitLetters[i], passLength, allChars, i));
  }
  passes = await Promise.all(passes);
  const endTime = new Date();
  const seconds = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
  passes = passes.flat();
  console.log(`Generated ${passes.length} words in ${seconds} seconds!\n\n`);
  if (save) savePasses(passes);
  return passes;
};

//prettier-ignore
const upper = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const allPossibleChars = upper
  .concat(upper.map((e) => e.toLowerCase()))
  .concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const stringLength = process.argv.slice(2)[0] || 4;
const threads = process.argv.slice(2)[1] || 10;
const save = process.argv.slice(2).indexOf('--save') != -1;

passGenThreads(threads, stringLength, allPossibleChars, save);
