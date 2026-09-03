import type { AppRouteRecordRaw } from '/@/router/types';
const alarmRecordRoutes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/alarmRecord/task',
    name: 'AppAlarmRecordTask',
    component: () => import('/@/views/aiIdentify/alarmRecord/app/task.vue'),
    meta: {
      title: '报警任务',
    },
  },
  {
    path: '/app/alarmRecord/details',
    name: 'AppAlarmRecordDetails',
    component: () => import('/@/views/aiIdentify/alarmRecord/app/details.vue'),
    meta: {
      title: '报警任务',
    },
  },
];
export default alarmRecordRoutes;
