/// <reference lib="webworker" />

import {ExamSummaryInterface, questionTypeList} from '../../models/student';

addEventListener('message', (dataIn) => {
  const data = dataIn.data;
  const examTypeList = questionTypeList;
  const dataOut = [];
  for (const examTyp of examTypeList) {
    const theExamType = examTyp.value;
    const scoreList = [];
    let scoreSum = 0;
    for (const one of data) {
      if (one.examType === theExamType) {
        scoreSum += one.examScore;
        scoreList.push(one.examScore);
      }
    }
    const scoreNum = scoreList.length;
    let scoreMax = 0;
    let scoreMin = 0;
    let scoreAvg = 0;
    if (scoreNum > 0) {
      scoreMax = Math.max.apply(null, scoreList);
      scoreMin = Math.min.apply(null, scoreList);
      scoreAvg = Math.round(scoreSum / scoreNum);
    }
    const examSummary: ExamSummaryInterface = {examType: theExamType, max: scoreMax, min: scoreMin, num: scoreNum, sum: scoreSum, avg: scoreAvg};
    dataOut.push(examSummary)
  }
  postMessage(dataOut);
});
