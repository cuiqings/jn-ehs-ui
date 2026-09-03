<template>
  <BasicDrawer
    v-bind="$attrs"
    :bodyStyle="{ padding: '4px 10px' }"
    :footer="null"
    @register="register"
    :width="'70%'"
    :maskClosable="false"
    title="作业申请"
    @close="onClose"
    :zIndex="999"
    :loading="loading"
  >
    <a-tabs v-model:activeKey="activeKey" type="card" @change="tabChange">
      <a-tab-pane key="1" tab="作业信息" :disabled="!readonly">
        <JobMessage
          v-for="(item, idx) in workList"
          :key="idx"
          :workIndex="idx"
          ref="jobMessageRef"
          :readonly="readonly"
          v-model:value="activeKey"
          :initType="initType"
          @delete="deleteWork(idx)"
          @close="close"
          @refresh="refresh"
          @flow-path="flowPath"
          @typeChange="typeChange"
        />
      </a-tab-pane>
      <a-tab-pane key="2" tab="审批流程" :disabled="!readonly" forceRender>
        <examineAndApprove
          v-if="activeKey == '2'"
          ref="ExamineAndApprove"
          :readonly="readonly"
          v-model:value="activeKey"
          :initType="initType"
          @close="close"
          @refresh="refresh"
        />
      </a-tab-pane>
    </a-tabs>
    <a-row v-if="pageType == 'apply'">
      <a-col :span="24">
        <a-form-item :wrapper-col="{ span: 20, offset: 4 }">
          <a-space :size="12">
            <a-button v-if="!readonly && ['1', '2', '3', '4'].includes(workList[0].workType)" type="primary" @click="addNewWork"
              >添加新作业类型</a-button
            >
            <a-button @click="save" :loading="submiting" v-if="!readonly">保存</a-button>
            <a-button @click="activeKey = '1'" v-if="!readonly && activeKey == '2'">上一步</a-button>
            <a-button type="primary" @click="nextStep" v-if="!readonly && activeKey == '1'">下一步</a-button>
            <a-button type="primary" :loading="submiting" @click="submit" v-if="!readonly && activeKey == '2'">提交</a-button>
            <a-button @click="close" v-if="readonly">关闭</a-button>
          </a-space>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :span="24" v-if="pageType == 'examine'">
      <a-col :span="24">
        <a-form-item :wrapper-col="{ span: 20, offset: 10 }">
          <a-space>
            <a-button @click="keepData" style="background-color: #f27a05; color: #fff">审批退回</a-button>
            <a-button type="primary" @click="shut">审批通过</a-button>
          </a-space>
        </a-form-item>
      </a-col>
    </a-row>
    <BackModal ref="backModalRef" @register="registerBackModal" @submit="handleOk" />
  </BasicDrawer>
</template>

<script setup lang="ts">
  import { getKeepJob, getModificationJob, getWorkDetail, getWorkExamineInfo, addWork, getWorkExamineBack, queryIsHaveWork } from '../api';
  import { ref, nextTick, computed, watch } from 'vue';
  import { JobApplyForFrom } from '../type';
  import JobMessage from './JobMessage.vue';
  import { workSaveFormType } from './hazardIdentification';
  import examineAndApprove from './examineAndApprove.vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import BackModal from '../components/backModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal } from 'ant-design-vue';
  const { createMessage } = useMessage();
  const readonly = ref<boolean>(false);
  const loading = ref<boolean>(false);

  const workStore = useWorkStore();
  const workList = computed(() => workStore.getWorkList);

  const props = defineProps<{
    show: boolean;
  }>();
  watch(
    () => props.show,
    (val) => {
      if (val) {
        workList.value = workStore.getWorkList;
      }
    }
  );
  const [registerBackModal, { openModal, closeModal }] = useModal();
  const pageType = ref('apply');
  const initType = ref('apply');
  const emit = defineEmits(['renewal', 'close']);
  const jobMessageRef = ref();
  const ExamineAndApprove = ref();
  const activeKey = ref('1');
  const title = ref('作业申请');
  const typeChange = (type: string, idx: number) => {
    // workList.value[idx].workType = type;
  };

  const [register, { closeDrawer }] = useDrawerInner(async (data) => {
    console.log('data:', data);
    readonly.value = data.readOnly;
    pageType.value = data.pageType;
    title.value = data.title;
    initType.value = title.value == '复用' ? 'copy' : 'apply';
    if (data.id) {
      if (pageType.value == 'apply') {
        loading.value = true;
        const res = await getWorkDetail(data.id);
        loading.value = false;
        // let detail: any[] = [];
        // // detail[0] = res;
        workStore.setWorkList([initItem(res)]);
        if (res.otherWorkApply && res.otherWorkApply.length > 0) {
          res.otherWorkApply.forEach((item) => {
            workStore.updateWorkList(initItem({ ...item, pid: data.id }));
          });
        }
      } else {
        loading.value = true;
        const res = await getWorkExamineInfo({ id: data.id });
        loading.value = false;
        workList.value[0] = res;
      }
    }
    jobMessageRef.value[0].pageInit();
  });

  function initItem(item) {
    let possibleDangers = '';
    if (title.value == '复用') {
      item.otherSecurityMeasures = '';
      item.otherSecurityMeasuresAnnex = '';
      item.securityMeasuresIdList = [];
      item.startTimeStr = null;
      item.endTimeStr = null;
    }
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
     if (title.value == '复用') {
      item.start = [];
      item.startTimeStr = null;
      item.endTimeStr = null;
    }
    return item;
  }

  const flowPath = async (path: string) => {
    ExamineAndApprove.value.pageInit(path);
  };
  const refresh = () => {
    emit('renewal');
    jobMessageRef.value[0].reset();
  };

  const onClose = () => {
    activeKey.value = '1';
    jobMessageRef.value[0].reset();
    workStore.resetWorkList();
    emit('close');
  };

  const addNewWork = () => {
    console.log('添加新作业类型');
    // workList.value.push(workList.value[workList.value.length - 1]);
    workStore.addWorkList();
  };

  const deleteWork = (idx: number) => {
    workStore.deleteWorkList(idx);
  };

  const submiting = ref(false);
  const save = async () => {
    let examineData = ExamineAndApprove.value ? ExamineAndApprove.value.getFormData(false) : {};
    let formState = workSaveFormType(workStore.getWorkList[0]);
    if (workStore.getWorkList.length > 1) {
      formState.otherWorkApply = [];
      workStore.getWorkList.slice(1, workStore.getWorkList.length).forEach((item) => {
        let data = workSaveFormType(item, examineData);
        formState.otherWorkApply.push(data);
      });
    }
    if (!formState) return;
    submiting.value = true;
    // 复用逻辑
    if (title.value == '复用') {
      formState.id = null;
      formState.workApplyCode = null;
      formState.state = 1;
      formState.workState = 1;
      workList.value.forEach((item: any) => {
        item.id = null;
        item.workApplyCode = null;
        item.state = 1;
        item.workState = 1;
        item.otherSecurityMeasuresAnnex = '';
      });
    }
    if (formState.id) {
      getModificationJob(formState)
        .then(() => {
          submiting.value = false;
          close();
          workStore.resetWorkList();
        })
        .catch((_) => {
          submiting.value = false;
        });
    } else {
      //保存
      getKeepJob(formState as JobApplyForFrom)
        .then(() => {
          submiting.value = false;
          close();
          workStore.resetWorkList();
        })
        .catch((_) => {
          submiting.value = false;
        });
    }
  };

  const submit = async () => {
    const promiseAll: Promise<any>[] = [];
    jobMessageRef.value.forEach((ref: any) => {
      promiseAll.push(ref.nextStep());
    });
    Promise.all(promiseAll)
      .then(async (_) => {
        let formState = workStore.getWorkList[0];
        if (!formState.otherWorkApply && workStore.getWorkList.length > 1) {
          formState.otherWorkApply = [];
          workStore.getWorkList.slice(1, workStore.getWorkList.length).forEach((item) => {
            let data = workSaveFormType(item, []);
            if (title.value == '复用') {
              data.otherSecurityMeasuresAnnex = '';
            }
            formState.otherWorkApply.push(data);
          });
        }

        let examineData = [];
        examineData = await ExamineAndApprove.value.submitFormData(true);
        let data: JobApplyForFrom = workSaveFormType(formState, examineData);
        // 复用逻辑
        if (title.value == '复用') {
          data.id = null;
          data.workApplyCode = null;
          data.state = 2;
          data.workState = 1;
        }
        queryIsHaveWork({ userId: formState.sceneHead }).then((res) => {
          if (res) {
            Modal.info({
              title: '提示',
              content: res,
              okText: '确定',
              onOk() {
                console.log('OK');
              },
            });
          } else {
            submiting.value = true;
            addWork(data)
              .then(() => {
                submiting.value = false;
                close();
                workStore.resetWorkList();
              })
              .catch((_) => {
                submiting.value = false;
              });
          }
        })
      })
      .catch((err) => console.log(err));
  };

  const tabChange = (key: string) => {
    if (key == '2') {
      nextStep();
    }
  };

  const nextStep = () => {
    let promiseAll = [];
    workList.value.forEach((_, idx) => {
      promiseAll.push(jobMessageRef.value[idx].nextStep());
    });
    Promise.all(promiseAll)
      .then((res) => {
        if (res) {
          activeKey.value = '2';
          nextTick(() => {
            ExamineAndApprove.value.pageInit(workList.value);
          });
        }
      })
      .catch((err) => {
        createMessage.error('请检查作业信息是否填写完整');
      });
  };

  const close = async () => {
    closeDrawer();
    activeKey.value = '1';
    refresh();
    onClose();
  };

  //审批退回
  const keepData = async () => {
    openModal();
  };

  const handleOk = async (txt) => {
    let data = workSaveFormType(workList.value[0]); //@ts-ignore
    data.workApplyId = data.id; //@ts-ignore
    data.workExamineId = data.examineInfoList[data.examineInfoList.length - 1].id;
    data.reviewComments = txt;
    await getWorkExamineBack(data);
    closeModal();
  };
</script>

<style scoped lang="less"></style>
