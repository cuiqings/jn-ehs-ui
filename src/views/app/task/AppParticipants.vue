<template>
  <div class="pageParticipants">
    <div>
      <div class="par-inp">
        <van-search v-model="realname" show-action @clear="searchName" placeholder="请输入搜索关键词" @search="searchName">
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
          <ul v-for="(v, i) in userArr" :key="i" @click="onBackName(v, i)">
            <li :style="{ backgroundColor: userIndex == i ? '#bae7ff' : '' }">{{ v.realname }}</li>
          </ul>
        </div>
      </div>
    </div>
    <footer>
      <a-button class="par-button" @click="onParCan">取消</a-button>
      <a-button class="par-button" type="primary" @click="onAddto">添加</a-button>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { departCom, parAdd, getUserList } from './appTask.api';
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  const router = useRouter();
  const route: any = useRoute();
  const departData = ref([]);
  const userArr: any = ref([]);
  const userIndex = ref(null);
  const userObj: any = ref(null);
  const departName = ref('');
  const realname = ref('');
  const orgCode = ref(undefined);
  //tree属性控制键
  comDep();
  const onSelect = (selectedKeys, e) => {
    userObj.value = null;
    userIndex.value = null;
    orgCode.value = undefined;
    if (selectedKeys.length > 0) {
      orgCode.value = e.node.orgCode;
      comUser();
    } else {
      comUser();
    }
  };
  //tree数据
  async function comDep() {
    await departCom({ departName: departName.value }).then((res) => {
      if (res) departData.value = res;
      else departData.value = [];
    });
  }
  async function comUser() {
    await getUserList({
      orgCode: orgCode.value,
      realname: realname.value,
    }).then((res) => {
      if (res) userArr.value = res;
      else userArr.value = [];
    });
  }

  //点击名子改变背景色
  const onBackName = (name, index) => {
    userObj.value = name;
    userIndex.value = index;
  };
  //添加参与人
  const onAddto = async () => {
    let params = {
      publishId: route.query.publishId, // 汇报表id
      realname: userObj.value.realname,
      userId: userObj.value.id,
    };
    if (userObj.value) {
      await parAdd(params);
      router.back();
    }
  };
  //取消
  const onParCan = () => {
    router.back();
  };
  //搜索
  const searchName = () => {
    comUser();
  };
</script>

<style lang="less" scoped>
  .pageParticipants {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    & > div {
      height: calc(100% - 45px);
      .par-inp {
        height: 54px;
        width: 100%;
      }
      .par-list {
        width: 100%;
        height: calc(100% - 54px);
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
      height: 45px;
      display: flex;
      .par-button {
        height: 45px;
        width: 50%;
      }
    }
  }
</style>
