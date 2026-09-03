<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1200" :title="title" destroyOnClose>
      <div>
        <a-form :model="info" ref="infoRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off">
          <div style="display: flex; justify-content: space-between">
            <div style="width: 49%">
              <div style="color: #1890ff; margin-bottom: 20px"> 基本信息</div>
              <a-form-item label="报警名称：" name="alarmName" :rules="[{ required: type !== 'view', message: '报警名称为必填项！' }]">
                <a-input v-model:value="info.alarmName" :maxlength="50" :disabled="type === 'view'" placeholder="请输入" />
              </a-form-item>
              <a-form-item label="声光报警器：" name="soundLightAlarm">
                <a-select
                  v-model:value="info.soundLightAlarm"
                  :options="soundLightAlarmOptions"
                  label-field="departName"
                  value-field="orgCode"
                  placeholder="请选择"
                  :disabled="type === 'view'"
                />
              </a-form-item>
              <div style="border: 1px solid #d9d9d9; padding: 10px; margin-bottom: 25px" v-for="(item, index) in info.notifierList" :key="index">
                <a-form-item label="通知角色：" :name="['notifierList', index, 'notifierRole']">
                  <api-select
                    v-model:value="item.notifierRole"
                    mode="multiple"
                    :api="role"
                    label-field="roleName"
                    value-field="roleCode"
                    result-field="records"
                    placeholder="请选择"
                    :disabled="type === 'view'"
                    @change="handlerChange($event, index, 'notifierRoleName', 'notifierList')"
                  />
                </a-form-item>
                <a-form-item
                  label="通知方式："
                  :name="['notifierList', index, 'noticeType']"
                  :rules="[{ required: type !== 'view' && item.notifierRole && item.notifierRole.length > 0, message: '通知方式为必填项！' }]"
                >
                  <a-checkbox-group v-model:value="item.noticeType" :options="checkboxOptions" :disabled="type === 'view'" />
                </a-form-item>
                <div style="text-align: right" v-if="type !== 'view'">
                  <span v-if="info.notifierList.length < 3" style="color: #4498f0; margin-left: 20px; cursor: pointer" @click="notifierListAdd(index)"
                    >添加</span
                  >
                  <span v-if="info.notifierList.length > 1" style="color: red; margin-left: 20px; cursor: pointer" @click="notifierListRemove(index)"
                    >删除</span
                  >
                </div>
              </div>
              <div style="color: #1890ff; margin-bottom: 20px"> 报警规则</div>
              <a-form-item label="摄像头名称：" name="cameraName" :rules="[{ required: type !== 'view', message: '摄像头名称为必填项！' }]">
                <a-input v-model:value="info.cameraName" readonly placeholder="请选择" :disabled="type === 'view'" @click="openCameraRegisterModal" />
              </a-form-item>
              <a-form-item label="温度规则：" v-if="cameraType.includes('温度')">
                <a-switch v-model:checked="temperature" :disabled="type === 'view'" @change="temperatureSwitch" />
              </a-form-item>
              <a-form-item label="报警阈值：" :required="type !== 'view'" v-if="temperature" class="threshold">
                <div
                  class="threshold_div"
                  style="display: flex; justify-content: space-between; margin-top: 28px"
                  v-for="(item, index) in info.thresholdList"
                  :key="index"
                >
                  <span style="line-height: 30px">区域{{ item.areaCode }}</span>
                  <a-form-item
                    label=""
                    name="thresholdMax"
                    style="width: calc(50% - 35px); margin-bottom: 0"
                    :rules="[
                      {
                        required: (item.thresholdMin === '' || !item.thresholdMin) && !item.thresholdMax && type !== 'view',
                        message: '请设置区域范围！',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input-number
                      v-model:value="item.thresholdMax"
                      addon-before="高于"
                      style="width: 100%"
                      :min="0"
                      :precision="1"
                      :controls="false"
                      :disabled="type === 'view'"
                    />
                  </a-form-item>
                  <a-form-item
                    label=""
                    name="thresholdMin"
                    style="width: calc(50% - 35px); margin-bottom: 0"
                    :rules="[
                      {
                        required: (item.thresholdMax === '' || !item.thresholdMax) && !item.thresholdMin && type !== 'view',
                        message: '请设置区域范围！',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input-number
                      v-model:value="item.thresholdMin"
                      addon-before="低于"
                      style="width: 100%"
                      :min="0"
                      :precision="1"
                      :controls="false"
                      :disabled="type === 'view'"
                    />
                  </a-form-item>
                </div>
              </a-form-item>
              <a-form-item label="屏幕亮灭规则：" v-if="cameraType.includes('屏幕亮灭')">
                <a-switch v-model:checked="onAndOff" :disabled="type === 'view'" @change="onAndOffSwitch" />
              </a-form-item>
              <a-form-item label="火焰规则：" v-if="cameraType.includes('火焰')">
                <a-switch v-model:checked="flame" :disabled="type === 'view'" @change="flameSwitch" />
              </a-form-item>
              <a-form-item label="人员数量规则：" v-if="cameraType.includes('人员数量')">
                <a-switch v-model:checked="personnelNum" :disabled="type === 'view'" @change="personnelNumSwitch" />
              </a-form-item>
              <a-form-item label="报警阈值：" :required="type !== 'view'" v-if="personnelNum" class="threshold">
                <div
                  class="threshold_div"
                  style="display: flex; justify-content: space-between; margin-top: 28px"
                  v-for="(item, index) in info.thresholdList"
                  :key="index"
                >
                  <span style="line-height: 30px">人员数量{{ item.areaCode }}</span>
                  <a-form-item
                    label=""
                    name="thresholdMax"
                    style="width: calc(50% - 35px); margin-bottom: 0"
                    :rules="[
                      {
                        required: (item.thresholdMin === '' || !item.thresholdMin) && !item.thresholdMax && type !== 'view',
                        message: '请设置人员数量范围！',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input-number
                      v-model:value="item.thresholdMax"
                      addon-before="高于"
                      style="width: 100%"
                      :min="0"
                      :precision="1"
                      :controls="false"
                      :disabled="type === 'view'"
                    />
                  </a-form-item>
                  <a-form-item
                    label=""
                    name="thresholdMin"
                    style="width: calc(50% - 35px); margin-bottom: 0"
                    :rules="[
                      {
                        required: (item.thresholdMax === '' || !item.thresholdMax) && !item.thresholdMin && type !== 'view',
                        message: '请设置人员数量范围！',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input-number
                      v-model:value="item.thresholdMin"
                      addon-before="低于"
                      style="width: 100%"
                      :min="0"
                      :precision="1"
                      :controls="false"
                      :disabled="type === 'view'"
                    />
                  </a-form-item>
                </div>
              </a-form-item>
              <a-form-item label="劳保穿戴规则：" v-if="cameraType.includes('劳保穿戴')">
                <a-switch v-model:checked="wear" :disabled="type === 'view'" @change="wearSwitch" />
              </a-form-item>
              <a-form-item label="OCR识别规则：" v-if="cameraType.includes('OCR识别')">
                <a-switch v-model:checked="identifyOcr" :disabled="type === 'view'" @change="identifyOcrSwitch" />
              </a-form-item>
              <a-form-item label="报警阈值：" :required="type !== 'view'" v-if="identifyOcr" class="threshold">
                <div
                  class="threshold_div"
                  style="display: flex; justify-content: space-between; margin-top: 28px"
                  v-for="(item, index) in info.thresholdList"
                  :key="index"
                >
                  <span style="line-height: 30px">数值{{ item.areaCode }}</span>
                  <a-form-item
                    label=""
                    name="thresholdMax"
                    style="width: calc(50% - 35px); margin-bottom: 0"
                    :rules="[
                      {
                        required: (item.thresholdMin === '' || !item.thresholdMin) && !item.thresholdMax && type !== 'view',
                        message: '请设置数值范围！',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input-number
                      v-model:value="item.thresholdMax"
                      addon-before="高于"
                      style="width: 100%"
                      :min="0"
                      :precision="1"
                      :controls="false"
                      :disabled="type === 'view'"
                    />
                  </a-form-item>
                  <a-form-item
                    label=""
                    name="thresholdMin"
                    style="width: calc(50% - 35px); margin-bottom: 0"
                    :rules="[
                      {
                        required: (item.thresholdMax === '' || !item.thresholdMax) && !item.thresholdMin && type !== 'view',
                        message: '请设置数值范围！',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <a-input-number
                      v-model:value="item.thresholdMin"
                      addon-before="低于"
                      style="width: 100%"
                      :min="0"
                      :precision="1"
                      :controls="false"
                      :disabled="type === 'view'"
                    />
                  </a-form-item>
                </div>
              </a-form-item>
            </div>
            <div style="width: 49%">
              <div style="color: #1890ff; margin-bottom: 20px"> 报警任务</div>
              <a-form-item label="报警任务：" name="alarmJobSwitch" :required="type !== 'view'">
                <a-switch v-model:checked="info.alarmJobSwitch" :disabled="type === 'view'" />
              </a-form-item>
              <a-form-item
                label="任务通知角色："
                name="jobHandle"
                :rules="[{ required: type !== 'view' && info.alarmJobSwitch, message: '任务通知角色为必填项！' }]"
              >
                <api-select
                  v-model:value="info.jobHandle"
                  mode="multiple"
                  :api="role"
                  label-field="roleName"
                  value-field="roleCode"
                  result-field="records"
                  placeholder="请选择"
                  :disabled="type === 'view'"
                  @change="handleJobHandleChange"
                />
              </a-form-item>
              <a-form-item label="任务验收角色：" name="jobAccepter">
                <api-select
                  v-model:value="info.jobAccepter"
                  mode="multiple"
                  :api="role"
                  label-field="roleName"
                  value-field="roleCode"
                  result-field="records"
                  placeholder="请选择"
                  :disabled="type === 'view'"
                  @change="handleJobAccepterChange"
                />
              </a-form-item>
              <div v-if="!(info.alarmUpList.length === 0 && type === 'view')" style="color: #1890ff; margin-bottom: 20px"> 报警升级</div>
              <div style="text-align: left" v-if="type !== 'view'">
                <a-button v-if="info.alarmUpList.length < 3" style="margin-bottom: 10px" type="primary" @click="addAlarmUpList">添加</a-button>
              </div>
              <div style="border: 1px solid #d9d9d9; padding: 10px; margin-bottom: 25px" v-for="(item, index) in info.alarmUpList" :key="index">
                <a-form-item
                  label="通知渠道："
                  :name="['alarmUpList', index, 'noticeType']"
                  :rules="[{ required: type !== 'view', message: '通知渠道为必填项！' }]"
                >
                  <a-checkbox-group v-model:value="item.noticeType" :options="checkboxOptions" :disabled="type === 'view'" />
                </a-form-item>
                <a-form-item
                  label="报警持续时间："
                  :name="['alarmUpList', index, 'durationTime']"
                  :rules="[{ required: type !== 'view', message: '报警持续时间必填项！' }]"
                >
                  <a-input-number
                    v-model:value="item.durationTime"
                    style="width: 100%"
                    addon-after="分钟"
                    :min="0"
                    :max="999"
                    :precision="0"
                    placeholder="请输入"
                    :disabled="type === 'view'"
                  />
                </a-form-item>
                <a-form-item
                  label="通知角色："
                  :name="['alarmUpList', index, 'noticeRole']"
                  :rules="[{ required: type !== 'view', message: '通知角色为必填项！' }]"
                >
                  <api-select
                    v-model:value="item.noticeRole"
                    mode="multiple"
                    :api="role"
                    label-field="roleName"
                    value-field="roleCode"
                    result-field="records"
                    placeholder="请选择"
                    :disabled="type === 'view'"
                    @change="handlerChange($event, index, 'noticeRoleName', 'alarmUpList')"
                  />
                </a-form-item>
                <div style="text-align: right" v-if="type !== 'view'">
                  <span v-if="info.alarmUpList.length > 0" style="color: red; margin-left: 20px; cursor: pointer" @click="removeAlarmUpList(index)"
                    >删除</span
                  >
                </div>
              </div>
            </div>
          </div>
        </a-form>
      </div>
      <template #footer>
        <div style="text-align: right">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="type !== 'view'" type="primary" @click="confirmClose">提交</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
  <camera-modal @register="cameraRegisterModal" @camera-data="handleCameraData" />
</template>
<script lang="ts" name="config-modal" setup>
  import { ref, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ApiSelect } from '/@/components/Form';
  import { add, edit, role, deiails } from './url/index';
  import { useModal } from '/@/components/Modal';
  import cameraModal from './cameraModal.vue';
  const emit = defineEmits(['success']);
  const [cameraRegisterModal, { openModal }] = useModal();
  const title = ref('');
  const type = ref('add');
  const infoRef = ref();
  const cameraType = ref('');
  const temperature = ref(false);
  const onAndOff = ref(false);
  const flame = ref(false);
  const personnelNum = ref(false);
  const wear = ref(false);
  const identifyOcr = ref(false);
  // 温度个数
  const regionNum = ref(0);
  // OCR个数
  const ocrNum = ref(0);
  const checkboxOptions = [
    { label: '电话', value: '1' },
    { label: '短信', value: '2' },
    { label: 'APP消息', value: '3' },
    { label: 'web', value: '4' },
  ];
  const soundLightAlarmOptions = [];
  const roleArr: any = ref([]);
  const info: any = ref({
    id: '',
    alarmName: '',
    soundLightAlarm: undefined,
    notifierList: [
      {
        notifierRole: undefined,
        notifierRoleName: '',
        noticeType: '',
      },
    ],
    cameraId: '',
    cameraName: '',
    alarmType: '',
    thresholdList: [],
    alarmJob: '',
    alarmJobSwitch: true,
    jobHandle: undefined,
    jobHandleName: '',
    jobAccepter: undefined,
    jobAccepterName: '',
    alarmUpList: [],
  });
  onMounted(() => {
    role().then((res) => {
      if (res && res.records.length > 0) {
        roleArr.value = res.records;
      } else roleArr.value = [];
    });
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    type.value = data.type;
    cameraType.value = '';
    temperature.value = false;
    onAndOff.value = false;
    flame.value = false;
    personnelNum.value = false;
    wear.value = false;
    identifyOcr.value = false;
    await infoRef.value.resetFields();
    info.value = {
      id: '',
      alarmName: '',
      soundLightAlarm: undefined,
      notifierList: [
        {
          notifierRole: undefined,
          notifierRoleName: '',
          noticeType: '',
        },
      ],
      cameraId: '',
      cameraName: '',
      alarmType: '',
      thresholdList: [],
      alarmJob: '',
      alarmJobSwitch: true,
      jobHandle: undefined,
      jobHandleName: '',
      jobAccepter: undefined,
      jobAccepterName: '',
      alarmUpList: [],
    };
    if (type.value !== 'add') {
      cameraType.value = data.data.cameraType;
      deiails(data.data.id).then((res) => {
        info.value = res;
        info.value.alarmJobSwitch = info.value.alarmJob === '0';
        info.value.jobAccepter = info.value.jobAccepter && info.value.length > 0 ? info.value.jobAccepter.split(',') : undefined;
        info.value.jobHandle = info.value.jobHandle && info.value.jobHandle.length > 0 ? info.value.jobHandle.split(',') : undefined;
        currentType(info.value.alarmType);
        info.value.notifierList = info.value.notifierList.map((item) => {
          item.notifierRole = item.notifierRole && item.notifierRole.length > 0 ? item.notifierRole.split(',') : undefined;
          item.noticeType = item.noticeType && item.noticeType !== '' ? item.noticeType.split(',') : '';
          return item;
        });
        info.value.alarmUpList = info.value.alarmUpList.map((item) => {
          item.noticeRole = item.noticeRole.split(',');
          item.noticeType = item.noticeType.split(',');
          return item;
        });
      });
    }
  });
  const handlerChange = (value, index, key, type) => {
    if (value) {
      info.value[type][index][key] = roleArr.value
        .filter((item) => value.includes(item.roleCode))
        .map((item) => item.roleName)
        .join(',');
    }
  };
  const handleJobHandleChange = (_value, data) => {
    if (data) info.value.jobHandleName = data.map((item) => item.label).join(',');
  };
  const handleJobAccepterChange = (_value, data) => {
    if (data) info.value.jobAccepterName = data.map((item) => item.label).join(',');
  };
  const notifierListAdd = (index) => {
    info.value.notifierList.splice(index + 1, 0, {
      notifierRole: undefined,
      notifierRoleName: '',
      noticeType: '',
    });
  };
  const notifierListRemove = (index) => {
    info.value.notifierList.splice(index, 1);
  };
  const openCameraRegisterModal = () => {
    if (type.value !== 'view') openModal(true, { cameraId: info.value.cameraId });
  };
  const handleCameraData = (data) => {
    temperature.value = false;
    onAndOff.value = false;
    flame.value = false;
    personnelNum.value = false;
    wear.value = false;
    identifyOcr.value = false;
    info.value.thresholdList = [];
    info.value.cameraName = data.value[0].cameraName;
    info.value.cameraId = data.value[0].id;
    cameraType.value = data.value[0].cameraType;
    regionNum.value = data.value[0].regionNum;
    ocrNum.value = data.value[0].ocrNum;
    info.value.alarmType = cameraType.value.split(',')[0];
    currentType(cameraType.value.split(',')[0], false);
  };
  const addAlarmUpList = () => {
    info.value.alarmUpList.push({
      noticeType: '',
      durationTime: '',
      noticeRole: undefined,
      noticeRoleName: '',
    });
  };
  const removeAlarmUpList = (index) => {
    info.value.alarmUpList.splice(index, 1);
  };
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    data.alarmJob = data.alarmJobSwitch ? '0' : '1';
    delete data.alarmJobSwitch;
    data.jobAccepter = data.jobAccepter && data.jobAccepter.length > 0 ? data.jobAccepter.join(',') : undefined;
    data.jobHandle = data.jobHandle && data.jobHandle.length > 0 ? data.jobHandle.join(',') : undefined;
    data.notifierList = data.notifierList.map((item) => {
      item.notifierRole = item.notifierRole && item.notifierRole.length > 0 ? item.notifierRole.join(',') : undefined;
      item.noticeType = item.noticeType && item.noticeType !== '' ? item.noticeType.join(',') : '';
      return item;
    });
    data.alarmUpList = data.alarmUpList.map((item) => {
      item.noticeRole = item.noticeRole.join(',');
      item.noticeType = item.noticeType.join(',');
      return item;
    });
    if (type.value === 'add') {
      add(data).then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      });
    } else {
      edit(data).then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      });
    }
  };
  const currentType = (alarmType, is = true) => {
    switch (alarmType) {
      case '温度':
        temperature.value = true;
        if (is) regionNum.value = info.value.thresholdList.length;
        else {
          if (regionNum.value === 0) {
            info.value.thresholdList = [];
          } else {
            info.value.thresholdList = [];
            for (let i = 1; i <= regionNum.value; i++) {
              info.value.thresholdList.push({
                thresholdMax: '',
                thresholdMin: '',
                areaCode: i,
              });
            }
          }
        }
        break;
      case '屏幕亮灭':
        onAndOff.value = true;
        break;
      case '火焰':
        flame.value = true;
        break;
      case '人员数量':
        personnelNum.value = true;
        if (!is) {
          info.value.thresholdList.push({
            thresholdMax: '',
            thresholdMin: '',
            areaCode: 1,
          });
        }
        break;
      case '劳保穿戴':
        wear.value = true;
        break;
      case 'OCR识别':
        identifyOcr.value = true;
        if (is) ocrNum.value = info.value.thresholdList.length;
        else {
          if (ocrNum.value === 0) {
            info.value.thresholdList = [];
          } else {
            info.value.thresholdList = [];
            for (let i = 1; i <= ocrNum.value; i++) {
              info.value.thresholdList.push({
                thresholdMax: '',
                thresholdMin: '',
                areaCode: i,
              });
            }
          }
        }
        break;
    }
  };
  const temperatureSwitch = (checked) => {
    if (checked) {
      info.value.alarmType = '温度';
      onAndOff.value = false;
      flame.value = false;
      personnelNum.value = false;
      wear.value = false;
      identifyOcr.value = false;
      if (regionNum.value === 0) {
        info.value.thresholdList = [];
      } else {
        info.value.thresholdList = [];
        for (let i = 1; i <= regionNum.value; i++) {
          info.value.thresholdList.push({
            thresholdMax: '',
            thresholdMin: '',
            areaCode: i,
          });
        }
      }
    }
  };
  const onAndOffSwitch = (checked) => {
    if (checked) {
      info.value.alarmType = '屏幕亮灭';
      temperature.value = false;
      flame.value = false;
      personnelNum.value = false;
      wear.value = false;
      identifyOcr.value = false;
    }
  };
  const flameSwitch = (checked) => {
    if (checked) {
      info.value.alarmType = '火焰';
      onAndOff.value = false;
      temperature.value = false;
      personnelNum.value = false;
      wear.value = false;
      identifyOcr.value = false;
    }
  };
  const personnelNumSwitch = (checked) => {
    if (checked) {
      info.value.alarmType = '人员数量';
      onAndOff.value = false;
      flame.value = false;
      temperature.value = false;
      wear.value = false;
      identifyOcr.value = false;
      info.value.thresholdList.push({
        thresholdMax: '',
        thresholdMin: '',
        areaCode: 1,
      });
    }
  };
  const wearSwitch = (checked) => {
    if (checked) {
      info.value.alarmType = '劳保穿戴';
      onAndOff.value = false;
      flame.value = false;
      personnelNum.value = false;
      temperature.value = false;
      identifyOcr.value = false;
    }
  };
  const identifyOcrSwitch = (checked) => {
    if (checked) {
      info.value.alarmType = 'OCR识别';
      onAndOff.value = false;
      flame.value = false;
      personnelNum.value = false;
      wear.value = false;
      temperature.value = false;
      if (ocrNum.value === 0) {
        info.value.thresholdList = [];
      } else {
        info.value.thresholdList = [];
        for (let i = 1; i <= ocrNum.value; i++) {
          info.value.thresholdList.push({
            thresholdMax: '',
            thresholdMin: '',
            areaCode: i,
          });
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  .threshold {
    .threshold_div:last-child {
      margin-bottom: 0 !important;
    }
  }
</style>
