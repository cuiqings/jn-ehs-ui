<template>
  <a-card>
    <div>
      <div class="repeatDiff-header">与此重复</div>
      <div ref="repeatWithThisRef"> </div>
    </div>
    <div class="repeatDiff-button"> <a-button type="primary" :loading="confirmDuplicateLoading" @click="confirmRepeat">确认重复</a-button></div>
  </a-card>
</template>
<script setup name="app-incident-repeatDiff" lang="ts">
  import { onMounted, reactive, h, ref, createApp } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { Avatar } from 'ant-design-vue';
  import { queryById, getOrganizationNew, buttonAdd } from '../url/index';
  import { useRouter } from 'vue-router';
  import { showFailToast, showSuccessToast } from 'vant';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import * as Diff from 'diff';
  const router = useRouter();
  const { currentRoute } = router;
  const info: any = reactive({});
  const info1: any = reactive({});
  const repeatWithThisRef = ref(null);
  const orgCodeArr = ref([]);
  const confirmDuplicateLoading = ref(false);
  const keyObj = [
    {
      key: 'orgCode',
      label: '发生单位：',
    },
    {
      key: 'result',
      label: '事件结果：',
    },
    {
      key: 'type',
      label: '事件类型：',
    },
    {
      key: 'eventTime',
      label: '发生时间：',
    },
    {
      key: 'description',
      label: '事件描述：',
    },
    {
      key: 'address',
      label: '事件地点：',
    },
    {
      key: 'photo',
      label: '现场照片：',
    },
    {
      key: 'reporterName',
      label: '上报人员：',
    },
    {
      key: 'createTime',
      label: '上报时间：',
    },
  ];
  onMounted(async () => {
    await getOrganizationNew().then((res) => {
      orgCodeArr.value = res;
    });
    await queryById({ id: currentRoute.value.query.id }).then((res) => {
      Object.assign(info, res);
    });
    await queryById({ id: currentRoute.value.query.repeatId }).then((res) => {
      Object.assign(info1, res);
    });
    const keys = Object.keys(info1);
    keys.forEach((key) => {
      if (key === 'orgCode') {
        const arry: any[] = orgCodeArr.value.filter((item: any) => item.orgCode === info.orgCode);
        info.orgCode = arry[0]?.departName;
        const arry1: any[] = orgCodeArr.value.filter((item: any) => item.orgCode === info1.orgCode);
        info1.orgCode = arry1[0]?.departName;
      }
      if (key === 'result') {
        info.result = renderDict(info.result, 'event_result');
        info1.result = renderDict(info1.result, 'event_result');
      }
      if (key === 'type') {
        info.type = renderDict(info.type, 'event_type');
        info1.type = renderDict(info1.type, 'event_type');
      }
    });
    await create_vode(info1, info, repeatWithThisRef);
  });
  const create_vode = (oldStr, newStr, _dom) => {
    const vode = h(
      'div',
      {
        style: { border: '1px solid rgba(215, 215, 215, 1)', borderRadius: '5px', padding: '10px' },
      },
      h(
        'div',
        {
          style: { padding: '10px 10px 0 10px' },
        },
        keyObj.map((item) => {
          const result = Diff.diffChars(oldStr[item.key], newStr[item.key]);
          let photoArr = [];
          if (item.key === 'photo') photoArr = oldStr[item.key] ? oldStr[item.key].split(',') : [];
          return h('p', null, [
            h('span', item.label),
            h(
              'span',
              {
                style: item.key === 'photo' ? 'display: block' : '',
              },
              item.key === 'photo'
                ? photoArr.map((ite) => {
                    return h(Avatar, {
                      src: getFileAccessHttpUrl(ite),
                      shape: 'square',
                      size: 80,
                      style: { margin: '10px' },
                    });
                  })
                : result.map((ite) => {
                    if (ite.remove || !ite.added) {
                      return h('span', { style: { color: ite.removed ? 'red' : '' } }, ite.value);
                    }
                  })
            ),
          ]);
        })
      )
    );
    createApp({ render: () => vode }).mount(_dom.value);
  };
  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  // 与此重复
  const confirmRepeat = () => {
    confirmDuplicateLoading.value = true;
    buttonAdd({
      eventId: info.id,
      type: 1,
      repeatEventId: info1.id,
      repeatEventName: info1.name,
    })
      .then((res) => {
        if (res.success) {
          showSuccessToast('提交成功！');
          router.push({
            path: '/app/incidentManage/details',
            query: {
              id: currentRoute.value.query.id,
            },
          });
        } else {
          showFailToast(res.message);
        }
      })
      .finally(() => {
        confirmDuplicateLoading.value = false;
      });
  };
</script>
<style lang="less" scoped>
  /deep/.ant-card-body {
    padding: 10px 15px 0;
  }
  .repeatDiff-header {
    line-height: 50px;
  }
  .repeatDiff-button {
    text-align: center;
    margin-top: 15px;
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
