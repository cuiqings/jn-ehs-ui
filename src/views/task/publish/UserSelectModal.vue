<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="选择验收人" @ok="onSubmit" width="900px">
      <!-- <a-tabs v-model:activeKey="activeKey" @change="tabChange">
          <a-tab-pane key="1" tab="按单位"></a-tab-pane>
          <a-tab-pane key="2" tab="按用户"></a-tab-pane>
        </a-tabs> -->
      <a-row justify="space-between">
        <a-col flex="560px" class="rp-col">
          <!-- 按用户list -->
          <div class="user-box">
            <a-row>
              <a-col :span="12" style="border-right: 1px solid #eee; padding-right: 10px; min-height: 200px">
                <a-input-search placeholder="请输入" style="margin-bottom: 10px" @search="onUserSearch" allowClear />
                <div class="ur-ovl">
                  <a-tree
                    v-if="gData.length > 0"
                    class="dep-tree"
                    :showIcon="false"
                    :multiple="false"
                    :defaultExpandedKeys="expandedKeys"
                    :tree-data="gData"
                    @select="onSelect"
                  />
                  <a-empty v-if="!gData.length" />
                </div>
              </a-col>
              <a-col :span="12" style="padding-left: 10px">
                <a-spin :spinning="spinning">
                  <!-- <div class="all-check">
                      <a-checkbox v-model:checked="state.checkAll" :indeterminate="state.indeterminate" @change="onCheckAllChange"> 全选 </a-checkbox>
                    </div> -->
                  <div class="ur-ovl">
                    <a-radio-group v-model:value="state.checkedList" @change="handleChangeChecker" :options="plainOptions">
                      <!-- <a-row>
                          <a-col :span="24" v-for="item in plainOptions">
                            <a-radio :value="item.value" @change="userCheckChange">{{ item.name }}</a-radio>
                          </a-col>
                        </a-row> -->
                    </a-radio-group>
                  </div>
                </a-spin>
              </a-col>
            </a-row>
          </div>
        </a-col>
        <!-- 已选区域 -->
        <a-col flex="300px" class="rp-col">
          <div class="r-title">
            已选用户
            <span @click="clearSelect">清空</span>
          </div>
          <div class="ur-ovl">
            <div class="r-list" v-for="(item, index) in selectValues">
              <span class="name">{{ item.label }}</span>
              <i @click="closeSelect(item.value, index)">×</i>
            </div>
          </div>
        </a-col>
      </a-row>
    </BasicModal>
  </div>
</template>
    
  <script lang="ts" setup>
import { ref, unref, reactive, watch } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
// import { saveOrUpdate } from './plan.api';
import { defHttp } from '/@/utils/http/axios';
// import { useMessage } from '/@/hooks/web/useMessage';
// const { createMessage } = useMessage();
const emit = defineEmits(['success', 'register']);
// const field = ref('');
const activeKey = ref('1');
const spinning = ref<boolean>(false);
const roleValues: any = ref([]);
const roleList: any = ref([]);
// 右侧选中列表
const selectValues: any = ref([]);
//已选择的值
const checkedKeys = ref<any>([]);

const expandedKeys = ref<any>([]);
const state = reactive({
  indeterminate: false,
  checkAll: false,
  checkedList: [],
});
const plainOptions: any = ref([]);
const gData: any = ref([]);

// 获取角色列表
async function getRoleList(val?: string) {
  const params = {
    roleName: val,
  };
  await defHttp.get({ url: '/jn/common/getRole', params }).then((res) => {
    roleList.value = res.records.map((item: any) => {
      return {
        name: item.roleName,
        value: item.id,
      };
    });
  });
}
getDeptList();
getRoleList();
// 获取部门列表
function getDeptList(val?: string) {
  const params = {
    departName: val,
  };
  defHttp.get({ url: '/jn/common/getDepartTreeBy23', params }).then((res) => {
    gData.value = res;
    expandedKeys.value = res.map((v) => v.key);
  });
}

// 获取人员
function getUserList(val?: string) {
  const params = {
    departIds: val,
  };
  defHttp
    .get({ url: '/jn/common/getUser', params })
    .then((res) => {
      plainOptions.value = res.records.map((item: any) => {
        return {
          label: item.realname,
          value: item.id,
        };
      });
      if (selectValues.value.length > 0) {
        const pVal = plainOptions.value.map((v) => v.value);
        const selectedList = selectValues.value.filter((v) => pVal.includes(v.value));
        // console.log(selectedList,'selectedList-----')
        Object.assign(state, {
          checkedList: selectedList.map((v) => v.value),
        });
      }
    })
    .finally(() => {
      spinning.value = false;
    });
}

function handleChangeChecker(val: any) {
  console.log('handleChangeChecker', val);
  selectValues.value = [];
  //   selectValues.value = val.map((v: any) => {
  //     return {
  //       name: plainOptions.value.find((v2: any) => v2.value === v).name,
  //       value: v,
  //     };
  //   });
}
// 清除所有已选
function clearSelect() {
  selectValues.value = [];
  checkedKeys.value = [];
  // plainOptions.value=[]
  Object.assign(state, {
    indeterminate: false,
    checkAll: false,
    checkedList: [],
  });
}
// 删除已选 单项
function closeSelect(val: string, index: number) {
  let data = [...selectValues.value];
  data.splice(index, 1);
  selectValues.value = data;
  const checkedList = state.checkedList;
  console.log('closeSelect checkedList', checkedList, 'closeSelect val', val);
  Object.assign(state, {
    checkedList: []
  });
}

// 按用户搜索
function onUserSearch(value: string) {
  getDeptList(value);
}
// 部门树 选中
const onSelect = (info: any, event: any) => {
  console.log(info, '===ppp');
  console.log(event, '===ppp333');
  // 重置用户列表
  // plainOptions.value=[]
  Object.assign(state, {
    indeterminate: false,
    checkAll: false,
    checkedList: [],
  });
  if (info.length > 0) {
    spinning.value = true;
    getUserList(info.join(','));
  }
};
// 用户列表全选交互
const onCheckAllChange = (e: any) => {
  Object.assign(state, {
    checkedList: e.target.checked ? plainOptions.value.map((v) => v.value) : [],
    indeterminate: false,
  });
  if (!e.target.checked) {
    const pVal = plainOptions.value.map((v) => v.value);
    const newSelectValues = [...selectValues.value];
    selectValues.value = newSelectValues.filter((v) => !pVal.includes(v.value));
  }
};
// 人员列表checked改变
function userCheckChange(e: any) {
  // 取消选中时 清除对应选中列表
  selectValues.value = [];
  if (!e.target.checked) {
    const newSelectValues = [...selectValues.value];
    selectValues.value = newSelectValues.filter((v) => v.value !== e.target.value);
  }
}

watch(
  () => state.checkedList,
  (val: any) => {
    state.indeterminate = !!val.length && val.length < plainOptions.value.length;
    state.checkAll = plainOptions.value.length > 0 && val.length === plainOptions.value.length;
    let newSelectValues = [...selectValues.value];
    let newCheckedList = plainOptions.value.filter((v) => val.includes(v.value));
    // 取消勾选时候 处理 selectValues
    // let noCheckedList = plainOptions.value.filter(v => !val.includes(v.value)).map(v => v.value)

    // 勾选时候 处理 selectValues
    newCheckedList.forEach((v) => {
      const svVal = newSelectValues.map((v2) => v2.value);
      if (!svVal.includes(v.value)) {
        selectValues.value.push(v);
      }
    });
  }
);

async function onSubmit() {
  const selectValuesData = [...selectValues.value];
  // if(selectValuesData.length === 0){
  //   createMessage.warning('请选择角色或人员！')
  //   return
  // }
  const params = {
    // field: field.value,
    checkPeople: selectValuesData.map((v) => v.value).join(','),
    checkPeopleName: selectValuesData.map((v) => v.label).join(','),
  };
  console.log(params, 'params onSubmit');
  closeModal();
  emit('success', params);
}
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  // console.log('useModalInner data', data, data.a);
  // 下次点击弹窗的时候清空表单
  // await resetFields();
  activeKey.value = '1';
  clearSelect();
  setModalProps({ confirmLoading: false });
  // field.value = data.field;
  // 反显数据
  // if(data.record.selectValues) {
  //   activeKey.value = data.record.type === '1' ? '2' : '1'
  //   selectValues.value = data.record.selectValues
  //   if(data.record.type === '1'){
  //     activeKey.value = '2'
  //   } else {
  //     activeKey.value = '1'
  //     roleValues.value = selectValues.value.map(v => v.value)
  //   }
  // }
});
</script>
    
  <style lang="less" scoped>
.ur-ovl {
  max-height: 360px;
  overflow-y: auto;
}
/deep/.ant-input-suffix {
  color: #999;
}
/deep/.ant-radio-wrapper {
  width: 95%;
}
.rp-col {
  border: 1px solid #eee;
  padding: 10px;
}
.r-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.38);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  > span {
    color: #0091ff;
    cursor: pointer;
  }
}
.r-list {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
  .name {
    color: rgba(0, 0, 0, 0.87);
    margin-right: 8px;
  }
  > i {
    color: rgba(0, 0, 0, 0.87);
    display: inline-block;
    font-size: 18px;
    cursor: pointer;
    font-style: normal;
  }
}
.all-check {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
}
</style>
    