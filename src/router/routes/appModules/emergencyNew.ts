import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/emergencyNew/ledger',
    name: 'AppEmergencyNewLedger',
    component: () => import('/@/views/app/emergencyNew/ledger/index.vue'),
    meta: {
      title: '应急预案台账',
    },
  },
  {
    path: '/app/emergencyNew/ledgerdetail',
    name: 'AppEmergencyNewLedgerDetail',
    component: () => import('/@/views/app/emergencyNew/ledger/detail.vue'),
    meta: {
      title: '应急预案台账查看',
    },
  },
  {
    path: '/app/emergencyNew/material',
    name: 'AppEmergencyNewMaterial',
    component: () => import('/@/views/app/emergencyNew/material/index.vue'),
    meta: {
      title: '应急物资管理',
    },
  },
  {
    path: '/app/emergencyNew/materialdetail',
    name: 'AppEmergencyNewMaterialDetail',
    component: () => import('/@/views/app/emergencyNew/material/detail.vue'),
    meta: {
      title: '应急物资查看',
    },
  },
  {
    path: '/app/emergencyNew/plan',
    name: 'AppEmergencyNewPlan',
    component: () => import('/@/views/app/emergencyNew/plan/index.vue'),
    meta: {
      title: '计划审批',
    },
  },
  {
    path: '/app/emergencyNew/plandetail',
    name: 'AppEmergencyNewPlanDetail',
    component: () => import('/@/views/app/emergencyNew/plan/detail.vue'),
    meta: {
      title: '计划详情',
    },
  },
  {
    path: '/app/emergencyNew/signIn',
    name: 'AppEmergencyNewSignIn',
    component: () => import('/@/views/app/emergencyNew/signIn.vue'),
    meta: {
      title: '签到',
    },
  },
  {
    path: '/app/emergencyNew/task',
    name: 'AppEmergencyNewTask',
    component: () => import('/@/views/app/emergencyNew/task/index.vue'),
    meta: {
      title: '演练任务',
    },
  },
  {
    path: '/app/emergencyNew/taskCreate',
    name: 'AppEmergencyNewTaskCreate',
    component: () => import('/@/views/app/emergencyNew/task/create.vue'),
    meta: {
      title: '演练任务',
    },
  },
  {
    path: '/app/emergencyNew/taskDetail',
    name: 'AppEmergencyNewTaskDetail',
    component: () => import('/@/views/app/emergencyNew/task/detail.vue'),
    meta: {
      title: '演练任务',
    },
  },
  {
    path: '/app/emergencyNew/taskApproval',
    name: 'AppEmergencyNewTaskApproval',
    component: () => import('/@/views/app/emergencyNew/taskApproval/index.vue'),
    meta: {
      title: '演练任务审批',
    },
  },
  {
    path: '/app/emergencyNew/taskApprovalDetail',
    name: 'AppEmergencyNewTaskApprovalDetail',
    component: () => import('/@/views/app/emergencyNew/taskApproval/detail.vue'),
    meta: {
      title: '演练任务审批',
    },
  },
];

export default routes;
