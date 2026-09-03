import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/safetyResponsibility/dutyFill',
    name: 'AppSafetyResponsibilityDutyFill',
    component: () => import('/@/views/app/safetyResponsibility/dutyFill/index.vue'),
    meta: {
      title: '履职填报',
    },
  },
  {
    path: '/app/safetyResponsibility/dutyFill/fillModal',
    name: 'AppSafetyResponsibilityDutyFillModal',
    component: () => import('/@/views/app/safetyResponsibility/dutyFill/fillModal.vue'),
    meta: {
      title: '履职填报',
    },
  },
  {
    path: '/app/safetyResponsibility/dutyReview',
    name: 'AppSafetyResponsibilityDutyReview',
    component: () => import('/@/views/app/safetyResponsibility/dutyReview/index.vue'),
    meta: {
      title: '履职审核',
    },
  },
  {
    path: '/app/safetyResponsibility/dutyReview/detail',
    name: 'AppSafetyResponsibilityDutyReviewDetail',
    component: () => import('/@/views/app/safetyResponsibility/dutyReview/detail.vue'),
    meta: {
      title: '履职信息',
    },
  }
]

export default routes;