<template>
  <div class="historyReport">
    <section>
      <van-collapse v-model="activeNames">
        <van-collapse-item v-for="(v, i) in historyData" :key="i" :name="i" :is-link="false">
          <template #title>
            <div
              >汇报周期：{{ format(v.reportTime) }} <span class="rep-over">{{ v.overtimeLimit ? '超期' : '' }}</span>
            </div>
          </template>
          <div v-if="!v.canReport" class="report-text">
            <p>汇报时间：{{ v.reportCycle }}</p>
            <p>完成说明：{{ v.finishExplain }}</p>
            <p>
              <a class="upload-file" href="#">{{ v.attachmentFile }}</a>
            </p>
            <!-- 收展 -->
            <p
              ><a
                >汇报记录 <span @click="onClose">{{ close == false ? '展开' : '收起' }}</span></a
              ></p
            >
            <div :class="close == true ? 'recording' : 'hide'">
              <dl>
                <dt>{{ v.createTime }}</dt>
                <dd>
                  验收结果：{{ v.checkExplain }}<br />
                  验收人：{{ v.checkPeopleName }}
                </dd>
              </dl>
            </div>
          </div>
          <div v-else class="no-report">
            <span class="norep">未汇报</span>
            <van-button type="primary" size="mini">补交</van-button>
          </div>
        </van-collapse-item>
      </van-collapse>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { historyList } from './appTask.api';
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  const router = useRouter();
  const route = useRoute();
  const activeNames = ref(['1']);
  const close = ref(false); //收展
  const onClose = () => {
    //取反
    close.value = !close.value;
  };
  const publishId = route.query.id;
  const historyData = ref([]);

  onHistory(publishId);
  async function onHistory(publishId) {
    await historyList(publishId).then((res) => {
      //console.log(res);
      historyData.value = res;
    });
  }

  //时间的拆分
  function format(time) {
    if (time) {
      const [year, month, day] = time.split('-');
      const newTime = `${year}年${month}月${day}日`;
      return newTime;
    }
  }
</script>

<style lang="less" scoped>
  .historyReport {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
      flex: 1;
      overflow: auto;
      background: #eff1f5;

      :deep(.van-collapse-item__content) {
        background-color: #eff1f5;
      }

      .rep-over {
        margin-left: 1%;
        color: #d0372a;
      }

      .report-text {
        width: 100%;
        color: #333;

        .recording {
          width: 100%;
          dl {
            display: flex;
            dt {
              margin-right: 1%;
            }
          }
        }

        .upload-file {
          border-bottom: 1px solid #1f7cf8;
        }
      }
      .no-report {
        width: 100%;
        height: 30px;
        display: flex;
        align-items: center;
        .norep {
          color: #d0372a;
          margin-right: 3%;
        }
      }

      //隐藏
      .hide {
        display: none;
      }
    }
  }
</style>
