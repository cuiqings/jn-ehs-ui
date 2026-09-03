import { BasicColumn, FormSchema } from '/@/components/Table';
import { ref, computed } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from '/@/store/modules/user';
const userStore = useUserStore();
const userinfo: any = computed(() => userStore.getUserInfo);
getOrgList();
const orgOptions = ref([]);
async function getOrgList() {
  await defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
}
export const initOrgCode = () => {
  const orgCode = userinfo.value.orgCode.length >= 6 ? userinfo.value.orgCode.slice(0, 6) : undefined;
  return orgCode;
};
export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    width: 150,
    dataIndex: 'orgName',
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
    width: 100,
  },
  {
    title: '检查项分类',
    width: 150,
    dataIndex: 'itemType_dictText',
  },
  {
    title: '检查项',
    width: 160,
    dataIndex: 'itemName',
  },
  {
    title: '检查内容/方法',
    dataIndex: 'checkContent',
    width: 160,
  },
  {
    title: '检查标准',
    dataIndex: 'checkStandard',
    width: 160,
  },
  {
    title: '对应设备',
    dataIndex: 'deviceId',
    width: 100,
    slots: { customRender: 'deviceId' },
  },
  {
    title: '关联风险',
    dataIndex: 'riskId',
    width: 100,
    slots: { customRender: 'riskId' },
  },
];
export const deviceColumns: BasicColumn[] = [
  {
    title: '编号',
    width: 100,
    dataIndex: 'code',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '所属机构',
    width: 100,
    dataIndex: 'department',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '名称',
    width: 100,
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '系统',
    dataIndex: 'device',
    width: 100,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '类别',
    dataIndex: 'deviceFunction',
    width: 100,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '类型',
    dataIndex: 'deviceType_dictText',
    width: 80,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      switch (text) {
        case 0:
          return '离线';
        case 1:
          return '正常';
        case 2:
          return '报警';
        default:
          return '';
      }
    },
  },
  {
    title: '启/停用',
    dataIndex: 'enableFlag',
    width: 100,
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      switch (text) {
        case 0:
          return '停用';
        case 1:
          return '启用';
        default:
          return '';
      }
    },
  },
  {
    title: '时间',
    dataIndex: 'usedDate',
    width: 120,
    ellipsis: true,
    align: 'center',
  },
];
export const searchDeviceFormSchema: FormSchema[] = [
  {
    field: 'department',
    label: '所属机构',
    component: 'JTreeSelect1',
    // defaultValue: initOrgCode(),
    componentProps: () => {
      return {
        url: '/jn/common/getDepartTreeBy23',
        fieldNames: {
          label: 'departName',
          value: 'orgCode',
          options: 'children',
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    field: 'code',
    label: '编号',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 6 },
  },
];
export const riskPointsColumns: BasicColumn[] = [
  {
    title: '所属机构',
    width: 150,
    align: 'center',
    dataIndex: 'orgName',
    ellipsis: true,
  },
  {
    title: '风险类别',
    width: 100,
    align: 'center',
    dataIndex: 'riskType_dictText',
    ellipsis: true,
  },
  {
    title: '作业活动/设备设施',
    width: 150,
    align: 'center',
    dataIndex: 'jobActivity',
    ellipsis: true,
  },
  {
    title: '检查项目',
    width: 150,
    align: 'center',
    dataIndex: 'checkItem',
    ellipsis: true,
  },
  {
    title: '危险源或潜在事件',
    width: 200,
    align: 'center',
    dataIndex: 'riskDescription',
    ellipsis: true,
  },
  {
    title: '可能导致事故后果',
    width: 200,
    dataIndex: 'consequence',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '主要控制措施',
    width: 200,
    dataIndex: 'ctrlMeasure',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'L',
    width: 100,
    dataIndex: 'evaluateL',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'S',
    width: 100,
    dataIndex: 'evaluateS',
    ellipsis: true,
    align: 'center',
  },
  {
    title: 'R',
    width: 100,
    dataIndex: 'evaluateR',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '风险等级',
    width: 200,
    dataIndex: 'riskLevel_dictText',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '责任部门/责任人',
    width: 200,
    dataIndex: 'dutyOrgPostName',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '排查责任部门/责任人',
    width: 200,
    dataIndex: 'checkDutyOrgPostName',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '排查时间/频率',
    width: 200,
    dataIndex: 'checkTimeCompany',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '失职部门/人员',
    width: 200,
    dataIndex: 'drltOrgPostName',
    ellipsis: true,
    align: 'center',
  },
];
export const searchRiskPointsFormSchema: FormSchema[] = [
  {
    label: '所属机构',
    field: 'org',
    component: 'Select',
    componentProps: {
      options: [],
    },
    colProps: { span: 6 },
  },
  {
    label: '风险类别',
    field: 'riskType',
    component: 'JDictSelectTag',
    defaultValue: [],
    componentProps: {
      dictCode: 'risk_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '作业活动/设备设施',
    field: 'jobActivity',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '危险源或潜在事件',
    field: 'riskDescription',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '可能导致事故后果',
    field: 'consequence',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '主要控制措施',
    field: 'ctrlMeasure',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '风险等级',
    field: 'riskLevel',
    component: 'JDictSelectTag',
    defaultValue: [],
    componentProps: {
      dictCode: 'risk_level',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '责任部门/责任人',
    field: 'dutyOrgPostName',
    component: 'Input',
    colProps: { span: 6 },
  },
];
