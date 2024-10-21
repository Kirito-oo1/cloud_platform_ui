import {
    getApi,
    postDataApi,
    postfromApi
} from "../api/request"
import Vue from 'vue'
export default {
    // 请求图层配置数据
    getAppLayerConfig({
        commit,
        state
    }, serverURL) {
        getApi(`/gis/app/layersConfig/appId`, {
            appId: state.appId
        }).then((res) => {
            console.log(res);
            let dataList = res.data.data;
            commit("layerConfigFn", JSON.parse(dataList.layerConfig));
        }).catch((err) => {
            console.log(err);
        })
    },
    // 请求图层树列表数据
    getLayerTree({
        commit,
        state
    }, serverURL) {
        let params = {
            appId: state.appId,
        }
        getApi(`/gis/app/getTree`, params).then((res) => {
            let dataList = res.data.data[0].children;
            (dataList && dataList.length) && dataList.forEach(item => {
                (item.children && item.children.length) && item.children.forEach(item1 => {
                    item1.select = false;
                    (item1.children && item1.children.length) && item1.children.forEach(item2 => {
                        item2.select = false;
                    })
                })
            })
            commit("layerTreeListFn", dataList)
        }).catch((err) => {
            console.log(err);
        })
    },
    //按钮权限
    getBtnAuthority({
        commit,
    }) {
        getApi(`/sys/user/perms`, {}).then(res => {
            let {
                data
            } = res;
            if (data.code == 0) {
                commit("btnAuthorityFn", data.data)
            }
        });
    },
}