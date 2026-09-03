<template>
  <van-popup v-model:show="props.show" position="top" :style="{ height: '400px', width: '100%' }">
    <div class="pageParticipants">
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
                <li @click="onBackName(item)" :style="{ backgroundColor: selectIds.includes(item.id) ? '#bae7ff' : '' }"> {{ item.realname }}-{{ item.workNo }} </li>
              </VirtualScroll>
            </ul>
          </div>
          <div class="par-right">
            <ul>
              <li v-for="item in selectNames">{{ item }}<van-icon style="color: #ee0a24;" @click="delSelected(item)" name="cross" /></li>
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
  import { userListByOrg, getUserById } from '/@/api/common/api';
  import { ref, watchEffect } from 'vue';

  const props = withDefaults(
    defineProps<{
      show: boolean;
      value: object;
      params: any;
    }>(),
    {
      show: false,
      value: () => ({}),
      valueName: () => [],
      params: () => {},
    }
  );

  const emits = defineEmits(['update:show', 'change']);
  const userList = ref<any[]>([]);
  const selectValues = ref<any[]>([]);
  const selectNames = ref<string[]>([]);
  const selectIds = ref<string[]>([]);
  const myName = ref(null);

  watchEffect(() => {
    if(props.show && props.value && props.value.ids) {
      console.log('props.value', props.show, props.value);
      selectNames.value = props.value.names ? props.value.names.split(',') : [];
      selectIds.value = props.value.ids ? props.value.ids.split(',') : [];
    } else {
      selectNames.value = [];
    }
  });

  //tree属性控制键
  const selectCode = ref<string>('');
  comUser(null);
  //userList
  async function comUser(code?: string | null, name?: string) {
    let params = props.params ? { ...props.params } : {};
    if (code) {
      params.org = code.slice(0, 6);
      params.orgCode = code;
    }
    if (name) params.userName = name;
    await userListByOrg({ ...params, pageNo: 1, pageSize: 100000 }).then((res) => {
      userList.value = res.records;
    });
  }

  //点击名子改变背景色
  const onBackName = (item) => {
    myName.value = item;
    if (selectIds.value.includes(item.id)) {
      let index = selectIds.value.indexOf(item.id);
      selectNames.value.splice(index, 1);
      selectIds.value.splice(index, 1);
      selectValues.value.splice(index, 1);
    } else {
      selectNames.value.push(item.realname+'-'+item.workNo);
      selectIds.value.push(item.id);
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

  const onAddto = async () => {
    let params = {
      names: selectNames.value.toString(),
      ids: selectIds.value.toString(),
      values: selectValues.value,
    };
    emits('change', params);
    emits('update:show', false);
    selectValues.value = [];
    selectIds.value = [];
    selectNames.value = [];
  };
  //取消
  const onParCan = () => {
    emits('update:show', false);
  };
  //搜索
  const userName = ref('');
  const searchName = () => {
    console.log('userName', userName.value);
    comUser(selectCode.value, userName.value);
  };
  // 搜索机构
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
          li{
            padding-left: 10px;
            margin-bottom: 2px;
          }
          :deep(.van-search__content) {
            background-color: #ffffff !important;
          }
          :deep(.ant-tree-list-holder-inner) {
            background: #eff1f5;
          }
        }

        .par-right {
          width: 50%;
          height: 100%;
          padding: 1.9% 10px 0 3%;
          overflow: auto;
          ul{
            width: 100%;
            li{
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
