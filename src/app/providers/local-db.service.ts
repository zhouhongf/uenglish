import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {HttpClient} from '@angular/common/http';
import {APIService} from './api.service';
import {ExamJournalInterface} from '../models/student';

@Injectable({
    providedIn: 'root'
})
export class LocalDBService {
    englishDictData;

    constructor(private storage: Storage, private http: HttpClient) {
        this.getEnglishDict();
    }

    getStorageData(storageKey: string) {
        return this.storage.get(storageKey).then(data => {
            if (data) {
                return data;
            } else {
                return null;
            }
        })
    }

    getEnglishDict() {
        if (!this.englishDictData) {
            this.http.get(APIService.englishDictData).subscribe(data => {
                if (data) {
                    this.englishDictData = data;
                }
            });
        }
        return this.englishDictData;
    }

    getEnglishWord(name: string) {
        let databack;
        for (const one of this.englishDictData) {
            const id = one._id;
            if (id === name) {
                databack = one;
                break;
            }
        }
        return databack;
    }

    setPaperEnglish(paper): Promise<boolean> {
        const vocabularyList = [];
        const vocabularies = paper.vocabularies;
        for (const one of vocabularies) {
            for (const two of this.englishDictData) {
                if (one.englishWord === two._id) {
                    const three = {englishWord: two._id, chineseWord: two.name_chinese, phonetic: two.phonetic};
                    vocabularyList.push(three);
                }
            }
        }
        paper.vocabularies = vocabularyList;

        let dataList = [];
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (data && data.length > 0) {
                dataList = data;
                for (let i = 0; i < dataList.length; i++) {
                    const one = dataList[i];
                    if (one.id === paper.id) {
                        dataList.splice(i, 1, paper);
                        this.storage.set(APIService.SAVE_STORAGE.paperEnglish, dataList);
                        return true;
                    }
                }
            }
            dataList.push(paper);
            this.storage.set(APIService.SAVE_STORAGE.paperEnglish, dataList);
            return true;
        });
    }

    getPaperEnglish(id: string) {
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (data && data.length > 0) {
                for (const one of data) {
                    if (one.id === id) {
                        return one;
                    }
                }
            }
            return null;
        });
    }

    delPaperEnglish(id: string): Promise<boolean> {
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const one = data[i];
                    if (one.id === id) {
                        data.splice(i, 1);
                        this.storage.set(APIService.SAVE_STORAGE.paperEnglish, data);
                        return true;
                    }
                }
            }
            return false;
        });
    }

    getPaperList(username: string, type: string, startNumber: number, pageSize: number) {
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (!data || data.length === 0) {
                return null;
            }
            const dataList = [];
            for (const one of data) {
                const oneType = one.type;
                const oneUsername = one.id.split('=')[0];
                if (oneUsername === username && oneType === type) {
                    const paperSimple = {id: one.id, titleChinese: one.titleChinese, createTime: one.createTime, status: one.status};
                    dataList.push(paperSimple);
                }
            }
            if (dataList.length <= startNumber) {
                return null;
            }
            if (dataList.length < (startNumber + pageSize)) {
                const dataListFinal = dataList.slice(startNumber);
                return {total: dataList.length, data: dataListFinal};
            } else {
                const dataListFinal = dataList.slice(startNumber, startNumber + pageSize);
                return {total: dataList.length, data: dataListFinal};
            }
        });
    }

    getExamRange(username: string, timeStart: number, timeEnd: number) {
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (!data || data.length === 0) {
                return null;
            }
            const dataList = [];
            for (const one of data) {
                const oneUsername = one.id.split('=')[0];
                const createTime = one.createTime;
                if (oneUsername === username && one.status === 'YES') {
                    if (createTime >= timeStart && createTime < timeEnd) {
                        const paperSimple = {id: one.id, title_chinese: one.titleChinese, title_english: one.titleEnglish};
                        dataList.push(paperSimple);
                    }
                }
            }
            if (dataList.length === 0) {
                return null;
            }
            return dataList;
        });
    }

    getExamPaper(paperIds) {
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (!data || data.length === 0) {
                return null;
            }
            const dataList = [];
            for (const id of paperIds) {
                for (const one of data) {
                    if (id === one.id) {
                        const examPaper = {id: one.id, contentChinese: one.contentChinese, contentEnglish: one.contentEnglish, vocabularyList: one.vocabularies};
                        dataList.push(examPaper);
                    }
                }
            }
            if (dataList.length === 0) {
                return null;
            }
            return dataList;
        });
    }

    setExamJournal(username: string, examScore: number, examJournal: ExamJournalInterface) : Promise<boolean> {
        const record = {id: username + '=' + examJournal.timeStart, examScore, examJournal};
        let dataList = [];
        return this.storage.get(APIService.SAVE_STORAGE.examJournal).then(data => {
            if (data && data.length > 0) {
                dataList = data;
            }
            dataList.push(record);
            this.storage.set(APIService.SAVE_STORAGE.examJournal, dataList);
            return true;
        });
    }

    getPaperSummary(username: string) {
        return this.storage.get(APIService.SAVE_STORAGE.paperEnglish).then(data => {
            if (data && data.length > 0) {
                const dataList = [];
                for (const one of data) {
                    const oneUsername = one.id.split('=')[0];
                    if (username === oneUsername) {
                        const summary = {id: one.id, title_chinese: one.titleChinese, title_english: one.titleEnglish};
                        dataList.push(summary);
                    }
                }
                let paperTitles = [];
                const paperCount = dataList.length;
                if (paperCount < 6) {
                    paperTitles = dataList;
                } else {
                    const startNumber = paperCount - 5;
                    paperTitles = dataList.slice(startNumber)
                }
                return {paperCount, paperTitles}
            }
            return null;
        });
    }

    getExamJournalSummary(username: string) {
        return this.storage.get(APIService.SAVE_STORAGE.examJournal).then(data => {
            if (data && data.length > 0) {
                const dataList = [];
                for (const one of data) {
                    const oneUsername = one.id.split('=')[0];
                    const examJournal = one.examJournal;
                    const examScore = one.examScore;
                    if (username === oneUsername) {
                        const summary = {examType: examJournal.examType, examScore};
                        dataList.push(summary);
                    }
                }
                return dataList;
            }
            return null;
        })
    }

    saveExamSectionData(examType, examSectionData) : Promise<boolean> {
        const data = {examType, examSectionData};
        return this.storage.get(APIService.SAVE_STORAGE.examEnglish).then(examEnglishData => {
            let examEnglishDataList = [];
            if (examEnglishData && examEnglishData.length > 0) {
                for (let i = 0; i < examEnglishData.length; i++) {
                    const one = examEnglishData[i];
                    if (examType === one.examType) {
                        examEnglishData.splice(i, 1);
                    }
                }
                examEnglishDataList = examEnglishData;
            }
            examEnglishDataList.push(data);
            this.storage.set(APIService.SAVE_STORAGE.examEnglish, examEnglishDataList);
            return true;
        });
    }
}
