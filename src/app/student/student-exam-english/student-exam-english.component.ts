import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BaseService} from '../../providers/base.service';
import {HttpClient} from '@angular/common/http';
import {APIService} from '../../providers/api.service';
import {QuestionFillBlankInterface, QuestionSingleSelectInterface} from '../../models/student';
import {LocalDBService} from '../../providers/local-db.service';

@Component({
  selector: 'app-student-exam-english',
  templateUrl: './student-exam-english.component.html',
  styleUrls: ['./student-exam-english.component.scss'],
})
export class StudentExamEnglishComponent implements OnInit, OnDestroy {
  worker;
  stopWordsEn = [];

  dataALL = [];

  contentEnglishList = [];
  contentChineseList = [];
  vocabularyListAll = [];

  examContentEnglishList = [];
  examVocabularyListAll = [];
  examVocabularyListAllChinese = [];
  examVocabularyListAllEnglish = [];

  paperIds;
  questionTypes;
  questionTypesFinish = [];

  patternEN = new RegExp('[a-zA-Z]+', 'g');

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private baseService: BaseService,
      private localDBService: LocalDBService,
      private http: HttpClient
  ) {
  }

  ngOnInit() {
    this.getStopWordsEn();
    this.getLocalData();
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  getStopWordsEn() {
    this.http.get('assets/nlp/stopword_en.txt', {responseType: 'text'}).subscribe(data => {
      if (data) {
        this.stopWordsEn = data.toString().split(/\s+/);
      }
    });
  }

  getLocalData() {
    const localSave = localStorage.getItem(APIService.SAVE_LOCAL.currentExamRequirements);
    if (localSave) {
      const currentExamRequirements = JSON.parse(localSave);
      this.questionTypes = currentExamRequirements.questionTypes;
      this.paperIds = currentExamRequirements.paperIds;
      this.getData();
    } else {
      return this.router.navigate(['/mains/student/exam']);
    }
  }

  getData() {
    this.localDBService.getExamPaper(this.paperIds).then(data => {
      if (data) {
        this.dataALL = data;
        for (const one of this.dataALL) {
          this.contentChineseList.push(one.contentChinese);
          this.contentEnglishList.push(one.contentEnglish);
          this.vocabularyListAll = this.vocabularyListAll.concat(one.vocabularyList);
        }
        console.log('原始的contentChineseList单词集合是：', this.contentChineseList);
        console.log('原始的contentEnglishList单词集合是：', this.contentEnglishList);
        console.log('原始的vocabularyListAll单词集合是：', this.vocabularyListAll);

        if (typeof Worker !== 'undefined') {
          this.worker = new Worker('./student-exam-english.worker', { type: 'module' });
          this.worker.onmessage = (dataOut) => {
            const type = dataOut.data.type;
            if (type === 'prepare_base') {
              const theData = dataOut.data.data;
              this.examContentEnglishList = theData.contentEnglishWordList;
              this.examVocabularyListAll = theData.vocabularyList;
              this.examVocabularyListAllEnglish = theData.englishWordList;
              this.examVocabularyListAllChinese = theData.chineseWordList;
              console.log('Content中整理出来的单词集合是：', this.examContentEnglishList);
              console.log('Vocabulary中整理出来的集合是：', this.examVocabularyListAll);
              console.log('Vocabulary中整理出来英文词汇集合是：', this.examVocabularyListAllEnglish);
              console.log('Vocabulary中整理出来中文词汇集合是：', this.examVocabularyListAllChinese);
            }
          };
          const dataIn = {
            type: 'prepare_base',
            data: {
              stopwordEN: this.stopWordsEn,
              contentEnglishList: this.contentEnglishList,
              vocabularyListAll: this.vocabularyListAll
            }
          };
          this.worker.postMessage(dataIn);
        } else {
          console.log('webwork不起作用！！');
        }
      } else {
        this.baseService.presentToast('该时间范围内没有数据');
      }
    });
  }

  takeThis(one) {
    this.questionTypesFinish.push(one);
    if (this.examVocabularyListAll.length < 10) {
      return this.baseService.presentToast('需要考试的单词数少于10个，请扩大考试时间范围！');
    } else {
      switch (one) {
        case '英译汉单选':
          this.prepareSingleSelectEN('英译汉单选');
          break;
        case '汉译英单选':
          this.prepareSingleSelectCN('汉译英单选');
          break;
        case '单词听写题':
          this.prepareVoiceWriteEN('单词听写题');
          break;
        case '单词填空题':
          this.prepareSentenceFixEN('单词填空题');
          break;
      }
    }
  }

  prepareSingleSelectEN(examType) {
    // 先将题库随机排序
    this.examVocabularyListAll.sort(() => {
      return 0.5 - Math.random();
    });
    // 遍历题库
    const examQuestionSingleSelect = [];
    for (const one of this.examVocabularyListAll) {
      const chineseWordList = one.chineseWordList;
      const question = one.englishWord;
      // 一个英语单词，随机选择一个中文释义
      const answerCorrect = chineseWordList[Math.floor(Math.random() * chineseWordList.length)];
      const item: QuestionSingleSelectInterface = {question, answerCorrect, answerConfuse: [answerCorrect], answerSelected: ''};
      // 挑选4个备选项
      while (item.answerConfuse.length < 4) {
        // 从备选的中文词组集合中，随机挑选一个词组，
        const indexRandom = Math.floor(Math.random() * this.examVocabularyListAllChinese.length);
        const answerOption = this.examVocabularyListAllChinese[indexRandom];
        // 如果该词组不在answerConfuse中，并且也不在chineseWordList中（防止一个单词，有多个中文释义的选择出现），则添加；
        if (chineseWordList.indexOf(answerOption) === -1 && item.answerConfuse.indexOf(answerOption) === -1) {
          item.answerConfuse.push(answerOption);
        }
      }
      // 对item.answerConfuse随机排序
      item.answerConfuse.sort(() => {
        return 0.5 - Math.random();
      });
      examQuestionSingleSelect.push(item);
      // 考试题目超过20道，则停止添加
      if (examQuestionSingleSelect.length > 19) {
        break;
      }
    }
    this.saveToStorage(examType, examQuestionSingleSelect);
  }

  prepareSingleSelectCN(examType) {
    // 先将题库随机排序
    this.examVocabularyListAll.sort(() => {
      return 0.5 - Math.random();
    });
    const examQuestionSingleSelect = [];
    for (const one of this.examVocabularyListAll) {
      const chineseWordList = one.chineseWordList;
      // 随机选择一个中文释义作为问题
      const question = chineseWordList[Math.floor(Math.random() * chineseWordList.length)];
      // 答案为英文单词
      const answerCorrect = one.englishWord;
      const item: QuestionSingleSelectInterface = {question, answerCorrect, answerConfuse: [answerCorrect], answerSelected: ''};

      // 再次遍历全部词汇集合，如果某个英文单词的中文释义中，含有与上面英文单词相同的中文释义的，则放入黑名单
      const examVocabularyListAllBlackWords = [];
      for (const two of this.examVocabularyListAll) {
        const chineseWordListTwo = two.chineseWordList;
        for (const word of chineseWordListTwo) {
          if (chineseWordList.indexOf(word) !== -1) {
            examVocabularyListAllBlackWords.push(two.englishWord);
            break;
          }
        }
      }
      this.examVocabularyListAllEnglish.sort(() => {
        return 0.5 - Math.random();
      });
      // 挑选剩余的3个备选项, 如果英文单词不在黑名单中，则添加
      for (const english of this.examVocabularyListAllEnglish) {
        if (examVocabularyListAllBlackWords.indexOf(english) === -1) {
          item.answerConfuse.push(english);
        }
        if (item.answerConfuse.length === 4) {
          break;
        }
      }

      // 对item.answerConfuse随机排序
      item.answerConfuse.sort(() => {
        return 0.5 - Math.random();
      });
      examQuestionSingleSelect.push(item);
      // 考试题目超过20道，则停止添加
      if (examQuestionSingleSelect.length > 19) {
        break;
      }
    }
    console.log('考试题目为：', examQuestionSingleSelect);
    this.saveToStorage(examType, examQuestionSingleSelect);
  }

  prepareSentenceFixEN(examType) {
    const examSentenceFillBlank = [];
    for (const one of this.dataALL) {
      const answerCorrectList = [];
      const sentenceWithBlankList = [];
      const contentChinese = one.contentChinese;

      const contentEnglish = one.contentEnglish;
      const englishSentenceList = contentEnglish.split('.');
      for (let sentence of englishSentenceList) {
        const wordsEN = sentence.match(this.patternEN);
        if (wordsEN) {
          // 如果将文章断句后的句子少于3个单词的，则抛弃，将该句子放回，再遍历下一个句子
          if (wordsEN.length < 3) {
            sentenceWithBlankList.push(sentence);
            continue;
          }
          // 将句子中的单词转为集合后，随机排序
          wordsEN.sort(() => {
            return 0.5 - Math.random();
          });
          // 遍历句子中的单词，每句考察一个单词，如果该单词在examContentEnglishList集合中，则将该句子中的该单词替换为6个下滑线
          for (const word of wordsEN) {
            if (this.examContentEnglishList.indexOf(word) !== -1) {
              const patternWord = new RegExp(word);
              const sentenceWithBlank = sentence.replace(patternWord, '______');
              answerCorrectList.push(word);
              sentence = sentenceWithBlank;
              break;
            }
          }
          // 如果句子中有单词是考察单词，则将句子中该单词替换为6个下划线，最后不管有没有变为下划线，都将该句子添加回集合
          sentenceWithBlankList.push(sentence);
        }

      }
      // 将sentenceWithBlankList集合再次合并为string字符串，再将其根据6个下划线进行分割，分割为question和answer的形式
      const contentEnglishWithBank = sentenceWithBlankList.join('.') + '.';
      const questions = contentEnglishWithBank.split('______');


      const items = [];
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answerCorrect = answerCorrectList[i];
        const answerSelected = '';
        const questionFillBlank: QuestionFillBlankInterface = {question, answerCorrect, answerSelected};
        items.push(questionFillBlank);
      }
      const oneSection = {contentChinese, items};
      examSentenceFillBlank.push(oneSection);
    }
    console.log('考试题目为：', examSentenceFillBlank);
    this.saveToStorage(examType, examSentenceFillBlank);
  }

  prepareVoiceWriteEN(examType) {
    // 先将题库随机排序
    this.vocabularyListAll.sort(() => {
      return 0.5 - Math.random();
    });
    const examQuestionFillBlank = [];
    for (const one of this.vocabularyListAll) {
      const question = one.chineseWord + '; ' + one.phonetic;
      const answerCorrect = one.englishWord;
      const item: QuestionFillBlankInterface = {question, answerCorrect, answerSelected: ''};
      examQuestionFillBlank.push(item);
      if (examQuestionFillBlank.length > 19) {
        break;
      }
    }

    this.saveToStorage(examType, examQuestionFillBlank);
  }

  saveToStorage(examType, examSectionData) {
    this.localDBService.saveExamSectionData(examType, examSectionData).then(result => {
      if (result) {
        const examTime = new Date().getTime();
        return this.router.navigate(['/student/examDetail', {examType, examTime, backUrl: '/student/examEnglish'}]);
      }
    });
  }
}
