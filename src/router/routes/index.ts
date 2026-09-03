import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';

// import { mainOutRoutes } from './mainOut';
import { PageEnum } from '/@/enums/pageEnum';
import { t } from '/@/hooks/web/useI18n';
import AppRoutes from './appModules';
// AI识别
import aiIdentify from './aiIdentify';
const modules = import.meta.glob('./modules/**/*.ts', { eager: true });

const routeModuleList: AppRouteModule[] = [];

// 加入到路由集合中
Object.keys(modules).forEach((key) => {
  const mod = (modules as Recordable)[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  //新版后台登录，如果想要使用旧版登录放开即可
  // component: () => import('/@/views/sys/login/Login.vue'),
  component: () => import('/@/views/system/loginmini/MiniLogin.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

//update-begin---author:wangshuai ---date:20220629  for：auth2登录页面路由------------
export const Oauth2LoginRoute: AppRouteRecordRaw = {
  path: '/oauth2-app/login',
  name: 'oauth2-app-login',
  //新版钉钉免登录，如果想要使用旧版放开即可
  // component: () => import('/@/views/sys/login/OAuth2Login.vue'),
  component: () => import('/@/views/system/loginmini/OAuth2Login.vue'),
  meta: {
    title: t('routes.oauth2.login'),
  },
};
//update-end---author:wangshuai ---date:20220629  for：auth2登录页面路由------------
/**
 * 用户培训任务后门页面
 */
export const UserTrainRoute: AppRouteRecordRaw = {
  path: '/userTrain',
  name: 'userTrain',
  component: () => import('/@/views/studyTraining/trainingTasks/userTrain.vue'),
  meta: {
    title: '用户培训',
  },
};
/**
 * 【通过token直接静默登录】流程办理登录页面 中转跳转
 */
export const SafetyScreen: AppRouteRecordRaw = {
  path: '/safetyScreen',
  name: 'SafetyScreen',
  component: () => import('/@/views/safetyScreen/index.vue'),
  meta: {
    title: '环保管理大屏',
  },
};
export const TechnicalScreen: AppRouteRecordRaw = {
  path: '/technical/big/page',
  name: 'TechnicalScreen',
  component: () => import('/@/views/technicalScreen/bigPage/index.vue'),
  meta: {
    title: '技防大屏',
  },
};
export const TechnicalPagePreview: AppRouteRecordRaw = {
  path: '/technicalScreen/pagePreview',
  name: 'TechnicalPagePreview',
  component: () => import('/@/views/technicalScreen/screenSet/pagePreview.vue'),
  meta: {
    title: '组态预览',
  },
};
export const DevicePagePreview: AppRouteRecordRaw = {
  path: '/device/pageSet/pagePreview',
  name: 'DevicePagePreview',
  component: () => import('/@/views/device/pageSet/pagePreview.vue'),
  meta: {
    title: '组态预览',
  },
};
export const Exam: AppRouteRecordRaw = {
  path: '/exam',
  name: 'Exam',
  component: () => import('/@/views/education/student/myExam/exam.vue'),
  meta: {
    title: '考试',
    hideTab: true,
  },
};
export const SelfExam: AppRouteRecordRaw = {
  path: '/selfexam',
  name: 'selfExam',
  component: () => import('/@/views/education/student/selfStudy/exam.vue'),
  meta: {
    title: '自主刷题',
    hideTab: true,
  },
};
export const SelfexamResult: AppRouteRecordRaw = {
  path: '/selfexamResult',
  name: 'selfexamResult',
  component: () => import('/@/views/education/student/selfStudy/examResult.vue'),
  meta: {
    title: '自主刷题',
    hideTab: true,
  },
};
// 角色管理-统一用户平台
export const Role: AppRouteRecordRaw = {
  path: '/role',
  name: 'Role',
  component: () => import('/@/views/system/role/index.vue'),
  meta: {
    title: '角色管理',
    hideTab: true,
  },
};
// 菜单管理-统一用户平台
export const Menu: AppRouteRecordRaw = {
  path: '/menu',
  name: 'Menu',
  component: () => import('/@/views/system/menu/index.vue'),
  meta: {
    title: '菜单管理',
    hideTab: true,
  },
};
export const ExamResult: AppRouteRecordRaw = {
  path: '/examresult',
  name: 'ExamResult',
  component: () => import('/@/views/education/student/myExam/examresult.vue'),
  meta: {
    title: '考试结果',
    hideTab: true,
  },
};
export const PagePreview: AppRouteRecordRaw = {
  path: '/screenSet/pagePreview',
  name: 'PagePreview',
  component: () => import('/@/views/screenSet/pagePreview.vue'),
  meta: {
    title: '组态预览',
  },
};
export const AppPeriodicMaintain: AppRouteRecordRaw = {
  path: '/app/periodicMaintain',
  name: 'AppPeriodicMaintain',
  component: () => import('/@/views/periodicClean/app/maintain.vue'),
  meta: {
    title: '周期清理维护',
  },
};
export const AppPeriodicTask: AppRouteRecordRaw = {
  path: '/app/periodicTask',
  name: 'AppPeriodicTask',
  component: () => import('/@/views/periodicClean/app/task.vue'),
  meta: {
    title: '周期清理计划',
  },
};
export const AppPeriodicExecute: AppRouteRecordRaw = {
  path: '/app/periodicExecute',
  name: 'AppPeriodicExecute',
  component: () => import('/@/views/periodicClean/app/execute.vue'),
  meta: {
    title: '周期清理任务·执行',
  },
};
export const AppPeriodicExecuteDetail: AppRouteRecordRaw = {
  path: '/app/periodicExecuteDetail',
  name: 'AppPeriodicExecuteDetail',
  component: () => import('/@/views/periodicClean/app/detail.vue'),
  meta: {
    title: '周期清理计划',
  },
};
export const AppPeriodicClean: AppRouteRecordRaw = {
  path: '/app/periodicClean',
  name: 'AppPeriodicClean',
  component: () => import('/@/views/periodicClean/app/index.vue'),
  meta: {
    title: '周期清理计划',
  },
};
export const AppCleanStatistics: AppRouteRecordRaw = {
  path: '/app/cleanStatistics',
  name: 'AppCleanStatistics',
  component: () => import('/@/views/periodicClean/app/statistics/index.vue'),
  meta: {
    title: '清理维护统计',
  },
};
export const AppAbnormalReminder: AppRouteRecordRaw = {
  path: '/app/abnormalReminder',
  name: 'AppAbnormalReminder',
  component: () => import('/@/views/periodicClean/app/statistics/reminder.vue'),
  meta: {
    title: '异常情况提醒',
  },
};
export const AppStatisticsExecute: AppRouteRecordRaw = {
  path: '/app/statisticsExecute',
  name: 'AppStatisticsExecute',
  component: () => import('/@/views/periodicClean/app/statistics/execute.vue'),
  meta: {
    title: '周期清理任务·执行',
  },
};
export const AppStatisticsOverdue: AppRouteRecordRaw = {
  path: '/app/statisticsOverdue',
  name: 'AppStatisticsOverdue',
  component: () => import('/@/views/periodicClean/app/statistics/overdue.vue'),
  meta: {
    title: '周期清理计划',
  },
};
export const TokenLoginRoute: AppRouteRecordRaw = {
  path: '/tokenLogin',
  name: 'TokenLoginRoute',
  component: () => import('/@/views/sys/login/TokenLoginPage.vue'),
  meta: {
    title: '带token登录页面',
    ignoreAuth: true,
  },
};
export const AppEmergency: AppRouteRecordRaw = {
  path: '/app/emergency',
  name: 'AppEmergency',
  component: () => import('/@/views/emergency/app/index.vue'),
  meta: {
    title: '应急管理',
  },
};
export const AppOrgList: AppRouteRecordRaw = {
  path: '/app/org/list',
  name: 'AppOrgList',
  component: () => import('/@/views/app/security/AppOrgList.vue'),
  meta: {
    title: '组织架构',
  },
};
export const AppOrgDetails: AppRouteRecordRaw = {
  path: '/app/org/details',
  name: 'AppOrgDetails',
  component: () => import('/@/views/app/security/AppOrgDetails.vue'),
  meta: {
    title: '人员查看',
  },
};
export const AppEpInfoView: AppRouteRecordRaw = {
  path: '/app/epInfo/list',
  name: 'AppEpInfoView',
  component: () => import('/@/views/app/security/epInfoView/index.vue'),
  meta: {
    title: '环保资料',
  },
};

//我的任务
export const AppMyTask: AppRouteRecordRaw = {
  path: '/app/my/task',
  name: 'AppMyTask',
  component: () => import('/@/views/app/task/AppMyTask.vue'),
  meta: {
    title: '我的任务',
  },
};
export const AppTaskReport: AppRouteRecordRaw = {
  path: '/app/task/report',
  name: 'AppTaskReport',
  component: () => import('/@/views/app/task/AppTaskReport.vue'),
  meta: {
    title: '任务汇报',
  },
};
export const AppTaskDetail: AppRouteRecordRaw = {
  path: '/app/task/detail',
  name: 'AppTaskDetail',
  component: () => import('/@/views/app/task/AppTaskDetail.vue'),
  meta: {
    title: '任务详情',
  },
};
export const AppReportInformation: AppRouteRecordRaw = {
  path: '/app/report/information',
  name: 'reportInformation',
  component: () => import('/@/views/app/task/AppReportInformation.vue'),
  meta: {
    title: '汇报信息',
  },
};
export const AppHistoryReport: AppRouteRecordRaw = {
  path: '/app/history/repor',
  name: 'historyReport',
  component: () => import('/@/views/app/task/AppHistoryReport.vue'),
  meta: {
    title: '历史汇报',
  },
};
export const AppComments: AppRouteRecordRaw = {
  path: '/app/commentsr',
  name: 'AppComments',
  component: () => import('/@/views/app/task/AppComments.vue'),
  meta: {
    title: '任务评论',
  },
};
export const AppParticipants: AppRouteRecordRaw = {
  path: '/app/participants',
  name: 'AppParticipants',
  component: () => import('/@/views/app/task/AppParticipants.vue'),
  meta: {
    title: '添加参与人',
  },
};

//AppNotice
export const AppNotice: AppRouteRecordRaw = {
  path: '/app/notice',
  name: 'AppNotice',
  component: () => import('/@/views/notice/app/index.vue'),
  meta: {
    title: '通知书',
  },
};

export const AppNoticeDetail: AppRouteRecordRaw = {
  path: '/app/noticeDetail',
  name: 'AppNoticeDetail',
  component: () => import('/@/views/notice/app/ehsNoticeInfoDetail.vue'),
  meta: {
    title: '通知审核详情',
  },
};

export const AppNoticeReviewing: AppRouteRecordRaw = {
  path: '/app/noticeReviewing',
  name: 'AppNoticeReviewing',
  component: () => import('/@/views/notice/app/ehsNoticeInfoReviewing.vue'),
  meta: {
    title: '通知审核',
  },
};

export const AppNoticeInfoSign: AppRouteRecordRaw = {
  path: '/app/noticeInfoSign',
  name: 'AppNoticeInfoSign',
  component: () => import('/@/views/notice/app/ehsNoticeInfoSign.vue'),
  meta: {
    title: '通知签收',
  },
};

export const AppNoticeInfoSignDetail: AppRouteRecordRaw = {
  path: '/app/noticeInfoSignDetail',
  name: 'AppNoticeInfoSignDetail',
  component: () => import('/@/views/notice/app/ehsNoticeInfoSignDetail.vue'),
  meta: {
    title: '通知签收详情',
  },
};

export const AppNoticeInfoRecDetail: AppRouteRecordRaw = {
  path: '/app/ehsNoticeInfoRecDetail',
  name: 'AppNoticeInfoRecDetail',
  component: () => import('/@/views/notice/app/ehsNoticeInfoRecDetail.vue'),
  meta: {
    title: '通知书详情',
  },
};
export const AppNoticeFeedback: AppRouteRecordRaw = {
  path: '/app/ehsNoticeFeedback',
  name: 'AppNoticeFeedback',
  component: () => import('/@/views/notice/app/ehsNoticeFeedback.vue'),
  meta: {
    title: '整改反馈',
  },
};
export const AppNoticeFedReview: AppRouteRecordRaw = {
  path: '/app/ehsNoticeFedReview',
  name: 'AppNoticeFedReview',
  component: () => import('/@/views/notice/app/ehsNoticeFedReview.vue'),
  meta: {
    title: '整改复查',
  },
};

export const AppMaterialAudit: AppRouteRecordRaw = {
  path: '/app/materialAudit',
  name: 'AppMaterialAudit',
  component: () => import('/@/views/eia/app/MaterialAudit.vue'),
  meta: {
    title: '资料审核',
  },
};

export const AppIncidentExpress: AppRouteRecordRaw = {
  path: '/app/incidentManage/add',
  name: 'AppIncidentExpress',
  component: () => import('/@/views/incidentManage/incidentExpress/app/index.vue'),
  meta: {
    title: '事故快报',
  },
};
export const AppIncidentExpressList: AppRouteRecordRaw = {
  path: '/app/incidentManage/list',
  name: 'AppIncidentExpressList',
  component: () => import('/@/views/incidentManage/incidentExpress/app/list.vue'),
  meta: {
    title: '事故快报',
  },
};
export const AppIncidentExpressDetails: AppRouteRecordRaw = {
  path: '/app/incidentManage/details',
  name: 'AppIncidentExpressDetails',
  component: () => import('/@/views/incidentManage/incidentExpress/app/details.vue'),
  meta: {
    title: '事故/事件详情',
  },
};
export const AppIncidentExpressTask: AppRouteRecordRaw = {
  path: '/app/incidentManage/task',
  name: 'AppIncidentExpressTask',
  component: () => import('/@/views/incidentManage/incidentExpress/app/task.vue'),
  meta: {
    title: '事故快报确认',
  },
};
export const AppIncidentExpressRepeat: AppRouteRecordRaw = {
  path: '/app/incidentManage/repeat',
  name: 'AppIncidentExpressRepeat',
  component: () => import('/@/views/incidentManage/incidentExpress/app/repeat.vue'),
  meta: {
    title: '事故快报确认',
  },
};
export const AppIncidentExpressRepeatDiff: AppRouteRecordRaw = {
  path: '/app/incidentManage/diff',
  name: 'AppIncidentExpressRepeatDiff',
  component: () => import('/@/views/incidentManage/incidentExpress/app/repeatDiff.vue'),
  meta: {
    title: '事故快报确认',
  },
};
export const AppAccidentStatistics: AppRouteRecordRaw = {
  path: '/app/incidentManage/statistics',
  name: 'AppAccidentStatistics',
  component: () => import('/@/views/incidentManage/accidentStatistics/app/index.vue'),
  meta: {
    title: '事件统计',
  },
};
export const AppUserCertificate: AppRouteRecordRaw = {
  path: '/app/safetyProductionSystem/certificate',
  name: 'AppUserCertificate',
  component: () => import('/@/views/safetyProductionSystem/app/index.vue'),
  meta: {
    title: '人员资质证书',
  },
};
export const AppCertificateRecheck: AppRouteRecordRaw = {
  path: '/app/certificate/recheck',
  name: 'AppCertificateRecheck',
  component: () => import('/@/views/safetyProductionSystem/app/recheck.vue'),
  meta: {
    title: '人员资质证书·复审',
  },
};
export const AppCertificateDetails: AppRouteRecordRaw = {
  path: '/app/certificate/details',
  name: 'AppCertificateDetails',
  component: () => import('/@/views/safetyProductionSystem/app/details.vue'),
  meta: {
    title: '人员资质证书·详情',
  },
};
export const AppCertificateSignature: AppRouteRecordRaw = {
  path: '/app/certificate/signature',
  name: 'AppCertificateSignature',
  component: () => import('/@/views/safetyProductionSystem/app/signature.vue'),
  meta: {
    title: '人员资质证书·检查签字/确认签字',
  },
};
export const AppFsInfoView: AppRouteRecordRaw = {
  path: '/app/fsInfo/list',
  name: 'AppFsInfoView',
  component: () => import('/@/views/fsInfo/app/fsInfoView/index.vue'),
  meta: {
    title: '消防资料',
  },
};
export const AppEnterpriseList: AppRouteRecordRaw = {
  path: '/app/sm/enterprise/list',
  name: 'AppEnterpriseList',
  component: () => import('/@/views/sm/app/enterprise/index.vue'),
  meta: {
    title: '企业列表',
  },
};
export const AppEnterpriseView: AppRouteRecordRaw = {
  path: '/app/sm/enterprise/view',
  name: 'AppEnterpriseView',
  component: () => import('/@/views/sm/app/enterprise/view.vue'),
  meta: {
    title: '企业信息查看',
  },
};
export const AppPersonnelList: AppRouteRecordRaw = {
  path: '/app/sm/personnel/list',
  name: 'AppPersonnelList',
  component: () => import('/@/views/sm/app/personnel/index.vue'),
  meta: {
    title: '人员列表',
  },
};
export const AppPersonnelView: AppRouteRecordRaw = {
  path: '/app/sm/personnel/view',
  name: 'AppPersonnelView',
  component: () => import('/@/views/sm/app/personnel/view.vue'),
  meta: {
    title: '人员信息查看',
  },
};
export const AppBlackList: AppRouteRecordRaw = {
  path: '/app/sm/blacklist/list',
  name: 'AppBlackList',
  component: () => import('/@/views/sm/app/blacklist/index.vue'),
  meta: {
    title: '黑名单',
  },
};
export const AppProjectManageList: AppRouteRecordRaw = {
  path: '/app/sm/projectManage/list',
  name: 'AppProjectManageList',
  component: () => import('/@/views/sm/app/projectManage/index.vue'),
  meta: {
    title: '项目管理',
  },
};
export const AppAdmissionApplicationList: AppRouteRecordRaw = {
  path: '/app/sm/admissionApplication/list',
  name: 'AppAdmissionApplicationList',
  component: () => import('/@/views/sm/app/admissionApplication/index.vue'),
  meta: {
    title: '资质申请',
  },
};
export const AppAdmissionApplicationAddorEdit: AppRouteRecordRaw = {
  path: '/app/sm/admissionApplication/addOrEdit',
  name: 'AppAdmissionApplicationAddorEdit',
  component: () => import('/@/views/sm/app/admissionApplication/addOrEdit.vue'),
  meta: {
    title: '资质申请',
  },
};
export const AppAdmissionApplicationTask: AppRouteRecordRaw = {
  path: '/app/sm/task',
  name: 'AppAdmissionApplicationTask',
  component: () => import('/@/views/sm/app/components/ProjectDrawer.vue'),
  meta: {
    title: '资质申请',
  },
};
export const AppAdmissionApplicationView: AppRouteRecordRaw = {
  path: '/app/sm/details',
  name: 'AppAdmissionApplicationView',
  component: () => import('/@/views/sm/app/components/ProjectDrawer.vue'),
  meta: {
    title: '查看',
  },
};
export const AppAdmissionApprovalList: AppRouteRecordRaw = {
  path: '/app/sm/admissionApproval/list',
  name: 'AppAdmissionApprovalList',
  component: () => import('/@/views/sm/app/admissionApproval/index.vue'),
  meta: {
    title: '过程管控',
  },
};
export const AppAutonomous: AppRouteRecordRaw = {
  path: '/app/sm/autonomous/list',
  name: 'AppAutonomous',
  component: () => import('/@/views/sm/app/autonomous/index.vue'),
  meta: {
    title: '自主管理',
  },
};
export const AppAutonomousView: AppRouteRecordRaw = {
  path: '/app/sm/autonomous/view',
  name: 'AppAutonomousView',
  component: () => import('/@/views/sm/app/autonomous/view.vue'),
  meta: {
    title: '查看',
  },
};
export const AppAutonomousApproval: AppRouteRecordRaw = {
  path: '/app/sm/autonomous/approval',
  name: 'AppAutonomousApproval',
  component: () => import('/@/views/sm/app/autonomous/approval.vue'),
  meta: {
    title: '审核',
  },
};
export const AppAutonomousAssessment: AppRouteRecordRaw = {
  path: '/app/sm/autonomous/assessment',
  name: 'AppAutonomousAssessment',
  component: () => import('/@/views/sm/app/autonomous/addOrEdit.vue'),
  meta: {
    title: '人员考核',
  },
};
export const AppExamineQuestionList: AppRouteRecordRaw = {
  path: '/app/examineQuestion/list',
  name: 'AppExamineQuestionList',
  component: () => import('/@/views/environment/examineQuestion/app/list.vue'),
  meta: {
    title: '环保检查问题',
  },
};
export const AppExamineQuestionConfirm: AppRouteRecordRaw = {
  path: '/app/examineQuestion/confirm',
  name: 'AppExamineQuestionConfirm',
  component: () => import('/@/views/environment/examineQuestion/app/confirm.vue'),
  meta: {
    title: '问题确认',
  },
};
export const AppExamineQuestionRectify: AppRouteRecordRaw = {
  path: '/app/examineQuestion/rectify',
  name: 'AppExamineQuestionRectify',
  component: () => import('/@/views/environment/examineQuestion/app/rectify.vue'),
  meta: {
    title: '问题整改',
  },
};
export const AppExamineQuestionReview: AppRouteRecordRaw = {
  path: '/app/examineQuestion/review',
  name: 'AppExamineQuestionReview',
  component: () => import('/@/views/environment/examineQuestion/app/review.vue'),
  meta: {
    title: '问题复查',
  },
};
export const AppExamineQuestionDetails: AppRouteRecordRaw = {
  path: '/app/examineQuestion/details',
  name: 'AppExamineQuestionDetails',
  component: () => import('/@/views/environment/examineQuestion/app/details.vue'),
  meta: {
    title: '问题查看',
  },
};
export const AppCheckPlanTask: AppRouteRecordRaw = {
  path: '/app/checkPlan/task',
  name: 'AppCheckPlanTask',
  component: () => import('/@/views/environment/checkPlan/app/task.vue'),
  meta: {
    title: '环保检查任务',
  },
};
export const AppCheckPlanExamine: AppRouteRecordRaw = {
  path: '/app/checkPlan/examine',
  name: 'AppCheckPlanExamine',
  component: () => import('/@/views/environment/checkPlan/app/examine.vue'),
  meta: {
    title: '环保检查任务',
  },
};
export const AppCheckPlanDetails: AppRouteRecordRaw = {
  path: '/app/checkPlan/details',
  name: 'AppCheckPlanDetails',
  component: () => import('/@/views/environment/checkPlan/app/details.vue'),
  meta: {
    title: '环保检查任务',
  },
};
export const AppSafetyView: AppRouteRecordRaw = {
  path: '/app/safety/list',
  name: 'AppSafetyView',
  component: () => import('/@/views/safetyInfo/app/safetyView/index.vue'),
  meta: {
    title: '安全资料',
  },
};
export const AppScheduledTasks: AppRouteRecordRaw = {
  path: '/app/scheduledTasks',
  name: 'AppScheduledTasks',
  component: () => import('/@/views/app/scheduledTasks.vue'),
  meta: {
    title: '定时任务',
  },
};
export const AppMeetingBeforeClass: AppRouteRecordRaw = {
  path: '/app/meetingBeforeClass/list',
  name: 'AppMeetingBeforeClass',
  component: () => import('/@/views/teamManagement/app/meetingBeforeClass/index.vue'),
  meta: {
    title: '班前会管理',
  },
};
export const AppMeetingBeforeClassDetails: AppRouteRecordRaw = {
  path: '/app/meetingBeforeClass/details',
  name: 'AppMeetingBeforeClassDetails',
  component: () => import('/@/views/teamManagement/app/meetingBeforeClass/details.vue'),
  meta: {
    title: '班前会管理',
  },
};
export const AppDehydratorInspectionTask: AppRouteRecordRaw = {
  path: '/app/dehydratorInspection/task',
  name: 'AppDehydratorInspectionTask',
  component: () => import('/@/views/socialFacilitiesManage/dehydratorInspection/app/task.vue'),
  meta: {
    title: '脱水器点检',
  },
};
export const AppDehydratorInspectionExamine: AppRouteRecordRaw = {
  path: '/app/dehydratorInspection/examine',
  name: 'AppDehydratorInspectionExamine',
  component: () => import('/@/views/socialFacilitiesManage/dehydratorInspection/app/examine.vue'),
  meta: {
    title: '脱水器点检-执行',
  },
};
export const AppDeclarationAndIssuanceProcessing: AppRouteRecordRaw = {
  path: '/declarationAndIssuance/processing',
  name: 'AppDeclarationAndIssuanceProcessing',
  component: () => import('/@/views/equipmentManage/declarationAndIssuance/processing.vue'),
  meta: {
    title: '劳保申报处理',
    hideTab: true,
  },
};
export const cockpit2: AppRouteRecordRaw = {
  path: '/statistics/cockpit2',
  name: 'cockpit2',
  component: () => import('/@/views/statistics/cockpit2/index.vue'),
  meta: {
    title: '驾驶舱',
  },
};
export const basicRoutes = [
  Role,
  Menu,
  LoginRoute,
  RootRoute,
  // ...mainOutRoutes,
  REDIRECT_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
  SafetyScreen,
  Exam,
  SelfExam,
  SelfexamResult,
  ExamResult,
  PagePreview,
  AppPeriodicClean,
  AppPeriodicMaintain,
  AppPeriodicTask,
  AppPeriodicExecute,
  AppPeriodicExecuteDetail,
  AppCleanStatistics,
  AppAbnormalReminder,
  AppStatisticsExecute,
  AppStatisticsOverdue,
  TokenLoginRoute,
  Oauth2LoginRoute,
  AppEmergency,
  AppOrgList,
  AppOrgDetails,
  AppEpInfoView,
  AppNotice,
  AppNoticeDetail,
  AppNoticeReviewing,
  AppNoticeInfoSign,
  AppNoticeInfoSignDetail,
  AppNoticeInfoRecDetail,
  AppNoticeFeedback,
  AppNoticeFedReview,
  AppMaterialAudit,
  AppIncidentExpress,
  AppIncidentExpressList,
  AppIncidentExpressDetails,
  AppIncidentExpressTask,
  AppIncidentExpressRepeat,
  AppIncidentExpressRepeatDiff,
  AppAccidentStatistics,
  AppMyTask,
  AppTaskReport,
  AppTaskDetail,
  AppReportInformation,
  AppHistoryReport,
  AppComments,
  AppParticipants,
  AppUserCertificate,
  AppCertificateRecheck,
  AppCertificateDetails,
  AppFsInfoView,
  AppEnterpriseList,
  AppEnterpriseView,
  AppPersonnelList,
  AppPersonnelView,
  AppBlackList,
  AppProjectManageList,
  AppAdmissionApplicationList,
  AppAdmissionApplicationAddorEdit,
  AppAdmissionApplicationTask,
  AppAdmissionApplicationView,
  AppAdmissionApprovalList,
  AppExamineQuestionList,
  AppExamineQuestionConfirm,
  AppExamineQuestionRectify,
  AppExamineQuestionReview,
  AppExamineQuestionDetails,
  AppCheckPlanTask,
  AppCheckPlanExamine,
  AppCheckPlanDetails,
  ...AppRoutes,
  ...aiIdentify,
  AppSafetyView,
  TechnicalScreen,
  TechnicalPagePreview,
  DevicePagePreview,
  AppScheduledTasks,
  AppAutonomous,
  AppAutonomousView,
  AppAutonomousApproval,
  AppAutonomousAssessment,
  AppCertificateSignature,
  AppMeetingBeforeClass,
  AppMeetingBeforeClassDetails,
  AppDehydratorInspectionTask,
  AppDehydratorInspectionExamine,
  AppDeclarationAndIssuanceProcessing,
  UserTrainRoute,
  cockpit2,
];
