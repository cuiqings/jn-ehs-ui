import { ref } from 'vue';
import { get3DepartList, selectDeptNew } from '/@/api/common/api';
import { getRgLcList } from '/@/views/hiddenManage/dailyCheck/manage/manage.api';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
const departOptions: any = ref([]);
const orgOptions: any = ref([]);
const recogUnitOptions: any = ref([]);
function getOrgList() {
  get3DepartList().then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
  console.log('options', orgOptions.value);
}
getOrgList();
export const columns: BasicColumn[] = [
  {
    title: '隐患状态',
    ellipsis: true,
    dataIndex: 'yhStatus',
    width: '100px',
    customRender: ({ text }) => {
      //1确认退回 2待确认 3待整改 4待验收 5验收通过 6超期未整改
      if (text == '1') {
        return '确认退回';
      } else if (text == '2') {
        return '待确认';
      } else if (text == '3') {
        return '待整改';
      } else if (text == '4') {
        return '待验收';
      } else if (text == '5') {
        return '验收通过';
      } else if (text == '6') {
        return '超期未整改';
      } else if (text == '7') {
        return '超期整改';
      }
      return '';
    },
  },
  {
    title: '检查时间',
    ellipsis: true,
    dataIndex: 'checkTime',
    width: 120,
  },
  {
    title: '检查层级',
    dataIndex: 'controlLevel',
    width: 100,
    customRender: ({ text }) => {
      // 1安全部 2厂部主要负责人 3厂部安全科 4车间负责人 5班组负责人 6岗位人员 7隐患上报 8专项检查
      if (text == '1') {
        return '安全部';
      } else if (text == '2') {
        return '厂部主要负责人';
      } else if (text == '3') {
        return '厂部安全科';
      } else if (text == '4') {
        return '车间负责人';
      } else if (text == '5') {
        return '班组负责人';
      } else if (text == '6') {
        return '岗位人员';
      } else if (text == '7') {
        return '隐患上报（隐患随手拍）';
      } else if (text == '8') {
        return '专项检查';
      }
      return '';
    },
  },
  {
    title: '检查人',
    ellipsis: true,
    dataIndex: 'checkPersonName',
    width: 120,
  },
  {
    title: '检查人车间',
    ellipsis: true,
    dataIndex: 'checkDepartName',
    width: 120,
  },
  {
    title: '责任单位',
    width: 120,
    dataIndex: 'dutyOrgName',
  },
  {
    title: '整改部门',
    width: 120,
    dataIndex: 'repairDepartName',
  },
  {
    title: '隐患描述',
    ellipsis: false,
    dataIndex: 'yhDescription',
    width: 350,
    slots: {
      customRender: 'yhDescription',
    },
  },
  {
    title: '关联风险点',
    ellipsis: false,
    dataIndex: 'riskName',
    width: 150,
  },
  {
    title: '隐患等级',
    ellipsis: true,
    dataIndex: 'yhLevel',
    width: 100,
    customRender: ({ text }) => {
      if (text === '1') {
        return '一般隐患';
      }
      if (text === '2') {
        return '重大隐患';
      }
    },
  },
  {
    title: '治理措施',
    ellipsis: true,
    dataIndex: 'handleMsr',
    width: 180,
  },
  {
    title: '隐患类别',
    ellipsis: true,
    dataIndex: 'yhType_dictText',
  },
  {
    title: '隐患子类别',
    ellipsis: true,
    dataIndex: 'yhTypeSub_dictText',
  },
  {
    title: '完成时限',
    dataIndex: 'repairTimeLimit',
    width: 120,
    slots: {
      customRender: 'repairTimeLimit',
    },
  },
  {
    title: '整改责任人',
    ellipsis: true,
    dataIndex: 'repairPersonName',
    width: 130,
  },
  {
    title: '复查时间',
    ellipsis: true,
    dataIndex: 'realCheckTime',
    width: 150,
  },
  {
    title: '复查结果',
    dataIndex: 'recheckResult',
    width: 120,
    customRender: ({ text }) => {
      if (text === '1') {
        return '合格';
      }
      if (text === '2') {
        return '不合格';
      }
    },
  },
  {
    title: '复查人',
    ellipsis: true,
    dataIndex: 'realCheckPersonName',
    width: 100,
  },
  {
    title: '隐患照片',
    dataIndex: 'yhPicture',
    width: 120,
    slots: {
      customRender: 'yhPicture',
    },
  },
  {
    title: '整改后照片',
    dataIndex: 'repairPicture',
    width: 120,
    slots: {
      customRender: 'repairPicture',
    },
  },
];
export const riskPointsColumns: BasicColumn[] = [
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
    title: '风险点',
    dataIndex: 'pointName',
    width: '110px',
    align: 'center',
  },
  {
    title: '风险等级',
    width: 100,
    align: 'center',
    dataIndex: 'riskLevel',
    customRender: ({ text }) => {
      // 1重大风险 2较大风险 3一般风险 4低风险
      if (text == '1') {
        return '重大风险';
      } else if (text == '2') {
        return '较大风险';
      } else if (text == '3') {
        return '一般风险';
      } else if (text == '4') {
        return '低风险';
      }
      return '';
    },
  },
];
export const searchRiskPointsFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'orgCode',
    component: 'Select',
    componentProps: () => {
      return {
        options: orgOptions.value,
        onChange: (val) => {
          selectDeptNew({ orgCode: val }).then((res) => {
            departOptions.value = res.map((item) => {
              return {
                label: item.departName,
                value: item.orgCode,
              };
            });
          });
        },
      };
    },
  },
  {
    label: '所属车间',
    field: 'departCode',
    component: 'Select',
    componentProps: () => {
      return {
        options: departOptions.value,
        // 级联选择器
        onChange: (val) => {
          getRgLcList({ departCode: val }).then((res) => {
            recogUnitOptions.value = res.map((item) => {
              return {
                label: item.recogUnit,
                value: item.id,
              };
            });
          });
        },
      };
    },
  },
  {
    label: '辨识单元',
    field: 'recogId',
    component: 'Select',
    componentProps: () => {
      return {
        options: recogUnitOptions.value,
      };
    },
  },
  {
    label: '风险等级',
    field: 'riskLevel',
    component: 'Select',
    componentProps: () => {
      return {
        options: [
          {
            label: '重大风险',
            value: '1',
          },
          {
            label: '较大风险',
            value: '2',
          },
          {
            label: '一般风险',
            value: '3',
          },
          {
            label: '低风险',
            value: '4',
          },
        ],

      };
    },
  },
  {
    label: '风险点',
    field: 'pointName',
    component: 'Input',
  },
];

export const signUserColumns: BasicColumn[] = [
  {
    title: '用户账号',
    align: 'center',
    dataIndex: 'username',
    ellipsis: true,
  },
  {
    title: '用户姓名',
    align: 'center',
    dataIndex: 'realname',
    ellipsis: true,
  },
];
