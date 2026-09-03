import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/detecrionOnline',
    name: 'AppDetecrionOnline',
    component: () => import('/@/views/app/detecrionOnline/index.vue'),
    meta: {
      title: '在线检测',
    },
  },
  {
    path: '/app/detecrionOnlineDetail',
    name: 'AppDetecrionOnlineDetail',
    component: () => import('/@/views/app/detecrionOnline/detail.vue'),
    meta: {
      title: '在线检测',
    },
  },
  {
    path: '/app/detecrionOnlineDataDetail',
    name: 'AppDetecrionOnlineDataDetail',
    component: () => import('/@/views/app/detecrionOnline/data-detail.vue'),
    meta: {
      title: '在线检测',
    },
  }
  
]

export default routes;