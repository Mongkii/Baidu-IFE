var fieldset_region = document.querySelector("#select_region"),
    fieldset_product = document.querySelector("#select_product"),
    table = document.querySelector("#output_table"),
    div_bar = document.querySelector("#bar_graph"),
    div_line = document.querySelector("#line_graph");

var default_line_graph_color = "", // 储存初始值
    default_bar_graph_color = "";

function getFilteredData() {
    var product_filter = getFilterFromCheckbox(fieldset_product);
    var region_filter = getFilterFromCheckbox(fieldset_region);

    var data_1 = retrieveDataByFilter(sourceData, "product", product_filter);
    var data_2 = retrieveDataByFilter(data_1, "region", region_filter);

    return data_2;
}

function refreshGraph() {
    if (multiple_items.length != 0) {
        drawGraph(multiple_items, true);
    } else {
        var data = getFilteredData();
        drawGraph(data[0]["sale"]);
    }
}

function refreshOutput() { // 筛选并显示结果
    multiple_items = []; // 因筛选结果可能有变动，重置了多选 data 数组
    var data = getFilteredData();

    generateTable(table, data);
    drawGraph(data[0]["sale"]); // 图表默认读取筛选后数据第一项的值
}


fieldset_region.onclick = function (e) {
    checkNumOfSelected(e, fieldset_region);
    refreshOutput();
}

fieldset_product.onclick = function (e) {
    checkNumOfSelected(e, fieldset_product);
    refreshOutput();
}


window.onload = function () {
    generateOptions(fieldset_region, "region");
    generateOptions(fieldset_product, "product");

    fieldset_region.querySelector("input[value='all']").onclick = function () { // 在"全选"被生成后，为其绑定 selectAll 事件
        selectAll(fieldset_region);
    }
    fieldset_product.querySelector("input[value='all']").onclick = function () {
        selectAll(fieldset_product);
    }

    /* 为 checkbox 设置默认选项。有两个要注意的地方：
     * 1. fieldset 第一项是 legend，所以 checkbox 从第二项开始。
     * 2. children[1] 是 label，其第一个子元素才是 checkbox
     */
    fieldset_region.children[1].children[0].checked = true;
    fieldset_product.children[1].children[0].checked = true;

    default_line_graph_color = line_setting.graph_color; // 从其他 js 中读取初始值
    default_bar_graph_color = bar_setting.graph_color;

    refreshOutput(); // 初始显示一次数据
}

table.onmouseover = function (e) {
    line_setting.graph_color = default_line_graph_color; // 确保每次显示时都使用初始值
    bar_setting.graph_color = default_bar_graph_color;

    if (e.target && e.target.nodeName.toUpperCase() == "TD") {
        var data = retrieveDataFromTD(e.target);
        drawGraph(data);
    }
}

table.onmouseout = function () {
    refreshGraph();
}

table.onclick = function (e) {
    if (e.target && e.target.nodeName.toUpperCase() == "TD") {
        editMultipleByData(e.target);
    }
    refreshGraph();
}

