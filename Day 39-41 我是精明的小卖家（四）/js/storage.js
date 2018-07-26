function syncLocalStorage() {
    if (localStorage.length == 0) {
        createLocalStorage(sourceData);
    } else {
        sourceData = getDataFromStorage();
    }
}

function createLocalStorage(source_data) { // 使用初始数据构建初始缓存
    for (let i = 0; i < source_data.length; i++) {
        let item_num = "item" + i;
        localStorage.setItem(item_num + "_product", source_data[i]["product"]);
        localStorage.setItem(item_num + "_region", source_data[i]["region"]);
        let sale = source_data[i]["sale"];
        for (let j = 0; j < sale.length; j++) {
            let sale_num = "_sale" + j;
            localStorage.setItem(item_num + sale_num, sale[j]);
        }
    }
}


function getDataFromStorage() { // 通过缓存重新生成结构化的数据。不过必须先知道数据的数量、组成等信息
    var source_data = [];
    for (let i = 0; i < 9; i++) {
        let item_num = "item" + i;
        let item = {};
        item.product = localStorage.getItem(item_num + "_product");
        item.region = localStorage.getItem(item_num + "_region");
        item.sale = [];
        for (let j = 0; j < 12; j++) {
            let sale_num = "_sale" + j;
            let sale_value = parseInt(localStorage.getItem(item_num + sale_num));
            item.sale.push(sale_value);
        }
        source_data.push(item);
    }
    return source_data;
}

function updateLocalStorage(value, product, region, month) {
    value = Number(value);
    month = Number(month);
    for (let i = 0; i < 9; i++) {
        let item_num = "item" + i;
        let saved_product = localStorage.getItem(item_num + "_product"),
            saved_region = localStorage.getItem(item_num + "_region");
        if (saved_product == product && saved_region == region) {
            let sale_num = "_sale" + (month - 1);
            localStorage.setItem(item_num + sale_num, value);
            break;
        }
    }
}