<script setup lang="ts">
  import { ref } from 'vue';
  import { getUserList } from '../plan.api';
  import Modal from './Modal.vue';
  import { useModal } from '/@/components/Modal';
  const [registerModal, { openModal }] = useModal();
  const emit = defineEmits(['init']);
  const tableData: any = ref([]);

  function reloadList(val) {
    getUserList({
      organizationCode: val.orgCode || 'A04',
    }).then((res) => {
      tableData.value = res || [];
    });
  }

  function reloadOk() {
    emit('init');
  }

  // 在组件挂载后调用接口获取数据

  const prevType = () => {
    openModal(true, {
      showFooter: false,
    });
  };

  defineExpose({
    reloadList,
  });
</script>

<template>
  <section class="top">
    <div class="card-title">
      <div class="title">各单位环保负责人联系表</div>
      <div class="type">
        <span class="pre-button" @click="prevType">查看全部</span>
      </div>
    </div>

    <div class="titletop">
      <p class="text" style="width: 35%">所属机构</p>
      <p class="text" style="width: 35%">人员</p>
      <p class="text" style="width: 30%">联系方式</p>
    </div>
    <div class="separator"></div>
    <!-- 添加分割线 -->
    <div class="top-content">
      <div class="div-1">
        <div class="top-list">
          <div class="top-item" v-for="(item, index) in tableData" :class="'t' + index" :key="index">
            <span class="institution" :title="item.organizationName">{{ item.organizationName }}</span>
            <span class="user" :title="item.personnelName">{{ item.personnelName }}</span>
            <span class="phone" :title="item.contactInformation"> {{ item.contactInformation }} </span>
          </div>
          <div v-if="!tableData.length" style="padding-top: 30px">
            <a-empty />
          </div>
        </div>
      </div>
    </div>
  </section>
  <Modal @register="registerModal" @success="reloadOk()" />
</template>

<style scoped lang="less">
  .top {
    width: 380px;
    height: 327px;
    margin-top: 29px;
    .card-title {
      height: 40px;
      width: 379px;
      background: url('../../../assets/images/protection/form.png') no-repeat left;
      background-size: cover; /* 让背景图片完全覆盖容器 */
      position: relative;
      .title {
        font-size: 18px;
        text-align: left;
        font-weight: bold;
        color: #f4fffe;
        margin-left: 56px;
        margin-top: 6px;
        line-height: 38px;
        /* font-family:PangMenZhengDao-Regular; */
      }
      .type {
        position: absolute;
        left: 150px;
        top: 0px;
        font-size: 14px;
        text-align: right;
        color: #cfd3d8;
        line-height: 40px;
        margin-left: 154px;
        .pre-button {
          cursor: pointer;
        }
        .next-button {
          cursor: pointer;
        }
      }
    }
    .separator {
      width: 379px; /* 让分割线水平充满整个容器 */
      height: 0px;
      opacity: 0.15;
      border: 1px solid #ffffff;
      margin-top: 4px;
    }
    .titletop {
      position: relative;
      height: 17px;
      margin-top: 15px;
      display: flex;
      font-size: 14px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #ffffff;
      .text {
        text-align: center;
      }
    }
    .top-content {
      width: 392px;
      height: 280px;
      display: flex;
      flex-direction: column;
      margin-top: 11px;
      .div-1 {
        max-height: 225px; /* 最大高度为280px */
        overflow-y: auto; /* 创建垂直滚动容器 */
        overflow-x: hidden;
      }
    }

    .top-list {
      .top-item {
        display: flex;
        width: 100%;
        height: 24px;
        font-size: 14px;
        color: #ffffff;
        margin-bottom: 15px;
        .institution {
          width: 35%;
          height: 24px;
          line-height: 24px; /* 垂直居中文本的关键 */
          text-align: center;
          white-space: nowrap; /* 防止文本换行 */
          overflow: hidden; /* 隐藏溢出内容 */
          text-overflow: ellipsis; /* 显示省略号 */
        }

        .phone {
          width: 30%;
          height: 24px;
          line-height: 24px; /* 垂直居中文本的关键 */
          text-align: center;
          white-space: nowrap; /* 防止文本换行 */
          overflow: hidden; /* 隐藏溢出内容 */
          text-overflow: ellipsis; /* 显示省略号 */
        }
        .user {
          width: 35%;
          height: 24px;
          line-height: 24px; /* 垂直居中文本的关键 */
          text-align: center;
          white-space: nowrap; /* 防止文本换行 */
          overflow: hidden; /* 隐藏溢出内容 */
          text-overflow: ellipsis; /* 显示省略号 */
        }
        &.t0 {
          .progress {
            background: linear-gradient(to right, #2feaf8 30%, #2feaf8 100%);
          }
        }
        &.t1 {
          .progress {
            background: linear-gradient(to right, #2feaf8 30%, #2feaf8 100%);
          }
        }
        &.t2 {
          .progress {
            background: linear-gradient(to right, #2feaf8 30%, #2feaf8 100%);
          }
        }
        .finishedrate {
          position: absolute;
          left: 322px;
        }
        .discovery {
          position: absolute;
          left: 295px;
          width: 24px;
          text-align: center;
        }
      }
      > ul {
        padding: 0px;
        > li {
          width: 371px;
          height: 24px;
          position: relative;
          font-size: 14px;
          overflow: hidden;
          margin-bottom: 23px;
          &:last-child {
            margin-bottom: 0px;
          }
        }
      }
    }
  }
</style>
