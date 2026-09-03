import type { Router, RouteRecordRaw } from 'vue-router';

import { usePermissionStoreWithOut } from '/@/store/modules/permission';

import { PageEnum } from '/@/enums/pageEnum';
import { useUserStoreWithOut } from '/@/store/modules/user';

import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { PAGE_NOT_FOUND_NAME } from '/@/router/constant';

import { RootRoute } from '/@/router/routes';

import { isOAuth2AppEnv } from '/@/views/sys/login/useLogin';
import { defHttp } from '/@/utils/http/axios';
const LOGIN_PATH = PageEnum.BASE_LOGIN;
//auth2登录路由
const OAUTH2_LOGIN_PAGE_PATH = PageEnum.OAUTH2_LOGIN_PAGE_PATH;

//分享免登录路由
const SYS_FILES_PATH = PageEnum.SYS_FILES_PATH;

const ROOT_PATH = RootRoute.path;

//update-begin---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3不支持auth2登录------------
//update-begin---author:wangshuai ---date:20221111  for: [VUEN-2472]分享免登录------------
const whitePathList: PageEnum[] = [LOGIN_PATH, OAUTH2_LOGIN_PAGE_PATH, SYS_FILES_PATH];
//update-end---author:wangshuai ---date:20221111  for: [VUEN-2472]分享免登录------------
//update-end---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3不支持auth2登录------------

export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const permissionStore = usePermissionStoreWithOut();
  router.beforeEach(async (to, from, next) => {
    if (
      from.path === ROOT_PATH &&
      to.path === PageEnum.BASE_HOME &&
      userStore.getUserInfo.homePath &&
      userStore.getUserInfo.homePath !== PageEnum.BASE_HOME
    ) {
      next(userStore.getUserInfo.homePath);
      return;
    }
    if (to.fullPath.includes('token=')) {
      if (permissionStore.getIsDynamicAddedRoute) {
        next();
        return;
      }
      console.log('地址拼接token');
      // const token = to.fullPath.split('token=')[1];
      // userStore.setToken(token);
      // const params = { token };
      const tokenRegex = /token=([^&]+)/;
      const match = to.fullPath.match(tokenRegex);
      const token = match ? match[1] || '' : '';
      userStore.setToken(token);
      const params = { token };
      const loginResult = await defHttp.get({ url: '/sys/noAuth/tokenLogin', params }).catch((err) => {
        console.info(err);
        next();
      })
      console.log('已拿到token')
      const { token: newToken, userInfo } = loginResult;
      userStore.setToken(newToken);
      // userStore.setTenant(userInfo.loginTenantId);
      // delete to.query.token;
      // next({ path: to.fullPath, replace: true, query: to.query });
      // return userStore.afterLoginAction(false, res);
    }

    const token = userStore.getToken;
    window._CONFIG['token'] = token;
    if (whitePathList.includes(to.path as PageEnum)) {
      if (to.path === LOGIN_PATH && token) {
        const isSessionTimeout = userStore.getSessionTimeout;
        try {
          if (!isSessionTimeout) {
            next((to.query?.redirect as string) || '/');
            return;
          }
        } catch {}
      } else if (to.path === LOGIN_PATH && isOAuth2AppEnv() && !token) {
        //退出登录进入此逻辑
        //如果进入的页面是login页面并且当前是OAuth2app环境，并且token为空，就进入OAuth2登录页面
        next({ path: OAUTH2_LOGIN_PAGE_PATH });
        return;
        //update-end---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3不支持auth2登录------------
      }
      next();
      return;
    }
    // token does not exist
    if (!token) {
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      if (to.meta.ignoreAuth) {
        next();
        return;
      }
      //update-begin---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3 Auth2未实现------------
      let path = LOGIN_PATH;
      if (whitePathList.includes(to.path as PageEnum)) {
        // 在免登录白名单，如果进入的页面是login页面并且当前是OAuth2app环境，就进入OAuth2登录页面
        if (to.path === LOGIN_PATH && isOAuth2AppEnv()) {
          next({ path: OAUTH2_LOGIN_PAGE_PATH });
        } else {
          //在免登录白名单，直接进入
          next();
        }
      } else {
        // 如果当前是在OAuth2APP环境，就跳转到OAuth2登录页面，否则跳转到登录页面
        path = isOAuth2AppEnv() ? OAUTH2_LOGIN_PAGE_PATH : LOGIN_PATH;
      }
      //update-end---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3 Auth2未实现------------
      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        //update-begin---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3 Auth2未实现------------
        path: path,
        //update-end---author:wangshuai ---date:20220629  for：[issues/I5BG1I]vue3 Auth2未实现------------
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }
    // Jump to the 404 page after processing the login
    if (from.path === LOGIN_PATH && to.name === PAGE_NOT_FOUND_NAME && to.fullPath !== (userStore.getUserInfo.homePath || PageEnum.BASE_HOME)) {
      next(userStore.getUserInfo.homePath || PageEnum.BASE_HOME);
      return;
    }
    // get userinfo while last fetch time is empty
    if (userStore.getLastUpdateTime === 0) {
      try {
        userStore.setLastUpdateTime();
        await userStore.getUserInfoAction();
      } catch (err) {
        console.info(err);
        next();
      }
    }
    if (permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }
    const routes = await permissionStore.buildRoutesAction();
    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });
    router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
    permissionStore.setDynamicAddedRoute(true);
    if (to.name === PAGE_NOT_FOUND_NAME) {
      // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
      next({ path: to.fullPath, replace: true, query: to.query });
    } else {
      const redirectPath = (from.query.redirect || to.path) as string;
      const redirect = decodeURIComponent(redirectPath);
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect };
      next(nextData);
    }
  });
}
