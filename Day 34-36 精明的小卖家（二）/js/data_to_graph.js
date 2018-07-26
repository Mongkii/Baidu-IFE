/* "检索数据库获取图像数据"这一方法会用到的函数

function retrieveGraphData(product, region) {
    var data = [];
    for (let i = 0; i < sourceData.length; i++) {
        if (sourceData[i].product == product && sourceData[i].region == region) {
            data = sourceData[i].sale;
        }
    }
    return data;
}
 */

function retrieveDataFromTD(td) {
    var data = [];
    /* 以下是"读取所选行的数据，用其直接生成图像"的写法
     * 优点：简便，用户所见数据与生成图像总是一致的
     * 缺点：数据可以被本地修改，图表首行不能有数据或形似数据的项
     */
    var all_td = td.parentNode.children; // 获取该行所有 td

    if (isNaN(all_td[1].innerHTML)) { // 检查该行第 2 个 td 是否为数据
        var i = 2;
    } else {
        var i = 1;
    }
    for (; i < all_td.length; i++) {
        data.push(all_td[i].innerHTML);
    }

    /* 以下是"读取所选行的商品、地区，在数据库中查找，使用找到的数据生成图像"的写法
     * 优点：之后可以方便的调取商品、地区名这些数据；数据直接从服务器取得，避开了本地修改
     * 缺点：为了在 rowspan 情况下能顺利读取被合并的数据，要在 table.js 的 generateTable() 函数中做特殊处理，详见其注释。如果不这么处理，读取 rowspan 会极其麻烦。
     * --------
    if (document.querySelector("#output_table thead tr").children[0].innerHTML == "商品") {
        var product = td.parentNode.children[0].innerHTML,
            region = td.parentNode.children[1].innerHTML;
        data = retrieveGraphData(product, region);
    } else if (document.querySelector("#output_table thead tr").children[0].innerHTML == "地区") {
        var product = td.parentNode.children[1].innerHTML,
            region = td.parentNode.children[0].innerHTML;
        data = retrieveGraphData(product, region);
    }
    * --------
    */
    return data;
}

function drawGraph(data, multiple) {
    var body_width = window.getComputedStyle(document.querySelector("body"), null).width;
    var graph_width = parseInt(body_width) / 2 - 50; // 获取网页宽度，经适当计算后作为图表宽度

    line_setting.width = graph_width;
    line_setting.height = graph_width / 16 * 9;
    bar_setting.width = graph_width;
    bar_setting.height = graph_width / 16 * 9;

    var svg = barDrawGraph(data, multiple);
    div_bar.innerHTML = "";
    div_bar.appendChild(svg);


    var canvas = lineDrawGraph(data, multiple);
    div_line.innerHTML = "";
    div_line.appendChild(canvas);
}

// ----多个 data 时的操作----
var multiple_items = [];

function randomColor() {
    var rgb = [];
    for (let i = 0; i < 3; i++) {
        rgb.push(Math.floor(Math.random() * 256));
    }
    return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}

function editMultipleByData(td) {
    var data = retrieveDataFromTD(td);

    if (td.parentNode.className.match(/tr_selected/g) == null) { // 使用 .tr_selected 标识是否被选中
        td.parentNode.className += "tr_selected";

        var color = randomColor();
        var max = Math.max.apply(null, data);
        var new_multiple_item = {data: data, color: color, max: max};

        multiple_items.push(new_multiple_item);
    } else {
        deleteItemFromMultiple(data);
        td.parentNode.className = td.parentNode.className.replace(/tr_selected/g, ""); // 去除 class
    }
}

function deleteItemFromMultiple(data) {
    for (let i = 0; i < multiple_items.length; i++) {
        let count_same = 0; // 计算出现相同项的数量
        for (let j = 0; j < data.length; j++) { // 逐项比较 data 数组与该对象 data 的异同
            if (data[j] == multiple_items[i]["data"][j]) {
                count_same += 1;
            }
        }
        if (count_same == data.length) { // 若各项相同，则移除该对象
            multiple_items.splice(i, 1);
            i -= 1;
        }
    }
}