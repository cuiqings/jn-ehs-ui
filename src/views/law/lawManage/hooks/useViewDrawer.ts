import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { ref } from 'vue';
import { details, getUserByUsername } from '../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { doPreview } from '/@/api/common/api';
export const useViewDrawer = () => {
  const list: any = ref({});
  const realname = ref('');
  const [registerDrawerView, { setDrawerProps }] = useDrawerInner(async (data) => {
    list.value = {};
    realname.value = '';
    initdetails(data.id);
    // 更新抽屉
    setDrawerProps({ confirmLoading: false });
  });
  const initdetails = (id) => {
    details({ id }).then((res) => {
      list.value = res;
      getUserByUsername({ username: res.createBy }).then((data) => {
        realname.value = data.realname;
      });
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
  // 预览
  const onPreview = (name) => {
    doPreview(name).then((res) => {
      window.open(res, '_blank');
    });
  };
  // 相关文件
  const goView = async (id) => {
    initdetails(id);
    // 更新抽屉
    setDrawerProps({ confirmLoading: false });
  };
  return {
    BasicDrawer,
    registerDrawerView,
    list,
    renderDict,
    onPreview,
    goView,
    realname,
  };
};
export default useViewDrawer;
