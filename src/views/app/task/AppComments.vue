<template>
    <div class='pageComments'>
        <section>
            <CommentList :tableName="route.query.tableName"
                :dataId="route.query.dataId"
                :allHeight="allHeight"
                :commentHeight="allHeight-240"
                :datetime="route.query.datetime" />
        </section>
        <!-- <section>
            <dl class="comments-list">
                <dt class="comments-dt">
                    <div class="surname" :style="{ backgroundColor: getRandomColor() }">张</div>
                </dt>
                <dd class="comments-dd">
                    <div class="comments-box">
                        <div class="list-information">
                            <div class="commentators">
                                <span>六号线-热工制造部-张嘻嘻</span> <br />
                                <span>2023-03-12 18:02</span>
                            </div>
                            <van-button class="reply" color="#1F7CF8" plain size="mini">回复</van-button>
                        </div>
                        <p class="illustrate">
                            Lorem ipsum dolor sit amet, consecteturadipiscing elit.Aenean mpor.Sociis .
                        </p>
                        <p class="comments-img">
                            <img src="../../../assets/images/epInfo/picture.png" alt="">
                            <img src="../../../assets/images/epInfo/picture.png" alt="">
                        </p>
                    </div>
                    子评论 
                    <dl class="child-dl">
                        <dt class="child-dt">
                            <div class="child-surname" :style="{ backgroundColor: getRandomColor() }">林</div>
                        </dt>
                        <dd class="child-dd">
                            <div class="child-information">
                                <div class="child-commentators">
                                    <span>六号线-热工制造部-张嘻嘻</span> <br />
                                    <span>2023-03-12 18:02</span>
                                </div>
                                <van-button class="child-reply" color="#1F7CF8" plain size="mini">回复</van-button>
                            </div>
                            <p class="child-illustrate">
                                Lorem ipsum dolor sit amet, consecteturadipiscing elit.Aenean mpor.Sociis .
                            </p>
                        </dd>
                    </dl>
                </dd>
            </dl>
        </section> -->
        <!-- <footer @click="addComment">
            添加评论
        </footer>
        <van-popup
            v-model:show="showComment"
            position="bottom"
            :style="{ height: '80%' }"
            closeable
            @click-close-icon="onClickCloseIcon"
        >      
        </van-popup> -->
    </div>
</template>

<script setup lang='ts'>
import CommentList from '/@/components/jeecg/comment/CommentList.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
const randomColor = ref(['#1F7CF8', '#00f0f0', '#09C199', '#ffff00', '#ff00ff']);
const showComment = ref(false);

//添加评论
const addComment = () => {
    showComment.value = true;
};
//X关闭评论弹出层
const onClickCloseIcon = () => {
    console.log('X');
};

onMounted(() => {
    getRandomColor();
});
//随机背景色
function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * randomColor.value.length);
    return randomColor.value[randomIndex];
};
const allHeight = document.body.clientHeight;
// const randomBackgroundColor = computed(() => {
//     return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
// });
</script>

<style lang='less' scoped>
.pageComments {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
        flex: 1;
        overflow: auto;
        background: #EFF1F5;
        height: 100%;
        .comments-list {
            width: 100%;
            display: flex;
            background: white;
            padding: 3%;

            .comments-dt {
                width: 60px;

                .surname {
                    width: 29px;
                    height: 29px;
                    text-align: center;
                    line-height: 29px;
                    border-radius: 50%;
                    color: white;
                    // background: #ff0000;
                }
            }

            .comments-dd {
                .list-information {
                    display: flex;
                    justify-content: space-between;

                    .reply {
                        width: 50px;
                    }
                }

                .comments-img {
                    display: flex;

                    img {
                        width: 100px;
                        height: 60px;
                    }
                }

                //子评论
                .child-dl {
                    font-size: 13px;
                    display: flex;

                    .child-dt {
                        width: 46px;

                        .child-surname {
                            width: 23px;
                            height: 23px;
                            text-align: center;
                            line-height: 23px;
                            border-radius: 50%;
                            color: white;
                            // background: #09C199;
                        }
                    }

                    .child-dd {
                        .child-information {
                            display: flex;
                            justify-content: space-between;

                            .child-reply {
                                width: 46px;
                            }
                        }
                    }
                }
            }
        }
    }

    footer {
        width: 100%;
        height: 50px;
        color: #1F7CF8;
        line-height: 50px;
        text-align: center;
        background-color: white;
    }
}
</style>