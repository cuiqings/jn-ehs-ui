import { BasicColumn, FormSchema } from '/@/components/Table';
import { defHttp } from '/@/utils/http/axios';
import { ref } from 'vue';
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
export const columns: BasicColumn[] = [
  {
    title: '检查类型',
    width: 140,
    dataIndex: 'checkType',
    customRender: ({ record }) => {
      // 检查类别（3综合检查 4季节性检查 5节假日检查 6专项检查 7重大事故隐患检查 8重大风险管控措施检查）
      if (record.checkType == '3') {
        return '综合检查';
      } else if (record.checkType == '4') {
        return '季节性检查';
      } else if (record.checkType == '5') {
        return '节假日检查';
      } else if (record.checkType == '6') {
        return '专项检查';
      } else if (record.checkType == '7') {
        return '重大事故隐患检查';
      } else if (record.checkType == '8') {
        return '重大风险管控措施检查';
      }
      return '';
    },
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 120,
    ellipsis: true,
  },
  {
    title: '检查范围',
    width: 160,
    dataIndex: 'orgNameRange',
    ellipsis: true,
  },
  {
    title: '任务时间',
    width: 220,
    dataIndex: 'taskTimeStart',
    customRender: ({ record }) => {
      return record.taskTimeStart + ' - ' + record.taskTimeEnd;
    },
  },

  {
    title: '检查人',
    width: 180,
    dataIndex: 'checkPersonName',
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    width: 110,
  },
];
export const checkLibraryColumns: BasicColumn[] = [
  {
    title: '检查类型',
    width: 120,
    dataIndex: 'checkType',
    customRender: ({ record }) => {
      // 检查类别（3综合检查 4季节性检查 5节假日检查 6专项检查 7重大事故隐患检查）
      if (record.checkType == '3') {
        return '综合检查';
      } else if (record.checkType == '4') {
        return '季节性检查';
      } else if (record.checkType == '5') {
        return '节假日检查';
      } else if (record.checkType == '6') {
        return '专项检查';
      } else if (record.checkType == '7') {
        return '重大事故隐患检查';
      }
      return '';
    },
  },
  {
    title: '检查表名称',
    width: 160,
    dataIndex: 'checkTable',
  },
  {
    title: '编制单位',
    width: 120,
    dataIndex: 'orgName',
  },
  {
    title: '备注',
    width: 100,
    dataIndex: 'remark',
  },
];
export const searchCheckLibraryFormSchema: FormSchema[] = [
  {
    field: 'org',
    label: '所属机构',
    component: 'Select',
    componentProps: () => {
      return {
        options: orgOptions,
        placeholder: '请选择',
      };
    },
    colProps: { span: 6 },
  },
  {
    field: 'itemType',
    label: '检查项分类',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'check_sort',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    field: 'itemName',
    label: '检查项',
    component: 'Input',
    colProps: { span: 6 },
  },
];
export const riskLibraryColumns: BasicColumn[] = [
  {
    title: '所属单位',
    ellipsis: true,
    dataIndex: 'orgName',
    width: '100px',
    align: 'center',
  },
  {
    title: '所属车间',
    ellipsis: true,
    dataIndex: 'departName',
    width: '100px',
    align: 'center',
  },
  {
    title: '辨识单元',
    dataIndex: 'recogUnit',
    width: '100px',
    align: 'center',
  },
  {
    title: '风险部位',
    dataIndex: 'workSite',
    width: '110px',
    align: 'center',
  },
  {
    title: '风险等级',
    dataIndex: 'riskLevel',
    width: '80px',
    align: 'center',
    customRender: ({ record }) => {
      // 1重大风险 2较大风险 3一般风险 4低风险
      if (record.riskLevel == '1') {
        return '重大风险';
      } else if (record.riskLevel == '2') {
        return '较大风险';
      } else if (record.riskLevel == '3') {
        return '一般风险';
      } else if (record.riskLevel == '4') {
        return '低风险';
      }
      return '';
    },
  },
  {
    title: '风险失控表现',
    dataIndex: 'riskFactor',
    width: '120px',
    align: 'center',
    ellipsis: true,
  },
];
