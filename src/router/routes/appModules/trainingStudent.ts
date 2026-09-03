import type { AppRouteRecordRaw } from '/@/router/types';
import { showToast } from 'vant';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/student/home',
    name: 'AppStudentHome',
    component: () => import('/@/views/app/educationTraining/students/home/index.vue'),
    meta: {
      title: '学习培训',
    },
  },
  {
    path: '/app/student/identify',
    name: 'AppStudentIdentity',
    component: () => import('/@/views/app/educationTraining/students/trainingTask/identify.vue'),
    meta: {
      title: '学习培训',
    },
  },
  {
    path: '/app/student/trainingTask',
    name: 'AppStudentTask',
    component: () => import('/@/views/app/educationTraining/students/trainingTask/index.vue'),
    meta: {
      title: '学习培训',
    },
  },
  {
    path: '/app/student/trainingTaskDetail',
    name: 'AppStudentTaskDetail',
    component: () => import('/@/views/app/educationTraining/students/trainingTask/detail.vue'),
    meta: {
      title: '学习培训',
    },
  },
  {
    path: '/app/student/examTask',
    name: 'AppStudentExamTask',
    component: () => import('/@/views/app/educationTraining/students/examTask/index.vue'),
    meta: {
      title: '考试任务',
    },
  },
  {
    path: '/app/student/examTaskDetail',
    name: 'AppStudentExamTaskDetail',
    component: () => import('/@/views/app/educationTraining/students/examTask/detail.vue'),
    meta: {
      title: '考试详情',
    },
  },
  {
    path: '/app/student/study',
    name: 'AppStudentStudy',
    component: () => import('/@/views/app/educationTraining/students/study/index.vue'),
    meta: {
      title: '学习培训',
    },
  },
  {
    path: '/app/student/studyRecord',
    name: 'AppStudentStudyRecord',
    component: () => import('/@/views/app/educationTraining/students/study/record.vue'),
    meta: {
      title: '学习记录',
    },
  },
  {
    path: '/app/student/certificate',
    name: 'AppStudentCertificate',
    component: () => import('/@/views/app/educationTraining/students/certificate/index.vue'),
    meta: {
      title: '我的证书',
    },
  },
  {
    path: '/app/student/examredct',
    name: 'AppStudentExamredct',
    component: () => import('/@/views/app/educationTraining/students/examination/redct.vue'),
    meta: {
      title: '考试',
    },
  },
  {
    path: '/app/student/exam',
    name: 'AppStudentExam',
    component: () => import('/@/views/app/educationTraining/students/examination/index.vue'),
    beforeEnter: () => {
      let identify = sessionStorage.getItem('identify');
      if (identify == 'true') {
        return true;
      }
      showToast('请先完成身份认证!');
      return false;
    },
    meta: {
      title: '考试',
    },
  },
  {
    path: '/app/student/examResult',
    name: 'AppStudentExamResult',
    component: () => import('/@/views/app/educationTraining/students/examination/result.vue'),
    meta: {
      title: '考试结果',
    },
  },
  // 培训管理
  {
    path: '/app/teacher/task',
    name: 'AppTeacherTask',
    component: () => import('/@/views/app/educationTraining/teacher/taskList/index.vue'),
    meta: {
      title: '培训管理',
    },
  },
  {
    path: '/app/teacher/taskDetail',
    name: 'AppTeacherTaskDetail',
    component: () => import('/@/views/app/educationTraining/teacher/taskList/detail.vue'),
    meta: {
      title: '培训管理',
    },
  },
  {
    path: '/app/teacher/taskDetailOutline',
    name: 'AppTeacherTaskDetailOutline',
    component: () => import('/@/views/app/educationTraining/teacher/taskList/detailOutline.vue'),
    meta: {
      title: '线下培训',
    },
  },
  {
    path: '/app/teacher/checkStudent',
    name: 'AppTeacherCheckStudent',
    component: () => import('/@/views/app/educationTraining/teacher/taskList/checkStudent.vue'),
    meta: {
      title: '培训管理',
    },
  },
  {
    path: '/app/teacher/evaluate',
    name: 'AppTeacherEvaluate',
    component: () => import('/@/views/app/educationTraining/teacher/evaluate/index.vue'),
    meta: {
      title: '签字评价',
    },
  },
  {
    path: '/app/teacher/evaluateDetail',
    name: 'AppTeacherEvaluateDetail',
    component: () => import('/@/views/app/educationTraining/teacher/evaluate/detail.vue'),
    meta: {
      title: '签字评价',
    },
  },
  {
    path: '/app/teacher/review',
    name: 'AppTeacherReview',
    component: () => import('/@/views/app/educationTraining/teacher/review/index.vue'),
    meta: {
      title: '教材评审',
    },
  },
  {
    path: '/app/teacher/reviewDetail',
    name: 'AppTeacherReviewDetail',
    component: () => import('/@/views/app/educationTraining/teacher/review/detail.vue'),
    meta: {
      title: '教材评审',
    },
  },
  {
    path: '/app/teacher/examPaper',
    name: 'AppTeacherReviewExamPaper',
    component: () => import('/@/views/app/educationTraining/teacher/review/examPaper.vue'),
    meta: {
      title: '试卷详情',
    },
  },
  {
    path: '/app/teacher/questionBank',
    name: 'AppTeacherReviewQuestionBank',
    component: () => import('/@/views/app/educationTraining/teacher/review/questionBank.vue'),
    meta: {
      title: '试卷详情',
    },
  },
  {
    path: '/app/teacher/studentDetail',
    name: 'AppTeacherStudentDetail',
    component: () => import('/@/views/app/educationTraining/teacher/taskList/studentDetail.vue'),
    meta: {
      title: '学员明细',
    },
  },
  {
    path: '/app/trining/signIn',
    name: 'AppTriningSignIn',
    component: () => import('/@/views/app/educationTraining/signIn.vue'),
    meta: {
      title: '培训签到',
    },
  },
  // 我的证书
  {
    path: '/app/students/certificate',
    name: 'AppStudentsCertificate',
    component: () => import('/@/views/app/educationTraining/students/certificate/index.vue'),
    meta: {
      title: '我的证书',
    },
  },
  {
    path: '/app/students/selfStudy',
    name: 'AppStudentsSelfStudy',
    component: () => import('/@/views/app/educationTraining/students/selfStudy/index.vue'),
    meta: {
      title: '每日一练',
    },
  },
  {
    path: '/app/students/selfStudying',
    name: 'AppStudentsSelfStudying',
    component: () => import('/@/views/app/educationTraining/students/selfStudy/study/index.vue'),
    meta: {
      title: '每日一练',
    },
  },
  {
    path: '/app/students/selfStudyDetail',
    name: 'AppStudentsSelfStudyDetail',
    component: () => import('/@/views/app/educationTraining/students/selfStudy/detail.vue'),
    meta: {
      title: '每日一练明细',
    },
  },
  // 个人信息
  {
    path: '/app/students/personInfo',
    name: 'AppStudentsPersonInfo',
    component: () => import('/@/views/app/educationTraining/students/personInfo/index.vue'),
    meta: {
      title: '人员信息',
    },
  },
  // 问卷调查
  {
    path: '/app/students/questionnaire',
    name: 'AppStudentsQuestionnaire',
    component: () => import('/@/views/app/educationTraining/students/questionnaire/index.vue'),
    meta: {
      title: '问卷调查',
    },
  },
  {
    path: '/app/students/selfStudyExam',
    name: 'AppStudentsSelfStudyExam',
    component: () => import('/@/views/app/educationTraining/students/selfStudy/examination/index.vue'),
    meta: {
      title: '自主刷题',
    },
  },
  {
    path: '/app/students/selfStudyExamResult',
    name: 'AppStudentsSelfStudyExamResult',
    component: () => import('/@/views/app/educationTraining/students/selfStudy/examination/result.vue'),
    meta: {
      title: '自主刷题',
    },
  },
];

export default routes;
