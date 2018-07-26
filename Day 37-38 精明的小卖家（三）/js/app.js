var fieldset_region = document.querySelector("#select_region"),
    fieldset_product = document.querySelector("#select_product"),
    table = document.querySelector("#output_table"),
    div_bar = document.querySelector("#bar_graph"),
    div_line = document.querySelector("#line_graph");

var default_line_graph_color = "", // 储存初始值
    default_bar_graph_color = "";

var last_mouseover_td = null; // 记录上一个 mouseover 的 td

function resetTDVariable() { // 重置与表格操作相关的变量
    multiple_items = [];
    last_mouseover_td = null;
    td_on_edit = {product: "", region: "", month: "", status: false};
}

function getFilteredData() {
    var product_filter = getFilterFromCheckbox(fieldset_product);
    var region_filter = getFilterFromCheckbox(fieldset_region);

    var data_1 = getDataByFilter(sourceData, "product", product_filter);
    var data_2 = getDataByFilter(data_1, "region", region_filter);

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
    resetTDVariable(); // 因筛选结果、表格数值可能有变动，需要将表格操作相关的变量重置

    var data = getFilteredData();
    createTable(table, data);

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
    syncLocalStorage();

    createOptions(fieldset_region, "region");
    createOptions(fieldset_product, "product");

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

    if (e.target && td_on_edit.status == false) { // 当 td 处于非编辑状态时
        switch (e.target.nodeName.toUpperCase()) {
            case "TD":
                deleteEditSign(last_mouseover_td); // 移入这个 td 时才清除上一个 td 的编辑符号，而非“当移出此 td 时，清除此 td 的符号”，从而避免当鼠标在编辑符号上时，符号循环创建删除
                var data = getDataFromTD(e.target);
                drawGraph(data);
                if (!isNaN(e.target.innerText)) { // 当 td 内容为数字才创建编辑符号
                    createEditSign(e.target);
                }
                break;
            case "TH": // 考虑鼠标从内容移至表头时的清除
                deleteEditSign(last_mouseover_td);
                break;
            case "DIV": //使鼠标位于编辑标记上时仍能显示当前行的表格图片
                var data = getDataFromTD(e.target.parentNode);
                drawGraph(data);
                break;
        }
    }
}

table.onmouseout = function (e) {
    if (e.target && e.target.nodeName.toUpperCase() == "TD") {
        last_mouseover_td = e.target;
    }
    refreshGraph();
}

table.onclick = function (e) {
    if (e.target && e.target.nodeName.toUpperCase() == "TD") {
        editMultipleByData(e.target);
    } else if (e.target && e.target.id == "edit_sign") {
        var td = e.target.parentNode;
        showEditor(td);
    }
    refreshGraph();
}
