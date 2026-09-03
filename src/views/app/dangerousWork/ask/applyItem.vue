<template>
  <div class="apply">
    <div class="title">选择申请类型</div>
    <div class="main">
      <template v-for="item in workTypeList" :key="item.value">
        <div class="item" v-if="item.value != '0'" @click="goPage('/app/dangerousWork/askdetail?workType=' + item.value)"> {{ item.title }} </div>
      </template>

      <!-- <div class="item" @click="goPage('/app/dangerousWork/askdetail?workType=2')"> 有限空间作业 </div>
      <div class="item" @click="goPage('/app/dangerousWork/askdetail?workType=3')"> 动火作业 </div>
      <div class="item" @click="goPage('/app/dangerousWork/askdetail?workType=4')"> 脚手架搭拆 </div> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();
  const workTypeList = ref<any[]>(userStore.getAllDictItems.work_type);
 
  const router = useRouter();
  const goPage = (url: string) => {
    router.replace(url);
  };
</script>
<style lang="less" scoped>
  .apply {
    width: 100%;
    height: 100%;
    padding: 15px;
    background-color: #ffffff;

    .title {
      font-size: 18px;
      font-weight: 600;
      padding: 10px;
    }

    .main {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      .item {
        width: 45%;
        height: 35px;
        line-height: 35px;
        text-align: center;
        color: #ffffff;
        background-color: #1989fa;
        margin-bottom: 15px;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
      }
    }

    a {
      color: #ffffff;
    }
  }
</style>
