<template>
  <div>
    <BasicModal wrapClassName="userModal" v-bind="$attrs" @register="registerModal" :width="1200" title="培训对象" destroyOnClose>
      <div class="usermain">
        <div class="left">
          <a-tabs v-model:activeKey="activeKey" size="size" @change="changeTab">
            <a-tab-pane key="1" tab="选择部门">
              <div class="tabinner">
                <div class="treewrap">
                  <a-tree
                    v-model:checkedKeys="checkedKeys"
                    checkable
                    checkStrictly
                    @check="treeSelectDepart"
                    :tree-data="treeData"
                    treeNodeFilterProp="title"
                    :fieldNames="{ label: 'title', value: 'key', options: 'children' }"
                    :showCheckedStrategy="SHOW_ALL"
                  />
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="选择学员">
              <basic-table @register="registerTable" :rowSelection="rowSelection" />
            </a-tab-pane>
          </a-tabs>
        </div>
        <div class="right">
          <div class="hd"> 已选择：<span @click="clearAll" class="clearall">清空</span> </div>
          <div class="r-main">
            <template v-for="(item, index) in resultList" :key="index">
              <div class="r-item" v-if="item.custmorType == 'user'">
                <span class="name">{{ item.userNameWorkNo }}</span
                ><CloseOutlined style="color: #ff4d4f" @click="delItem(item)" />
              </div>
              <div class="r-item" v-else>
                <span class="name">{{ item.title }}</span
                ><CloseOutlined style="color: #ff4d4f" @click="delItem(item)" />
              </div>
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { userListByOrg } from '/@/api/common/api';
  import { orgList } from './url/index';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { TreeSelect } from 'ant-design-vue';
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const activeKey = ref('1');
  const searchFormSchema: any = [
    {
      label: '所属部门',
      field: 'orgCode',
      component: 'JTreeSelect1',
      componentProps: {
        treeDataArr: [],
        treeNodeFilterProp: 'departName',
        allowClear: false,
      },
      colProps: { span: 9 },
    },
    {
      label: '人员姓名/工号',
      field: 'userName',
      component: 'Input',
      colProps: { span: 9 },
    },
  ];
  const columns: any = [
    {
      title: '人员姓名',
      align: 'center',
      dataIndex: 'userNameWorkNo',
    },
    {
      title: '所属三级',
      align: 'center',
      dataIndex: 'org3Name',
    },
  ];
  onMounted(() => {
    getDepartTree();
  });
  // 部门
  const treeData = ref<any[]>([]);
  const checkedKeys: any = ref<any[]>([]);
  // 学员
  const checkedUserList = ref<any[]>([]);
  const resultList = ref<any[]>([]);
  const userList: any = ref([]);
  const { tableContext } = useListPage({
    tableProps: {
      api: userListByOrg,
      columns: columns,
      rowKey: 'id',
      formConfig: {
        schemas: searchFormSchema,
        labelWidth: 100,
        autoAdvancedCol: 3,
      },
      showIndexColumn: false,
      immediate: false,
      showActionColumn: false,
      rowSelection: {
        fixed: 'left',
        onChange: () => {
          checkedUserList.value = [...new Set(checkedUserList.value.concat(selectedRows.value))]
            .filter((item) => selectedRowKeys.value.includes(item.id))
            .reduce((acc, current) => {
              const x = acc.find((item) => item.id === current.id);
              if (!x) {
                acc.push(current);
              }
              return acc;
            }, []);
          userList.value = selectedRowKeys.value;
          setResult();
        },
      },
      afterFetch: (result) => {
        result.forEach((item) => {
          item.userNameWorkNo = item.realname + '（' + item.username + '）';
        });
        return result;
      },
    },
  });
  const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const getDepartTree = () => {
    orgList({ level: 4 }).then(async (res) => {
      treeData.value = res;
    });
  };
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    activeKey.value = '1';
    userList.value = data.data.userList.map((item) => item.id);
    reviewData(data.data);
  });
  const changeTab = (key) => {
    if (key === '2') {
      nextTick(() => {
        getForm().updateSchema({
          field: 'orgCode',
          componentProps: {
            treeDataArr: treeData.value,
            placeholder: '请选择',
            isLeaf: false,
            load: false,
            allowClear: false,
            treeNodeFilterProp: 'title',
            fieldNames: { label: 'title', value: 'key', options: 'children' },
            showCheckedStrategy: SHOW_ALL,
          },
        });
        selectedRowKeys.value = userList.value;
        reload();
      });
    }
  };
  const close = () => {
    closeModal();
    clearAll();
  };
  // 回显选中
  const reviewData = (data) => {
    checkedKeys.value = data.orgList.map((val) => val.key);
    checkedUserList.value = data.userList.map((val) => {
      val.custmorType = 'user';
      return val;
    });
    selectedRowKeys.value = checkedUserList.value.map((item) => item.id);
    resultList.value = [...data.orgList, ...checkedUserList.value];
  };
  const confirmClose = async () => {
    let map = { trainObjectPerson: '', trainObjectPersonName: '', trainObjectOrg: '', trainObjectOrgName: '' };
    resultList.value.forEach((item) => {
      if (item.custmorType == 'user') {
        map.trainObjectPerson += item.id + ',';
        map.trainObjectPersonName += item.realname + '（' + item.username + '）' + ',';
      } else {
        map.trainObjectOrg += item.key + ',';
        map.trainObjectOrgName += item.title + ',';
      }
    });
    map.trainObjectPerson = map.trainObjectPerson.slice(0, -1);
    map.trainObjectPersonName = map.trainObjectPersonName.slice(0, -1);
    map.trainObjectOrg = map.trainObjectOrg.slice(0, -1);
    map.trainObjectOrgName = map.trainObjectOrgName.slice(0, -1);
    emit(
      'success',
      map,
      resultList.value.filter((item) => item.custmorType !== 'user'),
      resultList.value.filter((item) => item.custmorType === 'user')
    );
    close();
  };
  // 选择部门
  const treeSelectDepart = (_e, { node }) => {
    if (node.checked) {
      resultList.value = resultList.value.filter((item) => item.key !== node.key);
      return;
    } else {
      resultList.value.splice(
        resultList.value.findIndex((item) => item.custmorType === 'user'),
        0,
        node
      );
    }
  };
  // 学员选中/取消
  const setResult = () => {
    checkedUserList.value.forEach((item) => {
      item.custmorType = 'user';
    });
    resultList.value = resultList.value.filter((item) => item.custmorType !== 'user').concat(checkedUserList.value);
  };
  // 删除
  const delItem = (item) => {
    if (item.custmorType === 'user') {
      selectedRowKeys.value = selectedRowKeys.value.filter((i) => i !== item.id);
      resultList.value = resultList.value.filter((ite) => !ite.id || (ite.id && ite.id !== item.id));
    } else {
      console.log(checkedKeys.value, 1);
      if (checkedKeys.value?.checked?.length > 0) {
        checkedKeys.value.checked = checkedKeys.value.checked.filter((i) => i !== item.key);
      } else {
        checkedKeys.value = checkedKeys.value.filter((i) => i !== item.key);
      }
      resultList.value = resultList.value.filter((ite) => !ite.key || (ite.key && ite.key !== item.key));
    }
  };
  const clearAll = () => {
    resultList.value = [];
    checkedKeys.value = [];
    checkedUserList.value = [];
    selectedRowKeys.value = [];
    userList.value = [];
  };
</script>
<style lang="less" scoped>
  .usermain {
    display: flex;
    position: relative;
    justify-content: space-between;
    .left {
      flex: 1;
    }
    .right {
      width: 240px;
      max-height: 740px;
      display: flex;
      flex-direction: column;
      background-color: #fafafa;
      padding: 10px;
      padding-top: 0;
      overflow-y: auto;
      .hd {
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        span {
          color: #1890ff;
          cursor: pointer;
        }
      }
      .r-main {
        flex: 1;
        overflow-y: auto;
        .r-item {
          line-height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 5px;
        }
      }
    }
    .tabinner {
      height: 400px;
      display: flex;
      .treewrap {
        width: 300px;
        height: 100%;
        overflow-y: auto;
      }
      .userList {
        flex: 1;
        width: 400px;
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        .listwrap {
          flex: 1;
        }
        .item {
          line-height: 32px;
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
  :deep(.ant-table-title) {
    min-height: 0 !important;
  }
  :deep(.jeecg-basic-table-form-container) {
    padding: 0 !important;
  }
</style>
<style lang="less">
  .userModal {
    .ant-modal {
      top: 20px !important;
    }
  }
</style>
