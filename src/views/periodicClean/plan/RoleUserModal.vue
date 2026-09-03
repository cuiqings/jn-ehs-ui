<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="选择角色/人" @ok="onSubmit" width="900px" :bodyStyle="{ height: '590px' }">
      <a-tabs v-model:activeKey="activeKey" @change="tabChange">
        <a-tab-pane key="1" tab="按角色" />
        <a-tab-pane key="2" tab="按用户" />
      </a-tabs>
      <a-row justify="space-between" v-if="activeKey === '1'">
        <a-col flex="560px" class="rp-col">
          <!-- 按角色list -->
          <div class="role-box" v-if="activeKey === '1'">
            <a-input-search placeholder="请输入" style="margin-bottom: 10px" @search="onSearch" allowClear />
            <div class="ur-ovl">
              <a-checkbox-group v-model:value="roleValues" style="width: 100%" @change="roleChange">
                <a-row>
                  <a-col :span="24" v-for="item in roleList" :key="item.value">
                    <a-checkbox :value="item.value">{{ item.name }}</a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
              <a-empty v-if="!roleList.length" />
            </div>
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
      <!-- 按用户list -->
      <a-row justify="space-between" v-if="activeKey === '2'">
        <a-transfer
          v-model:target-keys="userSelectedList"
          :row-key="(record) => record.id"
          :data-source="userDataSource"
          :show-select-all="false"
          show-search
          :filter-option="(inputValue, item) => item.realname.indexOf(inputValue) !== -1"
        >
          <template #children="{ filteredItems, selectedKeys, onItemSelectAll, onItemSelect }">
            <a-table
              :row-selection="
                getRowSelection({
                  selectedKeys,
                  onItemSelectAll,
                  onItemSelect,
                })
              "
              :columns="columnsAuthorize"
              :data-source="filteredItems"
              :loading="userLoading"
              size="small"
              :scroll="{ y: 390 }"
              :custom-row="
                ({ id }) => ({
                  onClick: () => {
                    onItemSelect(id, !selectedKeys.includes(id));
                  },
                })
              "
            />
          </template>
        </a-transfer>
      </a-row>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { defHttp } from '/@/utils/http/axios';
  import { getUserList } from './plan.api';
  const emit = defineEmits(['success', 'register']);
  const field = ref('');
  const activeKey = ref('1');
  const roleValues: any = ref([]);
  const roleList: any = ref([]);
  // 右侧选中列表
  const selectValues: any = ref([]);
  const state = reactive({
    indeterminate: false,
    checkAll: false,
    checkedList: [],
  });
  // 用户选中
  const userSelectedList: any = ref([]);
  const ids: any = ref([]);
  // 用户list
  const userDataSource: any = ref([]);
  const userLoading = ref(false);
  const columnsAuthorize = [
    {
      title: '用户账号',
      align: 'center',
      dataIndex: 'username',
    },
    {
      title: '真实姓名',
      align: 'center',
      dataIndex: 'realname',
    },
  ];
  const type = ref('0');
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
  // 获取用户列表
  function initUserList() {
    getUserList().then((res) => {
      if (res) {
        userDataSource.value = res;
      } else userDataSource.value = [];
    });
  }
  function tabChange(val: any) {
    clearSelect();
    if (val === '2') {
      initUserList();
    } else {
      getRoleList();
    }
    if (type.value === '0') {
      roleValues.value = ids.value;
      roleChange(ids.value);
    } else userSelectedList.value = ids.value;
  }
  // 按角色搜索
  function onSearch(value: string) {
    getRoleList(value);
  }

  // 清除所有已选
  function clearSelect() {
    selectValues.value = [];
    roleValues.value = [];
    userSelectedList.value = [];
    Object.assign(state, {
      indeterminate: false,
      checkAll: false,
      checkedList: [],
    });
  }
  // 删除已选 单项
  function closeSelect(val: string, index: number) {
    selectValues.value.splice(index, 1);
    const rIndex: number = roleValues.value.indexOf(val);
    roleValues.value.splice(rIndex, 1);
  }
  // 角色列表checked变化
  function roleChange(val: any) {
    selectValues.value = roleList.value.filter((v) => val.includes(v.value));
  }
  async function onSubmit() {
    const selectValuesData = [...selectValues.value];
    const params = {
      field: field.value,
      approvalType: activeKey.value === '2' ? '1' : '0',
      keyStr: activeKey.value === '2' ? userSelectedList.value.join(',') : selectValuesData.map((v) => v.value).join(','),
      valueStr:
        activeKey.value === '2'
          ? userDataSource.value
              .filter((item) => userSelectedList.value.includes(item.id))
              .map((v) => v.realname)
              .join(',')
          : selectValuesData.map((v) => v.name).join(','),
    };
    closeModal();
    emit('success', params);
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    activeKey.value = '1';
    clearSelect();
    setModalProps({ confirmLoading: false });
    field.value = data.field;
    if (data.field === 'executor' && data.data.executor) {
      type.value = data.data.executorType ? data.data.executorType : '0';
      ids.value = data.data.executor.split(',');
      if (type.value === '0') {
        roleValues.value = ids.value;
        roleChange(ids.value);
      }
    }
    if (data.field === 'supervisor' && data.data.supervisor) {
      ids.value = data.data.supervisor.split(',');
      type.value = data.data.supervisorType ? data.data.supervisorType : '0';
      if (type.value === '0') {
        roleValues.value = ids.value;
        roleChange(ids.value);
      }
    }
    getRoleList();
  });
  // 用户操作
  const getRowSelection = ({ selectedKeys, onItemSelectAll, onItemSelect }: Record<string, any>) => {
    return {
      onSelectAll(selected: boolean, selectedRows: Record<string, string | boolean>[]) {
        const treeSelectedKeys = selectedRows.map(({ id }) => id);
        onItemSelectAll(treeSelectedKeys, selected);
      },
      onSelect({ id }: Record<string, string>, selected: boolean) {
        onItemSelect(id, selected);
      },
      selectedRowKeys: selectedKeys,
    };
  };
</script>

<style lang="less" scoped>
  .ur-ovl {
    max-height: 430px;
    overflow-y: auto;
  }
  /deep/.ant-input-suffix {
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
