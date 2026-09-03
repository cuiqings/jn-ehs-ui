<template>
  <van-popup v-model:show="props.show" position="top" @close="onParCan" :style="{ height: '400px', width: '100%' }">
    <div class="pageParticipants" v-loading="loading">
      <div class="par-inp">
        <van-search v-model="userName" @update:model-value="searchName" show-action @clear="searchName" placeholder="请输入姓名" @search="searchName">
          <template #action>
            <div @click="searchName">搜索</div>
          </template>
        </van-search>
      </div>
      <section>
        <div class="par-list">
          <div class="par-left">
            <ul>
              <VirtualScroll height="291" :items="userList" item-height="35" v-slot="{ item }">
                <li @click="onBackName(item)" :style="{ backgroundColor: selectIds.includes(item.userId) ? '#bae7ff' : '' }"> {{ item.name }} </li>
              </VirtualScroll>
            </ul>
          </div>
          <div class="par-right">
            <ul>
              <li v-for="item in selectNames">{{ item }}<van-icon style="color: #ee0a24" @click="delSelected(item)" name="cross" /></li>
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
  import { getIdCode } from '../../../../hazardousOperation/api/index';
  import { ref, watchEffect } from 'vue';

  const props = withDefaults(
    defineProps<{
      show: boolean;
      valueId: string[];
      valueName: string[];
      params: any;
    }>(),
    {
      show: false,
      valueId: () => [],
      valueName: () => [],
      params: () => {},
    }
  );

  const emits = defineEmits(['update:show', 'change']);
  const departData = ref<any[]>([]);
  const userList = ref<any[]>([]);
  const selectValues = ref<any[]>([]);
  const selectNames = ref<string[]>([]);
  const selectIds = ref<string[]>([]);
  const myName = ref(null);
  const loading = ref(false);

  watchEffect(() => {
    selectIds.value = props.valueId || [];
    selectNames.value = props.valueName || [];
    if (props.show) {
      comDep();
    }
  });

  //tree属性控制键
  const selectCode = ref<string>('');
  const originDepartTree = ref<any[]>([]);
  async function comDep() {
    comUser(null);
  }

  //userList
  async function comUser(code?: string | null, name?: string) {
    let params = props.params ? { ...props.params } : {};
    if (!params.workType) return;
    if (code) {
      params.org = code.slice(0, 6);
      params.orgCode = code;
    }
    if (name) params.userName = name;
    await getIdCode(params).then((res) => {
      res.forEach((item) => {
        item.name = `${item.userName}-${item.userWorkNo}`;
        if (item.orgSx) item.name += `-${item.orgSx}`;
      });
      userList.value = res;
      if (props.valueId && res.length) {
        res.forEach((item) => {
          if (props.valueId.includes(item.userId)) {
            item.id = item.userId;
            item.realname = item.userName;
            selectValues.value.push(item);
          }
        });
      }
    });
  }

  const reset = () => {
    userName.value = '';
    comUser(null);
  };

  //点击名子改变背景色
  const onBackName = (item) => {
    myName.value = item;
    if (selectIds.value.includes(item.userId)) {
      let index = selectIds.value.indexOf(item.userId);
      selectNames.value.splice(index, 1);
      selectIds.value.splice(index, 1);
      selectValues.value.splice(index, 1);
    } else {
      selectNames.value.push(item.name);
      selectIds.value.push(item.userId);
      item.id = item.userId;
      item.realname = item.userName;
      selectValues.value.push(item);
    }
  };
  const delSelected = (item) => {
    let index = selectNames.value.indexOf(item);
    if (index > -1) {
      selectNames.value.splice(index, 1);
      selectIds.value.splice(index, 1);
      selectValues.value.splice(index, 1);
    }
  };

  //console.log(publishId);
  const onAddto = async () => {
    let params = {
      names: selectNames.value.toString(),
      ids: selectIds.value.toString(),
      values: selectValues.value,
    };
    emits('change', params);
    emits('update:show', false);
    reset();
  };
  //取消
  const onParCan = () => {
    emits('update:show', false);
    reset();
  };
  //搜索
  const userName = ref('');
  const searchName = () => {
    console.log('userName', userName.value);
    comUser(selectCode.value, userName.value);
  };
  // 搜索机构
  const orgName = ref('');
  const searchOrg = (text) => {
    let result: Array<any> = [];
    if (typeof text == 'string' && text) {
      JSON.parse(JSON.stringify(departData.value)).map((item: any) => {
        let res = [];
        if (item.children) {
          res = item.children.filter((val: any) => {
            return val.departName.includes(text);
          });
        }
        item.children = res;
        if (res.length > 0) {
          result.push(item);
        }
      });
      departData.value = result;
    } else {
      departData.value = JSON.parse(JSON.stringify(originDepartTree.value));
    }
  };

  const searchValueChange = (e) => {
    searchOrg(e);
  };
</script>

<style lang="less" scoped>
  .pageParticipants {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
          li {
            margin-bottom: 2px;
          }
          :deep(.van-search__content) {
            background-color: #ffffff !important;
          }
          :deep(.ant-tree-list-holder-inner) {
            background: #eff1f5;
          }
        }
        li {
          padding: 0 10px;
        }
        .par-right {
          width: 50%;
          height: 100%;
          padding: 1.9% 0 0 3%;
          overflow: auto;
          ul {
            width: 100%;
            li {
              width: 100%;
              display: flex;
              justify-content: space-between;
            }
          }
        }

        ::-webkit-scrollbar {
          display: none;
        }
      }
    }

    footer {
      width: 100%;
      height: 55px;
      display: flex;

      button {
        flex: 1;
        color: #1f7cf8;
      }
    }
  }
</style>
