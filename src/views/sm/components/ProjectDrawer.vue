<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="项目查看" :width="1000" show-footer :show-ok-btn="false" destroyOnClose>
    <div class="custom-tabs">
      <div class="custom-tabs-nav">
        <div :class="['custom-tab', { active: activeKey === '1' }]" @click="activeKey = '1'">项目信息</div>
        <div v-if="status !== '0'" :class="['custom-tab', { active: activeKey === '2' }]" @click="activeKey = '2'">审批流程</div>
      </div>
      <div class="custom-tabs-content">
        <div v-show="activeKey === '1'">
          <filing-form ref="filingFormRef" :applicationType="applicationType" :type="type" disabled />
          <about v-if="applicationType === '入场申请'" ref="aboutRef" disabled :type="type" :currentNode="currentNode" />
          <personnel ref="personnelRef" disabled />
        </div>
        <div v-show="activeKey === '2' && status !== '0'">
          <approval ref="approvalRef" disabled :applicationType="applicationType" :type="type" :status="status" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="accident-drawer_footer">
        <div v-if="type !== 'approval' || activeKey !== '2'">
          <a-button @click="onClose">取消</a-button>
        </div>
        <div v-if="type === 'approval' && activeKey === '2'">
          <a-button
            v-if="applicationType == '入场申请'"
            class="approval-blacklist"
            type="primary"
            :loading="approvalLoading"
            @click="onApprovalBlacklist"
            >加入黑名单</a-button
          >
          <a-button class="approval-return" type="primary" :loading="approvalLoading" @click="onApprovalReturn">审批退回</a-button>
          <a-button type="primary" @click="onApprovalOk" :loading="approvalLoading">审批通过</a-button>
        </div>
      </div>
    </template>
  </BasicDrawer>
  <a-modal v-model:visible="visible" :body-style="{ margin: '20px' }" :title="titleModal" @ok="handleReturnOk">
    <template #footer>
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button key="submit" type="primary" :loading="approvalLoading" @click="handleReturnOk">确认</a-button>
    </template>
    <div v-if="titleModal === '加入黑名单'" style="padding-left: 10px; padding-bottom: 10px">是否确认将{{ obj.contractName }}加入黑名单？</div>
    <a-form :model="info" ref="infoRef" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" autocomplete="off">
      <a-form-item
        v-if="titleModal === '加入黑名单'"
        :label="labelModal + '：'"
        name="blackRemark"
        :rules="[{ required: true, message: `${labelModal}为必填项！` }]"
      >
        <a-textarea v-model:value="info.blackRemark" placeholder="请输入" :rows="5" :maxlength="300" />
      </a-form-item>
      <a-form-item v-else :label="labelModal + '：'" name="disagreeReason" :rules="[{ required: true, message: `${labelModal}为必填项！` }]">
        <a-textarea v-model:value="info.disagreeReason" placeholder="请输入" :rows="5" :maxlength="300" />
      </a-form-item>
    </a-form>
  </a-modal>
  <signModel @register="signRegister" @sign-ok="signOk" />
</template>
<script lang="ts" name="project-manage-drawer" setup>
  import FilingForm from '../admissionApplication/components/filingForm/index.vue';
  import About from '../admissionApplication/components/about/index.vue';
  import Personnel from '../admissionApplication/components/personnel/index.vue';
  import Approval from '../admissionApplication/components/Approval.vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, nextTick } from 'vue';
  import { queryById } from '../admissionApplication/url/index';
  import { handle, changeHandle } from '../admissionApproval/url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import signModel from './signModel.vue';
  const emits = defineEmits(['success']);
  const { createMessage } = useMessage();
  // 签名弹窗
  const [signRegister, { openModal, closeModal, setModalProps }] = useModal();
  const activeKey = ref('1');
  const filingFormRef = ref();
  const aboutRef = ref();
  const personnelRef = ref();
  const approvalRef = ref();
  const obj: any = ref({});
  const applicationType = ref('');
  // 审批进度
  const currentNode = ref('0');
  // 审批状态
  const status = ref('');
  const type = ref('');
  // 意见
  const info = ref({
    disagreeReason: '',
    blackRemark: '',
  });
  const titleModal = ref('');
  const labelModal = ref('');
  const infoRef = ref();
  const visible = ref(false);
  const approvalLoading = ref(false);
  // 	入场申请id/新增人员id
  const busId = ref('');
  // 审批退回node
  const current = ref(0);
  const [registerDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
    activeKey.value = '1';
    applicationType.value = data.addType;
    status.value = data.data.status;
    type.value = data.type;
    current.value = 0;
    nextTick(() => {
      if (filingFormRef.value) {
        filingFormRef.value.initSchemas(applicationType.value);
      }
    });
    queryById({ id: data.data.id }).then((res) => {
      busId.value = data.data.id;
      currentNode.value = res.currentNode;
      obj.value = JSON.parse(JSON.stringify(res));
      // handleTabChange(activeKey.value);
      nextTick(async () => {
        await filingFormRef.value.initSchemas(applicationType.value);
        await initOne(obj.value);
      });
      // 相关资料回显
      if (aboutRef.value && applicationType.value === '入场申请') {
        // 入场申请相关资料回显
        aboutRef.value.dataOne.forEach((item) => {
          const keyPrefix = item.keys;
          item.value = obj.value[`${keyPrefix}File`];
          item.img = obj.value[`${keyPrefix}Picture`];
          item.result = obj.value[`${keyPrefix}Result`];
          if (item.keys === 'sgcdbzt') {
            item.required = obj.value.xgfType !== '3';
          }
        });
      }
      nextTick(() => {
        // 审批流程回显
        // 获取已保存的节点
        console.log(currentNode.value);
        const nodes: Array<string> = Array.from(new Set(obj.value.assigneeList.map((ite) => ite.node)));
        if (Number(currentNode.value) >= 2 && !nodes.includes('4')) {
          approvalRef.value.manyHills = approvalRef.value.manyHills.filter((item) => item.type !== '4');
        }
        let data = approvalRef.value.manyHills;
        approvalRef.value.current =
          obj.value.status === '5' ? 6 : currentNode.value === '5' ? (!nodes.includes('4') ? 4 : 5) : Number(currentNode.value);
        data.forEach((item) => {
          item.currentNode = currentNode.value || '0';
          if (item.name === '资料提交' && obj.value.assigneeList) {
            item.handleTime = obj.value.assigneeList[0].handleTime;
            item.assigneeName = obj.value.assigneeList[0].handlerName;
            item.handleResult = 'agree';
          }
          if (nodes.includes(item.type)) {
            item.personnelList = editApproval(item, obj.value.assigneeList || []);
          }
        });
        // 审批退回current
        if (status.value === '2') {
          for (let i = 0; i < data.length; i++) {
            const agreeArr = data[i].personnelList?.filter((ite) => ite.handleResult === 'disagree' || ite.handleResult === 'addBlack') || [];
            if (agreeArr.length > 0) {
              approvalRef.value.current = Number(data[i].type);
              return;
            }
          }
        }
      });
    });
  });
  // 项目信息
  const initOne = async (obj) => {
    if (obj.workDateStart && applicationType.value === '入场申请') {
      obj.workDate = [obj.workDateStart, obj.workDateEnd];
    }
    if (filingFormRef.value) {
      await filingFormRef.value.setFieldsValue({ ...obj });
    }
    if (applicationType.value === '入场申请') {
      if (filingFormRef.value) {
        // 回显承包单位负责人
        filingFormRef.value.initContractManager(obj.contractCode, obj.publishCode);
      }
    } else {
      if (filingFormRef.value) {
        filingFormRef.value.init(obj.publishCode);
      }
    }
    // 入场人员回显
    if (obj.personList && obj.personList.length > 0) {
      if (personnelRef.value) {
        personnelRef.value.initUserList(obj.personList.map((item) => item.personId));
      }
    }
  };
  const editApproval = (item, data) => {
    return data
      .filter((ite) => ite.node === item.type && ite.node !== '0')
      .map((it) => {
        if (it.handleResult === 'disagree' || it.handleResult === 'addBlack') {
          item.handleResult = 'disagree';
        }
        item.approveType = it.approveType;
        return {
          assignee: it.assignee,
          handleTime: it.handleTime,
          assigneeName: it.assigneeName,
          handleResult: it.handleResult,
          disagreeReason: it.disagreeReason,
          blackRemark: it.blackRemark,
          signature: it.signature,
        };
      });
  };
  const onClose = () => {
    closeDrawer();
  };
  // 加入黑名单
  const onApprovalBlacklist = async () => {
    info.value.disagreeReason = '';
    info.value.blackRemark = '';
    titleModal.value = '加入黑名单';
    labelModal.value = '说明';
    visible.value = true;
    nextTick(() => {
      infoRef.value.resetFields();
    });
  };
  // 审批通过
  const onApprovalOk = async () => {
    if (currentNode.value === '1' && applicationType.value === '入场申请') {
      // 校验是否填写
      const { is, name } = isValidate();
      if (is) {
        return createMessage.info(name);
      }
      // 校验是否全部合格
      const qualifiedVal = qualifiedValidate();
      if (qualifiedVal.is) {
        return createMessage.info(qualifiedVal.name);
      }
    }
    await approvalRef.value.validate();
    openModal(true, {
      reload: true,
    });
  };
  const signOk = (sign) => {
    if (applicationType.value === '入场申请') {
      handle(
        currentNode.value === '1'
          ? {
              busId: busId.value,
              handleResult: 'agree',
              ...initData(),
              signature: sign,
              assigneeList: dataApproval(),
            }
          : {
              busId: busId.value,
              handleResult: 'agree',
              signature: sign,
              assigneeList: dataApproval(),
            }
      ).then((res) => {
        if (res) {
          setModalProps({ confirmLoading: false });
          closeModal();
          visible.value = false;
          emits('success');
          onClose();
        }
      });
    } else {
      changeHandle({
        busId: busId.value,
        handleResult: 'agree',
        signature: sign,
        assigneeList: dataApproval(),
      }).then((res) => {
        if (res) {
          setModalProps({ confirmLoading: false });
          closeModal();
          visible.value = false;
          emits('success');
          onClose();
        }
      });
    }
  };
  // 分厂安全员时审批流程数据
  const dataApproval = () => {
    const data = JSON.parse(JSON.stringify(approvalRef.value.manyHills));
    let detailDtoList: any = [];
    data.forEach((item) => {
      if (item.personnelList && (item.type === '2' || item.type === '3' || item.type === '4')) {
        item.personnelList.forEach((ite) => {
          if (ite.assignee) {
            detailDtoList.push({
              approveType: item.approveType,
              assignee: ite.assignee,
              node: item.type,
            });
          }
        });
      }
    });
    return detailDtoList;
  };
  // 审批退回
  const onApprovalReturn = async () => {
    info.value.disagreeReason = '';
    info.value.blackRemark = '';
    titleModal.value = '审批退回';
    labelModal.value = '退回原因';
    visible.value = true;
    nextTick(() => {
      infoRef.value.resetFields();
    });
  };
  const handleReturnOk = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    approvalLoading.value = true;
    const obj = { busId: busId.value };
    if (titleModal.value === '加入黑名单') {
      Object.assign(obj, {
        blackRemark: data.blackRemark,
        handleResult: 'addBlack',
      });
    } else {
      Object.assign(obj, {
        disagreeReason: data.disagreeReason,
        handleResult: 'disagree',
      });
    }
    if (applicationType.value === '入场申请') {
      handle(obj)
        .then((res) => {
          if (res) {
            visible.value = false;
            emits('success');
            onClose();
          }
        })
        .finally(() => {
          approvalLoading.value = false;
        });
    } else {
      changeHandle(obj)
        .then((res) => {
          if (res) {
            visible.value = false;
            emits('success');
            onClose();
          }
        })
        .finally(() => {
          approvalLoading.value = false;
        });
    }
  };
  const handleCancel = () => {
    visible.value = false;
  };
  // 校验是否填写
  const isValidate = () => {
    let is = false;
    let name = '';
    for (let i = 0; i < aboutRef.value.dataOne.length; i++) {
      if (aboutRef.value.dataOne[i].result === '') {
        is = true;
        name = `${aboutRef.value.dataOne[i].name}审查结果为必填项！`;
        return { is, name };
      }
    }
    return { is, name };
  };
  // 校验是否全部合格
  const qualifiedValidate = () => {
    let is = false;
    let name = '';
    let data = aboutRef.value.dataOne;
    if (!data.every((item) => item.result === '1')) {
      is = true;
      name = '审查项目有不合格项，不可审批通过！';
      return { is, name };
    }
    return { is, name };
  };
  // 审批合不合格
  const initData = () => {
    let aboutData: any = [];
    aboutData = aboutRef.value.dataOne.map((item) => {
      return {
        [item.keys + 'Result']: item.result,
      };
    });
    // 相关资料转换对象
    const obj = aboutData.reduce((acc, cur) => {
      return { ...acc, ...cur };
    }, {});
    return obj;
  };
</script>
<style lang="less" scoped>
  .approval-blacklist {
    background-color: red;
    border: 1px solid red;
    margin-right: 15px;
  }
  .approval-return {
    background-color: rgba(242, 122, 5, 1);
    border: 1px solid rgba(242, 122, 5, 1);
    margin-right: 15px;
  }
  .custom-tabs {
    .custom-tabs-nav {
      display: flex;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
      .custom-tab {
        padding: 12px 24px;
        cursor: pointer;
        font-size: 16px;
        color: #333;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        &.active {
          color: #1890ff;
          border-bottom: 2px solid #1890ff;
          background: #fff;
        }
        &:not(.active):hover {
          color: #40a9ff;
        }
      }
    }
    .custom-tabs-content {
      // 保持内容样式
    }
  }
</style>
