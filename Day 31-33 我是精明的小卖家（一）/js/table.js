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
        }
    }
    return result;
}

function retrieveData(data_source, property, filter_data) {
    var result = [];
    for (let i = 0; i < data_source.length; i++) {
        if (isInTheFilter(data_source[i][property], filter_data)) {
            result.push(data_source[i]);
        }
    }
    return result;
}

function generateTable(data, num_of_product, num_of_region) {
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
                table_row.innerHTML = "<td>" + data[j].region + "</td>";
                for (let month_i = 0; month_i < 12; month_i++) {
                    table_row.innerHTML += "<td>" + data[j].sale[month_i] + "</td>";
                }
            }
        }
    }
}