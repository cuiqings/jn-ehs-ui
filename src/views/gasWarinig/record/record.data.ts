import { ref } from 'vue';
import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
export const orgOptions: any = ref([]);
export const workshopOptions: any = ref([]);
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
    dataIndex: 'id',
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
    title: '浓度',
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
    title: '上报状态',
    dataIndex: 'reportStatus',
    width: 150,
  },
  {
    title: '报警类型',
    dataIndex: 'alarmType',
    width: 150,
  },
  {
    title: '报警开始/结束时间',
    dataIndex: 'startTime',
    width: 350,
    customRender: ({ record }) => {
      if (record.startTime && record.endTime) {
        return `${record.startTime} / ${record.endTime}`;
      } else if (record.startTime && !record.endTime) {
        return `${record.startTime} / 还未结束`;
      }
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
      stringToNumber: false,
      showChooseOption: false,
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
    label: '上报状态',
    field: 'reportStatus',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '高报', value: '高报' },
        { label: '低报', value: '低报' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '报警类型',
    field: 'alarmType',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '常规报警', value: '常规报警' },
        { label: '工艺报警', value: '工艺报警' },
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
];
