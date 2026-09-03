<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="选择责任单位/责任人" @ok="onSubmit" width="900px" @close="handleClose" @cancel="handleClose">
      <a-tabs v-model:activeKey="activeKey" @change="tabChange">
        <a-tab-pane key="1" tab="按单位"></a-tab-pane>
        <a-tab-pane key="2" tab="按用户"></a-tab-pane>
      </a-tabs>
      <a-row justify="space-between">
        <a-col flex="560px" class="rp-col">
          <!-- 按部门list -->
          <div class="role-box" v-if="activeKey === '1'">
            <a-input-search placeholder="请输入" style="margin-bottom: 10px" @search="onSearch" allowClear />
            <div class="ur-ovl">
              <a-tree
                v-if="gData.length > 0"
                class="dep-tree"
                checkable
                :multiple="true"
                v-model:checkedKeys="checkedKeys"
                :selectable="false"
                :tree-data="gData"
                :checkStrictly="true"
                default-expand-all
                :field-names="fieldNames"
                @check="onCheck"
              />
              <a-empty v-if="!gData.length" />
            </div>
          </div>
          <!-- 按用户list -->
          <div class="user-box" v-if="activeKey === '2'">
            <a-row>
              <a-col :span="12" style="border-right: 1px solid #eee; padding-right: 10px; min-height: 200px">
                <a-input-search placeholder="请输入" style="margin-bottom: 10px" @search="onUserSearch" allowClear />
                <div class="ur-ovl">
                  <a-tree
                    v-if="gData.length > 0"
                    class="dep-tree"
                    :showIcon="false"
                    :multiple="false"
                    v-model:selectedKeys="selectedKeys"
                    :defaultExpandedKeys="expandedKeys"
                    :tree-data="gData"
                    @select="onSelect"
                  />
                  <a-empty v-if="!gData.length" />
                </div>
              </a-col>
              <a-col :span="12" style="padding-left: 10px">
                <a-spin :spinning="spinning">
                  <div class="all-check">
                    <a-checkbox v-model:checked="state.checkAll" :indeterminate="state.indeterminate" @change="onCheckAllChange"> 全选 </a-checkbox>
                  </div>
                  <div class="ur-ovl">
                    <a-checkbox-group v-model:value="state.checkedList" style="width: 100%">
                      <a-row>
                        <a-col :span="24" v-for="item in plainOptions">
                          <a-checkbox :value="item.value" @change="userCheckChange">{{ item.name }}</a-checkbox>
                        </a-col>
                      </a-row>
                    </a-checkbox-group>
                  </div>
                </a-spin>
              </a-col>
            </a-row>
          </div>
        </a-col>
        <!-- 已选区域 -->
        <a-col flex="300px" class="rp-col">
          <div class="r-title">
            已选{{ selectValues.length }}项
            <span @click="clearSelect">清空</span>
          </div>
          <div class="ur-ovl">
            <div class="r-list" v-for="(item, index) in selectValues" :key="item.value">
              <span class="name">{{ item.name }}</span>
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
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
import type { TreeProps } from 'ant-design-vue';
import { nextTick } from 'process';
const emit = defineEmits(['success', 'register']);
const field = ref('');
const activeKey = ref('1');
const spinning = ref<boolean>(false);
const roleValues: any = ref([]);
const roleList: any = ref([]);
// 右侧选中列表
const selectValues: any = ref([]);
//已选择的值
const checkedKeys = ref<any>([]);
const selectedKeys = ref<any>([]);

const expandedKeys = ref<any>([]);
const state = reactive({
  indeterminate: false,
  checkAll: false,
  checkedList: [],
});
const plainOptions: any = ref([]);

const gData: any = ref([]);
const dutyOrgName: any = ref([]);
const dutyPersonName: any = ref([]);
const selectTreeKey = ref('');
const jobList: any = ref([]);
const currentSelectData = ref({});

getDeptList();
const fieldNames: TreeProps['fieldNames'] = {
  key: 'orgCode',
};
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
async function getUserList(val?: string, realname?: string) {
  const params = {
    departIds: val,
    realname: realname,
  };
  await defHttp.get({ url: '/jn/common/getUser', params }).then((res) => {
    plainOptions.value = res.records.map((item: any) => {
      return {
        name: item.realname,
        value: item.id,
        type: 'user',
      };
    });
  });
  console.log('getUserList selectValues.value', selectValues.value);
  if (selectValues.value.length > 0) {
    const pVal = plainOptions.value.map((v) => v.value);
    const selectedList = selectValues.value.filter((v) => pVal.includes(v.value));
    // console.log(selectedList,'selectedList-----')
    Object.assign(state, {
      checkedList: selectedList.map((v) => v.value),
    });
  }
}

function tabChange(val: any) {
  // clearSelect();
  // if (val === '2') {
  //   getDeptList();
  //   plainOptions.value = [];
  // } else {
  //   getRoleList();
  // }
}

// 按部门搜索
function onSearch(value: string) {
  getDeptList(value);
}

// 清除所有已选
function clearSelect() {
  selectValues.value = [];
  checkedKeys.value = [];
  selectedKeys.value = [];
  activeKey.value = '1';
  plainOptions.value = [];
  Object.assign(state, {
    indeterminate: false,
    checkAll: false,
    checkedList: [],
  });
  dutyOrgName.value = [];
  dutyPersonName.value = [];
}
// 删除已选 单项
function closeSelect(val: string, index: number) {
  console.log('closeSelect', val, index);
  // 判断删除的val是否在 checkedKeys.value中
  let data = [...selectValues.value];
  data.splice(index, 1);
  selectValues.value = data;
  if (checkedKeys.value.checked && checkedKeys.value.checked.length > 0) {
    const index2 = checkedKeys.value.checked.includes(val);
    console.log('index2', index2);
    if (index2) {
      console.log('11111 checkedKeys.value.value', checkedKeys.value);
      checkedKeys.value.checked = checkedKeys.value.checked.filter((v) => v !== val);
    } else {
      console.log('state.checkedList', state.checkedList);
      const checkedList = state.checkedList;
      Object.assign(state, {
        checkedList: checkedList.filter((v) => v !== val),
      });
      console.log('state.checkedList11111', state.checkedList);
    }
  } else {
    const checkedList = state.checkedList;
    Object.assign(state, {
      checkedList: checkedList.filter((v) => v !== val),
    });
  }
}
// 部门列表checked变化
function onCheck(val: any, e: any) {
  console.log('onCheck', val, e);
  if (e.checked) {
    let count = 0;
    // 判断是否已经存在
    let filteredJobList = jobList.value.filter((index, item) => index != field.value);
    console.log('filteredJobList', filteredJobList);
    jobList.value.map((item) => {
      if (item.dutyOrg) {
        item.dutyOrg.split(',').map((item1) => {
          if (item1 == e.node.eventKey) {
            createMessage.warning('该责任部门已被选择过，请重新选择！');
            count++;
            checkedKeys.value.checked.pop();
            return;
          }
        });
      }
    });
    if (count == 0) {
      selectValues.value.push({
        name: e.node.title,
        value: e.node.key,
      });
    }
  } else {
    selectValues.value = selectValues.value.filter((v) => v.value !== e.node.key);
  }
}

// 按用户搜索
function onUserSearch(value: string) {
  getUserList(selectTreeKey.value, value);
}
// 部门树 选中
const onSelect = (info: any, event: any) => {
  console.log(info, '===ppp');
  console.log(event, '===ppp333');
  // 重置用户列表
  // plainOptions.value=[]
  // Object.assign(state, {
  //   indeterminate: false,
  //   checkAll: false,
  //   checkedList: [],
  // });
  if (info.length > 0) {
    selectTreeKey.value = info.join(',');
    getUserList(info.join(','), '');
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
  console.log('userCheckChange', e);
  // 取消选中时 清除对应选中列表
  if (!e.target.checked) {
    const newSelectValues = [...selectValues.value];
    selectValues.value = newSelectValues.filter((v) => v.value !== e.target.value);
  }
  // else {
  //   // 选中时，判断是否已经存在
  //   let count = 0;
  //   let filteredJobList = jobList.value.filter((index, item) => index != field.value);
  //   filteredJobList.map((item) => {
  //     if (item.dutyPerson) {
  //       item.dutyPerson.split(',').map((item1) => {
  //         if (item1 == e.target.value) {
  //           createMessage.warning('该责任人已被选择过，请重新选择！');
  //           count++;
  //           return;
  //         }
  //       });
  //     }
  //   });
  //   console.log('count', count);
  //   if (count !== 0) {
  //     const newSelectValues = [...selectValues.value];
  //     console.log('newSelectValues', newSelectValues);
  //     selectValues.value = newSelectValues.filter((v) => v.value !== e.target.value);
  //     const checkedList = state.checkedList;
  //     Object.assign(state, {
  //       checkedList: checkedList.filter((v) => v !== e.target.value),
  //     });
  //   }
  //   else {
  //     state.checkedList.push(e.target.value);
  //     console.log('state.checkedList', state.checkedList);
  //     let newSelectValues = [...selectValues.value];
  //     let newCheckedList = plainOptions.value.filter((v) => state.checkedList.includes(v.value));
  //     newCheckedList.forEach((v) => {
  //       const svVal = newSelectValues.map((v2) => v2.value);
  //       if (!svVal.includes(v.value)) {
  //         selectValues.value.push(v);
  //       }
  //     });

  //   }
  // }
}

watch(
  () => state.checkedList,
  (val: any) => {
    console.log('watch val', val);
    if (val.length > 0) {
      Object.assign(state, {
        checkedList: val,
      });
    }
    let count = 0;
    console.log('watch count', count);
    // state.indeterminate = !!val.length && val.length < plainOptions.value.length;
    state.checkAll = plainOptions.value.length > 0 && val.length === plainOptions.value.length;
    let newSelectValues = [...selectValues.value];
    let newCheckedList = plainOptions.value.filter((v) => val.includes(v.value));
    // 取消勾选时候 处理 selectValues
    // let noCheckedList = plainOptions.value.filter(v => !val.includes(v.value)).map(v => v.value)

    // 勾选时候 处理 selectValues
    console.log('field.value', field.value);
    // let filteredJobList = jobList.value.filter((index, item) => index != field.value);
    // console.log('filteredJobList', filteredJobList);
    // jobList.value.splice(field.value, 1);
    let currentSelectData =  jobList.value[field.value];
    console.log('currentSelectData', currentSelectData);
    jobList.value.map((item) => {
      if (item.dutyPerson) {
        item.dutyPerson.split(',').map((item1) => {
          if (val.length > 0 &&!currentSelectData.dutyPerson.split(',').includes(item1)) {
            if (item1 == val.slice(-1)[0]) {
              // selectValues.value = selectValues.value.filter((v) => v.value !== item1);
              // console.log('watch selectValues.value', selectValues.value);
              createMessage.warning('该责任人已被选择过，请重新选择！');
              const stateCheckedList = state.checkedList;
              Object.assign(state, {
                checkedList: stateCheckedList.filter((v) => v !== item1),
              });
              count++;
              return;
            }
          }
        });
      }
    });
    console.log('count', count);
    if (count === 0) {
      newCheckedList.forEach((v) => {
        const svVal = newSelectValues.map((v2) => v2.value);
        if (!svVal.includes(v.value)) {
          selectValues.value.push(v);
        }
      });
    }
  },
  { immediate: true }
);

async function onSubmit() {
  const selectValuesData = [...selectValues.value];
  console.log('selectValuesData', selectValuesData);
  console.log('checkedKeys', checkedKeys, checkedKeys.value, checkedKeys.value.checked);
  console.log('state.checkedList', state.checkedList);
  if (selectValuesData.length > 0) {
    dutyPersonName.value = [];
    selectValuesData.map((item) => {
      if (item.type && item.type == 'user') {
        dutyPersonName.value.push(item.name);
      }
    });
  }
  if (checkedKeys.value.checked && checkedKeys.value.checked.length > 0) {
    dutyOrgName.value = [];
    selectValuesData.map((item) => {
      if (!item.type || item.type !== 'user') {
        dutyOrgName.value.push(item.name);
      }
    });
  }
  console.log('dutyPersonName.value', dutyPersonName.value, dutyOrgName.value);
  const params = {
    index: unref(field),
    dutyOrg: checkedKeys.value.checked ? checkedKeys.value.checked.join(',') : '',
    dutyPerson: state.checkedList.join(','),
    dutyOrgName: dutyOrgName.value.join(','),
    dutyPersonName: dutyPersonName.value.join(','),
    selectValuesData: selectValuesData,
    // departNames: selectValuesData.map((v) => v.name).join(','),
    // departValues: selectValuesData.map((v) => v.value).join(','),
  };
  // await saveOrUpdate(params);
  closeModal();
  console.log('部门弹框params', params);
  emit('success', params);
  clearSelect();
}
function handleClose() {
  console.log('handleClose');
  selectValues.value = [];
  checkedKeys.value = [];
  selectedKeys.value = [];
  activeKey.value = '1';
  plainOptions.value = [];
  Object.assign(state, {
    indeterminate: false,
    checkAll: false,
    checkedList: [],
  });
  dutyOrgName.value = [];
  dutyPersonName.value = [];
}
// 注册弹窗
// 这个方法执行需要openModal传入第二个参数
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  console.log('责任单位/责任人 useModalInner data', data, data);
  jobList.value = data.jobList;
  selectValues.value = data.jobList[data.index].selectValuesData;
  console.log('selectValues.value', selectValues.value);
  // 当前一条的选择
  let currentSelectData = data.jobList[data.index];
  // currentSelectData.value = data.jobList[data.index];
  console.log('currentSelectData', currentSelectData);
  if (currentSelectData.dutyOrg) {
    checkedKeys.value = currentSelectData.dutyOrg.split(',');
  } else {
    checkedKeys.value = [];
  }
  if (currentSelectData.dutyPerson) {
    Object.assign(state, {
      checkedList: currentSelectData.dutyPerson.split(','),
    });
  } else {
    Object.assign(state, {
      checkedList: [],
    });
  }
  console.log('openModal 赋值前', checkedKeys.value, state.checkedList);

  // selectValues.value = [...data.selectValuesData];
  // console.log('selectValues.value', selectValues.value);
  // checkedKeys.value.checked = data.checkedKeys;
  // state.checkedList = data.checkedList;
  // console.log('openModal 赋值后', checkedKeys.value,state.checkedList);
  // 下次点击弹窗的时候清空表单
  // await resetFields();
  // clearSelect();
  setModalProps({ confirmLoading: false });
  field.value = data.index;
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
:deep(.ant-input-suffix) {
  color: #999;
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
  