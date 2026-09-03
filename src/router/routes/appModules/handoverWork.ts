import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/handoverWork',
    name: 'AppHandoverWork',
    component: () => import('/@/views/app/handoverWork/list/index.vue'),
    meta: {
      title: '交接班管理',
    },
  },
  {
    path: '/app/handoverWorkSubmit',
    name: 'AppHandoverWorkSubmit',
    component: () => import('/@/views/app/handoverWork/detail/index.vue'),
    meta: {
      title: '交班',
    },
  },
  {
    path: '/app/handoverWorkCatch',
    name: 'AppHandoverWorkCatch',
    component: () => import('/@/views/app/handoverWork/detail/index.vue'),
    meta: {
      title: '接班',
    },
  },
  {
    path: '/app/handoverWorkSign',
    name: 'AppHandoverWorkSign',
    component: () => import('/@/views/app/handoverWork/detail/index.vue'),
    meta: {
      title: '签字',
    },
  },
  {
    path: '/app/handoverWorkDetail',
    name: 'AppHandoverWorkDetail',
    component: () => import('/@/views/app/handoverWork/detail/index.vue'),
    meta: {
      title: '详情',
    },
  }
]

export default routes;
