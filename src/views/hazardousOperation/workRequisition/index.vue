<template>
  <div class="m-2 p-3" style="background: #fff; height: 100%">
    <job-list ref="JobListRef" @viewCopy="viewCopy" @view-edit="viewEdit" @apply-for="ApplyForAnAssignment" @changePersonClick="changePersonClick" />
    <JobPopUpBox :readonly="readOnly" @renewal="renewal" @register="register" />
    <DetailDrawer @register="registerDetail" />
    <!-- 添加人员 -->
    <Modal
      :width="450"
      v-model:visible="changePersonShow"
      title="添加人员"
      :bodyStyle="{ padding: '4px 10px' }"
      :mask-closable="false"
      @cancel="
        workStopFormRef.resetFields();
      "
      :confirm-loading="confirmLoading"
      centered
      @ok="changePersonShowHandleOk"
      :zIndex="900"
    >
      <a-form ref="workStopFormRef">
        <a-form-item labelAlign="left" label="监护人:" name="workUnitGuardian" :colon="false" :label-col="{ span: 6 }" :wrapper-col="{ flex: 1 }">
          <JUserModal v-model:value="addPersonForm.workUnitGuardian" placeholder="请选择" />
        </a-form-item>
        <template v-for="item in addPersonForm.workUsers" :key="item.value">
          <a-form-item labelAlign="left" :label="item.name" :colon="false" :wrapper-col="{ flex: 1 }">
            <JUserModal
              type="checkbox"
              url="/workApply/getIdCode"
              :curColumns="curColumns"
              :params="{ workType: item.workType }"
              v-model:value="item.userId"
              placeholder="请选择"
            />
          </a-form-item>
        </template>
      </a-form>
    </Modal>
  </div>
</template>

<script setup name="HazardousOperation-WorkRequisition" lang="ts">
  import { ref } from 'vue';
  import JobList from './JobList.vue';
  import type { JobApplyForFrom } from '../type';
  import JobPopUpBox from './JobPopUpBoxNew.vue';
  import { useDrawer } from '/@/components/Drawer';
  import DetailDrawer from '../detail/detailDaver.vue';
  import { updateGuardian, addWorkUser } from '../api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { JUserModal } from '/@/components/Form';
  import { Modal } from 'ant-design-vue';
  const { createMessage } = useMessage();

  const [register, { openDrawer }] = useDrawer();
  const [registerDetail, { openDrawer: openDetailDrawer }] = useDrawer();
  const readOnly = ref(false);
  let ListViewEditData = ref<JobApplyForFrom>({});
  const JobListRef = ref();

  const ApplyForAnAssignment = () => {
    unpack();
  };

  const curColumns = [
    {
      title: '所属单位',
      dataIndex: 'org3Name',
      key: 'org3Name',
    },
    {
      title: '人员姓名',
      dataIndex: 'realname',
      key: 'realname',
    },
    {
      title: '工号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '证书',
      dataIndex: 'certificationsName',
      key: 'certificationsName',
    },
  ];

  // 弹出申请作业弹框，关闭申请作业类型弹框
  const unpack = () => {
    readOnly.value = false;
    ListViewEditData.value = {};
    openDrawer(true, {
      pageType: 'apply',
      title: '作业申请',
    });
  };
  // 查看和编辑作业
  const viewEdit = async (item: { readonly: boolean; workApplyId: string; workTypeName: string }) => {
    if (item.readonly) {
      openDetailDrawer(true, {
        id: item.workApplyId,
        title: item.workTypeName,
      });
    } else {
      openDrawer(true, {
        pageType: 'apply',
        readOnly: item.readonly,
        id: item.workApplyId,
        title: '编辑',
      });
    }
  };

  // 复制作业
  const viewCopy = async (item: { readonly: boolean; workApplyId: string; workTypeName: string }) => {
    openDrawer(true, {
      pageType: 'apply',
      readOnly: item.readonly,
      id: item.workApplyId,
      title: '复用',
    });
  };

  const renewal = () => {
    JobListRef.value.reload();
  };

  const changePersonShow = ref(false);
  const addPersonForm = ref<any>({
    workUnitGuardian: '',
    workUnit: '',
    workUsers: [],
  });
  const currentItem = ref<any>({});
  const confirmLoading = ref(false);
  const changePersonClick = (item) => {
    currentItem.value = item;
    let names = item.workTypeName.split('、');
    let values = item.workType.split(',');
    addPersonForm.value.workUsers = values.map((v, i) => ({ name: `${names[i]}-作业人员:`, workType: v, userId: '' }));
    console.log(addPersonForm.value);

    changePersonShow.value = true;
};
  const workStopFormRef = ref(null);
  const changePersonShowHandleOk = async () => {
    let workUsers = addPersonForm.value.workUsers.filter((item) => item.userId);
    if (!addPersonForm.value.workUnitGuardian && workUsers.length === 0) return createMessage.warning('请选择监护人或作业人员！');
    confirmLoading.value = true;
    if (addPersonForm.value.workUnitGuardian) {
      await updateGuardian({
        workApplyId: currentItem.value.id,
        userId: addPersonForm.value.workUnitGuardian,
      })
        .then((res) => {
          addPersonForm.value.workUnitGuardian = '';
          changePersonShow.value = false;
          confirmLoading.value = false;
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
    if (workUsers.length > 0) {
      await addWorkUser({
        workApplyId: currentItem.value.id,
        workUsers: workUsers,
      })
        .then((res) => {
          addPersonForm.value.workUsers = [];
          changePersonShow.value = false;
          confirmLoading.value = false;
        })
        .catch((e) => {
          confirmLoading.value = false;
        });
    }
  };
</script>

<style lang="less" scoped>
  .WorkRequisitionModal {
    :deep(.ant-modal-title) {
      text-align: center !important;
    }
  }
</style>
