<template>
  <div class="legal-consultation" v-if="viewId === ''">
    <!-- 左侧历史记录面板 -->
    <div class="history-panel">
      <div class="header">
        <img src="/@/assets/images/law/logo.png" class="logo" alt="logo" />
        <span class="title">心安智问大模型</span>
        <EditOutlined class="new-chat-btn" @click="newPainting" />
      </div>
      <a-divider>历史记录</a-divider>
      <div class="history-list">
        <div
          v-for="(item, index) in historyData"
          :key="index"
          class="history-item"
          :class="{ active: item.id == $ls.get('aiSearchId')?.id }"
          @click="handleHistory(item.id)"
        >
          <p>{{ item.title }}</p>
        </div>
      </div>
    </div>
    <!-- 右侧聊天面板 -->
    <div class="chat-panel">
      <div :style="{ height: contentHeight }" ref="contentRef" v-if="!spinning" class="chat-content">
        <!-- 欢迎页面 -->
        <div v-if="isShow" class="welcome-page">
          <div class="welcome-content">
            <div class="welcome-title">
              <img src="/@/assets/images/law/logo.png" class="logo" alt="logo" />
              <div>你好，我是心安智问大模型</div>
              <span>使用心安智问大模型，法律法规查询一键搞定</span>
            </div>
            <div class="quick-actions">
              <div class="action-row">
                <div class="action-card" @click="handleNavSearch('哪些法规文件中规定了生产安全第一责任人？')">
                  <div class="action-title">法规出处</div>
                  <div class="action-desc">哪些法规文件中规定了生产安全第一责任人？</div>
                </div>
                <div class="action-card" @click="handleNavSearch('排放污染物的行政处罚办法？')">
                  <div class="action-title">合规查询</div>
                  <div class="action-desc">排放污染物的行政处罚办法？</div>
                </div>
              </div>
              <div class="action-row">
                <div class="action-card" @click="handleNavSearch('今天员工搬运货物时不小心受伤了，应该怎么做？')">
                  <div class="action-title">应急查询</div>
                  <div class="action-desc">今天员工搬运货物时不小心受伤了，应该怎么做？</div>
                </div>
                <div class="action-card" @click="handleNavSearch('危险化学品目录包括哪些？')">
                  <div class="action-title">目录查询</div>
                  <div class="action-desc">危险化学品目录包括哪些？</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天记录 -->
        <div v-else class="chat-messages">
          <div v-for="(item, index) in searchHistory" :key="index" :class="['message', item.role === 'assistant' ? 'assistant' : 'user']">
            <template v-if="item.role === 'assistant'">
              <img src="/@/assets/images/law/logo.png" style="width: 45px; height: 40px" alt="assistant" />
              <div class="message-content">
                <div class="thinking-header" @click="changeCollapse(item)" v-if="item.content">
                  已经深度思考
                  <div class="collapse-icon">
                    <UpOutlined v-if="item.isCollapse" />
                    <DownOutlined v-else />
                  </div>
                </div>
                <div class="thinking-content" v-if="item.isCollapse && item.content">
                  <div class="thinking-line"></div>
                  <div v-if="!Typing && searchHistory.length - 1 === index" id="currentText"></div>
                  <div v-else v-html="mdFilter(item.content)"></div>
                </div>

                <div class="answer-content" v-if="item.isThink">
                  <div v-if="!Typing && searchHistory.length - 1 === index" id="currentText1"></div>
                  <div v-else v-html="mdFilter(item.content1)"></div>
                </div>

                <div v-if="item.linkAnswerList.length > 0 && item.isFile && item.content1 != '根据已知信息无法回答该问题。'" class="reference-files">
                  <div class="reference-header" @click="changeCollapse1(item, index)">
                    {{ '找到了' + item.linkAnswerList.length + '份文件作为参考：' }}
                    <UpOutlined v-if="item.isCollapse1" class="collapse-icon" />
                    <DownOutlined v-else class="collapse-icon" />
                  </div>
                  <div class="reference-content" v-if="item.isCollapse1">
                    <div v-for="ite in item.linkAnswerList" :key="ite.meta_id" class="reference-item">
                      <span class="file-title" @click="handleDetails(ite.meta_id)"> {{ '<<' + ite.meta_file_name + '>>' }} </span>
                      <span v-html="mdFilter(ite.content_chunk)"></span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="user-message">{{ item.content }}</div>
              <img src="/@/assets/images/law/user.png" class="avatar" alt="user" />
            </template>
          </div>

          <!-- 加载状态 -->
          <div class="message assistant" v-if="!isLoading">
            <img src="/@/assets/images/law/logo.png" style="width: 45px; height: 40px" alt="assistant" />
            <div class="message-content">
              <div class="thinking-header">深度思考中...</div>
              <div><loading-outlined class="loading-icon" /></div>
            </div>
          </div>
        </div>
      </div>
      <div class="knowledge">
        <div
          :class="knowledgeValue.includes(item.id) ? 'knowledge-active' : ''"
          v-for="item in knowledgeOptions"
          :key="item.id"
          @click="handleChange(item.id)"
        >
          <span style="display: flex; align-items: center"
            ><span style="font-size: 20px; margin-right: 5px" class="iconify" data-icon="mynaui:book-open" data-inline="false"></span
            >{{ item.kb_name }}</span
          >
        </div>
      </div>
      <!-- 输入区域 -->
      <div class="input-area" v-if="!spinning">
        <div class="input-wrapper">
          <InputTextArea
            id="inputTextArea"
            v-model:value="text"
            placeholder="请输入问题，Enter发送，Shift+Enter换行"
            :auto-size="autoSize"
            @input="handleInput"
            @keydown="handleKeyup"
          />
        </div>
        <div class="disclaimer"> 内容由AI智能模型生成，无法确保真实准确，仅供参考 </div>
        <img v-if="isSendBtn" class="send-btn" src="/@/assets/images/law/enter.png" @click="handleSend" alt="send" />
        <loading-outlined v-else class="send-btn loading" />
      </div>

      <a-spin tip="加载中..." :spinning="spinning" />
    </div>
  </div>
  <ai-view :id="viewId" v-if="viewId !== ''" @success="handleSuccess" :scrollTop="scrollTop" />
</template>

<script setup name="legal-legalConsultation" lang="ts">
  import { ref, onMounted, nextTick, watch, onDeactivated } from 'vue';
  import { Input } from 'ant-design-vue';
  import { getHistory, addHistory, getHistoryById, aiGetToken } from './url/index';
  import { LoadingOutlined, UpOutlined, DownOutlined, EditOutlined } from '@ant-design/icons-vue';
  import { createLocalStorage } from '/@/utils/cache';
  import { defHttp } from '/@/utils/http/axios';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getAiToken } from '/@/utils/auth';
  import { useUserStore } from '/@/store/modules/user';
  import MarkdownIt from 'markdown-it';
  import aiView from './view.vue';
  import TypeIt from 'typeit';
  const InputTextArea = Input.TextArea;
  const userStore = useUserStore();
  const contentHeight = ref('calc(100vh - 336px)');
  const spinning = ref(false);
  const text = ref('');
  const autoSize = ref(true);
  const isShow = ref(true);
  const isSendBtn = ref(true);
  const isLoading = ref(true);
  const historyData: any = ref([]);
  const searchHistory: any = ref([]);
  const viewId = ref('');
  const Typing = ref(true);
  const contentRef = ref();
  const scrollTop = ref(0);
  const $ls = createLocalStorage();
  const timer: any = ref(null);
  // 初始化 MarkdownIt 实例
  const md = new MarkdownIt();
  const knowledgeValue = ref([1]);
  const knowledgeOptions: any = ref([]);
  watch(
    () => searchHistory.value,
    () => {
      nextTick(() => {
        contentRef.value.scrollTop = contentRef.value.scrollHeight;
      });
    }
  );
  const handleInput = (event) => {
    const inputTextAreaDom: any = document.getElementById('inputTextArea');
    inputTextAreaDom.style.height = '80px';
    if (event.target.scrollHeight <= 191) {
      autoSize.value = true;
      inputTextAreaDom.style.height = event.target.scrollHeight;
      contentHeight.value = `calc(100vh - ${event.target.scrollHeight + 258}px)`;
    } else {
      autoSize.value = false;
    }
  };
  const handleKeyup = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 阻止默认的 Enter 行为
      if (isSendBtn.value) handleSend();
    }
  };
  // 过滤
  const mdFilter = (text) => {
    return md.render(text).replace(/&ensp;/g, ' ');
    // .replace(/\n/g, '<br/>');
  };
  const addHis = async (content) => {
    const id = generateId();
    if (!$ls.get('aiSearchId')) {
      $ls.set('aiSearchId', { id });
    }
    addHistory({
      largeModelId: $ls.get('aiSearchId') ? $ls.get('aiSearchId')?.id : id,
      content,
    }).then(() => {
      initHistory();
    });
  };
  const handleSend = async () => {
    if (text.value.length > 0) {
      isShow.value = false;
      isSendBtn.value = false;
      isLoading.value = false;
      Typing.value = false;
      let queryText = text.value;
      text.value = '';
      // 重置高度
      const inputTextAreaDom: any = document.getElementById('inputTextArea');
      inputTextAreaDom.style.height = '80px';
      contentHeight.value = 'calc(100vh - 336px)';
      const data = [
        {
          role: 'user',
          content: queryText,
          linkAnswerList: [],
        },
      ];
      // 数据
      const aiSearchHistory = $ls.get('aiSearchHistory');
      if (aiSearchHistory) {
        const data1 = aiSearchHistory.data.concat(data);
        $ls.set('aiSearchHistory', { data: data1 });
        searchHistory.value = data1.map((item) => {
          if (item.role === 'assistant') {
            item.isCollapse = true;
            item.isThink = true;
            item.isFile = true;
            item.isCollapse1 = true;
          }
          return item;
        });
      } else {
        $ls.set('aiSearchHistory', { data });
        searchHistory.value = data;
      }
      const _data = JSON.parse(JSON.stringify(data));
      _data[0] = JSON.stringify(_data[0]);
      await addHis(_data);
      defHttp
        .post(
          {
            url: '/chat',
            data: {
              sid: '2',
              question: queryText,
              kb_id_list: knowledgeValue.value,
              top_k: '2',
              history: [],
            },
            headers: {
              'x-auth-token': getAiToken(),
            },
          },
          {
            isTransformResponse: false,
            apiUrl: useGlobSetting().aiUrl,
            withToken: false,
          }
        )
        .then(async (res) => {
          if (res.status === 'success') {
            let linkAnswerList = [];
            if (Array.isArray(res.cite_docs)) {
              linkAnswerList = res.cite_docs.map((item) => {
                item.content_chunk = item.content_chunk.replace(/<标题>.*?<\/标题>|<标题><\/标题>/g, '');
                return item;
              });
            }
            const answerData = [
              {
                role: 'assistant',
                content: null,
                content1: res.response,
                isCollapse: true,
                isCollapse1: false,
                isThink: false,
                isFile: false,
                linkAnswerList: linkAnswerList,
              },
            ];
            const _answerData = JSON.parse(JSON.stringify(answerData));
            _answerData[0] = JSON.stringify(_answerData[0]);
            await addHis(_answerData);
            // 更新当前会话缓存内容
            const aiSearchHistory1 = $ls.get('aiSearchHistory');
            if (aiSearchHistory1) {
              const answerData1 = aiSearchHistory1.data.concat(answerData);
              searchHistory.value = answerData1.map((item, index) => {
                if (item.role === 'assistant') {
                  item.isCollapse = true;
                  item.isThink = index !== answerData1.length - 1;
                  item.isCollapse1 = index !== answerData1.length - 1;
                  item.isFile = index !== answerData1.length - 1;
                }
                return item;
              });
              const answerHtml = mdFilter(res.response);
              nextTick(() => {
                timer.value = setInterval(() => {
                  contentRef.value.scrollTop = contentRef.value.scrollHeight;
                }, 500);
                searchHistory.value = searchHistory.value.map((item, index) => {
                  if (index === searchHistory.value.length - 1) {
                    item.isThink = true;
                  }
                  return item;
                });
                $ls.set('aiSearchHistory', { data: searchHistory.value });
                nextTick(() => {
                  new TypeIt('#currentText1', {
                    strings: [answerHtml],
                    speed: 10,
                    cursor: false,
                    lifeLike: false,
                    html: true,
                    waitUntilVisible: true,
                    afterComplete: () => {
                      Typing.value = true;
                      searchHistory.value = searchHistory.value.map((item, index) => {
                        if (index === searchHistory.value.length - 1) {
                          item.isCollapse1 = true;
                          item.isFile = true;
                        }
                        return item;
                      });
                      isSendBtn.value = true;
                      clearInterval(timer.value);
                    },
                  }).go();
                });
              });
            }
          }
        })
        .catch(() => {
          isSendBtn.value = true;
        })
        .finally(() => {
          isLoading.value = true;
        });
    }
  };
  // ai登陆
  const initAiToken = async () => {
    aiGetToken().then(async (res) => {
      if (res) {
        userStore.setAiToken(res);
        await initKnowledge();
      }
    });
  };
  const initKnowledge = async () => {
    defHttp
      .get(
        {
          url: '/kb/list',
          headers: {
            'x-auth-token': getAiToken(),
          },
        },
        {
          isTransformResponse: false,
          apiUrl: useGlobSetting().aiUrl,
          withToken: false,
        }
      )
      .then((res) => {
        if (res.status === 'success') {
          knowledgeOptions.value = res.kb_list.filter((item) => ['企业知识库', '法律法规'].includes(item.kb_name)).sort((a, b) => a.id - b.id);
        }
      });
  };
  onMounted(() => {
    initAiToken();
    // 获取当前会话历史记录
    const aiSearchHistory = $ls.get('aiSearchHistory');
    if (aiSearchHistory) {
      searchHistory.value = aiSearchHistory.data.map((item) => {
        if (item.role === 'assistant') {
          item.isCollapse = true;
          item.isThink = true;
          item.isFile = true;
          item.isCollapse1 = true;
        }
        return item;
      });
      isShow.value = false;
    } else isShow.value = true;
    // 获取历史记录
    initHistory();
  });
  // nav查询
  const handleNavSearch = (navText) => {
    text.value = navText;
    handleSend();
  };
  // 历史
  const initHistory = () => {
    getHistory().then((res) => {
      if (res) {
        historyData.value = res;
      }
    });
  };
  // 历史查询
  const handleHistory = (id) => {
    spinning.value = true;
    getHistoryById({ id })
      .then((res) => {
        if (res) {
          spinning.value = false;
          isShow.value = false;
          $ls.set('aiSearchId', { id });
          searchHistory.value = res.map((item) => {
            item = JSON.parse(item);
            if (item.role === 'assistant') {
              item.isCollapse = true;
              item.isThink = true;
              item.isFile = true;
              item.isCollapse1 = true;
            }
            return item;
          });
          $ls.set('aiSearchHistory', { data: searchHistory.value });
        }
      })
      .finally(() => {
        spinning.value = false;
      });
  };
  // 相关文件详情
  const handleDetails = (id) => {
    viewId.value = id;
    scrollTop.value = contentRef.value.scrollTop;
  };
  const handleSuccess = () => {
    viewId.value = '';
    nextTick(() => {
      contentRef.value.scrollTop = scrollTop.value;
    });
  };
  const changeCollapse = (data) => {
    data.isCollapse = !data.isCollapse;
  };
  const changeCollapse1 = (data, index) => {
    data.isCollapse1 = !data.isCollapse1;
    nextTick(() => {
      if (searchHistory.value.length - 1 === index) contentRef.value.scrollTop = contentRef.value.scrollHeight;
    });
  };
  function generateId() {
    return new Date().getTime();
  }
  // 新会话
  const newPainting = () => {
    $ls.remove('aiSearchHistory');
    const id = generateId();
    $ls.set('aiSearchId', { id });
    isShow.value = true;
  };
  const handleChange = (value) => {
    if (knowledgeValue.value.includes(value)) {
      if (knowledgeValue.value.length > 1) {
        knowledgeValue.value = knowledgeValue.value.filter((item) => item !== value);
      }
    } else {
      knowledgeValue.value.push(value);
    }
  };
  onDeactivated(() => {
    userStore.setAiToken('');
  });
</script>

<style lang="less" scoped>
  .legal-consultation {
    height: 100%;
    display: flex;
    background-color: #f5f5f9;

    // 左侧历史记录面板
    .history-panel {
      width: 20%;
      height: 100%;
      background-color: #f5f5f9;
      padding: 10px;
      border-right: 1px solid #e8e8e8;

      .header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 40px 0;

        .logo {
          width: 55px;
          height: 50px;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
          margin-left: 10px;
        }

        .new-chat-btn {
          margin-left: 20px;
          cursor: pointer;
          color: rgb(23, 130, 210);
          transition: color 0.3s;
          font-size: 20px;
          &:hover {
            color: darken(rgb(23, 130, 210), 10%);
          }
        }
      }

      .history-list {
        padding: 0 20px;
        height: calc(100vh - 294px);
        overflow: auto;

        .history-item {
          padding: 10px;
          cursor: pointer;
          border-radius: 5px;
          margin-bottom: 10px;
          transition: background-color 0.3s;

          &:hover {
            background-color: rgb(219, 234, 254);
          }

          &.active {
            background-color: rgb(219, 234, 254);
          }

          p {
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    // 右侧聊天面板
    .chat-panel {
      width: 80%;
      height: 100%;
      background-color: rgb(237, 237, 242);
      padding-top: 60px;
      display: flex;
      flex-direction: column;

      .chat-content {
        height: calc(100vh - 336px);
        overflow: auto;
        padding: 0 125px 0 130px;
      }

      // 欢迎页面
      .welcome-page {
        padding: 0 45px 0 40px;
        .welcome-content {
          background-color: #fff;
          border-radius: 8px;
          padding: 20px;

          .welcome-title {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            .logo {
              width: 55px;
              height: 50px;
            }
            div {
              font-size: 28px;
              font-weight: bold;
              margin-right: 20px;
            }

            span {
              font-size: 14px;
              color: #666;
            }
          }

          .quick-actions {
            .action-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;

              .action-card {
                width: 49%;
                background-color: rgb(231, 238, 250);
                border-radius: 8px;
                padding: 20px;
                cursor: pointer;
                transition: transform 0.3s;

                &:hover {
                  transform: translateY(-2px);
                }

                .action-title {
                  font-weight: bold;
                  margin-bottom: 10px;
                }

                .action-desc {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
          }
        }
      }

      // 聊天消息
      .chat-messages {
        .chat-title {
          position: absolute;
          top: 15px;
          width: calc(77% - 200px);
          text-align: center;
          font-size: 18px;
          font-weight: bold;
        }
        .message {
          display: flex;
          margin-bottom: 15px;
          max-width: calc(100% - 40px);

          &.user {
            margin-left: 40px;
            justify-content: flex-end;

            .user-message {
              background-color: #2db7f5;
              color: #fff;
              border-radius: 8px;
              padding: 15px 20px;
              font-size: 16px;
            }

            .avatar {
              margin-left: 10px;
              margin-top: 12px;
              width: 30px;
              height: 30px;
            }
          }
          &.assistant {
            .avatar {
              margin-right: 5px;
              margin-top: 3px;
              width: 35px;
              height: 35px;
            }

            .message-content {
              .thinking-header {
                cursor: pointer;
                margin-bottom: 12px;
                font-size: 12px;
                line-height: 18px;
                background-color: rgb(245, 245, 245);
                user-select: none;
                border-radius: 10px;
                padding: 7px 14px;
                display: flex;
                align-items: center;
                width: fit-content;

                .collapse-icon {
                  font-size: 13px;
                  margin-left: 5px;
                }
              }

              .thinking-content {
                color: #8b8b8b;
                white-space: pre-wrap;
                padding-left: 13px;
                line-height: 26px;
                position: relative;
                margin-bottom: 12px;
                font-size: 14px;

                .thinking-line {
                  border-left: 2px solid #d4d4d4;
                  height: calc(100% - 10px);
                  margin-top: 5px;
                  position: absolute;
                  top: 0;
                  left: 0;
                }
              }

              .answer-content {
                background-color: #fff;
                border-radius: 8px;
                font-size: 16px;
                padding: 15px 20px;
              }

              .reference-files {
                margin-top: 15px;
                background-color: #e2e9f5;
                border-radius: 8px;
                padding: 15px 20px;

                .reference-header {
                  cursor: pointer;
                  position: relative;
                  padding-right: 26px;
                  line-height: 25px;

                  .collapse-icon {
                    position: absolute;
                    right: 0;
                    top: 5px;
                    font-size: 16px;
                  }
                }

                .reference-content {
                  padding-top: 10px;

                  .reference-item {
                    font-size: 15px;
                    color: #666;
                    margin-bottom: 10px;

                    .file-title {
                      color: rgb(15, 105, 165);
                      cursor: pointer;
                      font-size: 16px;

                      &:hover {
                        text-decoration: underline;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        .message:last-child {
          margin-bottom: 0;
        }
      }
      .knowledge {
        margin: 10px 170px;
        // .knowledge-select {
        //   :deep(.ant-select-selector) {
        //     // background-color: rgb(237, 237, 242);
        //     // border-color: rgb(237, 237, 242);
        //     border-radius: 15px;
        //   }
        // }
        & > div {
          padding: 5px 10px;
          margin-right: 10px;
          background-color: #fff;
          border: 1px solid rgb(230, 230, 230);
          display: inline-block;
          border-radius: 15px;
          & > span {
            cursor: pointer;
          }
        }
        .knowledge-active {
          background-color: #dbeafe;
          border-color: #4d6bfe;
          color: #4d6bfe;
        }
      }
      // 输入区域
      .input-area {
        position: relative;
        margin: 0 170px;
        .input-wrapper {
          textarea {
            width: 100%;
            border-radius: 10px;
            font-size: 18px;
            padding: 25px 66px 25px 20px;
            resize: none;
            border: 1px solid #d9d9d9;
            transition: border-color 0.3s;

            &:focus {
              border-color: #40a9ff;
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
            }
          }
        }

        .disclaimer {
          font-size: 15px;
          text-align: center;
          padding: 10px 0;
          color: rgb(146, 146, 147);
        }

        .send-btn {
          height: 50px;
          width: 50px;
          position: absolute;
          bottom: 60px;
          right: 20px;
          cursor: pointer;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.1);
          }

          &.loading {
            font-size: 35px;
            color: rgb(23, 130, 210);
            top: 25px;
          }
        }
      }
    }
  }

  :deep(.ant-divider-inner-text) {
    color: rgb(146, 146, 147);
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }
</style>
