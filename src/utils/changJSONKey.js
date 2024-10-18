export {
    upperJSONKey,
    lowerJSONKey
};


// 大写转换
function upperJSONKey(jsonObj) {
    for (var key in jsonObj) {
        if (key.toUpperCase() != key) {
            jsonObj[key.toUpperCase()] = jsonObj[key];
            delete (jsonObj[key]);
        }
    }
    return jsonObj;
}

// 小写转换
function lowerJSONKey(jsonObj) {
    for (var key in jsonObj) {
        if (key.toLowerCase() != key) {
            jsonObj[key.toLowerCase()] = jsonObj[key];
            delete (jsonObj[key]);
        }
    }
    return jsonObj;
}

/* 多维数组扁平化 */
function flatten(arr) {
    return [].concat(
        ...arr.map((item) => {
            if (item.children && item.children.length) {
                let arr = [].concat(item, ...flatten(item.children));
                delete item.children;
                return arr;
            }
            return [].concat(item);
        })
    );
}