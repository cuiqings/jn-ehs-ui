<template>
  <van-form :colon="true" style="padding-bottom: 250px; background-color: #ffffff" ref="formRef">
    <van-field required :readonly="readonly" v-model="formData.workLocation" name="workGrade" label="作业地点">
      <template #input>
        {{ formData.workLocation }}
      </template>
    </van-field>
    <van-field required :readonly="readonly" :maxlength="300" name="workGrade" label="作业时间">
      <template #input>
        <div>{{ formData.startTimeStr }} - {{ formData.endTimeStr }}</div>
      </template>
    </van-field>
    <van-field required :readonly="readonly" label="作业内容">
      <template #input>
        {{ formData.workContent }}
      </template>
    </van-field>
    <van-field required :readonly="readonly" label="作业类别">
      <template #input>
        {{ getWorkName() }}
      </template>
    </van-field>
    <van-field
      v-model="jiaodiFormState.identifyUnit"
      required
      name="identifyUnit"
      label="辨识单位"
      placeholder="请选择"
      readonly
      is-link
      input-align="left"
      :rules="[{ required: true, message: '请选择作业车间！' }]"
    >
      <template #input>
        <a-tree-select
          style="width: 100%"
          :dropdownStyle="{ zIndex: 3000 }"
          v-model:value="jiaodiFormState.identifyUnit"
          placeholder="请选择"
          :tree-data="applicationUnitList"
          showSearch
          tree-node-filter-prop="title"
          :field-names="{ label: 'title', value: 'key', children: 'children' }"
        />
      </template>
    </van-field>
    <van-field
      required
      v-model="jiaodiFormState.identifyPersonName"
      name="identifyPersonName"
      label="辨识人"
      placeholder="请选择"
      readonly
      @click="curPersonShow = true"
      :rules="[{ required: true, message: '请选择作业负责人！' }]"
    />

    <van-field required v-model="formData.sceneHeadName" label="交底人">
      <template #input>
        {{ formData.sceneHeadName }}
      </template>
    </van-field>
    <van-field required v-model="formData.disclosureTime" label="交底时间">
      <template #input>
        {{ formData.disclosureTime }}
      </template>
    </van-field>

    <van-field required v-model="formData.sceneHeadName" label="作业负责人">
      <template #input>
        {{ formData.sceneHeadName }}
      </template>
    </van-field>

    <van-field required v-model="formData.workUnitGuardianName" label="监护人">
      <template #input>
        {{ formData.workUnitGuardianName }}
      </template>
    </van-field>
    <van-field label="基本要求">
      <template #input>
        作业前，属地单位车间负责人应对作业人员进行安全交底和风险告知内容包括作业及作业环境、作业风险、防范指施(工艺、设备、个体防护等)应急措施及其他注意事项。作业人员应按照风险告知内容，逐条对接确认，落实到位后方可作业。
      </template>
    </van-field>
    <van-field label="上传附件">
      <template #input>
        <JUpload  ref="uploadRef" :maxCount="1" v-model:value="jiaodiFormState.annexUrl" text="上传附件"  />
      </template>
    </van-field>
    <van-collapse v-model="activeNames">
      <van-collapse-item title="安全交底内容" name="1">
        <van-field
          type="textarea"
          :maxlength="200"
          label-align="top"
          v-model="jiaodiFormState.tool"
          name="tool"
          label="使用主要设备工具"
          placeholder="请选择"
        />
        <van-field
          required
          autosize
          type="textarea"
          :maxlength="200"
          label-align="top"
          v-model="jiaodiFormState.damageType"
          name="damageType"
          label="可能导致的伤害类型及存在主要风险"
          placeholder="请选择"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          required
          autosize
          type="textarea"
          :maxlength="500"
          label-align="top"
          v-model="jiaodiFormState.measure"
          name="measure"
          label="防范措施"
          placeholder="请选择"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          required
          autosize
          type="textarea"
          :maxlength="300"
          label-align="top"
          v-model="jiaodiFormState.emergencyMeasure"
          name="emergencyMeasure"
          label="应急措施"
          placeholder="请选择"
          :rules="[{ required: true, message: '请输入' }]"
        />
        <van-field
          autosize
          type="textarea"
          :maxlength="200"
          label-align="top"
          v-model="jiaodiFormState.other"
          name="other"
          label="其他注意事项"
          placeholder="请选择"
        />
      </van-collapse-item>
    </van-collapse>
    <van-field
      required
      label-align="top"
      v-model="jiaodiFormState.identifyNumber"
      name="identifyNumber"
      :rules="[{ required: true, message: '请输入' }]"
      label="风险辨识情况及管控落实情况小结"
    >
      <template #input>
        <div style="font-size: 12px">
          已开展全面风险辨识，共辨识作业风险
          <input class="cur-input" type="text" v-model="jiaodiFormState.identifyNumber" placeholder="请输入" />项；管控据施已全部落实。
        </div>
      </template>
    </van-field>
    <van-field required name="startTime" label="辨识时间" label-align="top" placeholder="请选择" readonly>
      <template #input>
        <van-field
          input-align="center"
          :border="false"
          v-model="jiaodiFormState.identifyStartTime"
          name="identifyStartTime"
          label-align="top"
          placeholder="开始时间"
          readonly
          style="padding: 10px 0"
          @click="startTimeShow = true"
          :rules="[{ required: true, message: '请选择' }]"
        />
        至
        <van-field
          input-align="center"
          :border="false"
          v-model="jiaodiFormState.identifyEndTime"
          name="identifyEndTime"
          label-align="top"
          placeholder="结束时间"
          readonly
          style="padding: 10px 0"
          @click="endTimeShow = true"
          :rules="[{ required: true, message: '请选择' }]"
        />
      </template>
    </van-field>
    <!-- 开始时间 -->
    <DateTimePicker
      :minDate="new Date()"
      :values="jiaodiFormState.identifyStartTime"
      @changeValue="startTimeShow = false"
      :showPicker="startTimeShow"
      @confirm="onConfirm($event, 'startTime')"
    />
    <!-- 结束时间 -->
    <DateTimePicker
      :minDate="jiaodiFormState.identifyStartTime ? new Date(jiaodiFormState.identifyStartTime) : new Date()"
      :values="formData.identifyEndTime"
      @changeValue="endTimeShow = false"
      :showPicker="endTimeShow"
      @confirm="onConfirm($event, 'endTime')"
    />
    <van-field label-align="top" label="风险及管控措施告知（被交底人签字）">
      <template #input> 我已熟知此次作业存在的安全风险及管控指施，将严格道章作业，确保安全。 </template>
    </van-field>
  </van-form>
  <allPerson
    :value="jiaodiFormState.identifyPerson"
    :isRadio="true"
    :not-tree="true"
    value-key="id"
    title-key="realname"
    v-model:show="curPersonShow"
    @change="onConfirmPerson"
  />
</template>

<script lang="ts" setup>
  import { ref, toRefs, computed } from 'vue';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
  import { getWorkSecurityMeasuresByType } from '/@/views/hazardousOperation/api';
  import DateTimePicker from '../../../components/appDateTimePicker.vue';
  import allPerson from '../../ask/components/allPerson.vue';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';
import { FormInstance } from 'vant';
  const userStore = useUserStore();
  const props = defineProps({
    formData: {
      type: Object,
      default: () => ({}),
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
  const formRef = ref<FormInstance|null>(null);
  const { formData, readonly } = toRefs(props);
  const jiaodiFormState = ref<any>({
    workLocation: '',
    workContent: '',
    workType: '',
    startTimeStr: '',
    endTimeStr: '',
    identifyUnit: userStore.getUserInfo.orgCode, // 辨识单位
    identifyPerson: userStore.getUserInfo.id, // 辨识人
    identifyPersonName: userStore.getUserInfo.realname,
    sceneHead: '', // 作业负责人 交底人
    disclosureTime: '', // 交底时间
    workUnitGuardian: '', // 监护人
    tool: '', // 工具
    damageType: '', // 可能导致的伤害类型
    risk: '', // 存在主要风险
    measure: '', // 防范措施
    emergencyMeasure: '', // 应急措施
    other: '', // 其他注意事项
    identifyStartTime: '', //dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    identifyEndTime: '', //dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  });

  const emergencyMeasures = {
    1: '发生中毒或窒息等事故时，监护人员禁止盲目进入，立即上报领导，并拨打急救电话 19933178120，效援时，戴好空气呼吸器，迅速将人员转移到空气流通的地方，进行心肺复苏急救。',
    2: '发生事故现场人员立即撤离危险区，立即采取可靠措施，在保证抢救人员安全的前提下，迅速将患者救出危险区域，判断受害者的受害程度，对存在外伤流血或骨折的进行应急止血包扎及固定，发生事故尽快通知用人单位作业负责人并拨打急救电话:19933178120。',
    3: '发生触电或者灼伤现场人员大声呼叫，并拨打安全环保部门电话19933178120，再迅速查看人员受伤情况，首先确保呼吸顺畅，不能随意搬动伤者，等待救援',
  };

  formData.value.disclosureTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
  const applicationUnitList = ref<any[]>([]);
  const curPersonShow = ref(false);
  const activeNames = ref(['1']);
  const startTimeShow = ref(false);
  const endTimeShow = ref(false);
  const onConfirmPerson = async (e) => {
    jiaodiFormState.value.identifyPersonName = e.names;
    jiaodiFormState.value.identifyPerson = e.ids;
  };
  const onConfirm = (e, type) => {
    if (type === 'startTime') {
      jiaodiFormState.value.startTime = e;
      jiaodiFormState.value.identifyStartTime = dayjs(e).format('YYYY-MM-DD HH:mm:ss');
    } else if (type === 'endTime') {
      jiaodiFormState.value.endTime = e;
      jiaodiFormState.value.identifyEndTime = dayjs(e).format('YYYY-MM-DD HH:mm:ss');
    }
  };

  const init = async (data) => {
    const { applicationUnitList: list } = await useDepartList();
    applicationUnitList.value = list.value;
    let res = await getWorkSecurityMeasuresByType({ workType: data.workType });
    formData.value.hazardFactors = data.possibleDanger.toString();
    Object.keys(jiaodiFormState.value).forEach((key) => {
      if (data[key]) {
        jiaodiFormState.value[key] = data[key];
      }
    });
    jiaodiFormState.value.damageType = data.possibleDanger;
    let measures: string[] = [];
    res.forEach((item) => {
      if (data.securityMeasuresIds.includes(item.sort)) {
        measures.push(item.sort + '、' + item.name);
      }
    });

    jiaodiFormState.value.measure = jiaodiFormState.value.measure.substring(0, jiaodiFormState.value.measure.length - 1);
    if (data.otherSecurityMeasures) measures.push('其他安全措施：、' + data.otherSecurityMeasures);
    if (data.otherWorkApply && data.otherWorkApply.length > 0) {
      jiaodiFormState.value.measure = jiaodiFormState.value.measure + '\n';
      data.otherWorkApply.forEach(async (item) => {
        jiaodiFormState.value.damageType += ',' + item.possibleDanger;
        let res = await getWorkSecurityMeasuresByType({ workType: item.workType });
        res.forEach((citem) => {
          if (item.securityMeasuresIds.includes(citem.sort)) {
            measures.push(citem.sort + '、' + citem.name);
          }
        });
        jiaodiFormState.value.measure = [...new Set(measures)].join('\n');
      });
      // 风险辨识拼接去重
      jiaodiFormState.value.damageType = [...new Set(jiaodiFormState.value.damageType.split(',').filter((i) => !!i))].join(',');
      jiaodiFormState.value.risk = jiaodiFormState.value.damageType;
    } else {
      jiaodiFormState.value.measure = [...new Set(measures)].join('\n');
      jiaodiFormState.value.damageType = jiaodiFormState.value.damageType.filter((i) => !!i).join(',');
    }

    if (emergencyMeasures[data.workType]) jiaodiFormState.value.emergencyMeasure = emergencyMeasures[data.workType];
    if (data.otherWorkApply) {
      if (jiaodiFormState.value.emergencyMeasure) {
        jiaodiFormState.value.emergencyMeasure += ';\n';
      }
      jiaodiFormState.value.emergencyMeasure += data.otherWorkApply.map((item) => {
        let str = emergencyMeasures[item.workType] ? emergencyMeasures[item.workType] : '';
        return str + ';\n';
      });
    }
  };

  const getData = async () => {
    return jiaodiFormState.value;
  };
  const validate = async () => {
    return formRef.value?.validate();
  };

  const getWorkName = () => {
    let name = '';
    userStore.getAllDictItems.work_type.forEach((item) => {
      if (item.value == props.formData.workType) {
        name += item.label + ',';
      }
      if (props.formData.otherWorkApply && props.formData.otherWorkApply.length > 0) {
        props.formData.otherWorkApply.forEach((citem) => {
          if (item.value == citem.workType) {
            name += item.label + ',';
          }
        });
      }
    });
    return name.substring(0, name.length - 1);
  };

  defineExpose({
    init,
    getData,
    validate
  });
</script>

<style lang="less">
  .list {
    padding-left: 16px;
    span {
      display: block;
      margin-top: 10px;
    }
    div {
      line-height: 30px;
      padding-right: 16px;
    }
    div:last-child {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }
  }
  .labelclass {
    align-items: center;
  }
  .sign-wrap {
    width: 100px;
  }
  .cur-input {
    width: 50px;
    display: inline-block;
    border-bottom: 1px solid #dcdfe6;
    text-align: center;
  }
</style>
