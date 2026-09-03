<template>
  <BasicModal @register="registerModal" :defaultFullscreen="true" v-bind="$attrs" :title="title" :width="800" @close="close" @cancel="close">
    <div class="detail">
      <div class="tit">{{ info.title }}</div>
      <div class="info" v-if="info.type == 2">
        <div class="l">
          <img src="../../../assets/images/icon/c.png" alt="" />
          {{ info.playDate }}
        </div>
        <div class="l">
          <img src="../../../assets/images/icon/l.png" alt="" />
          {{ info.playLocation }}
        </div>
        <div class="h">
          <img src="../../../assets/images/icon/h.png" alt="" />
          {{ info.orgName }}
        </div>
      </div>
      <div class="img">
        <a-image :width="120" v-for="(item, index) in info.file" :key="index" :src="item" alt=""/>
      </div>
      <div class="main" v-html="info.playContent"></div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Image } from 'ant-design-vue'
  import { ref } from 'vue';
const AImage = Image;
  const info = ref<any>({});
  const title = ref('安全文化活动');
  const [registerModal, { closeModal }] = useModalInner((data) => {
    title.value = data.title;
    info.value = data.data;
  });
  const close = () => {
    closeModal();
    info.value = {};
  };
</script>
<style lang="less" scoped>
  .detail {
    padding: 20px;
    .tit{
      font-size: 22px;
      font-weight: 600;
      text-align: center;
    }
    .info {
      display: flex;
      align-items: center;
      color: #999999;
      div {
        display: flex;
        align-items: center;
        margin-right: 10px;
      }
      img {
        width: 16px;
        height: 16px;
        margin-right: 5px;
      }
      div:nth-child(1) {
        img {
          width: 18px;
          height: 18px;
          margin-right: 5px;
        }
      }
    }
    .img{
      margin: 16px 0;
    }
    .main{
      text-indent: 2em;
    }
  }
</style>
