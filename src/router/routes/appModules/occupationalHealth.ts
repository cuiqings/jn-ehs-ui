import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/occupationalHealthFile',
    name: 'AppOccupationalHealthFile',
    component: () => import('/@/views/app/occupationalHealth/file/index.vue'),
    meta: {
      title: '职业健康档案',
    },
  },
  {
    path: '/app/occupationalHealthFile/detail',
    name: 'AppOccupationalHealthFileDetail',
    component: () => import('/@/views/app/occupationalHealth/file/detail.vue'),
    meta: {
      title: '职业健康档案详情',
    },
  },
  {
    path: '/app/occupationalHealth',
    name: 'AppOccupationalHealth',
    component: () => import('/@/views/app/occupationalHealth/index.vue'),
    meta: {
      title: '职业健康体检',
    },
  },
  {
    path: '/app/occupationalHealth/detail',
    name: 'AppOccupationalHealthDetail',
    component: () => import('/@/views/app/occupationalHealth/detail.vue'),
    meta: {
      title: '职业健康体检详情',
    },
  }
]

export default routes;
