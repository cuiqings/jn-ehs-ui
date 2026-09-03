import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/dangerousWork/index',
    name: 'AppDangerousWork',
    component: () => import('/@/views/app/dangerousWork/index.vue'),
    meta: {
      title: '危险作业',
    },
  },
  {
    path: '/app/dangerousWork/ask',
    name: 'AppDangerousWorkAsk',
    component: () => import('/@/views/app/dangerousWork/ask/index.vue'),
    meta: {
      title: '作业申请',
    },
  },
  {
    path: '/app/dangerousWork/applyItem',
    name: 'AppDangerousWorkApplyItem',
    component: () => import('/@/views/app/dangerousWork/ask/applyItem.vue'),
    meta: {
      title: '危险作业申请类型',
    },
  },
  {
    path: '/app/dangerousWork/askdetail',
    name: 'AppDangerousWorkDetail',
    component: () => import('/@/views/app/dangerousWork/ask/detail.vue'),
    meta: {
      title: '作业申请',
    },
  },
  {
    path: '/app/dangerousWork/approve',
    name: 'AppDangerousWorkApprove',
    component: () => import('/@/views/app/dangerousWork/approve/index.vue'),
    meta: {
      title: '作业审批',
    },
  },
  {
    path: '/app/dangerousWork/approvedetail',
    name: 'Approvedetail',
    component: () => import('/@/views/app/dangerousWork/approve/detail.vue'),
    meta: {
      title: '作业审批',
    },
  },
  {
    path: '/app/dangerousWork/detail',
    name: 'WorkDetail',
    component: () => import('/@/views/app/dangerousWork/detail/detail.vue'),
    meta: {
      title: '作业详情',
    },
  },
  {
    path: '/app/dangerousWork/manage',
    name: 'AppDangerousWorkManage',
    component: () => import('/@/views/app/dangerousWork/manage/index.vue'),
    meta: {
      title: '作业管理',
    },
  },
  {
    path: '/app/dangerousWork/redirect',
    name: 'AppDangerousWorkRedirect',
    component: () => import('/@/views/app/dangerousWork/redirect.vue'),
    meta: {
      title: '危险作业',
    },
  },
  {
    path: '/app/dangerousWork/statistics',
    name: 'AppDangerousWorkStatistics',
    component: () => import('/@/views/statistics/dangerWork/app/index.vue'),
    meta: {
      title: '作业统计',
    },
  },
  {
    path: '/app/dangerousWork/unStatistics',
    name: 'AppDangerousWorkunStatistics',
    component: () => import('/@/views/statistics/dangerWork/app/undgworkStatistics.vue'),
    meta: {
      title: '作业统计',
    },
  },
  {
    path: '/app/dangerousWork/statisticsDetail',
    name: 'AppDangerousWorkStatisticsDetail',
    component: () => import('/@/views/app/dangerousWork/statistics/detail.vue'),
    meta: {
      title: '作业统计明细',
    },
  },
];

export default routes;
