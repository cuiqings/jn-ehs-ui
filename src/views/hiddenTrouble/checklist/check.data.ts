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
    title: '风险ID',
    width: 150,
    dataIndex: 'riskId',
    ellipsis: true,
    slots: { customRender: 'riskId' },
  },
  {
    title: '所属单位',
    width: 150,
    dataIndex: 'orgName',
    ellipsis: true,
  },
  {
    title: '所属车间',
    dataIndex: 'departName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '区域位置（单元）',
    width: 150,
    dataIndex: 'rgLcName',
    ellipsis: true,
  },
  {
    title: '风险名称',
    width: 160,
    dataIndex: 'riskName',
    ellipsis: true,
  },
  {
    title: '排查内容',
    dataIndex: 'checkContent',
    width: 160,
    ellipsis: true,
  },
  {
    title: '现有安全控制措施',
    children: [
      {
        title: '工程技术措施',
        dataIndex: 'enTechMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '管理措施',
        dataIndex: 'manageMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '培训教育措施',
        dataIndex: 'trainMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '个体防护措施',
        dataIndex: 'selfDfeMsr',
        width: 120,
        ellipsis: true,
      },
      {
        title: '应急处置措施',
        dataIndex: 'emgDpsMsr',
        width: 120,
        ellipsis: true,
      },
    ],
  },
  {
    title: '排查方法',
    dataIndex: 'checkMethod_dictText',
    width: 100,
  },
  {
    title: '排查周期',
    dataIndex: 'checkCycle_dictText',
    width: 100,
    ellipsis: true,
  },
  {
    title: '排查责任人',
    dataIndex: 'checkDutyPersonName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 100,
    ellipsis: true,
  },
];
