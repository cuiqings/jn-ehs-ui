import type { AppRouteRecordRaw } from '/@/router/types';
const routes: Array<AppRouteRecordRaw> = [
  {
    path: '/app/hiddenManage/randomClapping/list',
    name: 'AppHiddenManageRandomClappingList',
    component: () => import('/@/views/app/hiddenManage/randomClapping/index.vue'),
    meta: {
      title: '隐患随手拍',
    },
  },
  {
    path: '/app/hiddenManage/randomClapping/add',
    name: 'AppHiddenManageAdd',
    component: () => import('/@/views/app/hiddenManage/randomClapping/add.vue'),
    meta: {
      title: '隐患上报',
    },
  },
  {
    path: '/app/hiddenManage/deal',
    name: 'AppHiddenManageDeal',
    component: () => import('/@/views/app/hiddenManage/components/deal.vue'),
    meta: {
      title: '隐患处理',
    },
  },
  // 日常检查任务
  {
    path: '/app/hiddenManage/dailyTasks',
    name: 'AppHiddenManageDailyTasks',
    component: () => import('/@/views/app/hiddenManage/dailyTasks/index.vue'),
    meta: {
      title: '日常任务处理',
    },
  },
  {
    path: '/app/hiddenManage/dailyTasks/executeTask',
    name: 'AppHiddenManageExecuteTask',
    component: () => import('/@/views/app/hiddenManage/dailyTasks/executeTask.vue'),
    meta: {
      title: '巡检计划执行',
    },
  },
  {
    path: '/app/hiddenManage/dailyTasks/detail',
    name: 'AppHiddenManageDailyTasksDetail',
    component: () => import('/@/views/app/hiddenManage/dailyTasks/detail.vue'),
    meta: {
      title: '巡检计划执行',
    },
  },
  {
    path: '/app/hiddenManage/checkPlan',
    name: 'AppDangerManage',
    component: () => import('/@/views/app/hiddenManage/checkPlan/index.vue'),
    meta: {
      title: '排查计划',
    },
  },
   // 排查计划详情
   {
    path: '/app/hiddenManage/checkPlan/edit',
    name: 'AppHiddenDangerDetailaNew',
    component: () => import('/@/views/app/hiddenManage/checkPlan/edit.vue'),
    meta: {
      title: '排查计划详情',
    },
  },
  // 专项检查任务
  {
    path: '/app/hiddenManage/specialTasks',
    name: 'AppHiddenManageSpecialTasks',
    component: () => import('/@/views/app/hiddenManage/specialTasks/signIndex.vue'),
    meta: {
      title: '专项任务',
    },
  },
  {
    path: '/app/hiddenManage/specialTasks/taskInfo',
    name: 'AppHiddenManageSpecialTasksTaskInfo',
    component: () => import('/@/views/app/hiddenManage/specialTasks/taskInfo.vue'),
    meta: {
      title: '专项任务检查',
    },
  },
  {
    path: '/app/hiddenManage/specialTasks/executeTask',
    name: 'AppHiddenManageSpecialTasksExecuteTask',
    component: () => import('/@/views/app/hiddenManage/specialTasks/executeTask.vue'),
    meta: {
      title: '专项任务执行',
    },
  },
  {
    path: '/app/hiddenManage/specialTasks/detail',
    name: 'AppHiddenManageSpecialTasksDetail',
    component: () => import('/@/views/app/hiddenManage/specialTasks/detail.vue'),
    meta: {
      title: '专项任务详情',
    },
  },
  // 整改计划列表
  {
    path: '/app/hiddenManage/repairPlan',
    name: 'AppRepairPlan',
    component: () => import('/@/views/app/hiddenManage/repairPlan/index.vue'),
    meta: {
      title: '整改计划',
    },
  },
   // 整改计划审批
   {
    path: '/app/hiddenManage/repairPlan/approval',
    name: 'AppRepairPlanApproval',
    component: () => import('/@/views/app/hiddenManage/repairPlan/approval.vue'),
    meta: {
      title: '整改计划审批',
    },
  },
  {
    path: '/app/hiddenManage/repairPlan/detail',
    name: 'AppRepairPlanDetail',
    component: () => import('/@/views/app/hiddenManage/repairPlan/detail.vue'),
    meta: {
      title: '整改计划详情',
    },
  },
  // 日常检查隐患治理
  {
    path: '/app/hiddenManage/dailyDanger',
    name: 'AppHiddenManageDailyDanger',
    component: () => import('/@/views/app/hiddenManage/dailyDanger/index.vue'),
    meta: {
      title: '日常检查隐患治理',
    },
  },
  // 专项隐患治理
  {
    path: '/app/hiddenManage/specialDanger',
    name: 'AppHiddenManageSpecialDanger',
    component: () => import('/@/views/app/hiddenManage/specialDanger/index.vue'),
    meta: {
      title: '专项检查隐患治理',
    },
  },
  {
    path: '/app/hiddenManage/account',
    name: 'AppHiddenManageAccount',
    component: () => import('/@/views/app/hiddenManage/account/index.vue'),
    meta: {
      title: '隐患台账',
    },
  },
  // 煤气预警平台
  {
    path: '/app/gasWarning',
    name: 'AppGasWarning',
    component: () => import('/@/views/app/gasWarning/index.vue'),
    meta: {
      title: '煤气预警处理',
    },
  },  
   {
    path: '/app/hiddenManage/tipOff/list',
    name: 'AppHiddenManageTipOffList',
    component: () => import('/@/views/app/hiddenManage/tipOff/index.vue'),
    meta: {
      title: '隐患举报',
    },
  },
  {
    path: '/app/hiddenManage/tipOff/add',
    name: 'AppHiddenManageTipOffAdd',
    component: () => import('/@/views/app/hiddenManage/tipOff/add.vue'),
    meta: {
      title: '隐患举报上报',
    },
  },
  // 隐患举报答复
  {
    path: '/app/hiddenManage/tipOff/reply',
    name: 'AppHiddenManageTipOffReply',
    component: () => import('/@/views/app/hiddenManage/tipOff/reply.vue'),
    meta: {
      title: '隐患举报答复',
    },
  },
  {
    path: '/app/hiddenManage/tipOff/detail',
    name: 'AppHiddenManageTipOffDetail',
    component: () => import('/@/views/app/hiddenManage/tipOff/detail.vue'),
    meta: {
      title: '隐患举报详情',
    },
  },
  // 权限转交
  {
    path: '/app/permissionTransfer',
    name: 'AppPermissionTransfer',
    component: () => import('/@/views/app/permissionTransfer/index.vue'),
    meta: {
      title: '权限临时转交',
    },
  },
];

export default routes;
