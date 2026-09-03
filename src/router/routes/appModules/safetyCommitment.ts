import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/supervisor/task',
    name: 'AppSupervisorTask',
    component: () => import('/@/views/app/safetyCommitment/index.vue'),
    meta: {
      title: '安全承诺书签署',
    },
  },
]

export default routes;
