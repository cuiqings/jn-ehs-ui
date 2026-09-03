<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="900" :footer="null" :bodyStyle="{ padding: '0 20px 20px 20px' }" title="重复上报">
      <a-tabs v-model:activeKey="activeKey" @change="changeTabs">
        <a-tab-pane key="1" tab="同时间上报">
          <div class="pane-container">
            <template v-if="listData.length > 0">
              <div v-for="item in listData" :key="item.id">
                <div
                  ><p>事件类型：{{ item.type_dictText }}</p
                  ><span style="color: red">{{ item.distanceTime }}h内</span></div
                >
                <div
                  ><p>发生单位：{{ item.orgCode_dictText }}</p></div
                >
                <div
                  ><p>发生时间：{{ item.eventTime }}</p></div
                >
                <div
                  ><p>事件描述：{{ item.description }}</p></div
                >
                <div>
                  <p>
                    现场照片：
                    <span style="display: block">
                      <a-avatar
                        v-for="(ite, index) in item.photo ? item.photo.split(',') : []"
                        style="margin: 10px"
                        :key="index"
                        :src="getFileAccessHttpUrl(ite)"
                        shape="square"
                        :size="80"
                      />
                    </span>
                  </p>
                </div>
                <div class="pane-container_button"> <a-button type="primary" @click="onRepeatWithThis(item)">与此重复</a-button></div>
              </div>
            </template>
            <a-empty v-else />
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="同单位最近上报">
          <div class="pane-container">
            <template v-if="listData1.length > 0">
              <div v-for="item in listData1" :key="item.id">
                <div
                  ><p>事件类型：{{ item.type_dictText }}</p></div
                >
                <div
                  ><p
                    >发生单位：<span style="color: red"> {{ item.orgCode_dictText }}</span></p
                  ></div
                >
                <div
                  ><p>发生时间：{{ item.eventTime }}</p></div
                >
                <div
                  ><p>事件描述：{{ item.description }}</p></div
                >
                <div
                  ><p
                    >现场照片：<span style="display: block">
                      <a-avatar
                        v-for="(ite, index) in item.photo ? item.photo.split(',') : []"
                        style="margin: 10px"
                        :key="index"
                        :src="getFileAccessHttpUrl(ite)"
                        shape="square"
                        :size="80"
                      /> </span></p
                ></div>
                <div class="pane-container_button"> <a-button type="primary" @click="onRepeatWithThis(item)">与此重复</a-button></div>
              </div>
            </template>
            <a-empty v-else />
          </div>
        </a-tab-pane>
      </a-tabs>
    </basic-modal>
    <compare-model @register="compareRegisterModal" @success="onSuccess" />
  </div>
</template>
<script lang="ts" name="repeat-modal" setup>
  import compareModel from './compareModel.vue';
  import { useRepeatModal } from './hooks/useRepeatModal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const emit = defineEmits(['success']);
  const { registerModal, BasicModal, activeKey, listData, listData1, changeTabs, onRepeatWithThis, compareRegisterModal, onSuccess } =
    useRepeatModal(emit);
</script>
<style lang="less" scoped>
  .pane-container {
    display: flex;
    & > div {
      position: relative;
      border: 1px solid #666666;
      padding: 10px;
      border-radius: 5px;
      width: calc(95% / 3);
      margin-right: calc(5% / 2);
      padding-bottom: 50px;
      div:nth-child(1) {
        display: flex;
        justify-content: space-between;
      }
      .pane-container_button {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    & > div:nth-child(3) {
      margin-right: 0;
    }
    /deep/ .ant-empty {
      width: 100%;
      border: none;
      margin: 0;
      padding: 0;
    }
  }
</style>
