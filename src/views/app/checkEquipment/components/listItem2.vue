<!-- 共用列表项 -->
<template>
  <div class="item">
    <div class="left" v-show="showBatch">
      <van-checkbox @change="(val) => emit('checkChange', { checked: val })" v-model="curItem.checked"
        :name="curItem.id" shape="square"></van-checkbox>
    </div>
    <div class="right" @click="openDetail">
      <p>
        {{ {6: '消防器材',1: '起重机械', 2: '叉车', 3: '压力容器', 4: '安全阀', 5: '锅炉'}[curItem.checkType] }}
          <span v-if="curItem.remindStatus != 1" class="tag" :class="curItem.remindStatus==2? 'or' : ''">{{ filterDictTextByCache('jn_risk_remind_status', curItem.remindStatus) }}</span>
      </p>
      <p>
        <span>{{ curItem.deviceName }}</span>
        <span>{{ curItem.deviceNumber }}</span>
      </p>
      <p>
        <span>下次检验时间: {{ curItem.nextCheckDate }}</span>
        <span>{{ curItem.useDepartment }}</span>
      </p>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    btnText?: string;
    needBtn?: boolean;
    item: any;
    needNotice?: boolean;
    btnShowTag?: string;
    showBatch?: boolean;
  }>(),
  {
    btnText: '处理',
    needBtn: true,
    item: () => { },
    btnShowTag: 'canHandle',
    needNotice: false,
    showBatch: false,
  }
);

const curItem = ref(props.item);
const emit = defineEmits(['itemClick', 'btnClick', 'checkChange']);

// item卡片事件
const openDetail = () => {
  emit('itemClick');
};

</script>

<style lang="less" scoped>
.item {
  width: 100%;
  height: 130px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  font-size: 12px;
  margin-bottom: 15px;

  .left {
    padding-right: 15px;
  }

  .tag {
    font-size: 12px;
    display: inline-block;
    background-color: #f76262;
    color: #fff;
    font-size: 10px;
    border-radius: 4px;
    padding: 0 4px;
    margin-left: 10px;
  }

  .bl {
    background-color: #68b0f8;
  }

  .or {
    background-color: #f7aa36;
  }

  img {
    width: 100%;
    height: 100px;
  }

  .custom-indicator {
    color: #fff;
    position: absolute;
    right: 5px;
    bottom: 5px;
    padding: 2px 5px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.3);
  }

  .right {
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
  }

  p {
    font-size: 12px;
    color: #333;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .time {
    color: #999;
  }

  .content {
    font-size: 14px;
    word-break: break-all;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .tag1 {
    color: #f76262;
  }

  .tag2 {
    color: #f7aa36;
  }

  .tag3 {
    color: #e2f868;
  }

  .tag4 {
    color: #68b0f8;
  }

  .tag5 {
    color: #62f776;
  }

  .hint {
    font-size: 12px;
    color: #f7aa36;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }
}
</style>
