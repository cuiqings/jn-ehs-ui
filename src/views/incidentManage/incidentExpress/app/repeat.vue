<template>
  <a-card>
    <div>
      <div class="repeat-header">同时间最近上报</div>
      <div class="repeat-container">
        <template v-if="listData.length > 0">
          <div v-for="item in listData" :key="item.id">
            <div
              ><p>事件类型：{{ item.type_dictText }}</p
              ><span style="color: red">{{ item.distanceTime }}h内</span></div
            >
            <div
              ><p>发生单位：{{ item.orgCode_dictText }}</p></div
            >
            <div
              ><p>发生时间：{{ item.eventTime }}</p></div
            >
            <div>
              <text-ellipsis rows="3" :content="item.description" expand-text="展开" collapse-text="收起" />
              <!-- <p class="repeat-container_ellipsis">事件描述：{{ item.description }}</p> -->
            </div>
            <div class="repeat-container_button"> <a-button type="primary" @click="onRepeatWithThis(item)">与此重复</a-button></div>
          </div>
        </template>
        <a-empty v-else />
      </div>
    </div>
  </a-card>
</template>
<script setup name="app-incident-repeat" lang="ts">
  import { ref, onMounted, reactive } from 'vue';
  import { list, queryById } from '../url/index';
  import { useRouter } from 'vue-router';
  import { TextEllipsis } from 'vant';
  const router = useRouter();
  const { currentRoute } = router;
  const listData = ref<any[]>([]);
  const record: any = reactive({});
  onMounted(async () => {
    await queryById({ id: currentRoute.value.query.id }).then((res) => {
      Object.assign(record, res);
    });
    await list({
      orderBy: 'event_time',
      pageNo: 1,
      pageSize: 4,
      startTime: time(record.eventTime),
      endTime: record.eventTime,
    }).then((res) => {
      const arr = res.records.filter((item: any) => {
        item.distanceTime = distanceTime(item.eventTime);
        item.description = '事件描述：' + item.description;
        return item.id !== record.id;
      });
      if (arr.length > 3) arr.pop();
      listData.value = arr;
    });
  });
  // 离当前事件距离多少小时
  const distanceTime = (date) => {
    const time1 = new Date(record.eventTime + ':00').getTime();
    const time2 = new Date(date + ':00').getTime();
    return Math.ceil((time1 - time2) / 3600000);
  };
  // 72小时
  const time = (date) => {
    const time = new Date(date + ':00').getTime();
    return timeDate(time - 259200000);
  };
  // 年月日时分
  const timeDate = (eventTime: string | number) => {
    const date = new Date(eventTime);
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return Y + M + D + h + m;
  };
  // 与此重复
  const onRepeatWithThis = (data) => {
    router.push({
      path: '/app/incidentManage/diff',
      query: {
        id: currentRoute.value.query.id,
        repeatId: data.id,
      },
    });
  };
</script>
<style lang="less" scoped>
  /deep/.ant-card-body {
    padding: 10px 15px 0;
  }
  .repeat-header {
    line-height: 50px;
  }
  .repeat-container {
    & > div {
      border: 1px solid rgba(215, 215, 215, 1);
      border-radius: 5px;
      padding: 10px;
      margin-bottom: 15px;
      div:nth-child(1) {
        display: flex;
        justify-content: space-between;
      }
      .repeat-container_ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .repeat-container_button {
        text-align: center;
      }
    }
  }
  /deep/ .ant-empty {
    width: 100%;
    border: none !important;
    margin: 0;
    padding: 0;
  }
  /deep/.van-text-ellipsis {
    margin-bottom: 15px;
  }
</style>
