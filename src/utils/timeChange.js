/* 对象数组去重 */
const resetArray = (arr) => {
    //reduce第一个参数是遍历需要执行的函数，第二个参数是item的初始值
    let obj = {};
    arr = arr.reduce(function (item, next) {
        obj[next.id] ? '' : obj[next.id] = true && item.push(next);
        return item;
    }, []);
    console.log(arr);
    return arr
};

//时间戳转换为正常的年月日时分秒
function timeStampToTime(time) {
    let date = new Date(time)
    let Y = date.getFullYear() + '-'
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
    let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    return Y + M + D + h + m + s
}
export {
    resetArray,
    timeStampToTime
}