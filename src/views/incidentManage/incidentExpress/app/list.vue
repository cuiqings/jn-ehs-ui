<template>
  <div class="app-em-wrap">
    <a-card>
      <a-input-search
        size="large"
        style="margin-bottom: 10px"
        v-model:value="queryParams.keyword"
        enter-button
        placeholder="请输入关键字"
        @search="search"
      />
      <van-list v-model:loading="loading" :finished="finished" :finished-text="listArr.length > 0 ? '没有更多了' : ''" @load="onLoad">
        <div class="list" v-for="item in listArr" :key="item.id">
          <div @click="onDetails(item.id)">
            <div>{{ item.orgCode_dictText }}&nbsp;&nbsp;{{ item.type_dictText }}</div>
            <span v-html="statusText(item.status)"></span>
          </div>
          <div @click="onDetails(item.id)"><span>事故描述：</span>{{ item.description }}</div>
          <div v-if="item.photo !== ''">
            <JImageUpload disabled text="" :value="onPhotoe(item.photo)" />
          </div>
          <div @click="onDetails(item.id)"><span>上报时间：</span>{{ item.createTime }}</div>
        </div>
      </van-list>
      <a-empty v-if="listArr.length === 0" />
      <div class="go-add" @click="goAdd"
        ><span>事故<br />快报</span></div
      >
    </a-card>
  </div>
</template>
<script setup name="app-incident-list" lang="ts">
  import { list } from '../url/index';
  import { useRouter } from 'vue-router';
  import { onMounted, ref, reactive } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  const router = useRouter();
  const listArr: any = ref([]);
  const loading = ref(true);
  const finished = ref(true);
  const total = ref(0);
  const queryParams = reactive({
    orderBy: 'create_time',
    pageNo: 1,
    pageSize: 10,
    oneself: true,
    keyword: '',
  });
  onMounted(() => {
    init();
  });
  const init = async (is = true) => {
    loading.value = true;
    try {
      const data = await list(queryParams);
      if (is) listArr.value = data.records;
      else listArr.value = listArr.value.concat(data.records);
      total.value = data.total;
    } finally {
      loading.value = false;
      finished.value = false;
    }
  };
  const search = () => {
    queryParams.pageNo = 1;
    total.value = 0;
    init();
  };
  const onLoad = () => {
    if (listArr.value.length == total.value) {
      finished.value = true;
    } else {
      finished.value = false;
      // 加载状态结束
      loading.value = false;
      scrollCallback();
    }
  };
  //滚动后继续加载的回调函数
  const scrollCallback = () => {
    queryParams.pageNo++;
    init(false);
  };
  const statusText = (status) => {
    const confirmedArr = [3, 5, 6, 7, 8, 9, 10];
    const closedArr = [1, 2, 4, 11];
    if (status === 0) {
      return "<span style='color: red'>待确认</span>";
    } else if (confirmedArr.includes(status)) {
      return "<span style='color: #70B603'>已确认</span>";
    } else if (closedArr.includes(status)) {
      return "<span style='color: #7F7F7F'>已结案</span>";
    }
  };
  const onPhotoe = (text) => {
    let imageStr = '';
    if (text !== '' && text) {
      if (text.split(',').length - 1 >= 2) {
        const firstCommaIndex = text.indexOf(','); // 获取第一个逗号的位置
        const secondCommaIndex = text.indexOf(',', firstCommaIndex + 1); // 获取第二个逗号的位置
        imageStr = text.substring(0, secondCommaIndex); //
      } else {
        imageStr = text;
      }
    }
    return imageStr;
  };
  const goAdd = () => {
    router.push({
      path: '/app/incidentManage/add',
    });
  };
  const onDetails = (id) => {
    router.push({
      path: '/app/incidentManage/details',
      query: {
        id,
      },
    });
  };
</script>
<style lang="less" scoped>
  .app-em-wrap {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: #ffffff;
  }

  /deep/.ant-card-body {
    padding: 10px 15px 0;
  }
  /deep/.ant-card-bordered {
    border: none;
  }
  .list {
    border: 1px solid rgba(215, 215, 215, 1);
    border-radius: 5px;
    margin-bottom: 10px;
    padding: 10px;

    & > div:nth-child(1) {
      font-size: 16px;
      display: flex;
      justify-content: space-between;

      span {
        font-size: 14px;
      }
    }

    & > div:nth-child(2) {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      word-break: break-all;
    }

    div {
      span {
        color: #7f7f7f;
      }
    }
  }

  /deep/.ant-upload-list-item {
    padding: 0;
    border: none;
  }

  /deep/ .ant-upload-list-picture-card-container {
    margin: 0 8px 0 0;
  }

  .go-add {
    width: 60px;
    height: 60px;
    text-align: center;
    border-radius: 50%;
    color: #ffffff;
    background-color: #1890ff;
    position: fixed;
    bottom: 30px;
    right: 10px;

    span {
      margin-top: 8px;
      display: inline-block;
    }
  }
  /deep/ .ant-upload-list-picture-card-container {
    height: 90px !important;
    width: 90px !important;
  }
</style>
