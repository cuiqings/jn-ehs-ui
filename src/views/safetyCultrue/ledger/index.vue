<template>
  <div class="safetyCulture-ledger">
    <div class="top">
      <div class="hd">安全理念学习区</div>
      <div class="main">
        <div class="item" v-for="item in listA" :title="item.playContent">
          <span class="tag"></span>
          {{ item.playContent }}
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="hd">安全活动公示区</div>
      <div class="main">
        <div class="left">
          <div class="content-wrap">
            <div class="content">
              <dl v-for="item in listB" @click="openDetail(item)">
                <dt v-if="item.file && item.file.length > 0">
                  <a-carousel :autoplay="true" style="width: 160px; height: 140px">
                    <div class="imgwrap" v-for="value in item.file">
                      <img :src="value" alt="" />
                    </div>
                  </a-carousel>
                </dt>
                <dd>
                  <div class="tit">{{ item.title }}</div>
                  <div class="info">
                    <div class="l">
                      <img src="../../../assets/images/icon/c.png" alt="" />
                      {{ item.playDate }}
                    </div>
                    <div class="l">
                      <img src="../../../assets/images/icon/l.png" alt="" />
                      {{ item.playLocation }}
                    </div>
                    <div class="h">
                      <img src="../../../assets/images/icon/h.png" alt="" />
                      {{ item.orgName }}
                    </div>
                  </div>
                  <div class="con" v-html="item.playContent">
                  </div>
                </dd>
              </dl>
            </div>
          </div>

          <div class="page">
            <a-pagination
              v-model:current="current"
              v-model:page-size="pageSize"
              :page-size-options="pageSizeOptions"
              :total="total"
              show-size-changer
              @showSizeChange="onShowSizeChange"
              @change="pageChange"
            >
              <template #buildOptionText="props">
                <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
                <span v-else>全部</span>
              </template>
            </a-pagination>
          </div>
        </div>
        <div class="right">
          <div class="rightinner">
            <div class="top">
              <a-carousel :autoplay="true" style="width: 100%; height: 300px">
                <div class="item" v-for="item in listC" @click="openDetail(item)">
                  <img :src="item.file[0]" alt="" />
                  <div class="content">
                    <div class="tit">{{ item.title }}</div>
                    <div class="main" v-html="item.playContent"></div>
                  </div>
                </div>
              </a-carousel>
            </div>
            <div class="b-r-bottom">
              <div class="item" v-for="item in listD" @click="openDetail(item)">
                <div class="tit">
                  <img v-if="item.file && item.file.length > 0" :src="item.file[0]" alt="">
                  {{ item.title }}
                </div>
                <div class="main" v-html="item.playContent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DetailModal @register="register" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { ledgerList, ledgerListPage } from '../api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import DetailModal from './detailModal.vue';
  import { Pagination } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  const APagination = Pagination;
  const listA = ref<any[]>([]);
  const listB = ref<any[]>([]);
  const listC = ref<any[]>([]);
  const listD = ref<any[]>([]);

  const [register, { openModal }] = useModal();
  onMounted(async () => {
    listA.value = await getData(1);
    computC();
    getledgerListPage();
  });

  const computC = async () => {
    const res = await getData(3);
    let arrA: any = [];
    let arrB: any = [];
    res.forEach((item) => {
      // 有图片
      if (item.isTop == 1) {
        arrA.push(item);
      } else {
        arrB.push(item);
      }
    });
    listC.value = arrA;
    listD.value = arrB;
    console.log(listC.value, listD.value);
  };

  const getData = async (type) => {
    const res = await ledgerList({ type: type });
    if ([2, 3].includes(type)) {
      res.forEach((item) => {
        if (item.file) {
          item.file = item.file.split(',');
          item.file = item.file.map((str) => getFileAccessHttpUrl(str));
        }
      });
      console.log(type, res);
    }
    return res;
  };
  const getledgerListPage = async () => {
    const res = await ledgerListPage({
      type: 2,
      pageNo: current.value,
      pageSize: pageSize.value,
    });
    res.records &&
      res.records.forEach((item) => {
        if (item.file) {
          item.file = item.file.split(',');
          item.file = item.file.map((str) => getFileAccessHttpUrl(str));
        }
      });
    listB.value = res.records;
    total.value = res.total;
  };

  const pageSizeOptions = ref<string[]>(['10', '20', '30', '40', '50']);
  const current = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const onShowSizeChange = (current: number, size: number) => {
    pageSize.value = size;
    getledgerListPage();
  };
  const pageChange = async (pageNo: number) => {
    current.value = pageNo;
    getledgerListPage();
  };

  const openDetail = (item) => {
    openModal(true, {title: '安全文化活动', data: item});
  };
</script>
<style lang="less" scoped>
  dl,
  dd,
  dt {
    margin: 0;
    padding: 0;
  }
  .safetyCulture-ledger {
    width: 100%;
    height: calc(100vh - 98px);
    background-color: #ffffff;
    overflow: hidden;
    padding: 0 16px;
    .hd {
      height: 50px;
      line-height: 50px;
      font-size: 18px;
      font-weight: 600;
      padding-left: 10px;
      display: flex;
      align-items: center;
      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 20px;
        background-color: #37acf0;
        margin-right: 10px;
      }
    }
    .top {
      height: 270px;
      .main {
        height: 220px;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        .item {
          width: calc(25% - 10px);
          height: 45px;
          border: 1px solid #e5e5e5;
          line-height: 45px;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 16px;
          padding-left: 38px;
          border-radius: 8px;
          margin: 0 5px;
          margin-bottom: 10px;
          position: relative;

          border-radius: 8px;
          /* 反向阴影：左上暗 + 右下亮 */
          box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8);

          .tag {
            /* 基础圆形样式 */
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border-radius: 50%; /* 关键：设置为50%变成圆形 */
            background-color: rgba(135, 194, 253, 0.5); /* 主色调（可自定义） */
            /* 应用脉动动画 */
            animation: pulse 2s infinite ease-in-out;
            &::before {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate3D(-50%, -50%, 0);
              content: '';
              width: 13px;
              height: 13px;
              border-radius: 50%; /* 关键：设置为50%变成圆形 */
              background-color: #409eff; /* 主色调（可自定义） */
            }
          }

          /* 定义脉动关键帧：缩放 + 透明度变化 */
          @keyframes pulse {
            0% {
              transform: translateY(-50%) scale(1); /* 初始大小 */
              opacity: 1; /* 初始透明度 */
            }
            50% {
              transform: translateY(-50%) scale(1.2); /* 放大到1.2倍（可调整） */
              opacity: 0.7; /* 半透明 */
            }
            100% {
              transform: translateY(-50%) scale(1); /* 还原大小 */
              opacity: 1; /* 还原透明度 */
            }
          }
        }
      }
    }
    .bottom {
      height: calc(100% - 270px);
      overflow: hidden;
      .main {
        display: flex;
        height: calc(100% - 50px);
        overflow: hidden;
        .left {
          width: 65%;
          height: 100%;
          padding: 16px;
          padding-bottom: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          .content-wrap {
            flex: 1;
            width: 100%;
            overflow: hidden;
            .content {
              height: 100%;
              width: calc(100% + 10px);
              padding-right: 10px;
              overflow-y: auto;
            }
          }

          .page {
            height: 42px;
            width: 100%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-right: 6px;
          }
          dl {
            display: flex;
            height: 120px;
            margin-bottom: 16px;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            overflow: hidden;

            box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8);

            dt {
              .imgwrap {
                width: 160px;
                height: 140px;
                img {
                  width: 160px;
                  height: 140px;
                }
              }
            }
            dd {
              padding: 10px 16px;
              .tit {
                font-size: 17px;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .info {
                display: flex;
                align-items: center;
                padding-top: 10px;
                div {
                  display: flex;
                  align-items: center;
                  margin-right: 10px;
                }
                img {
                  width: 16px;
                  height: 16px;
                  margin-right: 5px;
                }
                div:nth-child(1) {
                  img {
                    width: 18px;
                    height: 18px;
                    margin-right: 5px;
                  }
                }
              }
              .con {
                font-size: 14px;
                color: #999999;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                text-overflow: ellipsis;
                overflow: hidden;
                line-height: 20px;
                margin-top: 10px;
                :dedp(img){
                  display: none;
                }
              }
            }
          }
        }
        .right {
          width: 35%;
          height: 100%;
          overflow: hidden;
          .rightinner{
            width: calc(100% + 10px);
            height: 100%;
            padding: 16px 0;
            overflow-y: auto;
            padding-right: 10px;
          }
          .item {
            height: 260px;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1); /* 关键：低透明度 + 小偏移 */
            img {
              width: 100%;
              height: 100%;
            }
            .content {
              width: 100%;
              height: 120px;
              color: #00ff00;
              padding: 10px 16px;
              position: absolute;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.6);
              .tit {
                font-size: 17px;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #ffffff;
                margin-bottom: 10px;
              }
              .main {
                color: aliceblue;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                text-overflow: ellipsis;
                overflow: hidden;
                line-height: 20px;
                :deep(img){
                  display: none !important;
                }
              }
            }
          }
          .b-r-bottom {
            display: flex;
            flex-wrap: wrap;
            .item {
              width: calc(50% - 4px);
              height: 120px;
              margin-bottom: 16px;
              margin: 5px 0;
              box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8);
              padding: 10px;
              border: 1px solid #e5e5e5;
              .tit {
                font-size: 17px;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                img{
                  width: 38px;
                  height: 38px;
                  margin-right: 10px;
                  border-radius: 50%;
                }
              }
              .main {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                text-overflow: ellipsis;
                overflow: hidden;
                line-height: 20px;
                :deep(img){
                  display: none !important;
                }
              }
            }
            .item:nth-child(odd) {
              margin-right: 8px;
            }
          }
        }
      }
    }
  }
  :deep(.ant-carousel .slick-dots-bottom) {
    bottom: 0 !important;
  }
</style>
