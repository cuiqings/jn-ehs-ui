<template>
  <van-popup v-model:show="props.show" position="bottom">
    <div style="display: flex; justify-content: space-between; height: 44px; line-height: 44px">
      <van-button style="border: none; color: #969799" @click="cancelFn" size="normal">取消</van-button>
      <!-- <div style="border: none; color: #000" size="normal">确认</div> -->
      <van-button style="border: none; color: #6398fb" @click="checkedChange" size="normal">确认</van-button>
    </div>
    <div class="main">
      <van-checkbox-group v-model="selectList">
        <van-cell v-for="(item, index) in props.personList" :key="index" :title="item[customkey.title]">
          <template #right-icon>
            <van-checkbox :name="item[customkey.name]" />
          </template>
        </van-cell>
      </van-checkbox-group>
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';

  const props = defineProps({
    personList: {
      type: [],
      default: () => [],
    },
    show: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
    customkey: {
      type: Object,
      default: () => ({title: 'name', name: 'code'}),
    }
  });

  const emits = defineEmits(['update:show', 'confirm']);
  const { customkey } = props

  const selectList = ref<string[]>([])

  watch(() => props.value, (val) => {
    if(val){
      selectList.value = val.split(',')
    }
  })

  const cancelFn = () => {
    emits('update:show', false);
  };

  const checkedChange = () => {
    let codes = '';
    let names = '';
    props.personList.map(val => {
      if(selectList.value.includes(val[customkey.name])){
       codes += val[customkey.name] + ',';
       names += val[customkey.title] + ',';
      }
    })
    codes = codes.substring(0, codes.length - 1);
    names = names.substring(0, names.length - 1);
    emits('confirm', {codes, names});
    emits('update:show', false);
  };
</script>
<style lang="less" scoped>
  .main {
    height: 45vh;
  }
</style>
