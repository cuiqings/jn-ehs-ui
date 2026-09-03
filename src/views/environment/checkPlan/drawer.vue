<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="800"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoRef" name="basic" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }" autocomplete="off">
      <a-form-item label="所属机构：" name="organizationCode" :rules="[{ required: showOkBtn, message: '请选择所属机构!' }]">
        <a-select
          v-model:value="info.organizationCode"
          :options="orgOptions"
          label-field="departName"
          value-field="orgCode"
          placeholder="请选择"
          :disabled="!showOkBtn"
        />
      </a-form-item>
      <a-form-item label="计划名称：" name="checkPlanName" :rules="[{ required: showOkBtn, message: '计划名称不可为空！' }]">
        <a-input v-model:value="info.checkPlanName" placeholder="请输入" :maxlength="50" :disabled="!showOkBtn" />
      </a-form-item>
      <a-form-item label="检查频率：" name="checkFrequency" :rules="[{ required: showOkBtn, message: '请选择检查频率！' }]">
        <j-dict-select-tag
          v-model:value="info.checkFrequency"
          style="width: 100%"
          dictCode="check_frequency"
          placeholder="请选择"
          :string-to-number="false"
          :show-choose-option="false"
          :disabled="!showOkBtn"
          @change="changeFrequency"
        />
      </a-form-item>
      <a-form-item label="时间：" name="timeOne" :rules="[{ required: showOkBtn, message: '请选择时间！' }]">
        <a-select v-if="isTime" v-model:value="info.timeOne" style="width: 100%" :options="timeOneArr" placeholder="请选择" :disabled="!showOkBtn" />
        <a-space v-else>
          第<a-select
            v-model:value="info.timeOne"
            style="width: 303px"
            :options="timeOneArr"
            placeholder="请选择"
            :disabled="!showOkBtn"
          />个月<a-select v-model:value="info.timeTwo" style="width: 303px" :options="timeTwoArr" placeholder="请选择" :disabled="!showOkBtn" />
        </a-space>
      </a-form-item>
      <a-form-item label="检查人：" v-if="!showOkBtn">
        <a-input v-model:value="info.checkName" :disabled="!showOkBtn" />
      </a-form-item>
      <a-form-item v-if="showOkBtn" label="检查人：" name="checkUserId" :rules="[{ required: showOkBtn, message: '请选择检查人！' }]">
        <a-select
          v-model:value="info.checkUserId"
          show-search
          mode="multiple"
          placeholder="请选择"
          :options="checkerArr"
          :filter-option="filterOption"
          :disabled="!showOkBtn"
          @change="changeCheckUser"
        >
          <template v-if="fetching" #notFoundContent>
            <a-spin size="small" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="检查项：" :required="showOkBtn" style="display: block" :wrapper-col="{ span: 24 }">
        <a-table :columns="showOkBtn ? columns : columns1" :data-source="info.jnEnvironmentalCheckPlanSubList" bordered :pagination="false">
          <template #processes="{ record }">
            <a-input v-if="showOkBtn" v-model:value="record.processes" placeholder="请输入" :maxlength="20" />
            <div v-else style="word-break: break-all">{{ record.processes }}</div>
          </template>
          <template #checkEntry="{ record }">
            <a-input v-if="showOkBtn" v-model:value="record.checkEntry" placeholder="请输入" :maxlength="20" />
            <div v-else style="word-break: break-all">{{ record.checkEntry }}</div>
          </template>
          <template #checkRecord="{ record }">
            <a-input v-if="showOkBtn" v-model:value="record.checkRecord" placeholder="请输入" :maxlength="100" />
            <div v-else style="word-break: break-all">{{ record.checkRecord }}</div>
          </template>
          <template #operate="{ record }">
            <div style="display: flex; justify-content: center">
              <a-button type="primary" @click="onJia(record)">+</a-button>
              <a-button @click="onJian(record)" style="margin-left: 10px" v-if="record.serialNumber !== '1'">-</a-button>
            </div>
          </template>
        </a-table>
      </a-form-item>
      <a-form-item label="是否启用：" name="isEnable" :required="showOkBtn">
        <a-radio-group v-model:value="info.isEnable" :disabled="!showOkBtn">
          <a-radio value="0">启用</a-radio>
          <a-radio value="1">停用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </BasicDrawer>
</template>
<script lang="ts" name="checkPlan-drawer" setup>
  import { ref } from 'vue';
  import { JDictSelectTag } from '/@/components/Form';
  import useDrawer from './hooks/useDrawer';
  const emit = defineEmits(['success']);
  const infoRef = ref();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    orgOptions,
    changeFrequency,
    checkerArr,
    filterOption,
    columns,
    onJia,
    onJian,
    columns1,
    changeCheckUser,
    isTime,
    timeOneArr,
    timeTwoArr,
    fetching,
  } = useDrawer(emit, infoRef);
</script>
<style lang="less" scoped>
  /deep/.ant-input-disabled {
    color: rgba(0, 0, 0, 0.65);
  }
  .ant-select-dropdown {
    .ant-spin-spinning {
      padding-left: 336px;
    }
  }
</style>
