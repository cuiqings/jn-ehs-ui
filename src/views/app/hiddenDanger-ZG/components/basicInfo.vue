<template>
  <van-field
    disabled
    v-model="formData.departName"
    v-if="route.name != 'AppHiddenDangerEdit' && route.name != 'AppHiddenDangerDetail'"
    name="departName"
    label="隐患来源"
  >
    <template #input>
      {{ filterDictTextByCache('sk_yh_source', formData.sourceType) }}
    </template>
  </van-field>
  <!-- <template v-if="formData.sourceType == 1 || (formData.confirm && formData.confirm.sourceType == 1)">
    <van-field readonly v-model="formData.plan.planName" name="planName" label="巡检计划" placeholder="巡检计划" />
    <van-field readonly v-model="formData.itemName" name="itemName" label="检查项" placeholder="检查项">
      <template #input>
        <div>
        {{ filterDictTextByCache('check_sort', formData.itemType) }}<span v-if="formData.itemName">></span>
              {{ formData.itemName }}
        </div>
      </template>
    </van-field>
  </template> -->

  <van-field
    :disabled="readonly && !canSubmit"
    v-model="formData.yhDescription"
    name="yhDescription"
    autosize
    type="textarea"
    label=" 隐患描述"
    placeholder=" 隐患描述"
  />

  <van-field autosize label-align="top" name="yhPicture" label="隐患照片">
    <template #input>
      <AppUpload v-if="canSubmit" :watermarkText="watermarkText" v-model:fileList="formData.yhPictureo" />
      <div class="img-wrap" v-else>
        <van-image
          v-for="(item, index) in formData.yhPicture"
          @click.stop="preview(index, formData.yhPicture)"
          :key="index"
          width="100"
          height="100"
          :src="item"
        />
      </div>
    </template>
  </van-field>

  <van-field :disabled="readonly" v-model="formData.orgName" name="yhPlaceName" label="所属单位" placeholder="所属单位" />
  <van-field :disabled="readonly" v-model="formData.departName" name="departName" label="所属车间" placeholder="所属车间" />
  <van-field :disabled="readonly" v-if="formData.team" v-model="formData.teamName" name="teamName" label="所属班组" placeholder="所属班组" />
  <van-field
    :disabled="readonly"
    v-if="formData.departDutyPersonName"
    v-model="formData.departDutyPersonName"
    name="departDutyPersonName"
    label="车间责任人"
  />
  <van-field
    :disabled="readonly"
    v-if="formData.teamDutyPersonName"
    v-model="formData.teamDutyPersonName"
    name="teamDutyPersonName"
    label="班组责任人"
  />

  <van-field
    required
    :disabled="readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2)"
    v-model="formData.yhLevel"
    name="yhLevel"
    label="隐患等级"
    @click="yhLevelClick"
  >
    <template #input>
      <span :class="{ gary: readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) }">{{
        formData.yhLevelLabel ? formData.yhLevelLabel : formData.yhLevel == 1 ? '一般' : formData.yhLevel == 2 ? '重大' : ''
      }}</span>
    </template>
  </van-field>
  <van-field :disabled="readonly" v-model="formData.checkTime" name="checkTime" label="检查时间" placeholder="检查时间" />
  <van-field :disabled="readonly" v-model="formData.checkPersonName" name="checkPersonName" label="检查人" placeholder="检查人" />
  <van-form ref="basicFormRef">
    <van-field
      required
      v-if="!canHandle && formData.yhType"
      :disabled="readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2)"
      v-model="formData.yhType"
      name="sk_yh_type"
      :rules="[{ required: true, message: '请选择' }]"
      label="隐患分类"
    >
      <template #input>
        <span :class="{ gary: readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) }">
          {{ formData.yhTypeLabel ? formData.yhTypeLabel : formData.yhType ? filterDictTextByCache('sk_yh_type', formData.yhType) : '请选择' }}
        </span>
      </template>
    </van-field>
    <van-field
      required
      v-if="canHandle"
      :disabled="readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2)"
      v-model="formData.yhType"
      @click="yhTypeClick"
      name="sk_yh_type"
      :rules="[{ required: true, message: '请选择' }]"
      label="隐患分类"
    >
      <template #input>
        <span :class="{ gary: readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) }">
          {{ formData.yhTypeLabel ? formData.yhTypeLabel : formData.yhType ? filterDictTextByCache('sk_yh_type', formData.yhType) : '请选择' }}
        </span>
      </template>
    </van-field>
    <van-popup v-model:show="showyhType" position="bottom">
      <van-picker :columns="sk_yh_type" @confirm="onConfirm($event, 'showyhType', 'yhType')" @cancel="showyhType = false" />
    </van-popup>

    <van-field
      required
      v-if="!canHandle && formData.yhTypeSub"
      :disabled="readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2)"
      v-model="formData.yhTypeSub"
      name="yhTypeSub"
      :rules="[{ required: true, message: '请选择' }]"
      label="子类"
      placeholder="子类"
    >
      <template #input>
        <span :class="{ gary: readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) }">
          {{
            formData.yhTypeSubLabel
              ? formData.yhTypeSubLabel
              : formData.yhTypeSub
              ? filterDictTextByCache('sk_yh_type_sub', formData.yhTypeSub)
              : '请选择'
          }}
        </span>
      </template>
    </van-field>
    <van-field
      required
      v-if="canHandle"
      :disabled="readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2)"
      v-model="formData.yhTypeSub"
      @click="yhTypeSubClick"
      name="yhTypeSub"
      :rules="[{ required: true, message: '请选择' }]"
      label="子类"
      placeholder="子类"
    >
      <template #input>
        <span :class="{ gary: readonly && !(formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) }">
          {{
            formData.yhTypeSubLabel
              ? formData.yhTypeSubLabel
              : formData.yhTypeSub
              ? filterDictTextByCache('sk_yh_type_sub', formData.yhTypeSub)
              : '请选择'
          }}
        </span>
      </template>
    </van-field>
  </van-form>

  <van-popup v-model:show="showyhTypeSub" position="bottom">
    <van-picker :columns="sk_yh_type_1" @confirm="onConfirm($event, 'showyhTypeSub', 'yhTypeSub')" @cancel="showyhTypeSub = false" />
  </van-popup>

  <van-field :disabled="readonly" v-model="formData.riskId" name="riskId" label="风险ID" />
  <van-field :disabled="readonly" v-model="formData.remark" name="remark" label="备注" />
  <van-field :disabled="readonly" v-model="formData.repairRequire" name="repairRequire" label="整改要求" placeholder="整改要求">
    <template #input>
      <span class="gary">
        {{ formData.repairRequire == 1 ? '现场整改' : '限期整改' }}
      </span>
    </template>
  </van-field>
  <van-field :disabled="readonly" v-if="formData.repairPersonName" v-model="formData.repairPersonName" label="整改人"></van-field>
  <van-field :disabled="readonly" v-model="formData.repairTimeLimit" name="repairTimeLimit" label="整改期限" placeholder="整改期限" />
  <van-field
    label-width="100"
    readonly
    :disabled="readonly"
    label-align="top"
    v-if="formData.repairRequire == 2"
    type="textarea"
    v-model="formData.sugRepairMsr"
    name="sugRepairMsr"
    label="建议整改措施"
  />
  <van-field class="myfield" label-align="top" v-if="formData.repairRequire == 1" name="repairPicture" label="整改后照片">
    <template #input>
      <div class="img-wrap">
        <van-image
          v-for="(item, index) in formData.repairPicture"
          @click.stop="preview(index, formData.repairPicture)"
          :key="index"
          width="100"
          height="100"
          :src="item"
        />
      </div>
    </template>
  </van-field>
  <van-popup v-model:show="showYhLevel" position="bottom">
    <van-picker
      v-model="formData.newYhLevel"
      :columns="yh_hidden_levelList"
      @confirm="onConfirm($event, 'showYhLevel', 'yhLevel')"
      @cancel="showYhLevel = false"
    />
  </van-popup>
</template>

<script lang="ts" setup>
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { showImagePreview } from 'vant';
  import { useRoute } from 'vue-router';
  import { computed, ref, watchEffect } from 'vue';
  const route = useRoute();
  const userStore: any = useUserStore();
  const props = withDefaults(
    defineProps<{
      readonly?: boolean;
      formData: any;
    }>(),
    {
      formData: () => {},
      readonly: false,
    }
  );

  const { formData, readonly } = props;
  const canHandle = computed(() => route.query.canHandle == 'true');
  const canSubmit = ref(false);
  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );

  watchEffect(() => {
    if (formData.flowType == '2' && formData.currentNode == '21' && route.query.canHandle == 'true') {
      canSubmit.value = true;
    }
    if (formData.flowType == '2' && formData.currentNode == '22') {
      formData.newYhLevel = [formData.yhLevel];
    }
    // if(!Array.isArray(formData.yhPicture)) {
    //   formData.yhPicture = [formData.yhPicture];
    // }
  });

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
  const basicFormRef = ref(null);
  const getFormData = async () => {
    await basicFormRef.value.validate();
    if (canSubmit.value) {
      return {
        yhDescription: formData.yhDescription,
        yhPicture: formData.yhPictureo,
      };
    }
    if (formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) {
      return {
        yhLevel: formData.yhLevelNew || formData.yhLevel,
        yhType: formData.yhType,
        yhTypeSub: formData.yhTypeSub,
      };
    }
    return null;
  };

  const yh_hidden_levelList = [
    { text: '一般', value: '1' },
    { text: '重大', value: '2' },
  ];
  const showYhLevel = ref(false);
  const yhLevelClick = () => {
    if(!canHandle.value) return;
    if (formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) {
      showYhLevel.value = true;
    }
  };

  const showyhType = ref(false);
  const showyhTypeSub = ref(false);
  const sk_yh_type = userStore.getAllDictItems.sk_yh_type;
  const sk_yh_type_1 = ref(userStore.getAllDictItems.sk_yh_type_sub);

  const yhTypeClick = () => {
    if (formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) {
      showyhType.value = true;
    }
  };

  const yhTypeSubClick = () => {
    if (formData.flowType == 2 && formData.currentNode == 22 && formData.yhLevel == 2) {
      showyhTypeSub.value = true;
    }
  };

  const onConfirm = (value, show, key) => {
    switch (key) {
      case 'yhLevel':
        formData.yhLevelNew = value.selectedValues[0];
        formData.yhLevelLabel = value.selectedOptions[0].text;
        showYhLevel.value = false;
        break;
      case 'yhType':
        formData.yhType = value.selectedValues[0];
        formData.yhTypeLabel = value.selectedOptions[0].text;
        showyhType.value = false;
        // sk_yh_type_1.value = userStore.getAllDictItems[formData.yhType];
        break;
      case 'yhTypeSub':
        formData.yhTypeSub = value.selectedValues[0];
        formData.yhTypeSubLabel = value.selectedOptions[0].text;
        showyhTypeSub.value = false;
        break;
    }
  };

  defineExpose({
    getFormData,
  });
</script>

<style lang="less">
  .myfield {
    .van-field__value {
      max-width: 100%;
    }
  }
  .img-wrap {
    width: auto;
    height: auto;
    // display: flex;
    // overflow-y: hidden;
    // overflow-x: scroll;
    // padding-bottom: 20px;
    // box-sizing: content-box;
    .van-image {
      flex-shrink: 0;
      width: 100px;
      margin: 0px 5px;
    }
  }
  .gary {
    color: #9a9b9b;
  }
  .gary-text {
    color: #9a9b9b !important;
  }
  * {
    --van-field-input-disabled-text-color: #9a9b9b;
    --van-field-disabled-text-color: #9a9b9b;
  }
  .van-field--disabled .van-field__label {
    color: #323233 !important;
  }
  .van-field--disabled .van-field__control {
    color: #9a9b9b !important;
  }
</style>
