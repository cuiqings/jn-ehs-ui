<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="集团编辑"
    :body-style="{
      maxHeight: '680px',
      overflow: 'auto',
    }"
    :canFullscreen="false"
    :maskClosable="false"
    @ok="onSubmit"
    :width="1000"
    @cancel="handleClose"
  >
    <a-form ref="formRef" :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <!-- 基础信息 -->
      <div class="form-section">
        <div class="section-title-wrapper">
          <div class="section-title-bar"></div>
          <div class="section-title">基础信息</div>
        </div>
        <a-row>
          <a-col :span="12">
            <a-form-item label="应急负责人" name="jyLeaderId">
              <JUserModal
                :userStyle="{ width: '100%' }"
                v-model:value="formData.jyLeaderId"
                :z-index="1001"
                @confirm="(namesStr, displayStr, orgCode, resultList) => handleUserConfirm(namesStr, displayStr, orgCode, resultList)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="应急负责人电话" name="jyLeaderPhone">
              <a-input v-model:value="formData.jyLeaderPhone" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
      <!-- 队伍成员配置 -->
      <div class="member-table-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <div class="section-title-bar"></div>
            <div class="section-title">集团成员配置</div>
          </div>
          <a-button type="default" class="add-member-btn" @click="addMember">+ 添加成员</a-button>
        </div>
        <div class="member-table-container">
          <a-table :columns="memberColumns" :dataSource="memberList" :pagination="false" bordered size="middle" rowKey="id">
            <template #headerCell="{ column }">
              <template v-if="column.key === 'userId'"> <span class="red-require">*</span>姓名 </template>
              <template v-else-if="column.key === 'phone'"> <span class="red-require">*</span>电话 </template>
              <template v-else-if="column.key === 'role'"> <span class="red-require">*</span>角色 </template>
              <template v-else-if="column.key === 'jyResponsibility'"> 应急职责 </template>
              <template v-else>操作</template>
            </template>
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'userId'">
                <JUserModal
                  :userStyle="{ width: '100%' }"
                  v-model:value="record.userId"
                  :z-index="1001"
                  @click-user="(cb) => changeUser(cb, record)"
                  @confirm="(namesStr, displayStr, orgCode, resultList) => handleConfirm(namesStr, displayStr, orgCode, resultList, index)"
                />
              </template>
              <template v-else-if="column.key === 'phone'">
                <a-input v-model:value="record.phone" allowClear placeholder="请输入" />
              </template>
              <template v-else-if="column.key === 'role'">
                <a-select
                  v-model:value="record.role"
                  style="width: 100%"
                  :options="[
                    {
                      label: '应急队长',
                      value: '1',
                    },
                    {
                      label: '应急队员',
                      value: '3',
                    },
                  ]"
                  placeholder="请选择"
                  @change="onRoleChange($event, index)"
                />
              </template>
              <template v-else-if="column.key === 'jyResponsibility'">
                <a-input v-model:value="record.jyResponsibility" allowClear placeholder="请输入" :maxlength="100" />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" danger @click="() => deleteMember(index)"> 删除 </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-form>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { nextTick, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { JUserModal } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { addCompany } from './api';
  const emit = defineEmits(['success']);
  const formRef = ref<FormInstance>();
  const formData = ref({
    jyLeaderId: '',
    jyLeaderPhone: '',
  });
  const memberList = ref<any[]>([]);
  // 成员表格列定义
  const memberColumns = [
    { key: 'userId', title: '姓名', width: 160 },
    { key: 'phone', title: '电话', width: 140 },
    { key: 'role', title: '角色', width: 120 },
    { key: 'jyResponsibility', title: '应急职责', width: 200 },
    { key: 'action', title: '操作', width: 80, align: 'center' },
  ];
  // 应急负责人选择变化
  const handleUserConfirm = (_namesStr, _displayStr, _orgCode, resultList) => {
    formData.value.jyLeaderPhone = resultList[0]?.phone || '';
    formRef.value?.clearValidate(['jyLeaderId']);
  };
  // 用户选择变化
  const handleConfirm = (_namesStr, _displayStr, _orgCode, resultList, index) => {
    memberList.value[index].phone = resultList[0]?.phone;
  };
  // 角色变化
  const onRoleChange = (_value: string, index: number) => {
    // 只能有一个应急队长
    const hasCaptain = memberList.value.filter((item: any) => item.role === '1');
    if (hasCaptain.length > 1) {
      message.warning('只能有一个应急队长');
      nextTick(() => {
        memberList.value[index].role = undefined;
      });
      return;
    }
  };
  // 用户选择变化 - 过滤已选中的成员
  const changeUser = (cb: any, record: any) => {
    const userIds: string[] = [];
    memberList.value.forEach((item: any) => {
      if (item !== record && item.userId) {
        userIds.push(item.userId);
      }
    });
    cb(userIds);
  };
  // 添加成员
  const addMember = () => {
    memberList.value.push({
      userId: undefined,
      phone: '',
      role: undefined,
      jyResponsibility: '',
    });
  };

  // 删除成员
  const deleteMember = (index: number) => {
    memberList.value.splice(index, 1);
  };

  // 关闭方法
  const handleClose = () => {
    memberList.value = [];
    formData.value = {
      jyLeaderId: '',
      jyLeaderPhone: '',
    };
    formRef.value?.resetFields();
    setModalProps({ confirmLoading: false });
    closeModal();
  };

  // 提交表单
  const onSubmit = async () => {
    try {
      // 验证表单
      await formRef.value?.validate();
      // 验证每个成员的必填项
      for (let i = 0; i < memberList.value.length; i++) {
        const member = memberList.value[i];
        if (!member.userId) {
          message.warning(`第${i + 1}行成员：请选择姓名`);
          return;
        }
        if (!member.phone) {
          message.warning(`第${i + 1}行成员：电话不能为空`);
          return;
        }
        if (!member.role) {
          message.warning(`第${i + 1}行成员：请选择角色`);
          return;
        }
      }

      const params = {
        ...formData.value,
        yjRescueTeamSubList: memberList.value,
      };
      setModalProps({ confirmLoading: true });
      const res = await addCompany(params);
      if (res) {
        handleClose();
        emit('success');
      } else {
        setModalProps({ confirmLoading: false });
      }
    } catch (error) {
      setModalProps({ confirmLoading: false });
    }
  };

  // 注册弹窗
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    formRef.value?.resetFields();
    memberList.value = [];
    Object.assign(formData.value, {
      jyLeaderId: '',
      jyLeaderPhone: '',
    });
    setModalProps({ confirmLoading: false });
    if (data?.record) {
      const record = JSON.parse(JSON.stringify(data.record));
      formData.value = {
        jyLeaderId: record.jyLeaderId || undefined,
        jyLeaderPhone: record.jyLeaderPhone || '',
      };
      // 填充成员列表
      if (record.yjRescueTeamSubList && record.yjRescueTeamSubList.length > 0) {
        memberList.value = record.yjRescueTeamSubList.map((item: any) => {
          return {
            userId: item.userId,
            phone: item.phone,
            role: item.role,
            jyResponsibility: item.jyResponsibility,
          };
        });
      }
    }
  });
</script>

<style lang="less" scoped>
  :deep(.ant-col-6) {
    max-width: 140px !important;
    flex: none !important;
  }
  :deep(.ant-col-18) {
    max-width: 100% !important;
  }
  .form-section {
    margin-bottom: 24px;
    .section-title-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      .section-title-bar {
        width: 4px;
        height: 20px;
        background-color: #1890ff;
        margin-right: 12px;
        border-radius: 2px;
      }
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }
    }
  }
  .member-table-section {
    margin-top: 24px;
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      .section-title-wrapper {
        display: flex;
        align-items: center;
        .section-title-bar {
          width: 4px;
          height: 20px;
          background-color: #1890ff;
          margin-right: 12px;
          border-radius: 2px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
      }
      .add-member-btn {
        border-color: #d9d9d9;
        background-color: #fff;
        color: #595959;
        &:hover {
          border-color: #40a9ff;
          color: #40a9ff;
        }
      }
    }
    .member-table-container {
      :deep(.ant-table) {
        .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 500;
        }
        .ant-table-tbody > tr > td {
          padding: 8px;
        }
      }
    }
  }
  :deep(.ant-form-item-label > label) {
    .red-require {
      color: #ff4d4f;
      margin-right: 4px;
    }
  }
  :deep(.ant-table-thead) {
    .red-require {
      color: #ff4d4f;
      margin-right: 4px;
    }
  }
</style>
