function getFilterFromCheckbox(fieldset) {
    var result = [];
    var options = fieldset.querySelectorAll("input[type='checkbox']:not([value='all'])");

    for (let i = 0; i < options.length; i++) {
        if (options[i].checked) {
            result.push(options[i].value);
        }
    }
    return result;
}

function isInTheFilter(property, filter_data) {
    var result = false;
    for (let i = 0; i < filter_data.length; i++) {
        if (property == filter_data[i]) {
            result = true;
            break;
        }
    }
    return result;
}

function retrieveDataByFilter(source_data, property, filter_data) {
    var result = [];
    for (let i = 0; i < source_data.length; i++) {
        if (isInTheFilter(source_data[i][property], filter_data)) {
            result.push(source_data[i]);
        }
    }
    return result;
}

function generateTable(table, data) {
    // 通过 data 计算商品、地区总数，而非依靠输入参数，以使结果准确表现数据
    var region_filter = [],
        product_filter = [];
    for (let i = 0; i < data.length; i++) {
        if (!isInTheFilter(data[i].region, region_filter)) {
            region_filter.push(data[i].region);
        }
        if (!isInTheFilter(data[i].product, product_filter)) {
            product_filter.push(data[i].product);
        }
    }
    var num_of_region = region_filter.length,
        num_of_product = product_filter.length;

    table.innerHTML = ""; // 将表格初始化
    var table_head = table.createTHead().insertRow(); // 创建表头
    if (num_of_region == 1 && num_of_product > 1) {
        table_head.innerHTML = "<th>地区</th><th>商品</th>";
    } else {
        table_head.innerHTML = "<th>商品</th><th>地区</th>";
    }
    for (let month_i = 1; month_i < 13; month_i++) {
        table_head.innerHTML += "<th>" + month_i + " 月</th>";
    }

    var table_body = table.createTBody(); // 创建表体

    if (num_of_region == 1 && num_of_product > 1) {
        var table_first_row = table_body.insertRow();
        table_first_row.innerHTML = "<td rowspan='" + num_of_product + "'>" + data[0].region + "</td><td>" + data[0].product + "</td>";
        for (let month_i = 0; month_i < 12; month_i++) {
            table_first_row.innerHTML += "<td>" + data[0].sale[month_i] + "</td>";
        }

        for (let i = 1; i < data.length; i++) {
            let table_row = table_body.insertRow();
            /* "检索数据库获取图像数据"这一方法会用到的代码
             * 为了使得 rowspan 时仍能读取 region 数据，这里没有将其删去，而是设为了不显示
            table_row.innerHTML = "<td style='display: none'>" + data[i].region + "</td><td>" + data[i].product + "</td>";
             */
            table_row.innerHTML = "<td>" + data[i].product + "</td>";
            for (let month_i = 0; month_i < 12; month_i++) {
                table_row.innerHTML += "<td>" + data[i].sale[month_i] + "</td>";
            }
        }
    } else {
        for (let i = 0; i < num_of_product; i++) { // 为每一件商品进行一次循环
            let i_start = num_of_region * i; // 该商品在数据数组的起始 index
            let i_end = num_of_region * (i + 1); // 该商品在数据数组的结束 index

            let table_first_row = table_body.insertRow();
            table_first_row.innerHTML = "<td rowspan='" + num_of_region + "'>" + data[i_start].product + "</td><td>" + data[i_start].region + "</td>";
            for (let month_i = 0; month_i < 12; month_i++) {
                table_first_row.innerHTML += "<td>" + data[i_start].sale[month_i] + "</td>";
            }

            for (let j = i_start + 1; j < i_end; j++) {
                let table_row = table_body.insertRow();
                /* "检索数据库获取图像数据"这一方法会用到的代码
                 * 为了使得 rowspan 时仍能读取 region 数据，这里没有将其删去，而是设为了不显示
                table_row.innerHTML = "<td style='display: none'>" + data[j].product + "</td><td>" + data[j].region + "</td>";
                 */
                table_row.innerHTML = "<td>" + data[j].region + "</td>";
                for (let month_i = 0; month_i < 12; month_i++) {
                    table_row.innerHTML += "<td>" + data[j].sale[month_i] + "</td>";
                }
            }
        }
    }
}