<!-- 确认信息回显 -->
<template>
  <van-field name="handleResult" label="隐患确认">
    <template #input>
      {{ { 0: '未确认', 1: '非隐患', 2: '确认隐患' }[formData.confirm.handleResult] }}
    </template>
  </van-field>
  <!-- 非隐患 -->
  <van-field name="ifRepair" label="整改情况" v-if="formData.confirm.handleResult == 1">
    <template #input>
      {{ { 1: '整改完成', 2: '继续整改' }[formData.confirm.ifRepair] }}
    </template>
  </van-field>
  <div v-show="formData.confirm.ifRepair == '1'">
    <van-field
      v-model="formData.confirm.handleExplain"
      name="handleExplain"
      autosize
      type="textarea"
      label=" 处理说明"
      placeholder="请填写处理说明"
    />
    <van-field class="myfield" label-align="top" name="repairPicture" label=" ">
      <template #input>
        <div class="img-wrap">
          <van-image
            v-for="(item, index) in formData.confirm.handlePicture"
            @click.stop="preview(index, formData.confirm.handlePicture)"
            :key="index"
            width="100"
            height="100"
            :src="item"
          />
        </div>
      </template>
    </van-field>
  </div>
  <div v-show="formData.confirm.ifRepair == '2'">
    <van-field v-model="formData.confirm.repairDate" readonly name="repairDate" label="限定整改日期" />
    <van-field v-model="formData.confirm.dutyDeptName" readonly name="dutyDeptName" label="责任部门" />
    <van-field v-model="formData.confirm.dutyPeopleName" readonly name="dutyPeopleName" label="责任人" />
    <van-field v-model="formData.confirm.handler" readonly name="handler" label="处理人" />
    <van-field v-model="formData.confirm.handleTime" readonly name="handleTime" label="处理时间" />
  </div>

  <!-- 确认隐患 -->
  <template v-if="formData.confirm.handleResult == 2">
    <van-field v-model="formData.confirm.yhLevelLabel" readonly name="yhLevel" label="隐患等级" />
    <van-field v-model="formData.confirm.checkHierarchy" readonly name="checkHierarchy" label="检查层级" />

    <van-field v-model="formData.confirm.yhTypeLabel" readonly name="yhTypeLabel" label="隐患类型" />

    <van-field v-model="formData.confirm.handleMeansLabel" readonly name="handleMeansLabel" label="防控手段" />

    <van-field v-model="formData.confirm.yhPlaceName" readonly name="departName" label="隐患地点">
      <template #input>
        {{ formData.confirm.yhPlaceOrgName }} <template v-if="formData.confirm.yhPlaceOrgName && formData.confirm.yhPlaceDepartName">></template>
        {{ formData.confirm.yhPlaceDepartName }}
      </template>
    </van-field>

    <van-field v-model="formData.confirm.riskPointName" type="textarea" autosize readonly name="riskPointName" label="关联风险" />

    <van-field name="radio" label="整改情况" :rules="[{ required: true, message: '请选择整改情况' }]">
      <template #input>
        {{ { 1: '整改完成', 2: '整改未完成' }[formData.confirm.repairResult] }}
      </template>
    </van-field>
    <template v-if="formData.confirm.repairResult == 1">
      <van-field type="textarea" autosize v-model="formData.confirm.recheckResult" readonly name="picker" label="复查结果" />
      <van-field class="myfield" v-if="formData.confirm.recheckPicture" label-align="top" name="recheckPicture" label=" ">
        <template #input>
          <div class="img-wrap">
            <van-image
              v-for="(item, index) in formData.confirm.recheckPicture"
              @click.stop="preview(index, formData.confirm.recheckPicture)"
              :key="index"
              width="100"
              height="100"
              :src="item"
            />
          </div>
        </template>
      </van-field>
    </template>
    <template v-if="formData.confirm.repairResult == 2">
      <van-field v-model="formData.confirm.tempMeasure" readonly name="picker" label="临时措施" />

      <van-field v-model="formData.confirm.repairDate" readonly name="calendar" label="限定整改日期" />

      <van-field v-model="formData.confirm.dutyDeptName" readonly name="dutyDeptName" label="责任部门" />

      <van-field v-model="formData.confirm.dutyPeopleName" readonly name="dutyPeopleName" label="责任人" />
      <van-field v-model="formData.confirm.handler" readonly name="handler" label="处理人" />
      <van-field v-model="formData.confirm.handleTime" readonly name="handleTime" label="处理时间" />
    </template>
  </template>
</template>

<script lang="ts" setup>
  import { useUserStore } from '/@/store/modules/user';
  import { showImagePreview } from 'vant';

  const userStore: any = useUserStore();

  const yh_hidden_typeList = userStore.getAllDictItems.yh_hidden_type;
  const yh_hidden_levelList = userStore.getAllDictItems.yh_hidden_level;
  const yh_control_meansList = userStore.getAllDictItems.yh_control_means;

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
  const { formData } = props;

  pageInit();
  function pageInit() {
    yh_hidden_levelList.map((val) => {
      if (val.value == formData.confirm.yhLevel) {
        formData.confirm.yhLevelLabel = val.text;
      }
    });
    yh_hidden_typeList.map((val) => {
      if (val.value == formData.confirm.yhType) {
        formData.confirm.yhTypeLabel = val.text;
      }
    });
    yh_control_meansList.map((val) => {
      if (val.value == formData.confirm.handleMeans) {
        formData.confirm.handleMeansLabel = val.text;
      }
    });
  }

  // 图片预览
  const preview = (idx, list) => {
    showImagePreview({
      images: list,
      startPosition: idx,
    });
  };
</script>

<style lang="less" scoped>
  .myfield {
    .van-field__value {
      max-width: 100%;
    }
  }
  .img-wrap {
    width: auto;
    height: auto;
    display: flex;
    overflow-y: hidden;
    overflow-x: auto;
    padding-bottom: 20px;
    box-sizing: content-box;
    .van-image {
      flex-shrink: 0;
      width: 100px;
      margin: 0px 5px;
    }
  }
</style>
