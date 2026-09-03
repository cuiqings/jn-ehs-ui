import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';

import {useUserStore} from '/@/store/modules/user';
import {ref, computed, unref, defineComponent, reactive} from 'vue';
import {message, Upload} from "ant-design-vue";
import { defHttp } from '/@/utils/http/axios';
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
const departId = ref("");
const loginName = ref("");
const receiveUserOptions = ref([]);

//  userinfo.value.realname + userinfo.value.workNo;
loginName.value = userinfo.value.realname;
 async function getReceiveUser() {

  if(loginInfo.value.departs.length>0){
    departId.value = loginInfo.value.departs[0].id;
    let params = {
      departIds: departId.value
    };

    let res = await defHttp.get({
      url: '/jn/common/getUserInfo',
      params
    }, {isTransformResponse: false});
    if (res.success && res.result) {
      receiveUserOptions.value = [...res.result];
    } else {
      console.log('数根节点查询结果异常', res);
    }
  }

}
getReceiveUser();


//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '本人签字',
    field: 'recipientSign',
    required: true,
    component: 'JImageUpload',
    componentProps: {
      fileMax: 1,
      maxCount: 1,
      bizPath:'noticeSign',
      beforeUpload: (file: File) => {
        const isLt50M = file.size / 1024 / 1024 < 50;
        if (!isLt50M) {
          message.error('图片过大，请不要超过50M！');
          return false || Upload.LIST_IGNORE;
        }
        return true;
      },
    },
  },
 
  {
    label: '整改责任人',
    field: 'correctorId',
    required: true,
    component: 'Select',
    defaultValue : loginName,
    componentProps: { 
      options: receiveUserOptions,
    },
  },

  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];


