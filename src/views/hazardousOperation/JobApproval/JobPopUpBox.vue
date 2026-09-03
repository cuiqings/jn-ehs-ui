<template>
  <div>
    <BasicDrawer
      @register="register"
      v-bind="$attrs"
      style="top: 5px; right: 5px; position: absolute"
      :bodyStyle="{ padding: '4px 10px' }"
      :footer="null"
      :width="1300"
      :maskClosable="false"
      :title="title"
      :loading="loading"
    >
      <a-tabs v-model:activeKey="activeKey" type="card" v-if="!loading" :destroyInactiveTabPane="false">
        <a-tab-pane key="1" tab="作业信息" forceRender>
          <JobMessage
            v-for="(item, index) in workList"
            :key="index"
            :work-index="index"
            :formState="item"
            ref="jobMessage"
            :readonly="true"
            :title="value"
            v-model:value="activeKey"
            @refresh="refresh"
          />
        </a-tab-pane>
        <a-tab-pane key="2" tab="审批流程" forceRender>
          <examine-and-approve
            ref="ExamineAndApprove"
            :readonly="readonly"
            :formState="workList[0]"
            v-model:value="activeKey"
            :title="value"
            @refresh="refresh"
          />
        </a-tab-pane>
      </a-tabs>
      <template v-if="workList[0].examineInfoList && workList[0].examineInfoList.length > 1 && activeKey == '1'">
        <a-row :span="24" v-for="item in workList[0].examineInfoList" :key="item.id">
          <a-col :span="24" v-for="item2 in item.examineInfoItemList" :key="item2.id">
            <a-row :span="24" v-if="item.nodeName == '安全交底(作业负责人)'">
              <a-col :span="24">
                <a-form-item :labelCol="{ span: 3 }" :wrapper-col="{ span: 21 }" label="安全交底" name="workContent">
                  <table class="table-form" style="width: 100%">
                    <tr>
                      <td style="width: 120px">作业地点</td>
                      <td>
                        {{ workList[0].workLocation }}
                      </td>
                      <td style="width: 120px">作业时间</td>
                      <td> {{ workList[0].startTimeStr }} - {{ workList[0].endTimeStr }} </td>
                    </tr>
                    <tr>
                      <td style="width: 120px">作业内容</td>
                      <td> {{ workList[0].workContent }}</td>
                      <td style="width: 120px">作业类别</td>
                      <td> {{ getWorkName() }}</td>
                    </tr>
                    <tr>
                      <td style="width: 120px">辨识单位</td>
                      <td>
                        <a-form-item>
                          <a-tree-select
                            style="width: 190px"
                            v-model:value="jiaodiFormState.identifyUnit"
                            placeholder="请选择"
                            :tree-data="applicationUnitList"
                            showSearch
                            disabled
                            tree-node-filter-prop="departName"
                            :field-names="{ label: 'title', value: 'key', children: 'children' }"
                          /> </a-form-item
                      ></td>
                      <td style="width: 120px">辨识人</td>
                      <td>
                        <a-form-item>
                          <JUserModal type="checkbox" disabled v-model:value="jiaodiFormState.identifyPerson" placeholder="请选择" />
                        </a-form-item>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 120px">交底人</td>
                      <td>
                        <a-form-item>
                          <JUserModal
                            disabled
                            style="width: 190px"
                            type="checkbox"
                            v-model:value="workList[0].sceneHead"
                            placeholder="请选择"
                          /> </a-form-item
                      ></td>
                      <td style="width: 120px">交底时间</td>
                      <td> {{ jiaodiFormState.disclosureTime }}</td>
                    </tr>
                    <tr>
                      <td style="width: 120px">作业负责人</td>
                      <td>
                        <a-form-item
                          ><JUserModal
                            disabled
                            style="width: 190px"
                            type="checkbox"
                            v-model:value="workList[0].sceneHead"
                            placeholder="请选择"
                          /> </a-form-item
                      ></td>
                      <td style="width: 120px">监护人</td>
                      <td>
                        <a-form-item>
                          <JUserModal
                            disabled
                            style="width: 190px"
                            type="checkbox"
                            v-model:value="workList[0].workUnitGuardian"
                            placeholder="请选择"
                          /> </a-form-item
                      ></td>
                    </tr>
                    <tr>
                      <td style="width: 120px">基本要求</td>
                      <td colspan="3" style="text-align: left">
                        作业前，属地单位车问负责人应对能工作业人员进行安全交底和风险告知内容包括作业及作业环境、作业风险、防范指施(工艺、设备、个体防护等)应急措施及其他注意事项。作业人员应按照风险告知内容，逐条对接确认，落实到位后方可作业。
                      </td>
                    </tr>
                    <tr>
                      <td rowspan="5" style="width: 120px">安全交底内容</td>
                      <td colspan="3" style="text-align: left"> 使用主要设备工具：{{ jiaodiFormState.tool }} </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left">
                        <div> 可能导致的伤害类型：{{ jiaodiFormState.damageType }} </div>
                        <div> 存在主要风险：{{ jiaodiFormState.risk }} </div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left"> 防范措施：{{ jiaodiFormState.measure }} </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left"> 应急措施：{{ jiaodiFormState.emergencyMeasure }} </td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: left"> 其他注意事项：{{ jiaodiFormState.other }} </td>
                    </tr>
                    <tr>
                      <td>风险辨识情况及管控落实情况小结</td>
                      <td colspan="3" style="text-align: left">
                        <div> 已开展全面风险辨识，共辨识作业风险 {{ jiaodiFormState.identifyNumber }} 项；管控据施已全部落实。 </div>
                      </td>
                    </tr>
                    <tr>
                      <td>辨识时间</td>
                      <td colspan="3" style="text-align: left">
                        <div> 自 {{ jiaodiFormState.identifyStartTime }} 分始至 {{ jiaodiFormState.identifyEndTime }} 分止</div>
                      </td>
                    </tr>
                    <tr>
                      <td>风险及管控措施告知(被交底人签字)</td>
                      <td colspan="3" style="text-align: left"> 我已熟知此次作业存在的安全风险及管控指施，将严格道章作业，确保安全。 </td>
                    </tr>
                    <tr>
                      <td>上传附件</td>
                      <td colspan="3" style="text-align: left">
                        <JUpload ref="uploadRef" disabled :maxCount="1" v-model:value="jiaodiFormState.annexUrl" text="上传附件" />
                      </td>
                    </tr>
                  </table>
                </a-form-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </template>
      <a-row :span="24">
        <a-col
          :span="24"
          v-if="
            !(
              readOnly &&
              (examineInfoList.find((Item) => Item.nodeName === '接受交底(作业人员)') !== undefined ||
                examineInfoList.find((Item) => Item.nodeName === '接受交底(作业人员)')?.examineInfoItemList !== null)
            )
          "
        >
          <a-form-item :wrapper-col="{ span: 20, offset: 5 }">
            <a-space :size="50" v-if="buttonText == '审批同意'">
              <a-button @click="keepData" v-if="!disabled && !readOnly" :loading="backLoading" style="background-color: #f27a05; color: #fff"
                >审批退回</a-button
              >
              <a-button @click="shut" v-if="disabled && !readOnly"> 取消 </a-button>
              <a-button @click="RiskIdentification" v-if="!readOnly" type="primary"> {{ buttonText }} </a-button>
            </a-space>
            <a-space :size="50" v-if="['安全交底', '接受交底'].includes(buttonText)">
              <a-button @click="shut" v-if="!readOnly"> 取消 </a-button>
              <a-button @click="RiskIdentification" v-if="!readOnly" type="primary"> {{ buttonText }} </a-button>
            </a-space>
          </a-form-item>
        </a-col>
        <a-col :span="24" v-else>
          <a-form-item :wrapper-col="{ span: 24 }">
            <div style="width: 100%; text-align: center">
              <a-button @click="shut" type="primary"> 确认关闭 </a-button>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
      <my-model @register="registerMyModal" @close="closeExamine" />
      <BackModal @register="registerBack" @submit="backSubmit" />
      <SafetyModel @register="registerSafetyModal" @submit="SafetySubmit" />
      <markModal @register="registerModal" />
    </BasicDrawer>
  </div>
</template>

<script setup lang="ts">
  import { getWorkExamineInfo, getWorkJobWorkDetail, getWorkExamineBack } from '../api';
  import { workSaveFormType } from '../workRequisition/hazardIdentification';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { inject, nextTick, Ref, ref, watch, computed } from 'vue';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import examineAndApprove from './examineAndApprove.vue';
  import { useDepartList } from '../hooks/useDepartList';
  import { useUserStore } from '/@/store/modules/user';
  import JobMessage from './JobMessage.vue';
  import { useModal } from '/@/components/Modal'; 
  import { JUserModal } from '/@/components/Form';
  import MyModel from './MyModel.vue';
  import BackModal from '../components/backModal.vue';
  import SafetyModel from './safetyModel.vue';
  import markModal from '../components/markModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const [registerBack, { openModal, closeModal }] = useModal();
  const [registerModal, { openModal: openMarkdownModal }] = useModal();
  const [registerMyModal, { openModal: openMyModal, closeModal: closeMyModal }] = useModal();
  const [registerSafetyModal, { openModal: openSafetyModal, closeModal: closeSafetyModal }] = useModal();

  const userStore = useUserStore();
  const title = ref('');
  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);
  const prop = withDefaults(
    defineProps<{
      readonly?: boolean;
    }>(),
    {
      readonly: false,
    }
  );

  const emit = defineEmits(['renewal']);
  const jobMessage = ref();
  const ExamineAndApprove = ref();
  const activeKey = ref('1');
  let value = inject<Ref<string>>('title') as Ref<string>;
  let open = inject<Ref<boolean>>('open') as Ref<boolean>;
  const popup = ref(open);
  const loading = ref(false);

  const buttonText = computed(() => {
    console.log(examineInfoList.value, 'readOnly.value');
    return examineInfoList.value.length > 0 &&
      (examineInfoList.value[examineInfoList.value.length - 1].nodeName == '安全交底(作业负责人)' ||
        ['安全交底'].includes(examineInfoList.value[examineInfoList.value.length - 1].nodeName))
      ? '安全交底'
      : examineInfoList.value.length > 0 &&
        (examineInfoList.value[examineInfoList.value.length - 1].nodeName == '接受交底(作业人员)' ||
          ['接受交底'].includes(examineInfoList.value[examineInfoList.value.length - 1].nodeName))
      ? '接受交底'
      : '审批同意';
  });
  const examineInfoList = computed(() => workList.value[0].examineInfoList || []);
  const applicationUnitList = ref<any[]>([]);
  const jiaodiFormState = computed(() => workList.value[0].safetyDisclosureContent);
  const [register, { closeDrawer }] = useDrawerInner(async (data) => {
    loading.value = true;
    let workInfo = await getWorkExamineInfo({ id: data.id });
    title.value = '作业审批';
    const detail = await getWorkJobWorkDetail(data.id);
    workInfo.workExamine = detail.workExamine;
    workStore.setWorkList([initItem(workInfo)]);
    if (workInfo.otherWorkApply && workInfo.otherWorkApply.length > 0) {
      workInfo.otherWorkApply.forEach((item) => {
        workStore.updateWorkList(initItem(item));
      });
    }
    loading.value = false;
    const { applicationUnitList: list } = await useDepartList();
    applicationUnitList.value = list.value;
  });

  function initItem(item) {
    let possibleDangers = '';
    const possibleDanger = item.possibleDanger?.split(',').map((item) => {
      if (item.includes('其他伤害')) {
        possibleDangers = item.split('-')[1];
        return item.split('-')[0];
      }
      if (item === '其他') {
        possibleDangers = item.split('-')[1];
        return item.split('-')[0];
      }
      return item;
    });
    item.possibleDanger = possibleDanger;
    item.possibleDangerInput = possibleDangers;
    item.start = [item.startTimeStr, item.endTimeStr];
    item.securityMeasuresIds = item.securityMeasuresIds?.split(',');
    item.workAnalysis = item.workAnalysisList;
    item.examineInfoList = item.examineInfoList && item.examineInfoList.length > 0 ? [...item.examineInfoList] : [];
    item.reviewComments = '';
    item.operateMethod = item.operateMethod?.split(',');
    item.hoistingIdNumber = item.hoistingIdNumber?.split(',');
    item.hoistingCommander = item.hoistingCommander?.split(','); //@ts-ignore
    item.sign = userStore.getUserInfo?.signature;
    // 安全措施回显
    let securityMeasuresSelection: string | Array<string> = [];
    if (item.workSecurityMeasuresList && item.workSecurityMeasuresList.length > 0) {
      item.workSecurityMeasuresList.forEach((item) => {
        if (item.selected === '0') {
          securityMeasuresSelection.push(item.sort);
        }
      });
      item.securityMeasuresIdList = item.workSecurityMeasuresList;
      item.securityMeasuresIds = securityMeasuresSelection;
    }
    return item;
  }

  watch(
    () => open.value,
    (now) => {
      popup.value = now;
      if (now) {
        nextTick(async () => {
          // jobMessage.value.reset();
          // jobMessage.value.init();
        });
      }
    },
    {}
  );
  //审批退回
  const keepData = async () => {
    openModal();
  };
  const backLoading = ref(false);
  const backSubmit = async (txt) => {
    backLoading.value = true;
    let data = workSaveFormType(workList.value[0]); //@ts-ignore
    data.workApplyId = data.id; //@ts-ignore
    data.workExamineId = data.examineInfoList[data.examineInfoList.length - 1].id;
    data.reviewComments = txt;
    await getWorkExamineBack(data).catch((_) => {
      backLoading.value = false;
    });
    backLoading.value = false;
    closeDrawer();
    closeModal();
    emit('renewal');
  };

  //审批同意
  const RiskIdentification = async () => {
    let promisrAll = jobMessage.value.map((item) => item.submit());
    await Promise.all(promisrAll)
      .then((res) => {
        let params = JSON.parse(JSON.stringify(workList.value));
        let data: any = {};
        params.forEach((fitem, index) => {
          if (fitem.workUnitGuardian && Array.isArray(fitem.workUnitGuardian) && fitem.workUnitGuardian.length > 0) {
            fitem.workUnitGuardian = fitem.workUnitGuardian.join(',');
          }
          //@ts-ignore
          if (fitem.possibleDanger && fitem.possibleDanger.length > 0) {
            //@ts-ignore
            fitem.possibleDanger = fitem.possibleDanger.map((item) => {
              if (item == '其他伤害') {
                return item + '-' + fitem.possibleDangerInput;
              }
              return item;
            });
            //@ts-ignore
            fitem.possibleDanger = fitem.possibleDanger.join(',');
          }
          //@ts-ignore
          if (fitem.start && fitem.start.length > 0) {
            //@ts-ignore
            fitem.startTime = fitem.start[0]; //@ts-ignore
            fitem.endTime = fitem.start[1];
          }

          if (fitem.hoistingCommander && fitem.hoistingCommander.length > 0) {
            //@ts-ignore
            fitem.hoistingCommander = fitem.hoistingCommander.join(',');
          }
          if (fitem.hoistingIdNumber && fitem.hoistingIdNumber.length > 0) {
            //@ts-ignore
            fitem.hoistingIdNumber = fitem.hoistingIdNumber.join(',');
          }
          if (fitem.securityMeasuresIds && Array.isArray(fitem.securityMeasuresIds) && fitem.securityMeasuresIds.length > 0) {
            fitem.securityMeasuresIds = fitem.securityMeasuresIds.join(',');
          }
          if (fitem.securityMeasuresIdList) {
            fitem.securityMeasuresIdList.forEach((citem) => {
              console.log(citem);
            });
          }
          if (fitem.workAnalysis && fitem.workAnalysis.length > 0) {
            fitem.workAnalysis = fitem.workAnalysis.map((item) => ({ ...item, id: item.ids }));
          }
          if (fitem.operateMethod && fitem.operateMethod.length > 0) {
            //@ts-ignore
            fitem.operateMethod = fitem.operateMethod.join(',');
          }
        });
        data = params[0];
        if (params.length > 1) {
          data.otherWorkApply = [];
          params.forEach((fitem, index) => {
            if (index > 0) {
              data.otherWorkApply.push(fitem);
            }
          });
        }
        if (buttonText.value == '安全交底') {
          openSafetyModal(true, data);
        } else {
          openMyModal(true, data);
        }
      })
      .catch((error) => {
        createMessage.error('请检查必填项！');
      });
  };
  const closeExamine = () => {
    activeKey.value = '1';
    closeDrawer();
    workStore.resetWorkList();
    emit('renewal');
    if (buttonText.value == '安全交底') {
      closeSafetyModal();
    }
  };
  const refresh = () => {
    emit('renewal');
  };

  const SafetySubmit = (params) => {
    openMyModal(true, params);
  };

  const getWorkName = () => {
    let name = '';
    userStore.getAllDictItems.work_type.forEach((item) => {
      if (item.value == workList.value[0].workType) {
        name += item.label + ',';
      }
      if (workList.value[0].otherWorkApply && workList.value[0].otherWorkApply.length > 0) {
        workList.value[0].otherWorkApply.forEach((citem) => {
          if (item.value == citem.workType) {
            name += item.label + ',';
          }
        });
      }
    });
    return name.substring(0, name.length - 1);
  };
</script>

<style scoped lang="less">
  .table-form {
    border: 1px solid #e5e7eb;
    border-collapse: collapse;
    text-align: center;
    tr {
      height: 40px;
      td:nth-child(1),
      td:nth-child(3) {
        width: 240px;
      }
    }
    td {
      padding: 0 10px;
      border: 1px solid #e5e7eb;
      div {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
    :deep(.ant-row) {
    }
    :deep(.ant-input) {
      border-top: none;
      border-left: none;
      border-right: none;
    }
    :deep(.ant-input:focus) {
      border-top: none;
      border-left: none;
      border-right: none;
      box-shadow: none;
    }
  }
</style>
