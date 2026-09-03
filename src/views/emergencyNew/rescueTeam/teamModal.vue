<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    :body-style="{
      maxHeight: '680px',
      overflow: 'auto',
    }"
    :canFullscreen="false"
    :maskClosable="false"
    @ok="onSubmit"
    :width="1400"
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
          <a-col :span="24">
            <a-form-item label="所属单位" name="sysOrgCode" :rules="[{ required: true, message: '请选择所属单位' }]">
              <a-select v-model:value="formData.sysOrgCode" placeholder="请选择" show-search allowClear :options="orgOptions" @change="changeOrg" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="应急负责人" name="jyLeaderId" :rules="[{ required: true, message: '请选择应急负责人' }]">
              <JUserModal
                :userStyle="{ width: '100%' }"
                v-model:value="formData.jyLeaderId"
                :orgCode="formData.sysOrgCode"
                roleCode="yj_leader"
                :z-index="1001"
                :isInit="formData.sysOrgCode && formData.sysOrgCode !== '' ? true : false"
                @confirm="(namesStr, displayStr, orgCode, resultList) => handleUserConfirm(namesStr, displayStr, orgCode, resultList)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="应急负责人电话" name="jyLeaderPhone" :rules="[{ required: true, message: '请输入电话' }]">
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
            <div class="section-title">队伍成员配置</div>
          </div>
          <a-button type="default" class="add-member-btn" @click="addMember">+ 添加成员</a-button>
        </div>
        <div class="member-table-container">
          <a-table :columns="memberColumns" :dataSource="memberList" :pagination="false" bordered size="middle" rowKey="id">
            <template #headerCell="{ column }">
              <template v-if="column.key === 'level'"> <span class="red-require">*</span>层级 </template>
              <template v-else-if="column.key === 'workshopCode'"><span class="red-require">*</span>车间</template>
              <template v-else-if="column.key === 'team'">班组</template>
              <template v-else-if="column.key === 'userId'"> <span class="red-require">*</span>姓名 </template>
              <template v-else-if="column.key === 'phone'"> <span class="red-require">*</span>电话 </template>
              <template v-else-if="column.key === 'role'"> <span class="red-require">*</span>角色 </template>
              <template v-else-if="column.key === 'jyResponsibility'"> 应急职责 </template>
              <template v-else>操作</template>
            </template>
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'level'">
                <JDictSelectTag
                  v-model:value="record.level"
                  style="width: 100%"
                  :show-choose-option="false"
                  placeholder="请选择"
                  dictCode="jy_level"
                  @change="onLevelChange(record)"
                />
              </template>
              <template v-else-if="column.key === 'workshopCode'">
                <a-select
                  v-if="record.level === '2'"
                  v-model:value="record.workshopCode"
                  style="width: 100%"
                  :options="workshopCodeOptions"
                  placeholder="请选择"
                  show-search
                  allowClear
                  :filter-option="filterOption"
                />
                <span v-else style="color: #bfbfbf">-</span>
              </template>
              <template v-else-if="column.key === 'team'">
                <a-input v-if="record.level === '2'" v-model:value="record.team" allowClear placeholder="请输入" :maxlength="50" />
                <span v-else style="color: #bfbfbf">-</span>
              </template>
              <template v-else-if="column.key === 'userId'">
                <JUserModal
                  :userStyle="{ width: '100%' }"
                  v-model:value="record.userId"
                  :orgCode="formData.sysOrgCode"
                  :z-index="1001"
                  :isInit="formData.sysOrgCode && formData.sysOrgCode !== '' ? true : false"
                  @click-user="(cb) => changeUser(cb, record)"
                  @confirm="(namesStr, displayStr, orgCode, resultList) => handleConfirm(namesStr, displayStr, orgCode, resultList, index)"
                />
              </template>
              <template v-else-if="column.key === 'phone'">
                <a-input v-model:value="record.phone" allowClear placeholder="请输入" />
              </template>
              <template v-else-if="column.key === 'role'">
                <JDictSelectTag
                  v-model:value="record.role"
                  style="width: 100%"
                  :show-choose-option="false"
                  allowClear
                  placeholder="请选择"
                  dictCode="jy_role"
                  @change="onRoleChange(record)"
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
  import { ref, unref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { JUserModal, JDictSelectTag } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { addOrEdit } from './api';
  const emit = defineEmits(['success']);
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  const isUpdate = ref(false);
  const formRef = ref<FormInstance>();
  const formData = ref({
    sysOrgCode: undefined,
    jyLeaderId: '',
    jyLeaderPhone: '',
    id: undefined,
  });
  const orgOptions = ref<any[]>([]);
  const memberList = ref<any[]>([]);
  const workshopCodeOptions = ref<any[]>([]);
  // 成员表格列定义
  const memberColumns = [
    { key: 'level', title: '层级', width: 100 },
    { key: 'workshopCode', title: '车间', width: 140 },
    { key: 'team', title: '班组', width: 120 },
    { key: 'userId', title: '姓名', width: 160 },
    { key: 'phone', title: '电话', width: 140 },
    { key: 'role', title: '角色', width: 120 },
    { key: 'jyResponsibility', title: '应急职责', width: 200 },
    { key: 'action', title: '操作', width: 80, align: 'center' },
  ];
  // 下拉框过滤选项
  const filterOption = (input: string, option: any) => {
    const label = option.label || option.children?.[0]?.children || '';
    return label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  // 初始化所属单位选项
  const initOrgOptions = async () => {
    const res = await getDepart3ListWithSecurity();
    orgOptions.value = res.map((item: any) => ({
      label: item.departName,
      value: item.orgCode,
    }));
  };
  // 所属单位变化
  const changeOrg = (value: string) => {
    formData.value.jyLeaderId = '';
    formData.value.jyLeaderPhone = '';
    workshopCodeOptions.value = [];
    memberList.value.forEach((member) => {
      member.workshopCode = undefined;
      member.userId = undefined;
      member.phone = '';
    });
    if (value) {
      initWorkshopOptions();
    }
  };
  // 初始化车间选项
  const initWorkshopOptions = async () => {
    const res = await selectDeptNew({
      orgCode: formData.value.sysOrgCode,
    });
    workshopCodeOptions.value = (res || []).map((item: any) => ({
      label: item.departName,
      value: item.orgCode,
    }));
  };
  // 应急负责人选择变化
  const handleUserConfirm = (_namesStr, _displayStr, _orgCode, resultList) => {
    formData.value.jyLeaderPhone = resultList[0]?.phone;
    formRef.value?.clearValidate(['jyLeaderId']);
  };
  // 用户选择变化
  const handleConfirm = (_namesStr, _displayStr, _orgCode, resultList, index) => {
    memberList.value[index].phone = resultList[0]?.phone;
  };
  // 层级变化
  const onLevelChange = (record: any) => {
    // 如果是厂部级，清空车间和班组
    if (record.level === '1') {
      record.workshopCode = undefined;
      record.team = '';
    }
  };
  // 角色变化
  const onRoleChange = (record: any) => {
    if (record.level === '1' && ['2', '4'].includes(record.role)) {
      message.warning('厂部级不能选择应急组长或应急组员');
      record.role = undefined;
      return;
    }
    if (record.level === '2' && ['1', '3'].includes(record.role)) {
      message.warning('车间级不能选择应急队长或应急队员');
      record.role = undefined;
      return;
    }
    // 厂部级只能有一个应急队长
    if (record.role === '1' && record.level === '1') {
      const hasCaptain = memberList.value.some((item: any) => item.role === '1' && item.level === '1' && item !== record);
      if (hasCaptain) {
        message.warning('厂部级只能有一个应急队长');
        record.role = undefined;
        return;
      }
    }
    // 车间级：按车间和班组组合判断，每个车间班组组合只能有一个应急组长
    if (record.role === '2' && record.level === '2') {
      if (!record.workshopCode) {
        message.warning('请先选择车间');
        record.role = undefined;
        return;
      }
      const hasLeader = memberList.value.some(
        (item: any) =>
          item.role === '2' && item.level === '2' && item.workshopCode === record.workshopCode && item.team === record.team && item !== record
      );
      if (hasLeader) {
        message.warning('该车间班组组合只能有一个应急组长');
        record.role = undefined;
        return;
      }
    }
  };
  // 用户选择变化 - 过滤已选中的成员
  const changeUser = (cb: any, record: any) => {
    const userIds: string[] = [];
    if (record.level === '1') {
      memberList.value.forEach((item: any) => {
        if (item !== record && item.level === '1' && item.userId) {
          userIds.push(item.userId);
        }
      });
    }
    if (record.level === '2' && record.workshopCode && record.team !== undefined) {
      memberList.value.forEach((item: any) => {
        if (item !== record && item.level === '2' && item.workshopCode === record.workshopCode && item.team === record.team && item.userId) {
          userIds.push(item.userId);
        }
      });
    }
    cb(userIds);
  };
  // 添加成员
  const addMember = () => {
    memberList.value.push({
      level: '1',
      workshopCode: undefined,
      team: '',
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
      sysOrgCode: undefined,
      jyLeaderId: '',
      jyLeaderPhone: '',
      id: undefined,
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
        if (!member.level) {
          message.warning(`第${i + 1}行成员：请选择层级`);
          return;
        }
        // 车间级必须选择车间
        if (member.level === '2' && !member.workshopCode) {
          message.warning(`第${i + 1}行成员：请选择车间`);
          return;
        }
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
      const res = await addOrEdit(params, isUpdate.value);
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
    await initOrgOptions();
    formRef.value?.resetFields();
    memberList.value = [];
    Object.assign(formData.value, {
      sysOrgCode: undefined,
      jyLeaderId: '',
      jyLeaderPhone: '',
      id: undefined,
    });
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false });
    if (unref(isUpdate) && data?.record) {
      const record = JSON.parse(JSON.stringify(data.record));
      formData.value = {
        sysOrgCode: record.sysOrgCode,
        jyLeaderId: record.jyLeaderId || undefined,
        jyLeaderPhone: record.jyLeaderPhone || '',
        id: record.id,
      };
      // 填充成员列表
      if (record.teamSubMap) {
        Object.keys(record.teamSubMap).forEach((key: any) => {
          record.teamSubMap[key].forEach((item: any) => {
            memberList.value.push({
              level: item.level,
              workshopCode: item.workshopCode || undefined,
              team: item.team || '',
              userId: item.userId,
              phone: item.phone,
              role: item.role,
              jyResponsibility: item.jyResponsibility,
            });
          });
        });
        // 加载用户和车间选项以便显示
        if (formData.value.sysOrgCode) {
          initWorkshopOptions();
        }
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
