<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @cancel="onSubmit" width="800px" :bodyStyle="{ height: '520px' }">
      <a-button preIcon="ant-design:plus-outlined" v-auth="'safetyScreenContactPerson:add'" type="primary" @click="handleAdd">新增</a-button>
      <div class="m-table">
        <ul class="thead">
          <li style="flex: 1">所属机构</li>
          <li style="width: 150px">人员</li>
          <li style="width: 150px">联系方式</li>
          <li style="width: 100px">操作</li>
        </ul>
        <div class="tbody-wrap">
          <ul class="tbody" v-for="(item, index) in tableData" :key="index">
            <li style="flex: 1">
              <j-tree-select1
                v-if="item.edit"
                v-model:value="item.organizationCode"
                :tree-data="treeData"
                :isLeaf="false"
                :load="false"
                :tree-default-expand-all="false"
                :field-names="{
                  label: 'departName',
                  value: 'orgCode',
                  options: 'children',
                }"
                tree-node-filter-prop="departName"
                @change="treeChange"
              />
              <span :title="item.organizationName" v-else>{{ item.organizationName }}</span>
            </li>
            <li style="width: 150px">
              <a-input v-if="item.edit" placeholder="请输入" v-model:value="item.personnelName" :maxlength="20" />
              <span v-else :title="item.personnelName">{{ item.personnelName }}</span>
            </li>
            <li style="width: 150px">
              <a-input v-if="item.edit" placeholder="请输入" v-model:value="item.contactInformation" :maxlength="20" />
              <span v-else :title="item.contactInformation">{{ item.contactInformation }}</span>
            </li>
            <li style="width: 100px">
              <a v-if="!item.edit" @click="handleDel(item)">删除</a>
              <a v-if="item.edit" @click="handleSave(item)">保存</a>
            </li>
          </ul>
        </div>
        <div class="no-data" v-if="!tableData.length">暂无数据</div>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getUserList, leadersAdd, leadersDel, getDepartTree } from '../plan.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JTreeSelect1 } from '/@/components/Form';
  const { createMessage, createConfirm } = useMessage();
  const emit = defineEmits(['success', 'register']);

  const getTitle = ref('各单位环保负责人联系表');
  const tableData: any = ref([]);
  const treeData: any = ref([]);
  const organizationName = ref('');

  function handleAdd() {
    if (tableData.value.some((v) => v.edit)) {
      createMessage.error('不能同时添加多条数据');
      return;
    }
    tableData.value.unshift({
      edit: true,
      // organizationCode: '',
      // personnelName: '',
      // contactInformation: ''
    });
  }
  function handleSave(data: any) {
    if (!data.organizationCode) {
      createMessage.error('请选择所属机构');
      return;
    }
    if (!data.personnelName) {
      createMessage.error('请输入人员');
      return;
    }
    if (!data.contactInformation) {
      createMessage.error('请输入联系方式');
      return;
    }
    const params = {
      organizationCode: data.organizationCode,
      organizationName: organizationName.value,
      personnelName: data.personnelName,
      contactInformation: data.contactInformation,
    };
    leadersAdd(params).then(() => {
      getList();
    });
  }
  function handleDel(record: any) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        leadersDel({ id: record.id }).then(() => {
          getList();
        });
      },
      onCancel() {},
    });
  }

  function onSubmit() {
    closeModal();
    emit('success');
  }
  function getList() {
    getUserList({}).then((res) => {
      tableData.value = res || [];
    });
  }

  function treeChange(_value, extra) {
    organizationName.value = extra.triggerNode.props.departName;
  }
  // 注册弹窗
  // 这个方法执行需要openModal传入第二个参数
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });

    getList();
    getDepartTree({}).then((res) => {
      if (res) {
        treeData.value = res;
      } else treeData.value = [];
    });
  });
</script>

<style lang="less" scoped>
  .m-table {
    margin-top: 10px;
    width: 100%;
    color: #333;
    .thead {
      width: 100%;
      margin: 0px;
      background-color: #e8e8e8;
      display: flex;
      > li {
        list-style: none;
        height: 40px;
        line-height: 40px;
        text-align: center;
      }
    }
    .tbody-wrap {
      max-height: 400px;
      overflow: auto;
    }
    .tbody {
      width: 100%;
      margin: 0px;
      background-color: #fff;
      display: flex;
      border-right: #e8e8e8 1px solid;
      border-bottom: #e8e8e8 1px solid;
      > li {
        color: #333;
        list-style: none;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-left: #e8e8e8 1px solid;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0px 5px;
      }
    }
    .no-data {
      text-align: center;
      color: #999;
      padding: 40px;
      border: 1px solid #e8e8e8;
    }
  }
</style>
