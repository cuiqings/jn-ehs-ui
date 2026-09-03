<template>
  <div>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="0" tab="项目信息" :disabled="step === '2'">
        <BasicInfo
          ref="filingFormRef"
          :type="type"
          :applicationType="applicationType"
          @change-contract-code="changeContractCode"
          @change-xgf-type="changeXgfType"
          @change-publish-code="changePublishCode"
        />
        <About v-if="applicationType === '入场申请'" ref="aboutRef" :current-node="currentNode" />
        <Personnel ref="personnelRef" :application-type="applicationType" :status="status" @table-value="handleTableValue" />
      </a-tab-pane>
      <a-tab-pane key="1" tab="审批流程" :disabled="step === '1'">
        <Approval ref="approvalRef" :application-type="applicationType" :type="type" />
      </a-tab-pane>
    </a-tabs>
    <div class="btn-group">
      <div v-if="status == '0' || status === '' || status == '2'">
        <a-button style="margin-right: 15px" :loading="saveLoading" @click="onSave">保存</a-button>
        <a-button v-if="activeKey === '0'" style="margin-right: 15px" :loading="nextStepLoading" type="primary" @click="onNextStep">下一步</a-button>
        <a-button v-if="activeKey === '1'" style="margin-right: 15px" @click="previous">上一步</a-button>
        <a-button v-if="activeKey === '1'" style="margin-right: 15px" :loading="submitLoading" type="primary" @click="handleSubmit">提交</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" name="app-admissionApplication-addOrEdit" setup>
  import { ref, nextTick, onMounted } from 'vue';
  import About from './components/About.vue';
  import Personnel from './components/Personnel.vue';
  import Approval from './components/Approval.vue';
  import { useRoute, useRouter } from 'vue-router';
  import BasicInfo from './components/BasicInfo.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { merge, queryById, submitFlow, changeMerge, changeSubmitFlow } from '../../admissionApplication/url/index';
  import dayjs from 'dayjs';
  const { createMessage } = useMessage();
  const route: any = useRoute();
  const router = useRouter();
  const filingFormRef = ref();
  const aboutRef = ref();
  const personnelRef = ref();
  const approvalRef = ref();
  const title = ref('');
  const activeKey = ref('0');
  const objInfo: any = ref({});
  // 申请类型
  const applicationType = ref('');
  const saveLoading = ref(false);
  const nextStepLoading = ref(false);
  const submitLoading = ref(false);
  const id = ref('');
  const type = ref('');
  /**
   * 当前节点
   * 1: 分厂安全科
   * 2: 分厂领导
   * 3: 安全管理部
   * 4: 安全管理部领导
   */
  const currentNode = ref('0');
  // 提交步骤
  const step = ref('1');
  // 当前状态
  const status = ref('');
  // 是否延期
  const delayFlag = ref();
  onMounted(async () => {
    currentNode.value = '0';
    title.value = route.query.title;
    applicationType.value = route.query.addType;
    type.value = route.query.type;
    activeKey.value = '0';
    step.value = '1';
    id.value = '';
    status.value = '';
    objInfo.value = {};
    delayFlag.value = route.query.delayFlag ? route.query.delayFlag : null;
    nextTick(() => {
      filingFormRef.value.initEnter();
    });
    if (route.query.type !== 'add') {
      queryById({ id: route.query.id }).then(async (res) => {
        currentNode.value = res.currentNode;
        const obj = JSON.parse(JSON.stringify(res));
        if (delayFlag.value === '1') {
          status.value = '';
          obj.id = '';
        } else {
          status.value = obj.status;
        }
        objInfo.value = obj;
        id.value = obj.id;
        obj.contractCode = obj.contractCode === '' ? undefined : obj.contractCode;
        obj.contractManagerId = obj.contractManagerId === '' ? undefined : obj.contractManagerId;
        changeContractCode(obj.contractCode);
        filingFormRef.value.info = obj;
        if (applicationType.value === '入场申请') {
          filingFormRef.value.initContractManager(obj.contractCode, obj.publishCode);
          // 相关资料回显
          aboutRef.value.dataOne.forEach((item) => {
            const keyPrefix = item.keys;
            item.value = obj[`${keyPrefix}File`];
            item.img = obj[`${keyPrefix}Picture`];
            item.result = obj[`${keyPrefix}Result`];
            if (item.keys === 'sgcdbzt') {
              item.required = obj.xgfType !== '3';
            }
          });
        }
        // 入场人员回显
        personnelRef.value.orgCode = obj.contractCode;
        // 获取到期发包单位
        personnelRef.value.publishCode = obj.publishCode;
        if (applicationType.value === '新增人员') {
          await queryById({ id: obj.enterId }).then((res) => {
            const personIds = res.personList.map((item) => item.personId);
            personnelRef.value.originPersonList = [...personIds];
          });
        }
        if (obj.personList && obj.personList.length > 0 && obj.contractCode && initIds().length > 0) {
          personnelRef.value.initUserList(initIds());
        }
        personnelRef.value.xzSelectedRowKeys = initIds();
      });
    }
  });
  // 过滤掉证书状态过期的，保险期限过期的，教育培训状态不是培训合格的，体检在不在有限期内的
  const initIds = () => {
    return objInfo.value.personList
      .filter((item) => {
        return (
          item.certificateStatus === '1' &&
          item.insuranceStatus === '1' &&
          item.trainStatus === '2' &&
          dayjs(item.physicalReportOvertime).isAfter(dayjs())
        );
      })
      .map((item) => item.personId);
  };
  // 获取承包单位code
  const changeContractCode = (value, data?, publishCode?) => {
    personnelRef.value.orgCode = value;
    const personIds = data?.map((item) => item.personId);
    if (data) {
      personnelRef.value.originPersonList = [...personIds];
      personnelRef.value.initUserList(personIds);
    }
    if (!value) {
      personnelRef.value.dataSource = [];
      personnelRef.value.publishCode = '';
    }
    personnelRef.value.xzSelectedRowKeys = [];
    if (type.value === 'edit') {
      personnelRef.value.xzSelectedRowKeys = initIds();
    }
    if (publishCode) {
      personnelRef.value.publishCode = publishCode;
    }
  };
  // 发包单位
  const changePublishCode = (value) => {
    personnelRef.value.publishCode = value;
  };
  // 判断是否是搬倒类
  const changeXgfType = (value) => {
    aboutRef.value.dataOne = aboutRef.value.dataOne.map((item) => {
      if (item.keys === 'sgcdbzt') {
        item.required = value !== '3';
      }
      return item;
    });
  };
  // 根据选中入场人员的列表给作业人数赋值
  const handleTableValue = (data) => {
    if (data.length > 0) {
      filingFormRef.value.info.workerNumber = data.length;
      filingFormRef.value.info.specialWorkerNumber = data.filter((item) => item.certificateStatus === '1').length;
    } else {
      filingFormRef.value.info.workerNumber = 0;
      filingFormRef.value.info.specialWorkerNumber = 0;
    }
  };
  // 相关资料重组
  const initAbout = () => {
    let aboutData: any = [];
    aboutData = aboutRef.value.dataOne.map((item) => {
      return {
        [item.keys + 'File']: item.value,
        [item.keys + 'Picture']: item.img,
        [item.keys + 'Result']: item.result,
      };
    });
    // 相关资料转换对象
    const obj = aboutData.reduce((acc, cur) => {
      return { ...acc, ...cur };
    }, {});
    return obj;
  };
  // 保存
  const onSave = () => {
    saveLoading.value = true;
    if (activeKey.value === '0') {
      const validate = filingFormRef.value.info;
      const data = JSON.parse(JSON.stringify(validate));
      if (applicationType.value === '入场申请') {
        merge({
          ...data,
          ...initAbout(),
          assigneeList: [],
          personList: personnelRef.value.dataSource,
          type: applicationType.value,
          delayFlag: delayFlag.value,
        })
          .then((res) => {
            if (res) {
              router.go(-1);
            }
          })
          .finally(() => {
            saveLoading.value = false;
          });
      } else {
        changeMerge({
          ...data,
          assigneeList: [],
          personList: personnelRef.value.dataSource,
          type: applicationType.value,
          delayFlag: delayFlag.value,
        })
          .then((res) => {
            if (res) {
              router.go(-1);
            }
          })
          .finally(() => {
            saveLoading.value = false;
          });
      }
    } else {
      if (applicationType.value === '入场申请') {
        submitFlow({
          id: id.value,
          status: '0',
          assigneeList: dataApproval(),
          delayFlag: delayFlag.value,
        })
          .then((res) => {
            if (res) {
              saveLoading.value = false;
              router.go(-1);
            }
          })
          .finally(() => {
            saveLoading.value = false;
          });
      } else {
        changeSubmitFlow({
          id: id.value,
          status: '0',
          assigneeList: dataApproval(),
          delayFlag: delayFlag.value,
        })
          .then((res) => {
            if (res) {
              saveLoading.value = false;
              router.go(-1);
            }
          })
          .finally(() => {
            saveLoading.value = false;
          });
      }
    }
  };
  // 下一步
  const onNextStep = async () => {
    await filingFormRef.value.infoFormRef.validate();
    const data = JSON.parse(JSON.stringify(filingFormRef.value.info));
    if (applicationType.value === '入场申请') {
      for (let i = 0; i < aboutRef.value.dataOne.length; i++) {
        if (aboutRef.value.dataOne[i].value === '' && aboutRef.value.dataOne[i].img === '' && aboutRef.value.dataOne[i].required) {
          return createMessage.info(`${aboutRef.value.dataOne[i].name}为必填项！`);
        }
      }
    }
    if (personnelRef.value.dataSource.length <= 0) {
      return createMessage.info('请添加入场人员！');
    }
    nextStepLoading.value = true;
    if (applicationType.value === '入场申请') {
      merge({
        ...data,
        ...initAbout(),
        personList: personnelRef.value.dataSource,
        type: applicationType.value,
        delayFlag: delayFlag.value,
      })
        .then((res) => {
          if (res) {
            activeKey.value = '1';
            step.value = '2';
            id.value = res.id;
            nextTick(() => {
              let data = approvalRef.value.manyHills;
              data.forEach((item) => {
                item.currentNode = res.currentNode || '0';
                if (item.name === '资料提交' && objInfo.value.assigneeList) {
                  item.handleTime = objInfo.value.assigneeList[0].handleTime;
                  item.assigneeName = objInfo.value.assigneeList[0].handlerName;
                }
              });
            });
          }
        })
        .finally(() => {
          nextStepLoading.value = false;
        });
    } else {
      changeMerge({
        ...data,
        personList: personnelRef.value.dataSource,
        type: applicationType.value,
        delayFlag: delayFlag.value,
      })
        .then((res) => {
          if (res) {
            activeKey.value = '1';
            step.value = '2';
            id.value = res.id;
            nextTick(() => {
              let data = approvalRef.value.manyHills;
              data.forEach((item) => {
                item.currentNode = res.currentNode || '0';
                if (item.name === '资料提交' && objInfo.value.assigneeList) {
                  item.handleTime = objInfo.value.assigneeList[0].handleTime;
                  item.assigneeName = objInfo.value.assigneeList[0].handlerName;
                }
              });
            });
          }
        })
        .finally(() => {
          nextStepLoading.value = false;
        });
    }
  };
  // 上一步
  const previous = () => {
    activeKey.value = '0';
    step.value = '1';
  };
  // 提交
  const handleSubmit = async () => {
    await approvalRef.value.validate();
    submitLoading.value = true;
    if (applicationType.value === '入场申请') {
      submitFlow({
        id: id.value,
        status: '1',
        assigneeList: dataApproval(),
        delayFlag: delayFlag.value,
      })
        .then((res) => {
          if (res) {
            router.go(-1);
          }
        })
        .finally(() => {
          submitLoading.value = false;
        });
    } else {
      changeSubmitFlow({
        id: id.value,
        status: '1',
        assigneeList: dataApproval(),
        delayFlag: delayFlag.value,
      })
        .then((res) => {
          if (res) {
            router.go(-1);
          }
        })
        .finally(() => {
          submitLoading.value = false;
        });
    }
  };
  // 保存提交时处理审批流程
  const dataApproval = () => {
    const data = JSON.parse(JSON.stringify(approvalRef.value.manyHills));
    let detailDtoList: any = [];
    data.forEach((item) => {
      if (item.personnelList) {
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
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-content-holder) {
    padding: 0 15px;
    height: calc(100vh - 112px);
    overflow: auto;
  }
  :deep(.ant-tabs-nav-list) {
    margin: 0 15px;
  }
  .btn-group {
    & > div {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
    }
    position: relative;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    button {
      height: 35px;
    }
  }
  :deep(.ant-tabs-nav-add) {
    line-height: 40px;
    width: 106px;
  }
  :deep(.ant-tabs) {
    overflow: initial;
  }
  .nav {
    color: #1890ff;
    margin-bottom: 10px;
  }
</style>
