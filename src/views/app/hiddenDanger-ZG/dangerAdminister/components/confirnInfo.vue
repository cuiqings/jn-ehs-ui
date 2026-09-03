<template>
  <!-- 非隐患 -->
  <template v-if="true">
    <van-field name="radio" label="整改情况">
      <template #input>
        <van-radio-group v-model="formData.checked" direction="horizontal">
          <van-radio name="1">整改完成</van-radio>
          <van-radio name="2">继续整改</van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <!-- <div v-show="formData.checked == '1'"> -->
    <div>
      <van-field v-model="formData.yhDescription" name="yhDescription" autosize type="textarea" label=" 处理说明" placeholder="请填写处理说明" />
      <van-field name="repairPicture" label=" ">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
        </template>
      </van-field>
    </div>
    <!-- <div v-show="formData.checked == '2'"> -->
    <div>
      <van-field v-model="formData.date" readonly name="calendar" label="限定整改日期" placeholder="限定整改日期" />
      <van-field v-model="formData.depth" readonly name="picker" label="责任部门" placeholder="责任部门" />
      <van-field v-model="formData.person" readonly name="picker" label="责任人" placeholder="责任人" />
      <van-field v-model="formData.depth" readonly name="picker" label="处理人" placeholder="责任部门" />
      <van-field v-model="formData.person" readonly name="picker" label="处理事件" placeholder="责任人" />
    </div>
  </template>
  <!-- 确认隐患 -->
  <template v-if="true">
    <van-field v-model="formData.yhLevel" readonly name="yhLevel" label="隐患等级" placeholder="隐患等级" />
    <van-field v-model="formData.reporterName" name="reporterName" label="检查层级" placeholder="检查层级" />

    <van-field v-model="formData.yhType" readonly name="picker" label="隐患类型" placeholder="隐患类型" />

    <van-field v-model="formData.handleMeans" readonly name="handleMeans" label="防控手段" placeholder="防控手段" />

    <van-field v-model="formData.departName" readonly name="departName" label="隐患地点" placeholder="点击选择省市区" />

    <van-field v-model="formData.riskPoint" readonly name="riskPoint" label="关联风险" placeholder="关联风险" />

    <van-field name="radio" label="整改情况" :rules="[{ required: true, message: '请选择整改情况' }]">
      <template #input>
        <van-radio-group v-model="formData.repairResult" direction="horizontal">
          <van-radio name="1">整改完成</van-radio>
          <van-radio name="2">整改未完成</van-radio>
        </van-radio-group>
      </template>
    </van-field>

    <van-field v-model="formData.tempMeasure" readonly name="picker" label="临时措施" placeholder="临时措施" />

    <van-field v-model="formData.repairDate" readonly name="calendar" label="限定整改日期" placeholder="点击选择日期" />

    <van-field v-model="formData.dutyDeptName" readonly name="dutyDeptName" label="责任部门" placeholder="责任部门" />

    <van-field v-model="formData.dutyPeopleName" readonly name="dutyPeopleName" label="责任人" placeholder="责任人" />
  </template>
</template>

<script lang="ts" setup>
import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { ref } from 'vue';
  const userStore: any = useUserStore();
const watermarkText = ref(`${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(),'yyyy-MM-dd  hh:mm:ss')} 上传`)

  const props = defineProps({
    formData: {
      type: Object,
      default: () => {},
    },
  });
</script>
