import '/@/design/index.less';
// 注册 windi
import 'virtual:windi-base.css';
import 'virtual:windi-components.css';
import 'virtual:windi-utilities.css';
import 'virtual:windi-devtools';
// 注册图标
import 'virtual:svg-icons-register';
import App from './App.vue';
import { createApp } from 'vue';
import { initAppConfigStore } from '/@/logics/initAppConfig';
import { setupErrorHandle } from '/@/logics/error-handle';
import { router, setupRouter } from '/@/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import { setupGlobDirectives } from '/@/directives';
import { setupI18n } from '/@/locales/setupI18n';
import { registerGlobComp } from '/@/components/registerGlobComp';
import { registerThirdComp } from '/@/settings/registerThirdComp';
import { useSso } from '/@/hooks/web/useSso';
import vueEsign from 'vue-esign';
import { Timeline } from 'ant-design-vue';
import { Progress } from 'ant-design-vue';
import VueKonva from 'vue-konva'
import 'qweather-icons/font/qweather-icons.css';
// 注册online模块lib
//import { registerPackages } from '/@/utils/monorepo/registerPackages';
import vue3TreeOrg from 'vue3-tree-org';
import 'vue3-tree-org/lib/vue3-tree-org.css';
// 1. 引入你需要的组件
import {
  Form,
  Button,
  Tab,
  Tabs,
  Search,
  List,
  Popup,
  Calendar,
  Cell,
  Row,
  Icon,
  Dialog,
  Field,
  Picker,
  CellGroup,
  Uploader,
  NavBar,
  Step,
  Steps,
  Tag,
  Badge,
  Collapse,
  CollapseItem,
  Toast,
  PullRefresh,
  RadioGroup,
  Radio,
  Image,
  Swipe,
  SwipeItem,
  Loading,
  Circle,
  CheckboxGroup, 
  Checkbox,
  Signature,
  TreeSelect,
  FloatingBubble,
  Empty,
  Switch
} from 'vant';
// 2. 引入组件样式
import 'vant/lib/index.css';
import './views/app/cssVariable.less'
// 在本地开发中引入的,以提高浏览器响应速度
if (import.meta.env.DEV) {
  import('ant-design-vue/dist/antd.less');
}
// import Progress from 'ant-design-vue/lib/progress';
// import 'ant-design-vue/lib/progress/style';
async function bootstrap() {
  // 创建应用实例
  const app = createApp(App);
  app.use(vue3TreeOrg);
  // 多语言配置,异步情况:语言文件可以从服务器端获得
  await setupI18n(app);

  // 配置存储
  setupStore(app);

  // 初始化内部系统配置
  initAppConfigStore();

  // 注册外部模块路由(注册online模块lib)
  //registerPackages(app);

  // 注册全局组件
  registerGlobComp(app);

  //CAS单点登录
  await useSso().ssoLogin();

  // 配置路由
  setupRouter(app);

  // 路由保护
  setupRouterGuard(router);

  // 注册全局指令
  setupGlobDirectives(app);

  // 配置全局错误处理
  setupErrorHandle(app);

  // 注册第三方组件
  await registerThirdComp(app);

  // 当路由准备好时再执行挂载( https://next.router.vuejs.org/api/#isready)
  await router.isReady();
  // 3. 注册你需要的组件
  app.use(Form);
  app.use(Popup);
  app.use(Button);
  app.use(Tab);
  app.use(Tabs);
  app.use(Search);
  app.use(List);
  app.use(Calendar);
  app.use(Cell);
  app.use(Row);
  app.use(Icon);
  app.use(Dialog);
  app.use(Field);
  app.use(Picker);
  app.use(CellGroup);
  app.use(Uploader);
  app.use(NavBar);
  app.use(Step);
  app.use(Steps);
  app.use(Tag);
  app.use(Badge);
  app.use(Collapse);
  app.use(CollapseItem);
  app.use(PullRefresh);
  app.use(Toast);
  app.use(vueEsign);
  app.use(Progress);
  app.use(Radio);
  app.use(RadioGroup);
  app.use(Image);
  app.use(Swipe);
  app.use(SwipeItem);
  app.use(Loading);
  app.use(Circle);
  app.use(Timeline);
  app.use(Checkbox);
  app.use(CheckboxGroup);
  app.use(Signature);
  app.use(TreeSelect);
  app.use(FloatingBubble);
  app.use(Empty);
  app.use(VueKonva);
  app.use(Switch);
  // 挂载应用
  app.mount('#app', true);
}

bootstrap();
