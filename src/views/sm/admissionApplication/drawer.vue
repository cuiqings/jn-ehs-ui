<!-- 企业资质备案 -->
<template>
  <BasicDrawer v-bind="$attrs" :push="false" @register="registerDrawer" :title="title" :width="1000" show-footer :show-ok-btn="false" destroyOnClose>
    <a-tabs v-model:activeKey="activeKey" type="card" @change="handleTabChange">
      <a-tab-pane key="0" tab="项目信息" :disabled="step === '2'">
        <FilingForm
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
    <template #footer>
      <div>
        <div v-if="status == '0' || status === '' || status == '2'">
          <a-button style="margin-right: 15px" :loading="saveLoading" @click="onSave">保存</a-button>
          <a-button v-if="activeKey === '0'" style="margin-right: 15px" :loading="nextStepLoading" type="primary" @click="onNextStep"
            >下一步</a-button
          >
          <a-button v-if="activeKey === '1'" style="margin-right: 15px" @click="previous">上一步</a-button>
          <a-button v-if="activeKey === '1'" style="margin-right: 15px" :loading="submitLoading" type="primary" @click="handleSubmit">提交</a-button>
        </div>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" name="filingDrawer" setup>
  import { ref, nextTick } from 'vue';
  import FilingForm from './components/filingForm/index.vue';
  import About from './components/about/index.vue';
  import Personnel from './components/personnel/index.vue';
  import Approval from './components/Approval.vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { merge, queryById, submitFlow, changeMerge, changeSubmitFlow } from './url/index';
  import dayjs from 'dayjs';
  const { createMessage } = useMessage();
  const emits = defineEmits(['success']);
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
  const [registerDrawer, { closeDrawer }] = useDrawerInner((data) => {
    currentNode.value = '0';
    title.value = data.title;
    applicationType.value = data.addType;
    type.value = data.type;
    activeKey.value = '0';
    step.value = '1';
    id.value = '';
    status.value = '';
    delayFlag.value = data.delayFlag ? data.delayFlag : null;
    nextTick(() => {
      filingFormRef.value.initSchemas(applicationType.value);
      if (data.type === 'add') {
        filingFormRef.value.init();
      }
    });
    objInfo.value = {};
    if (data.type !== 'add') {
      queryById({ id: data.data.id }).then(async (res) => {
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
        if (obj.workDateStart && applicationType.value === '入场申请') {
          obj.workDate = [obj.workDateStart, obj.workDateEnd];
        }
        obj.contractCode = obj.contractCode === '' ? undefined : obj.contractCode;
        obj.contractManagerId = obj.contractManagerId === '' ? undefined : obj.contractManagerId;
        // 获取承包单位
        personnelRef.value.orgCode = obj.contractCode;
        // 获取到期发包单位
        personnelRef.value.publishCode = obj.publishCode;
        if (applicationType.value === '新增人员') {
          await queryById({ id: obj.enterId }).then((res) => {
            const personIds = res.personList.map((item) => item.personId);
            personnelRef.value.originPersonList = [...personIds];
          });
        }
        // 入场人员回显
        if (obj.personList && obj.personList.length > 0 && obj.contractCode && initIds().length > 0) {
          personnelRef.value.initUserList(initIds());
        }
        personnelRef.value.xzSelectedRowKeys = initIds();
        filingFormRef.value.setFieldsValue({ ...obj });
        if (applicationType.value === '入场申请') {
          // 回显承包单位负责人
          filingFormRef.value.initContractManager(obj.contractCode, obj.publishCode);
          // 入场申请相关资料回显
          aboutRef.value.dataOne.forEach((item) => {
            const keyPrefix = item.keys;
            item.value = obj[`${keyPrefix}File`];
            item.img = obj[`${keyPrefix}Picture`];
            item.result = obj[`${keyPrefix}Result`];
            if (item.keys === 'sgcdbzt') {
              item.required = obj.xgfType !== '3';
            }
          });
        } else {
          filingFormRef.value.init(obj.publishCode);
        }
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
  // 获取承包单位code  data存在是项目带出
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
      filingFormRef.value.setFieldsValue({
        workerNumber: data.length,
        specialWorkerNumber: data.filter((item) => item.ifSpecialOperator === '1').length,
      });
    } else {
      filingFormRef.value.setFieldsValue({
        workerNumber: undefined,
        specialWorkerNumber: undefined,
      });
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
      const validate = filingFormRef.value.getFieldsValue();
      const data = JSON.parse(JSON.stringify(validate));
      dateRangeProcessing(validate, data, 'workDate');
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
              closeDrawer();
              emits('success');
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
              closeDrawer();
              emits('success');
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
              closeDrawer();
              emits('success');
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
              closeDrawer();
              emits('success');
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
    const validate = await filingFormRef.value.validate();
    const data = JSON.parse(JSON.stringify(validate));
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
    dateRangeProcessing(validate, data, 'workDate');
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
            emits('success');
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
            emits('success');
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
            closeDrawer();
            emits('success');
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
            closeDrawer();
            emits('success');
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
  // tabs切换
  const handleTabChange = (activeKey) => {
    if (activeKey === '1') {
      nextTick(() => {
        // 审批流程回显
        approvalRef.value.current = Number(objInfo.value.jnStakeApproveRecords.filter((ite) => ite.result === '2')[0].type) - 1;
        approvalRef.value.manyHills.forEach((item) => {
          item.approveType = objInfo.value.jnStakeApproveRecords.filter((ite) => ite.type === item.type)[0].type;
          item.approveUnit = objInfo.value.jnStakeApproveRecords.filter((ite) => ite.type === item.type)[0].approveUnit;
          item.approveUnitCode = objInfo.value.jnStakeApproveRecords.filter((ite) => ite.type === item.type)[0].approveUnitCode;
          item.result = objInfo.value.jnStakeApproveRecords.filter((ite) => ite.type === item.type)[0].result;
          if (!item.personnelList && item.type !== '5') {
            item.approvePeople = objInfo.value.jnStakeApproveRecords.filter((ite) => ite.type === item.type)[0].approvePeople;
            if (item.name === '许可证发放') {
              item.updateTime = objInfo.value.workDateBegin + '至' + objInfo.value.workDateAfter;
            } else {
              item.updateTime = objInfo.value.jnStakeApproveRecords.filter((ite) => ite.type === item.type)[0].updateTime;
            }
          } else {
            item.personnelList = objInfo.value.jnStakeApproveRecords
              .filter((ite) => ite.type === item.type)
              .map((it) => {
                return {
                  isApprovePeopleId: it.approvePeopleId.split(','),
                  isApprovePeople: it.approvePeople.split(','),
                  updateTime: it.updateTime,
                  approvePeople: it.approvePeople,
                  options: [],
                  result: it.result,
                  approvalOpinion: it.approvalOpinion,
                };
              });
          }
        });
      });
    }
  };
  // 日期区间处理
  const dateRangeProcessing = (validate, data, key) => {
    if (validate[key] && validate[key].length > 0) {
      if (validate[key].length === 21 || validate[key].trim().length === 39 || Array.isArray(validate[key])) {
        if (Array.isArray(validate[key])) {
          data[`${key}Start`] = validate[key][0];
          data[`${key}End`] = validate[key][1];
        } else {
          const time = validate[key].trim();
          data[`${key}Start`] = dayjs(time.split(',')[0]).format('YYYY-MM-DD');
          data[`${key}End`] = dayjs(time.split(',')[1]).format('YYYY-MM-DD');
        }
      } else {
        const dateRegex = /\b\w{3}, \d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT\b/g;
        const dateMatches = validate[key].match(dateRegex);
        data[`${key}Start`] = dayjs(dateMatches[0]).format('YYYY-MM-DD');
        data[`${key}End`] = dayjs(dateMatches[1]).format('YYYY-MM-DD');
      }
    }
    delete data[key];
  };
</script>

<style lang="less" scoped>
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
