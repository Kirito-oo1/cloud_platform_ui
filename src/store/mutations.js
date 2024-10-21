export default {
    // 更新应用图层配置
    layerConfigFn(state, item) {
        state.layerConfig = item;
    },
    // 更新应用列表数据
    appListShowFn(state, item) {
        state.appListShow = item;
    },
    // 更新应用Id
    updateAppIdFn(state, item) {
        state.appId = item;
    },
    // 顶部nav按钮下标更新
    navChangeFn(state, item) {
        state.navActiveIndex = item;
    },
    // 更新图层树显隐状态
    layerTreeShowFn(state, item) {
        state.layerTreeShow = item;
    },
    // 更新图层树数据
    layerTreeListFn(state, item) {
        state.layerTreeList = item;
    },
    // 更新图层菜单选择项
    menuTabtypeFn(state, item) {
        state.menuTabtype = item;
    },
    // 更新视角列表数据
    angleListFn(state, item) {
        state.angleList = item;
    },
    // 更新地图弹窗显隐状态
    popupShowFn(state, item) {
        state.popupShow = item;
    },
    // 更新按钮权限数据
    btnAuthorityFn(state, item) {
        state.btnAuthorityList = item;
    }
}