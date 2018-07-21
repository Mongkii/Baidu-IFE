var bar_setting = { // 原生 JS 不支持模块，为避免相同变量名冲突，设置项只好用对象封装
    // ----图表基本设置-----
    width: 800, // 图表宽
    height: 450, // 图表高
    axis_color: "#000000", // 轴的颜色
    axis_width: 2, // 轴的宽度
    divide_color: "#aaaaaa", // 分隔线颜色
    divide_number: 6, // 分隔线数量

    // ----生成数据设置----
    graph_color: "#5ec0ed", // 柱的颜色
    number_color: "#555555", // 柱顶显示的数字的颜色
    x_axis_space: 10, // X 轴左侧留白
    bar_space_ratio: 5, // 柱与间隙比例
    y_axis_ratio: 1.2 // Y 轴最大值与数据最大值的比例
}

function barDrawAxis(svg, o_x, o_y, x_length, y_length) {
    function batchStyle(line) { // 对各轴相同的部分批量设置
        line.setAttribute("stroke", bar_setting.axis_color);
        line.setAttribute("stroke-width", bar_setting.axis_width);
        line.setAttribute("x1", o_x);
        line.setAttribute("y1", o_y);
    }

    var x_axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    batchStyle(x_axis);
    x_axis.setAttribute("x2", o_x + x_length);
    x_axis.setAttribute("y2", o_y);

    var y_axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    batchStyle(y_axis);
    y_axis.setAttribute("x2", o_x);
    y_axis.setAttribute("y2", o_y - y_length);

    svg.appendChild(x_axis);
    svg.appendChild(y_axis);
}

function barDrawDivide(svg, o_x, o_y, x_length, y_length, max) {
    var gap = 1 / bar_setting.divide_number * y_length / (bar_setting.y_axis_ratio * 0.9); // 计算分隔线间隔。除以 (bar_setting.y_axis_ratio * 0.9) 是为了使顶端有一定留白，更好看
    for (let i = 1; i < bar_setting.divide_number + 1; i++) {
        var text = Math.round(gap * i / y_length * max);
        var y = o_y - gap * i;
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", o_x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", o_x + x_length);
        line.setAttribute("y2", y);
        line.setAttribute("stroke-width", bar_setting.axis_width / 2);
        line.setAttribute("stroke", bar_setting.divide_color);
        svg.appendChild(line);
        barDrawText(svg, o_x - 30, y + 5, text, bar_setting.divide_color);
    }
}

function barDrawBar(svg, x, y, width, height) { // 为了便于调用数据，此处 x, y 指柱左下角位置
    var bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("fill", bar_setting.graph_color);
    bar.setAttribute("x", x);
    bar.setAttribute("y", y - height - bar_setting.axis_width / 2); // 因为柱的显示位置为坐标轴的中心，为使其不与轴边重合，向上平移 0.5 轴宽的高度
    bar.setAttribute("width", width);
    bar.setAttribute("height", height);
    svg.appendChild(bar);
}

function barDrawText(svg, x, y, str, color) {
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("fill", color);
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.innerHTML = str;
    svg.appendChild(text);
}

function barDrawGraph(input, multiple) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", bar_setting.width); // 设置画布大小
    svg.setAttribute("height", bar_setting.height);

    var o_x = bar_setting.width / 16,
        o_y = bar_setting.height / 9 * 8; // 设置原点。为了美观，距离画布边缘留出了一段距离
    var x_length = bar_setting.width / 16 * 14,
        y_length = bar_setting.height / 9 * 7; // 设置 X、Y 轴长度

    barDrawAxis(svg, o_x, o_y, x_length, y_length);

    var bar_space_width = Math.floor((x_length - bar_setting.x_axis_space) / 12); // 计算每一条柱+间隙占用宽度
    var bar_width = bar_space_width / (bar_setting.bar_space_ratio + 1) * bar_setting.bar_space_ratio;
    var first_bar_x = o_x + bar_setting.x_axis_space; // 第一个条柱出现的横坐标
    var first_text_x = first_bar_x + bar_width / 2 - 15; // 第一段文字出现的横坐标。该计算值能使文字横坐标尽量处于靠柱中间的地方

    for (let i = 0; i < 12; i++) {
        barDrawText(svg, first_text_x + bar_space_width * i, o_y + 20, (i + 1) + " 月", bar_setting.axis_color); // 添加月份
    }

    if (multiple != true) {
        var max = Math.max.apply(null, input) * bar_setting.y_axis_ratio; // Y 轴最大值
        for (let i = 0; i < input.length; i++) {
            var bar_start_x = first_bar_x + bar_space_width * i; // 当前柱的起始绘制点
            var text_start_x = bar_start_x + bar_width / 2 - 15; // 文字的起始绘制点。该计算值能使文字横坐标尽量处于靠柱中间的地方
            var data_height = input[i] / max * y_length;
            barDrawBar(svg, bar_start_x, o_y, bar_width, data_height);
            barDrawText(svg, text_start_x, o_y - data_height - bar_setting.axis_width / 2 - 10, input[i], bar_setting.number_color); // 在图上显示具体数值。o_y - data_height - axis_width / 2 = 柱顶实际 Y 坐标
        }
    } else {
        var all_max = [];
        for (let i = 0; i < input.length; i++) {
            all_max.push(input[i]["max"]);
        }
        var max = Math.max.apply(null, all_max) * line_setting.y_axis_ratio;
        barDrawDivide(svg, o_x, o_y, x_length, y_length, max); // 绘制分隔线

        bar_width = bar_width / input.length; // 根据 data 数量平分每个 data 的宽度

        for (let i = 0; i < input.length; i++) {
            let data = input[i]["data"];
            bar_setting.graph_color = input[i]["color"];

            for (let j = 0; j < data.length; j++) {
                var bar_start_x = first_bar_x + bar_width * i + bar_space_width * j; // bar_width * i = 当前 data 相对第一个 data 的横坐标偏移量。下同
                var text_start_x = bar_start_x + bar_width / 2 - 15;
                var data_height = data[j] / max * y_length;
                barDrawBar(svg, bar_start_x, o_y, bar_width, data_height);
                // 为避免数据太多时看不清数值，有多个 data 时采用分隔线，而不显示具体数值
                // barDrawText(svg, text_start_x, o_y - data_height - bar_setting.axis_width / 2 - 10, data[j], bar_setting.number_color);
            }
        }
    }

    return svg;
}