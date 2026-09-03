<template>
  <div class="drawer-content" v-if="cardObject !== null">
    <h2 c-if="isTitle"> {{ navTitle }}</h2>
    <slot name="title"></slot>
    <slot></slot>
    <template v-if="!isSlot">
      <template v-if="navTitle === '事故确认' || navTitle === '调查确认'">
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row">
          <a-col :sm="4" align="right" class="drawer-content_label"> 确认结果： </a-col>
          <a-col :sm="20">
            <div class="drawer-content_value">
              <div v-if="currentStatus !== 1"> {{ cardObject.result }} </div>
              <a-row v-if="currentStatus === 1" type="flex" align="middle" :gutter="[0, 24]">
                <a-col :sm="10"> {{ cardObject.result }} </a-col>
                <a-col :sm="14">
                  重复事故：
                  <span class="drawer-content-value_underline" @click="onRepeatAccident(cardObject.repeatEventId)">{{
                    cardObject.repeatEventName
                  }}</span></a-col
                >
              </a-row>
            </div>
          </a-col>
        </a-row>
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row" v-if="currentStatus === 2">
          <a-col :sm="4" align="right" class="drawer-content_label">关闭说明： </a-col>
          <a-col :sm="20">
            <a-textarea :value="cardObject.closeInfo" placeholder="请输入" :rows="4" disabled />
          </a-col>
        </a-row>
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row">
          <a-col :sm="4" align="right" class="drawer-content_label">确认人： </a-col>
          <a-col :sm="20">
            <div class="drawer-content_value"> {{ cardObject.affirmerName }} </div>
          </a-col>
        </a-row>
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row">
          <a-col :sm="4" align="right" class="drawer-content_label">确认时间： </a-col>
          <a-col :sm="20">
            <div class="drawer-content_value"> {{ cardObject.createTime }} </div>
          </a-col>
        </a-row>
      </template>
      <template v-if="navTitle === '调查报告审核' || navTitle === '整改落实审核'">
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row">
          <a-col :sm="4" align="right" class="drawer-content_label">审核结果： </a-col>
          <a-col :sm="20">
            <div class="drawer-content_value"> {{ cardObject.result }} </div>
          </a-col>
        </a-row>
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row">
          <a-col :sm="4" align="right" class="drawer-content_label">审核人： </a-col>
          <a-col :sm="20">
            <div class="drawer-content_value"> {{ cardObject.affirmerName }} </div>
          </a-col>
        </a-row>
        <a-row type="flex" :gutter="[0, 24]" class="drawer-content-row">
          <a-col :sm="4" align="right" class="drawer-content_label">审核时间： </a-col>
          <a-col :sm="20">
            <div class="drawer-content_value">{{ cardObject.updateTime }} </div>
          </a-col>
        </a-row>
      </template>
    </template>
  </div>
</template>
<script lang="ts" name="process-card" setup>
  defineProps({
    navTitle: {
      type: String,
    },
    isTitle: {
      type: Boolean,
      default: true,
    },
    isSlot: {
      type: Boolean,
      default: false,
    },
    isRepeatAccident: {
      type: Boolean,
      default: false,
    },
    cardObject: {
      type: Object,
      default: () => {
        return {
          result: '',
          affirmerName: '',
          createTime: '',
          closeInfo: '',
          repeatEventName: '',
          updateTime: '',
          repeatEventId: '',
        };
      },
    },
    currentStatus: {
      type: Number,
    },
  });
  const emit = defineEmits(['go-details']);
  const onRepeatAccident = (id: string) => {
    emit('go-details', id);
  };
</script>
<style lang="less" scoped>
  .drawer-content {
    background-color: rgb(242, 242, 242);
    padding: 0 20px 20px 0;
    margin-bottom: 15px;
    border-radius: 5px;
    h2 {
      color: rgb(64, 159, 253);
      line-height: 40px;
      padding-left: 20px;
      font-size: 16px;
    }
    .drawer-content-row {
      margin-bottom: 20px;
      .drawer-content_label {
        line-height: 30px;
      }
      .drawer-content_value {
        min-height: 30px;
        height: auto;
        line-height: 30px;
        background-color: #ffffff;
        padding: 0 10px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        .drawer-content-value_underline {
          text-decoration: underline;
          color: #409ffd;
          cursor: pointer;
        }
      }
    }
  }
</style>
