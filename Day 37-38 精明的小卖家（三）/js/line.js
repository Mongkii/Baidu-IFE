var line_setting = { // 原生 JS 不支持模块，为避免相同变量名冲突，设置项只好用对象封装
    // ----图表基本设置-----
    width: 800, // 图表宽
    height: 450, // 图表高
    axis_color: "#000000", // 轴的颜色
    axis_width: 2, // 轴的宽度
    divide_color: "#aaaaaa", // 分隔线颜色
    divide_number: 6, // 分隔线数量

    // ----生成数据设置----
    line_width: 2, // 线的宽度
    dot_radius: 4, // 点的半径
    graph_color: "#ed3f4f", // 点、线的颜色
    number_color: "#555555", // 柱顶显示的数字的颜色
    x_axis_space: 10, // X 轴左侧留白
    dot_position: 0.5, // 点在每一区间的位置，0.5 表示在中间
    y_axis_ratio: 1.2 // Y 轴最大值与数据最大值的比例
}

// ------------

function lineDrawAxis(ctx, o_x, o_y, x_length, y_length) {
    ctx.beginPath();
    ctx.moveTo(o_x, o_y);
    ctx.lineTo(o_x + x_length, o_y);
    ctx.moveTo(o_x, o_y);
    ctx.lineTo(o_x, o_y - y_length);
    ctx.lineWidth = line_setting.axis_width;
    ctx.strokeStyle = line_setting.axis_color;
    ctx.stroke();
}

function lineDrawDivide(ctx, o_x, o_y, x_length, y_length, max) {
    var gap = 1 / line_setting.divide_number * y_length / (line_setting.y_axis_ratio * 0.9); // 计算分隔线间隔。除以 (line_setting.y_axis_ratio * 0.9) 是为了使顶端有一定留白，更好看
    for (let i = 1; i < line_setting.divide_number + 1; i++) {
        var text = Math.round(gap * i / y_length * max);
        var y = o_y - gap * i;
        ctx.beginPath();
        ctx.moveTo(o_x, y);
        ctx.lineTo(o_x + x_length, y);
        ctx.lineWidth = line_setting.axis_width / 2;
        ctx.strokeStyle = line_setting.divide_color;
        ctx.stroke();
        lineDrawText(ctx, o_x - 30, y + 5, text, line_setting.divide_color);
    }
}

function lineDrawConnect(ctx, x_1, y_1, x_2, y_2) {
    ctx.beginPath();
    ctx.moveTo(x_1, y_1);
    ctx.lineTo(x_2, y_2);
    ctx.lineWidth = line_setting.line_width;
    ctx.strokeStyle = line_setting.graph_color;
    ctx.stroke();
}

function lineDrawDot(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, line_setting.dot_radius, 0, Math.PI * 2);
    ctx.fillStyle = line_setting.graph_color;
    ctx.fill();

    ctx.beginPath(); // 以在大圆里填充白色小圆的方式画"空心圆"，避免出现"线条透过圆环露出来"的情况
    ctx.arc(x, y, line_setting.dot_radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

function lineDrawText(ctx, x, y, str, color) {
    ctx.beginPath();
    ctx.font = "16px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
}

/*
function drawStructure(ctx) {

}
*/

function lineDrawGraph(input, multiple) { // multiple 标识"是否有多个 data"
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");
    canvas.width = line_setting.width;
    canvas.height = line_setting.height;

    var o_x = line_setting.width / 16,
        o_y = line_setting.height / 9 * 8; // 设置原点。为了美观，距离画布边缘留出了一段距离
    var x_length = line_setting.width / 16 * 14,
        y_length = line_setting.height / 9 * 7; // 设置 X、Y 轴长度

    var space = Math.floor((x_length - line_setting.x_axis_space) / 12); // 计算每一区间宽度
    var first_dot_x = o_x + line_setting.x_axis_space + space * line_setting.dot_position; // 第一个点出现的横坐标

    lineDrawAxis(ctx, o_x, o_y, x_length, y_length);
    for (let i = 0; i < 12; i++) {
        lineDrawText(ctx, first_dot_x + space * i - 20, o_y + 20, (i + 1) + " 月", line_setting.axis_color); // 添加月份，月份横坐标以点的横坐标为基准偏移
    }

    if (multiple != true) {
        var max = Math.max.apply(null, input) * line_setting.y_axis_ratio; // Y 轴最大值

        for (let i = 0; i < input.length; i++) {
            var dot_x = first_dot_x + space * i; // 当前点在 X 轴的位置
            var dot_y = o_y - input[i] / max * y_length; // 当前点在 Y 轴的位置
            if (i < input.length - 1) {
                lineDrawConnect(ctx, dot_x, dot_y, dot_x + space, o_y - input[i + 1] / max * y_length);
                // dot_x + space = 下一个点在 X 轴上的位置
                // o_y - input[i + 1] / max * y_length = 下一个点在 Y 轴上的位置
            }
            lineDrawDot(ctx, dot_x, dot_y);
            lineDrawText(ctx, dot_x - 15, dot_y - 15, input[i], line_setting.number_color); // 在图上显示具体数值
        }
    } else {
        var all_max = [];
        for (let i = 0; i < input.length; i++) {
            all_max.push(input[i]["max"]);
        }
        var max = Math.max.apply(null, all_max) * line_setting.y_axis_ratio;
        lineDrawDivide(ctx, o_x, o_y, x_length, y_length, max); // 绘制分隔线

        for (let i = 0; i < input.length; i++) {
            let data = input[i]["data"];
            line_setting.graph_color = input[i]["color"];

            for (let j = 0; j < data.length; j++) {
                var dot_x = first_dot_x + space * j;
                var dot_y = o_y - data[j] / max * y_length;
                if (j < data.length - 1) {
                    lineDrawConnect(ctx, dot_x, dot_y, dot_x + space, o_y - data[j + 1] / max * y_length);
                }
                lineDrawDot(ctx, dot_x, dot_y);
                // 为避免数据太多时看不清数值，有多个 data 时采用分隔线，而不显示具体数值
                // lineDrawText(ctx, dot_x - 15, dot_y - 15, data[j], line_setting.number_color);
            }
        }
    }

    return canvas;
}