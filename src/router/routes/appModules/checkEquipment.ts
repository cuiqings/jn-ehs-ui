import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/checkEquipment',
    name: 'AppCheckEquipment',
    component: () => import('/@/views/app/checkEquipment/index.vue'),
    meta: {
      title: '设备检验',
    },
  },
  {
    path: '/app/checkEquipment/detail',
    name: 'AppCheckEquipmentDetail',
    component: () => import('/@/views/app/checkEquipment/detail.vue'),
    meta: {
      title: '设备检验',
    },
  }
  
]

export default routes;