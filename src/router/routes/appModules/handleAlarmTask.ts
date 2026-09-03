import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/handleAlarmTask',
    name: 'AppHandleAlarmTask',
    component: () => import('/@/views/app/handleAlarmTask/index.vue'),
    meta: {
      title: '报警处理',
    },
  },
  {
    path: '/app/handleAlarmTaskDetail',
    name: 'AppHandleAlarmTaskDetail',
    component: () => import('/@/views/app/handleAlarmTask/detail.vue'),
    meta: {
      title: '报警处理',
    },
  }
]

export default routes;
