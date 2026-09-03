import { ref } from 'vue';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
export const orgOptions: any = ref([]);
export const workshopOptions: any = ref([]);
export const isDisabled = ref(false);
export const getOrgList = async () => {
  await getDepart3ListWithSecurity().then((res) => {
    orgOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
};
export const getWorkshopList = (orgCode) => {
  selectDeptNew({ orgCode }).then((res) => {
    workshopOptions.value = res.map((item) => {
      return {
        label: item.departName,
        value: item.orgCode,
      };
    });
  });
};
export const columns: BasicColumn[] = [
  {
    title: '报警ID',
    dataIndex: 'recordId',
    width: 150,
    fixed: 'left',
  },
  {
    title: '所属单位',
    dataIndex: 'orgCodeName',
    width: 200,
  },
  {
    title: '所属车间',
    dataIndex: 'workshopName',
    width: 200,
  },
  {
    title: '探头位置',
    dataIndex: 'probePosition',
    width: 200,
  },
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    width: 200,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 150,
  },
  {
    title: '上报浓度',
    dataIndex: 'concentration',
    width: 120,
  },
  {
    title: '报警状态',
    dataIndex: 'alarmStatus',
    width: 150,
    customRender: ({ text }) => {
      const color = text === '1' ? 'red' : 'green';
      const label = text === '1' ? '报警中' : '已结束';
      return render.renderTag(label, color);
    },
  },
  {
    title: '报警开始/结束时间',
    dataIndex: 'startTime',
    width: 350,
    // 合并显示字段
    customRender: ({ record }) => {
      if (record.startTime && record.endTime) {
        return `${record.startTime} / ${record.endTime}`;
      } else if (record.startTime && !record.endTime) {
        return `${record.startTime} / 还未结束`;
      }
    },
  },
  {
    title: '处理状态',
    dataIndex: 'status',
    width: 150,
    customRender: ({ text }) => {
      const color = text === '0' ? 'orange' : 'green';
      const label = text === '0' ? '未处理' : '已处理';
      return render.renderTag(label, color);
    },
  },
  {
    title: '处理人',
    dataIndex: 'userName',
    width: 200,
  },
  {
    title: '处理时间',
    dataIndex: 'processingTime',
    width: 200,
  },
  {
    title: '报警类型',
    dataIndex: 'processingType',
    width: 200,
    customRender: ({ text }) => {
      return render.renderDictText(text, 'alarm_warnType');
    },
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    label: '所属单位',
    field: 'orgCode',
    component: 'Select',
    componentProps: ({ formModel }) => {
      return {
        options: orgOptions,
        placeholder: '请选择',
        disabled: orgOptions.value.length === 1,
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
        onChange: (value) => {
          formModel.workshop = undefined;
          workshopOptions.value = [];
          if (value) {
            getWorkshopList(value);
          }
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '所属车间',
    field: 'workshop',
    component: 'Select',
    componentProps: {
      options: workshopOptions,
      placeholder: '请选择',
      showSearch: true,
      filterOption: (input: string, option: any) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
    colProps: { span: 6 },
  },
  {
    label: '探头位置',
    field: 'probePosition',
    component: 'Input',
    componentProps: {
      placeholder: '请输入',
    },
    colProps: { span: 6 },
  },
  {
    label: '设备编号',
    field: 'deviceCode',
    component: 'Input',
    componentProps: {
      placeholder: '请输入',
    },
    colProps: { span: 6 },
  },
  {
    label: '设备类型',
    field: 'deviceType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'gas_device_type',
      placeholder: '请选择',
    },
    colProps: { span: 6 },
  },
  {
    label: '报警状态',
    field: 'alarmStatus',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '报警中', value: '1' },
        { label: '已结束', value: '0' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '处理状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '未处理', value: '0' },
        { label: '已处理', value: '1' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '报警时间',
    field: 'alarmTime',
    component: 'RangeDate',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
    },
    colProps: { span: 6 },
  },
  {
    label: '处理人',
    field: 'handler',
    component: 'Input',
    componentProps: {
      placeholder: '请输入',
    },
    colProps: { span: 6 },
  },
  {
    label: '报警类型',
    field: 'processingType',
    component: 'JDictSelectTag',
    componentProps: () => {
      return {
        dictCode: 'alarm_warnType',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      };
    },
    colProps: { span: 6 },
  },
];

export const processFormSchema: FormSchema[] = [
  {
    field: 'divider-basic',
    component: 'Divider',
    label: '基础信息',
    componentProps: {
      style: {
        color: '#1890ff',
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '所属单位',
    field: 'orgCodeName',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '所属车间',
    field: 'workshopName',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '探头位置',
    field: 'probePosition',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '设备编号',
    field: 'deviceCode',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '上报浓度',
    field: 'concentration',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '报警状态',
    field: 'alarmStatus',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '报警开始/结束时间',
    field: 'alarmTime',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '',
    field: 'status',
    component: 'Input',
    show: false,
  },
  {
    field: 'divider-cl',
    component: 'Divider',
    label: '处理信息',
    componentProps: {
      style: {
        color: '#1890ff',
      },
    },
    ifShow: ({ values }) => {
      return !isDisabled.value || values.status === '1';
    },
    colProps: { span: 24 },
  },
  {
    label: '处理人',
    field: 'userName',
    component: 'Input',
    ifShow: ({ values }) => {
      return isDisabled.value && values.status === '1';
    },
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '处理时间',
    field: 'processingTime',
    component: 'Input',
    ifShow: ({ values }) => {
      return isDisabled.value && values.status === '1';
    },
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '报警类型',
    field: 'processingType',
    required: () => !isDisabled.value,
    component: 'JDictSelectTag',
    ifShow: ({ values }) => {
      return !isDisabled.value || values.status === '1';
    },
    componentProps: () => {
      return {
        dictCode: 'alarm_warnType',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
        disabled: isDisabled.value,
      };
    },
    colProps: { span: 24 },
  },
  {
    label: '报警说明',
    field: 'description',
    required: () => !isDisabled.value,
    component: 'InputTextArea',
    ifShow: ({ values }) => {
      return !isDisabled.value || values.status === '1';
    },
    componentProps: () => {
      return {
        placeholder: '请输入',
        disabled: isDisabled.value,
        autoSize: true,
      };
    },
    colProps: { span: 24 },
  },
  {
    label: '处理结果',
    field: 'result',
    required: () => !isDisabled.value,
    component: 'InputTextArea',
    ifShow: ({ values }) => {
      return !isDisabled.value || values.status === '1';
    },
    componentProps: () => {
      return {
        placeholder: '请输入',
        disabled: isDisabled.value,
        autoSize: true,
      };
    },
    colProps: { span: 24 },
  },
  {
    field: 'fileUrl',
    required: () => !isDisabled.value,
    component: 'JImageUpload',
    label: '上传图片',
    ifShow: ({ values }) => {
      return !isDisabled.value || values.status === '1';
    },
    componentProps: () => {
      return {
        disabled: isDisabled.value,
        maxCount: 10,
        bizPath: 'gasWarning',
      };
    },
  },
];
