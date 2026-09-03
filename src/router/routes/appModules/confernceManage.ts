import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/conferenceManage/appSign',
    name: 'AppConferenceManageClappingList',
    component: () => import('/@/views/conferenceManage/mine/appSign.vue'),
    meta: {
      title: '扫码签到',
    },
  },
  {
    path: '/app/highRiskLedger/ledger',
    name: 'AppHighRiskLedger',
    component: () => import('/@/views/occupationalHealth/highRiskLedger/appLedger.vue'),
    meta: {
      title: '检测记录',
    },
  },
];

export default routes;
