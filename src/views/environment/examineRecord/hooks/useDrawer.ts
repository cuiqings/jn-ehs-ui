import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { createImgPreview } from '/@/components/Preview/index';
import { ref } from 'vue';
import { queryByPlanId } from '../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
export const useDrawer = () => {
  const orgOptions = ref<any[]>([]);
  const info = ref<any>({
    checkPlanName: '',
    checkFrequency: '',
    organizationName: '',
    isOverdue: '',
    lastCheckTime: '',
    abnormalNum: '',
    jnEnvironmentalCheckRecordSubList: [],
  });
  const resultData = ref<any[]>([]);
  const columns = [
    { title: '序号', dataIndex: 'serialNumber', align: 'center', width: 70 },
    { title: '工序', dataIndex: 'processes', align: 'center', width: 100 },
    { title: '检查项目', dataIndex: 'checkEntry', align: 'center', width: 250 },
    { title: '检查要求', dataIndex: 'checkRecord', align: 'center', width: 315 },
    { title: '检查结果', dataIndex: 'checkResult', align: 'center', width: 100, slots: { customRender: 'checkResult' } },
    { title: '检查照片', dataIndex: 'checkPhoto', align: 'center', width: 100, slots: { customRender: 'checkPhoto' } },
    { title: '影响评估', dataIndex: 'impactAssessment', align: 'center', width: 200 },
  ];
  const activeKey = ref(0);
  const [registerDrawer, { setDrawerProps }] = useDrawerInner(async (data) => {
    info.value = {
      checkPlanName: '',
      checkFrequency: '',
      organizationName: '',
      isOverdue: '',
      lastCheckTime: '',
      abnormalNum: '',
      jnEnvironmentalCheckRecordSubList: [],
    };
    const drawerData = JSON.parse(JSON.stringify(data.data));
    await queryByPlanId({ planId: drawerData.planId }).then((res) => {
      resultData.value = res;
    });
    if (data.type !== 'add') {
      drawerData.isOverdue = drawerData.isOverdue === '0' ? '正常' : '超期';
      info.value = drawerData;
      info.value.checkFrequency = renderDict(info.value.checkFrequency, 'check_frequency');
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false });
  });
  const fmtImg = (record: any) => {
    const firstImg = record.checkPhoto.split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };
  const openImg = (record) => {
    const imageList = record.checkPhoto.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 600,
      rememberState: true,
      scaleStep: 10,
    });
  };
  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  return {
    BasicDrawer,
    registerDrawer,
    info,
    orgOptions,
    columns,
    activeKey,
    fmtImg,
    openImg,
    resultData,
  };
};
export default useDrawer;
