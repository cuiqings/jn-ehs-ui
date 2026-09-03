<template>
  <van-popup v-model:show="props.show" position="bottom" :style="{ height: '70%', width: '100%' }">
    <div class="pageParticipants">
      <section>
        <div class="par-inp">
          <van-search v-model="departName" show-action @clear="searchName" placeholder="请输入搜索关键词" @search="searchName">
            <template #action>
              <div @click="searchName">搜索</div>
            </template>
          </van-search>
        </div>
        <div class="par-list">
          <div class="par-left">
            <a-tree class="left-back" :tree-data="departData" @select="onSelect" />
          </div>
          <div class="par-right">
            <ul v-for="(v, i) in userName" :key="i" @click="onBackName(v, i)">
              <li :style="{ backgroundColor: selectName == i ? '#bae7ff' : '' }">{{ v.realname }}</li>
            </ul>
          </div>
        </div>
      </section>
      <footer>
        <button class="par-cancel" @click="onParCan">取消</button>
        <button class="par-add" @click="onAddto">添加</button>
      </footer>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { getDepartTreeBy23, userCom } from '../handleAlarmTask/index.api';
  import { ref, reactive } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  const props = defineProps({
    show: Boolean
  })
 
  const emits = defineEmits(['update:show', 'confirm'])
  const router = useRouter();
  const route = useRoute();
  const departData = ref([]);
  const userName = ref([]);
  const selectName = ref(null);
  const myName = ref(null);
  const parVal = ref('');
  const department = ref(null);
  const departName = ref('');
  //tree属性控制键
  comDep();
  const onSelect = (ids, e) => {
    //console.log(e.node.dataRef.title);
    comUser(e.node.dataRef.id);
    selectName.value = null;
    department.value = e.node.dataRef.title;
  };
  //tree数据
  async function comDep() {
    await getDepartTreeBy23().then((res) => {
      if (res) {
        departData.value = res;
      } else {
        departData.value = [];
      }
    });
  }
  //userName
  async function comUser(id) {
    await userCom(id).then((res) => {
      //console.log(res.records);
      userName.value = res.records;
    });
  }

  //点击名子改变背景色
  const onBackName = (name, index) => {
    myName.value = name;
    selectName.value = index;
    //console.log(myName.value);
  };
  //添加参与人
  let publishId = history.state.recId;
  //console.log(publishId);
  const onAddto = async () => {
    let params = {
      publishId: publishId,
      realname: `${department.value}-${myName.value.realname}`,
      userId: myName.value.id,
    };
    emits('confirm', params);
    emits('update:show', false);
  };
  //取消
  const onParCan = () => {
    emits('update:show', false);
  };
  //搜索
  const searchName = () => {
    console.log(departName.value);

    comDep();
  };
</script>

<style lang="less" scoped>
  .pageParticipants {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
      flex: 1;
      overflow: auto;

      .par-list {
        width: 100%;
        height: 100%;
        display: flex;

        .par-left {
          width: 50%;
          height: 100%;
          background: #eff1f5;
          overflow: auto;
          padding-top: 1.9%;

          :deep(.ant-tree-list-holder-inner) {
            background: #eff1f5;
          }
        }

        .par-right {
          width: 50%;
          height: 100%;
          padding: 1.9% 0 0 3%;
          overflow: auto;
        }

        ::-webkit-scrollbar {
          display: none;
        }
      }
    }

    footer {
      width: 100%;
      height: 10%;
      display: flex;

      button {
        flex: 1;
        color: #1f7cf8;
      }
    }
  }
</style>
