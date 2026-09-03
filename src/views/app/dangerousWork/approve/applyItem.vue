<template>
    <div class="apply">
        <div class="title">选择申请类型</div>
        <div class="main">
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/elevation?workType=1">高处作业</router-link>
            </div>
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/hoisting?workType=2">吊装作业</router-link>
            </div>
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/finitude?workType=3">有线空间作业</router-link>
            </div>
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/breakGround?workType=5">动土作业</router-link>
            </div>
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/temporary?workType=6">临时用电作业</router-link>
            </div>
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/getAngry?workType=4">动火作业</router-link>
            </div>
            <div class="item">
                <router-link to="/app/dangerousWork/askdetail/getAngry?workType=7">长期动火作业</router-link>
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
.apply {
    width: 100%;
    height: 100%;
    padding: 15px;
    background-color: #ffffff;

    .title {
        font-size: 18px;
        font-weight: 600;
        padding: 10px;
    }

    .main {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .item {
            width: 45%;
            height: 35px;
            line-height: 35px;
            text-align: center;
            color: #ffffff;
            background-color: #1989fa;
            margin-bottom: 15px;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 600;
        }
    }

    a {
        color: #ffffff;
    }
}
</style>