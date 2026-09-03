import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/unhazardousWork/index',
    name: 'AppUnhazardousWork',
    component: () => import('/@/views/app/dangerousWork/index.vue'),
    meta: {
      title: '危险作业',
    },
  },
  {
    path: '/app/unhazardousWork/ask',
    name: 'AppUnhazardousWorkAsk',
    component: () => import('/@/views/app/dangerousWork/ask/index.vue'),
    meta: {
      title: '作业申请',
    },
  },
  {
    path: '/app/unhazardousWork/applyItem',
    name: 'AppUnhazardousWorkApplyItem',
    component: () => import('/@/views/app/dangerousWork/ask/applyItem.vue'),
    meta: {
      title: '危险作业申请类型',
    },
  },
  {
    path: '/app/unhazardousWork/askdetail',
    name: 'AppUnhazardousWorkAddDetail',
    component: () => import('/@/views/app/dangerousWork/ask/detail.vue'),
    meta: {
      title: '作业申请',
    }
  },
  {
    path: '/app/unhazardousWork/approve',
    name: 'AppUnhazardousWorkApprove',
    component: () => import('/@/views/app/dangerousWork/approve/index.vue'),
    meta: {
      title: '作业审批',
    },
  },
  {
    path: '/app/unhazardousWork/approvedetail',
    name: 'AppUnhazardousWorkApprovedetail',
    component: () => import('/@/views/app/dangerousWork/approve/detail.vue'),
    meta: {
      title: '作业审批详情',
    }
  },
  {
    path: '/app/unhazardousWork/detail',
    name: 'AppUnhazardousWorkDetail',
    component: () => import('/@/views/app/dangerousWork/detail/detail.vue'),
    meta: {
      title: '作业详情',
    },
  },
  {
    path: '/app/unhazardousWork/manage',
    name: 'AppUnhazardousWorkManage',
    component: () => import('/@/views/app/dangerousWork/manage/index.vue'),
    meta: {
      title: '作业管理',
    },
  },
  {
    path: '/app/unhazardousWork/redirect',
    name: 'AppUnhazardousWorkRedirect',
    component: () => import('/@/views/app/dangerousWork/redirect.vue'),
    meta: {
      title: '危险作业',
    },
  },
  {
    path: '/app/unhazardousWork/statistics',
    name: 'AppUnhazardousWorkStatistics',
    component: () => import('/@/views/app/dangerousWork/statistics/index.vue'),
    meta: {
      title: '作业统计',
    },
  },
  {
    path: '/app/unhazardousWork/statisticsDetail',
    name: 'AppUnhazardousWorkStatisticsDetail',
    component: () => import('/@/views/app/dangerousWork/statistics/detail.vue'),
    meta: {
      title: '作业统计明细',
    },
  },
];

export default routes;
