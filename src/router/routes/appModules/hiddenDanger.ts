import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/hiddenDanger/randomClapping',
    name: 'AppHiddenDanger',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/index.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenDanger/randomClapping/add',
    name: 'AppHiddenDangerAdd',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/add.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenDanger/randomClapping/edit',
    name: 'AppHiddenDangerEdit',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患详情',
    },
  },
  {
    path: '/app/hiddenDanger/randomClapping/edit/undanger',
    name: 'AppHiddenDangerCancel',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '非隐患',
    },
  },
  {
    path: '/app/hiddenDanger/randomClapping/edit/confirmDanger',
    name: 'AppHiddenDangerConfirm',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '确认隐患',
    },
  },
  {
    path: '/app/hiddenDanger/randomClapping/detail',
    name: 'AppHiddenDangerDetail',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/detail.vue'),
    meta: {
      title: '隐患详情',
    },
  },
  {
    path: '/app/hiddenDanger/approve',
    name: 'AppHiddenDangerApprove',
    component: () => import('/@/views/app/hiddenDanger-ZG/approve/index.vue'),
    meta: {
      title: '巡检计划审批',
    },
  },
  {
    path: '/app/hiddenDanger/approve/return',
    name: 'AppHiddenDangerReturn',
    component: () => import('/@/views/app/hiddenDanger-ZG/approve/index.vue'),
    meta: {
      title: '巡检计划审批',
    },
  },
  {
    path: '/app/hiddenDanger/approve/pass',
    name: 'AppHiddenDangerPass',
    component: () => import('/@/views/app/hiddenDanger-ZG/approve/index.vue'),
    meta: {
      title: '巡检计划审批',
    },
  },
  {
    path: '/app/hiddenDanger/dailyTasks',
    name: 'AppHiddenDangerDailyTasks',
    component: () => import('/@/views/app/hiddenDanger-ZG/dailyTasks/index.vue'),
    meta: {
      title: '日常任务处理',
    },
  },
  {
    path: '/app/hiddenDanger/dailyTasks/executeTask',
    name: 'AppHiddenDangerExecuteTask',
    component: () => import('/@/views/app/hiddenDanger-ZG/dailyTasks/executeTask.vue'),
    meta: {
      title: '巡检计划执行',
    },
  },
  {
    path: '/app/hiddenDanger/dailyTasks/detail',
    name: 'AppHiddenDangerDailyTasksDetail',
    component: () => import('/@/views/app/hiddenDanger-ZG/dailyTasks/detail.vue'),
    meta: {
      title: '巡检计划执行',
    },
  },
  {
    path: '/app/hiddenDanger/dangerAdminister',
    name: 'AppDangerAdminister',
    component: () => import('/@/views/app/hiddenDanger-ZG/dangerAdminister/index.vue'),
    meta: {
      title: '隐患排查治理',
    },
  },
  {
    path: '/app/hiddenDanger/ledger',
    name: 'AppDangerLedger',
    component: () => import('/@/views/app/hiddenDanger-ZG/ledger/index.vue'),
    meta: {
      title: '隐患台账',
    },
  },
  {
    path: '/app/hiddenDanger/dangerAdminister/edit',
    name: 'AppDangerAdministerEdit',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患处理',
    },
  },
  {
    path: '/app/hiddenDanger/dangerAdminister/edit/undanger',
    name: 'AppDangerAdministerCancel',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患确认处理',
    },
  },
  {
    path: '/app/hiddenDanger/dangerAdminister/edit/confirmDanger',
    name: 'AppDangerAdministerConfirm',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患确认处理',
    },
  },
  {
    path: '/app/hiddenDanger/dangerAdminister/checkDanger',
    name: 'AppDangerAdministerCheckDanger',
    component: () => import('/@/views/app/hiddenDanger-ZG/dangerAdminister/checkDanger/index.vue'),
    meta: {
      title: '隐患整改',
    },
  },
  {
    path: '/app/hiddenDanger/dangerAdminister/checkAccept',
    name: 'AppDangerAdministerCheckAccept',
    component: () => import('/@/views/app/hiddenDanger-ZG/dangerAdminister/checkAccept/index.vue'),
    meta: {
      title: '隐患验收',
    },
  },
  // 随手拍详情
  {
    path: '/app/hiddenDanger/dangerAdminister/detail',
    name: 'AppHiddenDangerDetaila',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/detail.vue'),
    meta: {
      title: '隐患排查治理',
    },
  },
  {
    path: '/app/hiddenDanger/reportForms',
    name: 'AppDangerReportForms',
    component: () => import('/@/views/app/hiddenDanger-ZG/reportForms/index.vue'),
    meta: {
      title: '巡检统计',
    },
  },
  {
    path: '/app/hiddenDanger/reportForms/pagetwo',
    name: 'AppDangerReportFormsPagetwo',
    component: () => import('/@/views/app/hiddenDanger-ZG/reportForms/index.vue'),
    meta: {
      title: '巡检统计列表',
    },
  },
  // new隐患上报
  {
    path: '/app/hiddenDangerNew/randomClapping',
    name: 'AppHiddenDangerNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/index.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenDangerNew/randomClapping/add',
    name: 'AppHiddenDangerAddNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/add.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenDangerNew/randomClapping/edit',
    name: 'AppHiddenDangerEditNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患详情',
    },
  },
  {
    path: '/app/hiddenDangerNew/randomClapping/edit/undanger',
    name: 'AppHiddenDangerCancelNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '非隐患',
    },
  },
  {
    path: '/app/hiddenDangerNew/randomClapping/edit/confirmDanger',
    name: 'AppHiddenDangerConfirmNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '确认隐患',
    },
  },
  {
    path: '/app/hiddenDangerNew/randomClapping/detail',
    name: 'AppHiddenDangerDetailNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/detail.vue'),
    meta: {
      title: '隐患详情',
    },
  },
  {
    path: '/app/hiddenDangerNew/approve',
    name: 'AppHiddenDangerApproveNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/approve/index.vue'),
    meta: {
      title: '巡检计划审批',
    },
  },
  {
    path: '/app/hiddenDangerNew/approve/return',
    name: 'AppHiddenDangerReturnNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/approve/index.vue'),
    meta: {
      title: '巡检计划审批',
    },
  },
  {
    path: '/app/hiddenDangerNew/approve/pass',
    name: 'AppHiddenDangerPassNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/approve/index.vue'),
    meta: {
      title: '巡检计划审批',
    },
  },
  {
    path: '/app/hiddenDangerNew/dailyTasks',
    name: 'AppHiddenDangerDailyTasksNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/dailyTasks/index.vue'),
    meta: {
      title: '日常任务处理',
    },
  },
  {
    path: '/app/hiddenDangerNew/dailyTasks/executeTask',
    name: 'AppHiddenDangerExecuteTaskNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/dailyTasks/executeTask.vue'),
    meta: {
      title: '巡检计划执行',
    },
  },
  {
    path: '/app/hiddenDangerNew/dailyTasks/detail',
    name: 'AppHiddenDangerDailyTasksDetailNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/dailyTasks/detail.vue'),
    meta: {
      title: '巡检计划执行',
    },
  },
  {
    path: '/app/hiddenDangerNew/dangerAdminister',
    name: 'AppDangerAdministerNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/dangerAdminister/index.vue'),
    meta: {
      title: '隐患排查治理',
    },
  },
  {
    path: '/app/hiddenDangerNew/ledger',
    name: 'AppDangerLedgerNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/ledger/index.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenDangerNew/dangerAdminister/edit',
    name: 'AppDangerAdministerEditNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患处理',
    },
  },
  {
    path: '/app/hiddenDangerNew/dangerAdminister/edit/undanger',
    name: 'AppDangerAdministerCancelNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患确认处理',
    },
  },
  {
    path: '/app/hiddenDangerNew/dangerAdminister/edit/confirmDanger',
    name: 'AppDangerAdministerConfirmNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/edit.vue'),
    meta: {
      title: '隐患确认处理',
    },
  },
  {
    path: '/app/hiddenDangerNew/dangerAdminister/checkDanger',
    name: 'AppDangerAdministerCheckDangerNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/dangerAdminister/checkDanger/index.vue'),
    meta: {
      title: '隐患整改',
    },
  },
  {
    path: '/app/hiddenDangerNew/dangerAdminister/checkAccept',
    name: 'AppDangerAdministerCheckAcceptNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/dangerAdminister/checkAccept/index.vue'),
    meta: {
      title: '隐患验收',
    },
  },
  // 随手拍详情
  {
    path: '/app/hiddenDangerNew/dangerAdminister/detail',
    name: 'AppHiddenDangerDetailaNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/randomClapping/detail.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenDangerNew/reportForms',
    name: 'AppDangerReportFormsNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/reportForms/index.vue'),
    meta: {
      title: '巡检统计',
    },
  },
  {
    path: '/app/hiddenDangerNew/reportForms/pagetwo',
    name: 'AppDangerReportFormsPagetwoNew',
    component: () => import('/@/views/app/hiddenDanger-ZG/reportForms/index.vue'),
    meta: {
      title: '巡检统计列表',
    },
  },
  {
    path: '/app/library/hdAI/camera',
    name: 'AppLibraryHdCamera',
    component: () => import('/@/views/app/library/hdAI/camera.vue'),
    meta: {
      title: '隐患AI识别',
    },
  },
  {
    path: '/app/library/hdAI/camera/detail',
    name: 'AppLibraryHdCameraDetail',
    component: () => import('/@/views/app/library/hdAI/detail.vue'),
    meta: {
      title: '隐患AI识别结果',
    },
  },
];

export default routes;
