var fieldset_region = document.querySelector("#select_region"),
    fieldset_product = document.querySelector("#select_product"),
    table = document.querySelector("#show_output");

function showDefaultOutput() { // 默认的筛选并显示结果的样式
    var product_filter = getFilterFromCheckbox(fieldset_product);
    var region_filter = getFilterFromCheckbox(fieldset_region);

    var data_1 = retrieveData(sourceData, "product", product_filter);
    var data_2 = retrieveData(data_1, "region", region_filter);


    generateTable(data_2, product_filter.length, region_filter.length);
}


fieldset_region.onclick = function (e) {
    checkNumOfSelected(e, fieldset_region);
    showDefaultOutput();
}

fieldset_product.onclick = function (e) {
    checkNumOfSelected(e, fieldset_product);
    showDefaultOutput();
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

    fieldset_region.children[1].children[0].checked = true; // 为 checkbox 设置默认选项。有两个要注意的地方：1. fieldset 第一项是 legend，所以 checkbox 从第二项开始。 2. children[1] 是 label，其第一个子元素才是 checkbox
    fieldset_product.children[1].children[0].checked = true;

    showDefaultOutput();
}