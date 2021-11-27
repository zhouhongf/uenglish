/// <reference lib="webworker" />

addEventListener('message', (dataIn) => {
  const patternCN = new RegExp('[\u4E00-\u9FA5]+', 'g');
  const patternEN = new RegExp('[a-zA-Z]+', 'g');

  const type = dataIn.data.type;
  const data = dataIn.data.data;
  let dataOut;
  const stopwordEN = data.stopwordEN;
  const contentEnglishList = data.contentEnglishList;
  const vocabularyListAll = data.vocabularyListAll;
  // 从content中整理englishWord, 通过转换成set集合，去掉相同项， 然后去掉stopword
  let contentEnglishWordList = [];
  for (const content of contentEnglishList) {
    const wordsEN = content.match(patternEN);
    contentEnglishWordList = contentEnglishWordList.concat(wordsEN);
  }
  const contentEnglishWordSet = new Set(contentEnglishWordList);
  const contentEnglishWordListFinal = [];
  for (const word of contentEnglishWordSet) {
    if (stopwordEN.indexOf(word) === -1) {
      contentEnglishWordListFinal.push(word);
    }
  }
  // 从vocabularyList中整理出三个集合，纯英文单词集合、纯中文词组集合、和作为考试材料的中英文集合
  const vocabularyListFinal = [];
  let chineseWordList = [];
  const englishWordList = [];
  for (const one of vocabularyListAll) {
    englishWordList.push(one.englishWord);
    const chineseWord = one.chineseWord;
    const chineseWords = chineseWord.match(patternCN);
    chineseWordList = chineseWordList.concat(chineseWords);
    const chineseWordsSet = new Set(chineseWords);
    const oneNeed = {englishWord: one.englishWord, chineseWordList: Array.from(chineseWordsSet)};
    vocabularyListFinal.push(oneNeed);
  }
  const englishWordSet = new Set(englishWordList);
  const englishWordListFinal = Array.from(englishWordSet);
  const chineseWordSet = new Set(chineseWordList);
  const chineseWordListFinal = Array.from(chineseWordSet);
  dataOut = {type, data: {contentEnglishWordList: contentEnglishWordListFinal, vocabularyList: vocabularyListFinal, englishWordList: englishWordListFinal, chineseWordList: chineseWordListFinal}};
  postMessage(dataOut);
});
