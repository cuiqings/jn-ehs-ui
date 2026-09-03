import { getEduOrgList, userListByOrg } from '/@/api/common/api';
import { useForm, FormSchema } from '/@/components/Form';
import { useApiData } from './useApiData';
import { contractorList } from '../api/index';
import { useUserStore } from '/@/store/modules/user';
import { useRoute } from 'vue-router';
import { ref } from 'vue';
export const useContent = () => {
  const route = useRoute();
  const change = async (value: any) => {
    getUser(value.join(','));
    setFieldsValue({
      applicant: undefined,
    });
  };
  const formSchemas: FormSchema[] = [
    {
      field: 'workType',
      label: '作业类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        mode: 'multiple',
        class: 'work-apply-select',
      },
      ifShow: () => route.name !== 'UnhazardousWork-jobManagement',
    },
    {
      field: 'workContent',
      label: '作业内容',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'workApplyCode',
      label: '作业编号',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'applicationUnit',
      label: '申请单位',
      component: 'TreeSelect',
      componentProps: {
        multiple: true,
        placeholder: '请选择',
        fieldNames: { label: 'title', value: 'key', children: 'children' },
        onChange: change,
      },
    },
    {
      field: 'workUnit',
      label: route.name !== 'UnhazardousWork-jobManagement' ? '生产/作业单位' : '生产单位',
      component: 'TreeSelect',
      componentProps: {
        multiple: true,
        placeholder: '请选择',
        fieldNames: { label: 'title', value: 'key', children: 'children' },
      },
    },
    {
      field: 'isBallStatus',
      label: '是否存在布控',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        class: 'work-apply-select',
        options: [
          { text: '是', label: '是', value: '1' },
          { text: '否', label: '否', value: '0' },
        ],
      },
    },
    {
      field: 'applicant',
      label: '申请人',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        fieldNames: { label: 'title', value: 'id' },
        showSearch: true,
        filterOption: (input, option) => option.title.includes(input) || option.id.includes(input),
      },
    },
    {
      field: 'workGrade',
      label: '高危等级',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        mode: 'multiple',
        options: [
          { text: '一级', label: '一级', value: '一级' },
          { text: '二级', label: '二级', value: '二级' },
          { text: '三级', label: '三级', value: '三级' },
        ],
        showSearch: true,
      },
      ifShow: () => route.name !== 'UnhazardousWork-jobManagement',
    },
    {
      field: 'checkMark',
      label: '安全作业检查',
      component: 'Select',
      show: false,
      componentProps: {
        placeholder: '请选择',
        options: [
          { text: '安全部待检查', label: '安全部待检查', value: '1' },
          { text: '副部长待检查', label: '副部长待检查', value: '2' },
          { text: '安全科长待检查', label: '安全科长待检查', value: '11' },
          { text: '安全科待检查', label: '安全科待检查', value: '3' },
          { text: '车间主任待检查', label: '车间主任待检查', value: '4' },
          { text: '班组长待检查', label: '班组长待检查', value: '5' },
          { text: '安全部已检查', label: '安全部已检查', value: '6' },
          { text: '副部长已检查', label: '副部长已检查', value: '7' },
          { text: '安全科长已检查', label: '安全科长已检查', value: '12' },
          { text: '安全科已检查', label: '安全科已检查', value: '8' },
          { text: '车间主任已检查', label: '车间主任已检查', value: '9' },
          { text: '班组长已检查', label: '班组长已检查', value: '10' },
        ],
        showSearch: true,
      },
    },
    {
      field: 'start',
      label: '申请时间',
      component: 'RangeDate',
      componentProps: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD',
        separator: '至',
        clearable: true,
      },
    },
    {
      field: 'workStart',
      label: '作业时间',
      component: 'RangeDate',
      componentProps: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD',
        separator: '至',
        clearable: true,
      },
    },
  ];

  const fireColum = [
    {
      title: '动火类别',
      dataIndex: 'type',
      align: 'center',
      width: 180,
      customCell: (_, index) => {
        if (index === 0) {
          return { rowSpan: 6 };
        }
        if (index > 0 && index < 6) {
          return { rowSpan: 0 };
        }

        if (index === 6) {
          return { rowSpan: 3 };
        }
        if (index > 6 && index < 9) {
          return { rowSpan: 0 };
        }

        if (index === 9) {
          return { rowSpan: 3 };
        }
        if (index > 9 && index < 12) {
          return { rowSpan: 0 };
        }

        if (index === 12) {
          return { rowSpan: 3 };
        }
        if (index > 12 && index < 15) {
          return { rowSpan: 0 };
        }

        if (index === 15) {
          return { rowSpan: 3 };
        }
        if (index > 15 && index < 18) {
          return { rowSpan: 0 };
        }

        if (index === 18) {
          return { rowSpan: 6 };
        }
        if (index > 18) {
          return { rowSpan: 0 };
        }
      },
    },
    {
      title: '确认安全措施',
      dataIndex: 'name',
    },
    {
      title: '图示',
      dataIndex: 'imgUrl',
      align: 'center',
      width: 150,
    },
    {
      title: '确认',
      dataIndex: 'check',
      align: 'center',
      width: 180,
    },
  ];
  const setTypeTit = (index) => {
    return index == 0
      ? '通用要求'
      : index == 6
      ? '砂轮金属切割'
      : index == 9
      ? '墙壁屋顶动火'
      : index == 12
      ? '高处动火（距地面≧2m）'
      : index == 15
      ? '管道设备动火'
      : index == 18
      ? '气切割电焊'
      : '';
  };

  const fireGradeList = [
    { label: 'A级', value: 'A级' },
    { label: 'B级', value: 'B级' },
    { label: 'C级', value: 'C级' },
  ];

  // 动火作业 安全措施
  const fireSafeMathed = (data) => {
    let result = {
      dhConfirm: '',
      securityMeasuresIds: '',
    };

    data.forEach((item, idx) => {
      if (idx == 0) {
        if (item.check) {
          result.dhConfirm += setTypeTit(idx) + '-' + item.check + ',';
        } else {
          result.dhConfirm += setTypeTit(idx) + '-,';
        }
      }
      if (idx == 6) {
        if (item.check) {
          result.dhConfirm += setTypeTit(idx) + '-' + item.check + ',';
        } else {
          result.dhConfirm += setTypeTit(idx) + '-,';
        }
      }
      if (idx == 9) {
        if (item.check) {
          result.dhConfirm += setTypeTit(idx) + '-' + item.check + ',';
        } else {
          result.dhConfirm += setTypeTit(idx) + '-,';
        }
      }
      if (idx == 12) {
        if (item.check) {
          result.dhConfirm += setTypeTit(idx) + '-' + item.check + ',';
        } else {
          result.dhConfirm += setTypeTit(idx) + '-,';
        }
      }
      if (idx == 15) {
        if (item.check) {
          result.dhConfirm += setTypeTit(idx) + '-' + item.check + ',';
        } else {
          result.dhConfirm += setTypeTit(idx) + '-,';
        }
      }
      if (idx == 18) {
        if (item.check) {
          result.dhConfirm += setTypeTit(idx) + '-' + item.check + ',';
        } else {
          result.dhConfirm += setTypeTit(idx) + '-,';
        }
      }
      result.securityMeasuresIds += item.id + '-' + (item.type || '') + ',';
    });
    result.securityMeasuresIds = result.securityMeasuresIds ? result.securityMeasuresIds.slice(0, -1) : '';
    result.dhConfirm = result.dhConfirm ? result.dhConfirm.slice(0, -1) : '';
    return result;
  };
  const userStore: any = useUserStore();
  const resetFunc = async () => {
    // await init();
  };
  const [registerForm, { updateSchema, setFieldsValue, getFieldsValue }] = useForm({
    //注册表单列
    schemas: formSchemas,
    submitButtonOptions: { text: '查询' },
    resetButtonOptions: { text: '重置' },
    fieldMapToTime: [['start', ['startTime', 'endTime'], 'YYYY-MM-DD'], ['workStart', ['workStartTime', 'workEndTime'], 'YYYY-MM-DD']],
    showAdvancedButton: true,
    resetFunc: resetFunc,
    labelWidth: 130,
    baseColProps: { span: 6 },
    labelAlign: 'right',
    submitOnReset: true,
  });
  const departList = ref([]);
  const getApplicationUnitOptions = (tree: any[]) => {
    if (tree.length !== 1) return tree;
    const root = tree[0];
    return root?.title === '敬业集团' && Array.isArray(root.children) ? root.children : tree;
  };

  const removeApplicationUnitRoot = (tree: any[], values: string[]) => {
    if (tree.length !== 1 || tree[0]?.title !== '敬业集团') return values;
    const rootKey = tree[0].key;
    return values.filter((value) => value !== rootKey);
  };

  const init = async () => {
    const { workType } = await useApiData();
    const orgCode = await defaultCompany();
    const res = await getEduOrgList({ level: 4 });
    departList.value = res;
    // 申请单位从集团下一级开始展示，生产/作业单位继续使用完整机构树。
    const applicationUnitOptions = getApplicationUnitOptions(res);
    const applicationUnitOrgCode = removeApplicationUnitRoot(res, orgCode);
    await updateSchema([
      {
        field: 'workType',
        componentProps: { options: workType.value },
      },
      {
        field: 'applicationUnit',
        defaultValue: applicationUnitOrgCode,
        componentProps: {
          treeData: applicationUnitOptions,
          allowClear: applicationUnitOptions.length > 0,
          onchange: (val) => {
            getUser(val);
          },
        },
      },
      {
        field: 'workUnit',
        componentProps: {
          treeData: res,
          allowClear: res.length == 1 && res[0].children && res[0].children.length > 0 ? true : false,
        },
      },
    ]);
    if (applicationUnitOrgCode.length > 0) {
      setFieldsValue({
        applicationUnit: applicationUnitOrgCode,
      });
      getUser(applicationUnitOrgCode);
    }
  };
  async function defaultCompany() {
    const res = await contractorList();
    let code: string[] = [];
    res.map((item) => {
      if (item.user && item.user.includes(userStore.getUserInfo.id)) {
        code.push(item.orgCode);
      }
    });
    if(userStore.getUserInfo.isSecuritySector == 1) {
      if(userStore.getUserInfo.orgCode.startsWith('A04B01C11')) {
        code.push('A04')
      } else {
        code.push(userStore.getUserInfo.orgCode.substr(0, 9))
      }
    } else {
      code.push(userStore.getUserInfo.orgCode)
    }
    return code;
  }
  async function getUser(code) {
    setFieldsValue({
      applicant: undefined,
    });
    let res = await userListByOrg({ orgCode: code, pageSize: 100000 });
    res.records.map((item) => {
      item.title = item.realname + '（' + item.workNo + '）';
    });
    updateSchema({
      field: 'applicant',
      componentProps: {
        options: res.records,
      },
    });
  }
  return {
    init,
    fireColum,
    departList,
    setTypeTit,
    fireSafeMathed,
    fireGradeList,
    registerForm,
    setFieldsValue,
    updateSchema,
    getFieldsValue,
  };
};
export default useContent;
