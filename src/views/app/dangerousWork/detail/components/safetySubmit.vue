<template>
  <van-form :colon="true" style="background-color: #ffffff" ref="formRef">
    <van-field
      readonly
      v-model="formData.workLocation"
      name="workGrade"
      label="作业地点"
    >
     <template #input>
       {{ formData.workLocation }}
      </template>
    </van-field>
    <van-field
      readonly
      :maxlength="300"
      name="workGrade"
      label="作业时间"
    >
      <template #input>
        <div>{{ formData.startTimeStr }} - {{ formData.endTimeStr }}</div>
      </template>
    </van-field>
    <van-field
      readonly
      label="作业内容"
    >
      <template #input>
        {{ formData.workContent }}
      </template>
    </van-field>
    <van-field
      readonly
      label="作业类别"
    >
      <template #input>
        {{ getWorkName() }}
      </template>
    </van-field>
    <van-field
      v-model="formData.safetyDisclosureContent.identifyUnit"
      name="identifyUnit"
      label="辨识单位"
      placeholder="请选择"
      readonly
      input-align="left"
    >
      <template #input>
        <a-tree-select
          style="width: 100%"
          :dropdownStyle="{ zIndex: 3000}"
          v-model:value="formData.safetyDisclosureContent.identifyUnit"
          placeholder="请选择"
          :tree-data="applicationUnitList"
          showSearch
          disabled
          tree-node-filter-prop="title"
          :field-names="{ label: 'title', value: 'key', children: 'children' }"
        />
      </template>
    </van-field>
    <van-field
      v-model="formData.safetyDisclosureContent.identifyPersonName"
      name="identifyPersonName"
      label="辨识人"
      placeholder="请选择"
      readonly
      :rules="[{ required: true, message: '请选择作业负责人！' }]"
    />

    <van-field
      v-model="formData.sceneHeadName"
      label="交底人"
    >
     <template #input>
       {{ formData.sceneHeadName }}
      </template>
    </van-field>
    <van-field
      v-model="formData.disclosureTime"
      label="交底时间"
    >
     <template #input>
       {{ formData.disclosureTime }}
      </template>
    </van-field>

    <van-field
      v-model="formData.sceneHeadName"
      label="作业负责人"
    >
     <template #input>
       {{ formData.sceneHeadName }}
      </template>
    </van-field>

    <van-field
      v-model="formData.workUnitGuardianName"
      label="监护人"
    >
     <template #input>
       {{ formData.workUnitGuardianName }}
      </template>
    </van-field>
    <van-field
      label="基本要求"
    >
     <template #input>
       作业前，属地单位车间负责人应对作业人员进行安全交底和风险告知内容包括作业及作业环境、作业风险、防范指施(工艺、设备、个体防护等)应急措施及其他注意事项。作业人员应按照风险告知内容，逐条对接确认，落实到位后方可作业。
      </template>
    </van-field>
    <van-field label="上传附件">
      <template #input>
        <JUpload  ref="uploadRef" :disabled="readonly" :maxCount="1" v-model:value="formData.safetyDisclosureContent.annexUrl" text="上传附件"  />
      </template>
    </van-field>
    <van-collapse v-model="activeNames">
      <van-collapse-item title="安全交底" name="1">
        <van-field
          type="textarea"
          :maxlength="100"
          label-align="top"
          v-model="formData.safetyDisclosureContent.tool"
          name="tool"
          label="使用主要设备工具"
          placeholder="请选择"
          readonly
        />
        <van-field
          type="textarea"
          :maxlength="100"
          label-align="top"
          v-model="formData.safetyDisclosureContent.damageType"
          name="damageType"
          label="可能导致的伤害类型及存在主要风险"
          placeholder="请选择"
          readonly
        />
        <!-- <van-field
          readonly
          type="textarea"
          :maxlength="100"
          label-align="top"
          v-model="formData.safetyDisclosureContent.risk"
          name="risk"
          label="存在主要风险"
          placeholder="请选择"
        /> -->
        <van-field
          readonly
          autosize
          type="textarea"
          :maxlength="800"
          label-align="top"
          v-model="formData.safetyDisclosureContent.measure"
          name="measure"
          label="防范措施"
          placeholder="请选择"
        />
        <van-field
          readonly
          autosize
          type="textarea"
          :maxlength="500"
          label-align="top"
          v-model="formData.safetyDisclosureContent.emergencyMeasure"
          name="emergencyMeasure"
          label="应急措施"
          placeholder="请选择"
        />
        <van-field
          readonly
          autosize
          type="textarea"
          :maxlength="200"
          label-align="top"
          v-model="formData.safetyDisclosureContent.other"
          name="other"
          label="其他注意事项"
          placeholder="请选择"
        />
      </van-collapse-item>
    </van-collapse>
    <van-field
      readonly
      label-align="top"
      v-model="formData.safetyDisclosureContent.identifyNumber"
      name="identifyNumber"
      label="风险辨识情况及管控落实情况小结"
    >
     <template #input>
        <div style="display: flex; flex-wrap: wrap;">
          已开展全面风险辨识，共辨识作业风险 {{ formData.safetyDisclosureContent.identifyNumber }} 项；管控据施已全部落实。
        </div>
      </template>
    </van-field>
    <van-field
      v-model="formData.safetyDisclosureContent.identifyStartTime"
      name="startTime"
      label="辨识时间"
      label-align="top"
      placeholder="请选择"
      readonly
    >
      <template #input>
        <van-field
          input-align="center"
          :border="false"
          v-model="formData.safetyDisclosureContent.identifyStartTime"
          name="identifyStartTime"
          label-align="top"
          placeholder="开始时间"
          readonly
          style="padding: 10px 0"
        />
        至
        <van-field
          input-align="center"
          :border="false"
          v-model="formData.safetyDisclosureContent.identifyEndTime"
          name="identifyEndTime"
          label-align="top"
          placeholder="结束时间"
          readonly
          style="padding: 10px 0"
        />
      </template>
    </van-field>
    <van-field
      label-align="top"
      label="风险及管控措施告知（被交底人签字）"
    >
     <template #input>
       我已熟知此次作业存在的安全风险及管控指施，将严格道章作业，确保安全。
      </template>
    </van-field>
  </van-form>
</template>

<script lang="ts" setup>
  import { ref, toRefs } from 'vue';
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
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
  const formRef = ref(null);
  const { formData, readonly } = toRefs(props);
  const jiaodiFormState = ref<any>({
    workLocation: '',
    workContent: '',
    workType: '',
    startTimeStr: '',
    endTimeStr: '',
    identifyUnit: userStore.getUserInfo.orgCode, // 辨识单位
    identifyPerson: '', // 辨识人
    sceneHead: '', // 作业负责人 交底人
    disclosureTime: '', // 交底时间
    workUnitGuardian: '', // 监护人
    tool: '', // 工具
    damageType: '', // 可能导致的伤害类型
    risk: '', // 存在主要风险
    measures: '', // 防范措施
    emergencyMeasure: '', // 应急措施
    other: '', // 其他注意事项
    identifyStartTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    identifyEndTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  })

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
  
  const init = async () => {
    const { applicationUnitList: list } = await useDepartList();
    applicationUnitList.value = list.value;
  }
  init();

  const getData = async () => {
    await formRef.value?.validate();
    return formData.value;
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
    getData,
  });
</script>

<style lang="less" scoped>
  .tit{
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #1989fa;
  }
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
</style>
