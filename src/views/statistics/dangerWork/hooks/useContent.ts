import { useUserStore } from '/@/store/modules/user';
import { useDrawer } from '/@/components/Drawer';
import { getDerive } from '../../../hazardousOperation/api';
import { saveAs } from 'file-saver';
import { message } from 'ant-design-vue';
import { ref } from 'vue';
export const useContent = () => {
  const userStore: any = useUserStore();

  const work_typeList = userStore.getAllDictItems.work_type;
  const workStatusList = [
    { text: '全部', value: '' },
    { text: '审批中', value: '1' },
    { text: '待作业', value: '2' },
    { text: '作业中', value: '3' },
    { text: '作业中断', value: '7' },
    { text: '已验收', value: '5' },
  ];

  const departList = [
    { departName: '全部单位', orgCode: '' },
    { departName: '一炼铁', orgCode: 'A04B01C01' },
    { departName: '二炼铁', orgCode: 'A04B01C02' },
    { departName: '三炼铁', orgCode: 'A04B01C03' },
    { departName: '一炼钢', orgCode: 'A04B01C04' },
    { departName: '二炼钢', orgCode: 'A04B01C05' },
    { departName: '棒材', orgCode: 'A04B01C07' },
    { departName: '热卷板', orgCode: 'A04B01C06' },
    { departName: '原料', orgCode: 'A04B01C18' },
    { departName: '辅料', orgCode: 'A04B01C19' },
    { departName: '动力', orgCode: 'A04B01C10' },
    { departName: '维修', orgCode: 'A04B01C16' },
    { departName: '高品钢', orgCode: 'A04B01C08' },
    { departName: '宽厚板', orgCode: 'A04B02C01' },
  ];

  const gradeList = [
    { text: '全部等级', value: '' },
    { text: '一级', value: '一级' },
    { text: '二级', value: '二级' },
    { text: '三级', value: '三级' },
  ];

  const columns = [
    {
      title: '作业状态',
      dataIndex: 'workState',
      key: 'workState',
      width: 100,
    },
    {
      title: '申请单位',
      dataIndex: 'applicationUnit',
      key: 'applicationUnit',
      ellipsis: true,
      width: 130,
    },
    {
      title: '申请车间',
      dataIndex: 'workUnit',
      key: 'workUnit',
      ellipsis: true,
      width: 130,
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
      key: 'workContent',
      width: 220,
      ellipsis: true,
    },
    {
      title: '作业编号',
      dataIndex: 'workApplyCode',
      key: 'workApplyCode',
      width: 160,
      ellipsis: true,
    },
    {
      title: '作业类型',
      dataIndex: 'workType',
      key: 'workType',
      width: 150,
      ellipsis: true,
    },
    {
      title: '作业等级',
      dataIndex: 'workLevel',
      key: 'workLevel',
      width: 100,
    },
    {
      title: '高危作业等级',
      dataIndex: 'highWorkLevel',
      key: 'highWorkLevel',
      width: 130,
    },
    {
      title: '作业负责人',
      dataIndex: 'compiler',
      key: 'compiler',
      ellipsis: true,
      width: 120,
    },
    {
      title: '监护人',
      dataIndex: 'guardian',
      key: 'guardian',
      ellipsis: true,
      width: 160,
    },
    {
      title: '作业时间',
      dataIndex: 'workTime',
      key: 'workTime',
      width: 330,
    },
    {
      title: '安全作业检查',
      dataIndex: 'checkResult',
      key: 'checkResult',
      ellipsis: true,
      width: 130,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 100,
    },
  ];
  const columnsUn = [
    {
      title: '作业状态',
      dataIndex: 'workState',
      key: 'workState',
      width: 100,
    },
    {
      title: '申请单位',
      dataIndex: 'applicationUnit',
      key: 'applicationUnit',
      ellipsis: true,
      width: 130,
    },
    {
      title: '申请车间',
      dataIndex: 'workUnit',
      key: 'workUnit',
      ellipsis: true,
      width: 130,
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
      key: 'workContent',
      width: 220,
      ellipsis: true,
    },
    {
      title: '作业编号',
      dataIndex: 'workApplyCode',
      key: 'workApplyCode',
      width: 160,
      ellipsis: true,
    },
    {
      title: '作业负责人',
      dataIndex: 'compiler',
      key: 'compiler',
      ellipsis: true,
      width: 120,
    },
    {
      title: '监护人',
      dataIndex: 'guardian',
      key: 'guardian',
      ellipsis: true,
      width: 160,
    },
    {
      title: '作业时间',
      dataIndex: 'workTime',
      key: 'workTime',
      width: 330,
    },
    {
      title: '安全作业检查',
      dataIndex: 'checkResult',
      key: 'checkResult',
      ellipsis: true,
      width: 130,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      width: 100,
    },
  ];

  const columns2: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: '单位',
      dataIndex: 'departName',
      width: 150,
    },
    {
      title: '申请数量',
      dataIndex: 'applyNum',
      key: 'applyNum',
      width: 90,
    },
    {
      title: '未完结数量',
      dataIndex: 'unfinishedNum',
      key: 'unfinishedNum',
    },
    {
      title: '完结数量',
      dataIndex: 'finishedNum',
      key: 'finishedNum',
    },
    {
      title: '作业次数',
      dataIndex: 'shouldCheckNum',
      key: 'shouldCheckNum',
    },
    {
      title: '安全部检查次数',
      dataIndex: 'checkNum',
      key: 'checkNum',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部问题数量',
      dataIndex: 'problemNum',
      key: 'problemNum',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部检查比例(100%)',
      dataIndex: 'checkRatio',
      key: 'checkRatio',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '副部长检查次数',
      dataIndex: 'fbzCheckNum',
      key: 'fbzCheckNum',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '副部长问题数量',
      dataIndex: 'fbzProblemNum',
      key: 'fbzProblemNum',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '副部长检查比例(50%)',
      dataIndex: 'fbzCheckRatio',
      key: 'fbzCheckRatio',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '安全科长检查次数',
      dataIndex: 'aqkzCheckNum',
      key: 'aqkzCheckNum',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科长问题数量',
      dataIndex: 'aqkzProblemNum',
      key: 'aqkzProblemNum',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科长检查比例(100%)',
      dataIndex: 'aqkzCheckRatio',
      key: 'aqkzCheckRatio',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科检查次数',
      dataIndex: 'aqkCheckNum',
      key: 'aqkCheckNum',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科问题数量',
      dataIndex: 'aqkProblemNum',
      key: 'aqkProblemNum',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科检查比例(100%)',
      dataIndex: 'aqkCheckRatio',
      key: 'aqkCheckRatio',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '车间主任检查次数',
      dataIndex: 'cjZrCheckNum',
      key: 'cjZrCheckNum',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任问题数量',
      dataIndex: 'cjZrProblemNum',
      key: 'cjZrProblemNum',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任检查比例(100%)',
      dataIndex: 'cjZrCheckRatio',
      key: 'cjZrCheckRatio',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '班组长检查次数',
      dataIndex: 'bzzCheckNum',
      key: 'bzzCheckNum',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
    {
      title: '班组长问题数量',
      dataIndex: 'bzzProblemNum',
      key: 'bzzProblemNum',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
    {
      title: '班组长检查比例(100%)',
      dataIndex: 'bzzCheckRatio',
      key: 'bzzCheckRatio',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
  ];
  const columns22: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: '单位',
      dataIndex: 'departName',
      width: 150,
    },
    {
      title: '申请数量',
      dataIndex: 'applyNumThree',
      key: 'applyNumThree',
    },
    {
      title: '未完结数量',
      dataIndex: 'unfinishedNumThree',
      key: 'unfinishedNumThree',
    },
    {
      title: '完结数量',
      dataIndex: 'finishedNumThree',
      key: 'finishedNumThree',
    },
    {
      title: '作业次数',
      dataIndex: 'shouldCheckNumThree',
      key: 'shouldCheckNumThree',
    },
    {
      title: '安全部检查次数',
      dataIndex: 'checkNumThree',
      key: 'checkNumThree',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部问题数量',
      dataIndex: 'problemNumThree',
      key: 'problemNumThree',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部检查比例(60%)',
      dataIndex: 'checkRatioThree',
      key: 'checkRatioThree',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '副部长检查次数',
      dataIndex: 'fbzCheckNumThree',
      key: 'fbzCheckNumThree',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '副部长问题数量',
      dataIndex: 'fbzProblemNumThree',
      key: 'fbzProblemNumThree',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '副部长检查比例(40%)',
      dataIndex: 'fbzCheckRatioThree',
      key: 'fbzCheckRatioThree',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '安全科长检查次数',
      dataIndex: 'aqkzCheckNumThree',
      key: 'aqkzCheckNumThree',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科长问题数量',
      dataIndex: 'aqkzProblemNumThree',
      key: 'aqkzProblemNumThree',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科长检查比例(60%)',
      dataIndex: 'aqkzCheckRatioThree',
      key: 'aqkzCheckRatioThree',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科检查次数',
      dataIndex: 'aqkCheckNumThree',
      key: 'aqkCheckNumThree',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科问题数量',
      dataIndex: 'aqkProblemNumThree',
      key: 'aqkProblemNumThree',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科检查比例(100%)',
      dataIndex: 'aqkCheckRatioThree',
      key: 'aqkCheckRatioThree',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '车间主任检查次数',
      dataIndex: 'cjZrCheckNumThree',
      key: 'cjZrCheckNumThree',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任问题数量',
      dataIndex: 'cjZrProblemNumThree',
      key: 'cjZrProblemNumThree',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任检查比例(100%)',
      dataIndex: 'cjZrCheckRatioThree',
      key: 'cjZrCheckRatioThree',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '班组长检查次数',
      dataIndex: 'bzzCheckNumThree',
      key: 'bzzCheckNumThree',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
    {
      title: '班组长问题数量',
      dataIndex: 'bzzProblemNumThree',
      key: 'bzzProblemNumThree',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
    {
      title: '班组长检查比例(100%)',
      dataIndex: 'bzzCheckRatioThree',
      key: 'bzzCheckRatioThree',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
  ];
  const columns2Un: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: '单位',
      dataIndex: 'departName',
      width: 150,
    },
    {
      title: '申请数量',
      dataIndex: 'applyNum',
      key: 'applyNum',
      width: 90,
    },
    {
      title: '未完结数量',
      dataIndex: 'unfinishedNum',
      key: 'unfinishedNum',
    },
    {
      title: '完结数量',
      dataIndex: 'finishedNum',
      key: 'finishedNum',
    },
    {
      title: '作业次数',
      dataIndex: 'shouldCheckNum',
      key: 'shouldCheckNum',
    },
    {
      title: '安全部检查次数',
      dataIndex: 'aqbCheckNum',
      key: 'aqbCheckNum',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部问题数量',
      dataIndex: 'aqbProblemNum',
      key: 'aqbProblemNum',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    // {
    //   title: '安全部检查比例',
    //   dataIndex: 'checkRatio',
    //   key: 'checkRatio',
    //   className: 'shouldCheckNum',
    //   customCell: () => {
    //     return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
    //   }
    // },
    {
      title: '副部长检查次数',
      dataIndex: 'fbzCheckNum',
      key: 'fbzCheckNum',
      className: 'shouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(199, 223, 255, 0.2)' } };
      },
    },
    {
      title: '副部长问题数量',
      dataIndex: 'fbzProblemNum',
      key: 'fbzProblemNum',
      className: 'shouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(199, 223, 255, 0.2)' } };
      },
    },
    {
      title: '安全科长检查次数',
      dataIndex: 'aqkzCheckNum',
      key: 'aqkzCheckNum',
      className: 'aqkShouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(243, 167, 253, 0.2)' } };
      },
    },
    {
      title: '安全科长问题数量',
      dataIndex: 'aqkzProblemNum',
      key: 'aqkzProblemNum',
      className: 'aqkShouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(243, 167, 253, 0.2)' } };
      },
    },
    {
      title: '安全科检查次数',
      dataIndex: 'aqkCheckNum',
      key: 'aqkCheckNum',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科问题数量',
      dataIndex: 'aqkProblemNum',
      key: 'aqkProblemNum',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科检查比例(60%)',
      dataIndex: 'aqkCheckRatio',
      key: 'aqkCheckRatio',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '车间主任检查次数',
      dataIndex: 'cjZrCheckNum',
      key: 'cjZrCheckNum',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任问题数量',
      dataIndex: 'cjZrProblemNum',
      key: 'cjZrProblemNum',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任检查比例(100)%',
      dataIndex: 'cjZrCheckRatio',
      key: 'cjZrCheckRatio',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '班组长检查次数',
      dataIndex: 'bzzCheckNum',
      key: 'bzzCheckNum',
      className: 'cjZrShouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(126, 255, 147, 0.2)' } };
      },
    },
    {
      title: '班组长问题数量',
      dataIndex: 'bzzProblemNum',
      key: 'bzzProblemNum',
      className: 'cjZrShouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(126, 255, 147, 0.2)' } };
      },
    },
    {
      title: '班组长检查比例(100%)',
      dataIndex: 'bzzCheckRatio',
      key: 'bzzCheckRatio',
      className: 'cjZrShouldCheckNum1',
      customCell: () => {
        return { style: { background: 'rgba(126, 255, 147, 0.2)' } };
      },
    },
  ];
  const columns21: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: '单位',
      dataIndex: 'departName',
      width: 150,
    },
    {
      title: '申请数量',
      dataIndex: 'applyNumTwo',
      key: 'applyNumTwo',
    },
    {
      title: '未完结数量',
      dataIndex: 'unfinishedNumTwo',
      key: 'unfinishedNumTwo',
    },
    {
      title: '完结数量',
      dataIndex: 'finishedNumTwo',
      key: 'finishedNumTwo',
    },
    {
      title: '作业次数',
      dataIndex: 'shouldCheckNumTwo',
      key: 'shouldCheckNumTwo',
    },
    {
      title: '安全部检查次数',
      dataIndex: 'checkNumTwo',
      key: 'checkNumTwo',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部问题数量',
      dataIndex: 'problemNumTwo',
      key: 'problemNumTwo',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '安全部检查比例(60%)',
      dataIndex: 'checkRatioTwo',
      key: 'checkRatioTwo',
      className: 'shouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 199, 199, 0.2)' } };
      },
    },
    {
      title: '副部长检查次数',
      dataIndex: 'fbzCheckNumTwo',
      key: 'fbzCheckNumTwo',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '副部长问题数量',
      dataIndex: 'fbzProblemNumTwo',
      key: 'fbzProblemNumTwo',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '副部长检查比例(40%)',
      dataIndex: 'fbzCheckRatioTwo',
      key: 'fbzCheckRatioTwo',
      className: 'fbzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 209, 96, 0.2)' } };
      },
    },
    {
      title: '安全科长检查次数',
      dataIndex: 'aqkzCheckNumTwo',
      key: 'aqkzCheckNumTwo',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科长问题数量',
      dataIndex: 'aqkzProblemNumTwo',
      key: 'aqkzProblemNumTwo',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科长检查比例(60%)',
      dataIndex: 'aqkzCheckRatioTwo',
      key: 'aqkzCheckRatioTwo',
      className: 'aqkzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(83, 172, 249, 0.2)' } };
      },
    },
    {
      title: '安全科检查次数',
      dataIndex: 'aqkCheckNumTwo',
      key: 'aqkCheckNumTwo',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科问题数量',
      dataIndex: 'aqkProblemNumTwo',
      key: 'aqkProblemNumTwo',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '安全科检查比例(100%)',
      dataIndex: 'aqkCheckRatioTwo',
      key: 'aqkCheckRatioTwo',
      className: 'aqkShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(167,253,218, 0.2)' } };
      },
    },
    {
      title: '车间主任检查次数',
      dataIndex: 'cjZrCheckNumTwo',
      key: 'cjZrCheckNumTwo',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任问题数量',
      dataIndex: 'cjZrProblemNumTwo',
      key: 'cjZrProblemNumTwo',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '车间主任检查比例(100%)',
      dataIndex: 'cjZrCheckRatioTwo',
      key: 'cjZrCheckRatioTwo',
      className: 'cjZrShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(255, 221, 126, 0.2)' } };
      },
    },
    {
      title: '班组长检查次数',
      dataIndex: 'bzzCheckNumTwo',
      key: 'bzzCheckNumTwo',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
    {
      title: '班组长问题数量',
      dataIndex: 'bzzProblemNumTwo',
      key: 'bzzProblemNumTwo',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
    {
      title: '班组长检查比例(100%)',
      dataIndex: 'bzzCheckRatioTwo',
      key: 'bzzCheckRatioTwo',
      className: 'bzzShouldCheckNum',
      customCell: () => {
        return { style: { background: 'rgba(186, 232, 204,0.2)' } };
      },
    },
  ];

  const columns3: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: '高危作业等级',
      dataIndex: 'highWorkLevel',
    },
    {
      title: '申请单位',
      dataIndex: 'orgCode',
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
    },
    {
      title: '检查人',
      dataIndex: 'checkPerson',
    },
    {
      title: '检查单位',
      dataIndex: 'checkPersonOrg',
    },
    {
      title: '检查问题',
      dataIndex: 'checkProblem',
    },
    {
      title: '隐患类别',
      dataIndex: 'yhlb',
    },
    {
      title: '整改情况',
      dataIndex: 'result',
    },
    {
      title: '检查层级',
      dataIndex: 'unitType',
    },
  ];
  const columns3Un: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
    },
    {
      title: '申请单位',
      dataIndex: 'orgCode',
    },
    {
      title: '作业内容',
      dataIndex: 'workContent',
    },
    {
      title: '检查人',
      dataIndex: 'checkPerson',
    },
    {
      title: '检查单位',
      dataIndex: 'checkPersonOrg',
    },
    {
      title: '检查问题',
      dataIndex: 'checkProblem',
    },
    {
      title: '隐患类别',
      dataIndex: 'yhlb',
    },
    {
      title: '整改情况',
      dataIndex: 'result',
    },
    {
      title: '检查层级',
      dataIndex: 'unitType',
    },
  ];

  const onView = (record) => {
    console.log(record);
    openDrawer(true, {
      id: record.id,
      title: record.workTypeName,
    });
  };
  const downloading = ref(false);
  const onExportWork = async (record) => {
    console.log(record);
    downloading.value = true;
    const res = await getDerive({ id: record.id });
    downloading.value = false;
    var reader = new FileReader();
    reader.onload = function (event) {
      //@ts-ignore
      var textData = event.target.result; //@ts-ignore
      if (!JSON.parse(textData).success) message.error(JSON.parse(textData).message); //@ts-ignore
      if (JSON.parse(textData).success) message.success(JSON.parse(textData).message);
    };
    reader.readAsText(res.data); // 这里的 blobData 是从响应中获取的 Blob 数据
    const fileName = decodeURIComponent(res.headers['content-disposition'].split('=')[1]);
    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  const [register, { openDrawer }] = useDrawer();

  return {
    workStatusList,
    work_typeList,
    departList,
    gradeList,
    columns,
    columnsUn,
    columns2,
    columns2Un,
    columns21,
    columns22,
    columns3,
    columns3Un,
    onView,
    onExportWork,
    register,
    downloading,
  };
};
