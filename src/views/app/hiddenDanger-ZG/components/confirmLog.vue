<template>
  <van-field label-align="top" v-model="formData.repairExplain" name="repairExplain" autosize type="textarea" label="确认记录">
    <template #input>
      <van-steps direction="vertical" :active="1">
        <template v-for="item in formData.confirmLogList">
          <van-step>
            <h3>{{ item.handleTime }}</h3>
            <p class="active-text" v-if="item.node">{{ item.handlerOrgName }}>{{ item.handlerName }}</p>
            <p class="active-text" :class="{ 'red': item.confirmResult == 2}" v-if="item.node">确认结果： <span>{{ { 1: '确认下发', 2: '退回', 3: '加签' }[item.confirmResult] }}</span></p>
            <p class="active-text" v-if="item.node && item.confirmResult == 2">确认说明：{{ item.confirmBackReason }}</p>
          </van-step>
        </template>
      </van-steps>
    </template>
  </van-field>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  const props = withDefaults(
    defineProps<{
      formData: any;
    }>(),
    {
      formData: () => {},
      readonly: false,
    }
  );
  
  // const nodes = ref<any>({21: '安全员确认', 22: '工序负责人确认', 23: '产线经理确认', 24: 'EHS管理中心确认', 25: 'EHS管理中心-领导确认'})
  // if (props.formData.confirm.yhLevel == 2) {
  //   nodes.value = {21: '安全员确认', 22: '工序负责人确认', 23: '产线经理确认'}
  // }
  const { formData } = props;

  const activeIdx = ref(0);

  formData.confirmLogList.map((val, idx) => {
    if(!!val.remark1){
      activeIdx.value = idx;
    }
  })
</script>

<style lang="less" scoped>
  p{
    margin-bottom: 5px;
  }
  .myfield {
    .van-field__value {
      max-width: 100%;
    }
  }
  .img-wrap {
    width: auto;
    height: 100px;
    display: flex;
    overflow-y: hidden;
    overflow-x: auto;
    // padding-bottom: 20px;
    // box-sizing: content-box;
    .van-image {
      flex-shrink: 0;
      width: 100px;
      margin: 0px 5px;
    }
  }
  .active-text{
    color: #1989fa;
  }
  .red{
    color: red;
  }
</style>
