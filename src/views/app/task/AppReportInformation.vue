<template>
    <div class="reportInformation">
        <section>
            <van-collapse v-model="activeNames">
                <van-collapse-item name="1" :is-link="false">
                    <template #title>
                        <div>汇报周期：2023年02月28日 </div>
                    </template>
                    <div class="report-text">
                        <dl class="text-dl">
                            <dt class="text-dt">责任单位：</dt>
                            <dd class="text-dd">
                                <p class="line">一号线</p>
                                <p>汇报时间：2023-02-26</p>
                                <p>完成说明：熔炼工序：熔炼炉8套；涂装工序:2套喷粉线＋2套喷漆线（12座喷漆房）臭氧管控措施。</p>
                                <p>
                                    <a class="upload-file" href="#">汇报内容上传文件.docx</a>
                                </p>
                                <p><a>汇报记录 <span @click="onClose">{{ close==false ? '展开' : '收起' }}</span></a></p>
                                <!-- 收展 -->
                                <dl :class="close==true ? '' : 'hide'">
                                    <dt>2022-09-19 12:01</dt>
                                    <dd>
                                        <p>验收结果：通过</p>
                                        <p>验收人：安环部环境科-马克思</p>
                                    </dd>
                                </dl>
                            </dd>
                        </dl>
                    </div>
                </van-collapse-item>
                <van-collapse-item name="2" :is-link="false">
                    <template #title>
                        <div>汇报周期：2023年02月28日 </div>
                    </template>
                    技术无非就是那些开发它的人的共同灵魂。
                </van-collapse-item>
            </van-collapse>
        </section>
    </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
const activeNames = ref(['1']);
const close = ref(false); //收展
const onClose=()=>{
    //取反
    close.value = !close.value;
};
</script>

<style lang='less' scoped>
.reportInformation {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
        flex: 1;
        overflow: auto;
        background: #EFF1F5;
        :deep(.van-collapse-item__content) {
            background-color: #EFF1F5;
        }

        .report-text {
            width: 100%;

            .text-dl {
                width: 100%;
                display: flex;

                .text-dt {
                    width: 100px;
                    text-align: center;
                }

                .text-dd {
                    flex: 1;
                    color: #666;

                    .line {
                        color: black;
                        font-weight: 530;
                    }

                    .upload-file {
                        border-bottom: 1px solid #1F7CF8;
                    }
                }
            }
        }
        //隐藏
        .hide {
            display: none;
        }
    }
}
</style>