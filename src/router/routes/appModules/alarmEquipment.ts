import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/alarmEquipment',
    name: 'AppAlarmEquipment',
    component: () => import('/@/views/app/alarmEquipment/index.vue'),
    meta: {
      title: '设备报警管理',
    },
  },
  {
    path: '/app/alarmEquipmentDetail',
    name: 'AppAlarmEquipmentDetail',
    component: () => import('/@/views/app/alarmEquipment/detail.vue'),
    meta: {
      title: '设备报警管理详情',
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
