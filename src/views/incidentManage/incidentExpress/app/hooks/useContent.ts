import { getOrganizationNew, saveOrUpdate } from '../../url/index';
import { render } from '/@/utils/common/renderUtils';
import { useRouter } from 'vue-router';
import { showFailToast, showSuccessToast } from 'vant';
import { reactive, ref, onMounted } from 'vue';
export const useContent = (infoRef: any) => {
  const router = useRouter();
  const showPicker = ref(false);
  const info = reactive({
    id: '',
    photo: '',
    orgCode: '',
    result: '',
    type: '',
    description: '',
    eventTime: '',
    address: '',
    interimMeasures: '',
  });
  const orgOptions = ref<any[]>([]);
  const loading = ref(false);
  onMounted(() => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      info.orgCode = orgOptions.value.length === 1 ? orgOptions.value[0]?.value : undefined;
    });
    info.eventTime = timeDate(new Date().getTime(), true);
  });
  const handleSubmit = async () => {
    try {
      const values = await infoRef.value.validate();
      loading.value = true;
      //提交表单
      values.name = await integrateName(values.eventTime, values.orgCode, values.type);
      await saveOrUpdate(values)
        .then((res) => {
          if (res.success) {
            showSuccessToast('保存成功！');
            viewList();
          } else {
            showFailToast(res.message);
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } catch (e) {}
  };
  // 整合name
  const integrateName = async (eventTime: string, orgCode: string, type: string) => {
    let str = '';
    const b = await orgCodeFilter(orgCode);
    str = timeDate(eventTime) + b + render.renderDict(type, 'event_type').children + '事件';
    return str;
  };
  // 查找当前发生单位
  const orgCodeFilter = async (orgCode: string) => {
    let orgText = '';
    try {
      const res = await getOrganizationNew();
      orgText = res.filter((item: any) => item.orgCode === orgCode)[0].departName;
    } catch (e) {}
    return orgText;
  };
  // 年月日/年月日时分
  const timeDate = (eventTime: string | number, is = false) => {
    const date = new Date(eventTime);
    let str = '';
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    if (!is) str = Y + M + D;
    else str = Y + M + D + h + m;
    return str;
  };
  const onConfirm = (selectedValues) => {
    info.eventTime = selectedValues;
    showPicker.value = false;
  };
  const viewList = () => {
    router.push({
      path: '/app/incidentManage/list',
    });
  };
  return {
    handleSubmit,
    viewList,
    info,
    showPicker,
    onConfirm,
    loading,
    orgOptions,
  };
};
export default useContent;
