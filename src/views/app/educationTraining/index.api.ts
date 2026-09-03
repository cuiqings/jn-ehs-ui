import { defHttp } from '/@/utils/http/axios';
import encryptData from '/@/utils/encryption/JsEncryptSegment'
const Api = {
  trainPageList: '/edu/user/trainPageList', // 培训任务

  trainTaskInfo: '/edu/user/trainTaskInfo', // 培训任务详情

  examPageList: '/edu/user/examPageList', // 考试任务

  userHome: '/edu/user/index', // 用户首页

  sendSms: '/edu/user/sendSms', // 发送短信

  startExam: '/edu/user/startExam', // 开始考试

  examConfig: '/edu/user/examConfig', // 考试配置

  trainExamConfig: '/edu/user/trainExamConfig', // 培训考试配置

  examSubmit: '/edu/user/examSubmit', // 提交考试

  examRecord: '/edu/user/examRecord', // 考试记录

  getResourceUrl: '/edu/user/getResourceUrl', // 获取视频地址

  addDuration: '/edu/user/addDuration', // 添加时长

  teacherPageList: '/edu/app/trainManagement/pageList',

  taskContent: '/edu/app/trainManagement/taskContent', // 任务详情

  contentInfo: '/edu/app/trainManagement/contentInfo', // 阶段详情
  contentStatistics: '/edu/app/trainManagement/contentStatistics',


  confirmExam: '/edu/app/trainManagement/confirmExam', // 教育者确认（试卷）

  confirmClass: '/edu/app/trainManagement/confirm', // 教育者确认（课时）

  getQrCode: '/edu/app/trainManagement/getQrCode', // 获取二维码

  scanCode: '/edu/app/trainManagement/sign', // 签到

  studentSign: '/edu/user/sign', // 学员端签字

  correctionMistakes: '/edu/user/correctionMistakes', // 学员端纠错

  studyList: '/edu/user/studyList', // 学员端学习记录

  trainManagementDetail: '/edu/app/trainManagement/details', // 明细

  signInfo: '/edu/app/trainManagement/signInfo', // 签到信息

  getDepart3List: '/jn/common/getDepart3List', // 获取三级机构列表
  certList: '/edu/user/certList', // 获取证书列表
  certDetail: '/edu/user/viewUserCert', // 获取证书详情
  educatorsList: '/edu/common/educatorsList', // 获取教育者列表
  checkCardNo: '/edu/user/checkCardNo',
  evaluateList: '/edu/vetting/getAppraiseList', // 获取评价列表
  reviewList: '/edu/vetting/getReviewList', // 获取评审列表
  evaluateDetail: '/edu/vetting/getTaskInfo', // 获取评价详情
  reviewDetail: '/edu/vetting/contentInfo', // 获取评审详情
  review: '/edu/vetting/review', // 评审
  signAppraise: '/edu/vetting/signAppraise', // 签字评价
  exerciseSubmit: '/edu/autoPractise/examSubmit', // 每日一练 提交
  userAssess: '/edu/lecturer/assess', // 评价
  viewExam: '/edu/vetting/viewExam', // 评审查看试卷
  qrCodeExam: '/edu/user/qrCode', 
  viewProcess: '/edu/vetting/viewProcess', // 评审流程
};

export const trainPageList = (params) => defHttp.get({ url: Api.trainPageList, params });

export const trainTaskInfo = (params) => defHttp.get({ url: Api.trainTaskInfo, params });

export const examPageList = (params) => defHttp.get({ url: Api.examPageList, params });

export const userHome = () => defHttp.get({ url: Api.userHome });

export const sendSms = () => defHttp.get({ url: Api.sendSms });

export const startExam = (params) => defHttp.get({ url: Api.startExam, params });

export const examConfig = (params) => defHttp.get({ url: Api.examConfig, params });

export const trainExamConfig = (params) => defHttp.get({ url: Api.trainExamConfig, params });

export const examSubmit = (params) => defHttp.post({ url: Api.examSubmit, params });

export const exerciseSubmit = (params) => defHttp.post({ url: Api.exerciseSubmit, params });

export const examRecord = (params) => defHttp.get({ url: Api.examRecord, params });

export const getResourceUrl = (params) => defHttp.get({ url: Api.getResourceUrl, params });

export const addDuration = (params) => defHttp.post({ url: Api.addDuration, data:{ studyContent: JSON.parse(encryptData.encryptLongString(JSON.stringify(params))).chunks.join(',')}});

export const teacherPageList = (params) => defHttp.get({ url: Api.teacherPageList, params });

export const taskContent = (params) => defHttp.get({ url: Api.taskContent, params });

export const contentInfo = (params) => defHttp.get({ url: Api.contentInfo, params });

export const contentStatistics = (params) => defHttp.get({ url: Api.contentStatistics, params });

export const confirmExam = (params) => defHttp.post({ url: Api.confirmExam, params });

export const confirmClass = (params) => defHttp.post({ url: Api.confirmClass, params });

export const getQrCode = (params) => defHttp.get({ url: Api.getQrCode, params });

export const scanCode = (params) => defHttp.post({ url: Api.scanCode, params });

export const studentSign = (params) => defHttp.post({ url: Api.studentSign, params });

export const correctionMistakes = (params) => defHttp.get({ url: Api.correctionMistakes, params });

export const studyList = (params) => defHttp.get({ url: Api.studyList, params });

export const trainManagementDetail = (params) => defHttp.get({ url: Api.trainManagementDetail, params });

export const signInfo = (params) => defHttp.get({ url: Api.signInfo, params });

export const evaluateList = (params) => defHttp.get({ url: Api.evaluateList, params });

export const reviewList = (params) => defHttp.get({ url: Api.reviewList, params });

export const evaluateDetail = (params) => defHttp.get({ url: Api.evaluateDetail, params });

export const reviewDetail = (params) => defHttp.get({ url: Api.reviewDetail, params });

// 2级
export const getOrganizationNew = () => {
  return defHttp.get({ url: '/jn/common/getOrganizationNew' });
};

export const getDepart3List = (params) => defHttp.get({ url: Api.getDepart3List, params });
export const getCertList = (params) => defHttp.get({ url: Api.certList, params });
export const getCertDetail = (params) => defHttp.get({ url: Api.certDetail, params });
export const educatorsList = (params) => defHttp.get({ url: Api.educatorsList, params });
export const checkCardNo = (params) => defHttp.get({ url: Api.checkCardNo, params });
export const review = (params) => defHttp.post({ url: Api.review, params });
export const signAppraise = (params) => defHttp.post({ url: Api.signAppraise, params });
export const userAssess = (params) => defHttp.post({ url: Api.userAssess, params });

export const viewExam = (params) => defHttp.get({ url: Api.viewExam, params });
export const qrCodeExam = (params) => defHttp.get({ url: Api.qrCodeExam, params });
export const viewProcess = (params) => defHttp.get({ url: Api.viewProcess, params });
