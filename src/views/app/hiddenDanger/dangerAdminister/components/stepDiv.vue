<template>
  <div class="step-div">
    <div class="main">
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in 3" :key="item">
          <div class="time-tit">2024-01-28 12:00:00 一号线>旺达挂 </div>
          <van-field name="repairPicture" label="整改后照片">
          <template #input>
            <div style="display: flex; flex-wrap: wrap">
              <van-image v-for="item in 4" :key="item" width="100" height="100" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
            </div>
          </template>
        </van-field>
        <van-field v-model="formData.repairExplain" name="repairExplain" autosize type="textarea" label="整改描述" placeholder=" 整改描述" />
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  const formData = reactive({
    repairExplain: '会计法拉倒减肥的开始了减肥啦，接过来的进度款拉法基荆防颗粒大姐夫啦绝地反击阿里。',
  });
</script>

<style lang="less" scoped>
  .step-div {
    padding: 0 15px;
    .tag {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 7px;
      background-color: #ccc;
      position: absolute;
      left: -7px;
      top: 50%;
      transform: translateY(-50%);
    }
    .time-tit {
      height: 45px;
    }
    .main{
        position: relative;
    }
  }
</style>
