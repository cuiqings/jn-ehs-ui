<!-- 共用列表项 -->
<template>
  <dl class="item" @click="openDetail">
    <dt>
      <img :src="getImgUrl(item)" />
    </dt>
    <dd>
      <div class="top">
        <span class="name_ban1_tip_0" v-if="item.status == 0">离线</span>
        <span class="name_ban1_tip_1" v-if="item.status == 1">在线</span>
        <span class="name_ban1_tip_2" v-if="item.status == 2">报警</span>
        <h3>{{ curItem.name }}</h3>
      </div>
      <div>所属机构：{{ curItem.departmentName || '未知部门' }}</div>
      <div>{{ curItem.deviceCategoryName || '未知分类' }}</div>
    </dd>
  </dl>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      btnText?: string;
      needBtn?: boolean;
      item: any;
      listType?: number;
    }>(),
    {
      listType: 1, // 1申请 2审批
      btnText: '处理',
      needBtn: true,
      item: () => {},
    }
  );

  const curItem = ref(props.item);
  const { needBtn, btnText, listType } = props;
  console.log('listType', listType);

  const getImgUrl = (item) => {
    let name = item.deviceFunctionCategoryName;
    let send_name = '99';
    if (item.status == 1) {
      send_name = getFullImgName(name);
    }
    if (item.status == 0) {
      send_name = getFullGrayImgName(name);
    }
    if (item.status == 2) {
      send_name = getFullRedImgName(name);
    }

    return send_name;
  };
  function getFullImgName(name) {
    let imgSrc = new URL(`../../../../assets/images/device/energy-collect-${getImgName(name)}.png`, import.meta.url).href;
    return imgSrc;
  }
  function getFullGrayImgName(name) {
    let imgSrc = new URL(`../../../../assets/images/device/energy-collect-gray-${getImgName(name)}.png`, import.meta.url).href;
    return imgSrc;
  }
  function getFullRedImgName(name) {
    let imgSrc = new URL(`../../../../assets/images/device/energy-collect-red-${getImgName(name)}.png`, import.meta.url).href;
    return imgSrc;
  }
  // 设备类别对应图标
  function getImgName(name) {
    let send_name = 'r1';
    if (name.indexOf('静电电阻') !== -1) {
      send_name = 'r1';
    } else if (name.indexOf('回转窑') !== -1) {
      send_name = 'r2';
    } else if (name.indexOf('甲烷气体') !== -1) {
      send_name = 'r3';
    } else if (name.indexOf('RTO') !== -1) {
      send_name = '6';
    } else if (name.indexOf('VOC') !== -1) {
      send_name = '7';
    } else if (name.indexOf('生物滴滤') !== -1) {
      send_name = '8';
    } else if (name.indexOf('可燃气体') !== -1) {
      send_name = 'r5';
    } else if (name.indexOf('燃烧炉') !== -1) {
      send_name = '3';
    } else if (name.indexOf('压差表') !== -1) {
      send_name = 'r4';
    } else {
      send_name = '2';
    }
    return send_name;
  }

  const emit = defineEmits(['itemClick', 'btnClick', 'delClick']);

  // 按钮事件
  const edit = (type) => {
    emit('btnClick', type);
  };

  // 删除
  const del = () => {
    emit('delClick');
  };

  // item卡片事件
  const openDetail = () => {
    emit('itemClick');
  };
</script>

<style lang="less" scoped>
  dl {
    display: flex;
    background-color: #ffffff;
    margin-bottom: 10px;
    border-radius: 5px;
    padding: 15px;
    dt,
    dd {
      padding: 0;
      margin: 0;
    }
    dt {
      width: 80px;
      height: 80px;
      margin-right: 10px;
      img {
        width: 80px;
        height: 80px;
      }
    }
    dd {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      overflow: hidden;
      .top {
        display: flex;
        align-items: center;
        span {
          font-size: 14px;
          color: #ffffff;
          margin-right: 10px;
          border-radius: 5px;
          width: 38px;
          height: 22px;
          text-align: center;
          background-color: #007aff;
          &.offline {
            background-color: #999999;
          }
          &.warn {
            background-color: #ff9900;
          }
        }
        .name_ban1_tip_0 {
          background: #dadcdf;
          color: rgba(0, 0, 0, 0.38);
          border-radius: 2px;
        }
        .name_ban1_tip_1 {
          background: rgba(51, 119, 243, 0.15);
          color: #3377f3;
          border-radius: 2px;
        }
        .name_ban1_tip_2 {
          background: rgba(205, 43, 29, 0.15);
          color: #cd2b1d;
          border-radius: 2px;
        }
      }
      h3 {
        flex: 1;
        font-size: 16px;
        font-weight: 600px;
        padding: 0;
        margin: 0;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        white-space: nowrap;
      }
    }
  }
</style>
