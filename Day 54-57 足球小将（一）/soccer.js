var draw_config = {
    width: 800,
    height: 600,
    scale: 1 // 米转为像素的比例尺
};

class Player {
    constructor(vnum, power, stamina) {
        this.x = 0;
        this.y = 0;
        this.radius = 1;
        this.angel = 0; // 球员面向的角度
        this.v = 0; // 球员当前速度
        this.current_dur = 0;
        this.vmax = 3 + 9 * (vnum - 1) / 98; // 球员最高速度
        this.acc_time = 4 - 3 * (power - 1) / 98; // 球员加速至最高速所需时间
        this.duration = 10 + 5 * (stamina - 1) / 98; // 球员最高速持续时间
    }

    run(x, y, ground, interval = 10) { // interval：球员位置刷新间隔，默认为 10ms
        var width = x - this.x,
            height = y - this.y;
        this.angel = Math.atan(width / height);
        if ((width > 0 && height < 0) || (width < 0 && height < 0)) { // atan 范围为 (PI/2)~(-PI/2)，因此要对其他夹角做处理
            this.angel += Math.PI;
        }
        var place_now = Math.sqrt(width * width + height * height), // 球员与终点的上次与这次的距离差，用于判断是否到达终点
            place_last = place_now + 1;

        let timer = setInterval(() => {
            let unit_time = 1000 / interval; // 单位时间
            if (place_last - place_now > 0) { // 未到达终点前（即距离差在不断缩小）
                if (this.current_dur < this.duration) { // 球员处于未力竭时
                    if (this.v < this.vmax) {
                        this.v += this.vmax / (this.acc_time * unit_time);
                    } else {
                        this.current_dur += 1 / unit_time;
                        this.v = this.vmax;
                    }
                } else {
                    this.v = this.vmax / 2; // 设力竭后速度稳定为极速 1/2
                }
                this.x += this.v * Math.sin(this.angel) / unit_time;
                this.y += this.v * Math.cos(this.angel) / unit_time;
                place_last = place_now;
                place_now = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
            } else if (!(this.v < 0 || this.x < 0 || this.y < 0 || this.x > ground.width || this.y > ground.height)) { // 到达终点后还要跑一段
                this.v -= 2 * this.vmax / (this.acc_time * unit_time); // 设减速度是加速度 2 倍
                this.x += this.v * Math.sin(this.angel) / unit_time;
                this.y += this.v * Math.cos(this.angel) / unit_time;
            } else { // 也可用 Promise 处理，这个 else 代码块的内容作为 .then() 的内容。使用 Promise 注意要 var that = this;
                if (this.x < 0) { // 球员超出边界后将其定住
                    this.x = 0;
                }
                if (this.x > ground.width) {
                    this.x = ground.width;
                }
                if (this.y < 0) {
                    this.y = 0;
                }
                if (this.y > ground.height) {
                    this.y = ground.height;
                }
                this.v = 0;
                this.current_dur = 0;
                clearInterval(timer);
            }
        }, interval);
    }
}

function getRandom(min, max) {
    return Math.floor(min + (max - min + 1) * Math.random());
}

function playersRunControl(players, ground) {
    var players_count = players.length;
    for (let i = 0; i < players_count; i++) {
        if (players[i].v == 0) {
            let x = getRandom(0, ground.width),
                y = getRandom(0, ground.height);
            players[i].run(x, y, ground);
        }
    }
}

function createGround(width, height) {
    var playground = {};
    playground.width = width;
    playground.height = height;
    return playground;
}

function drawStatic(div, ground) { // 绘制静态内容
    var background = document.createElement("canvas"),
        layer = document.createElement("canvas"); // layer 用于放置动画
    layer.width = background.width = draw_config.width;
    draw_config.height = Math.round(draw_config.width / ground.width * ground.height); // 为了便捷，将长宽比设为与球场相同
    layer.height = background.height = draw_config.height;

    draw_config.scale = draw_config.width / ground.width;

    var ctx = background.getContext("2d");

    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, background.width, background.height);

    div.appendChild(background);
    div.appendChild(layer);

    return layer; // 将 layer 返回，便于后续绘图
}

function meterToPx(meter) {
    return Math.round(meter * draw_config.scale);
}

function drawAnimation(layer, players) {
    var ctx = layer.getContext("2d");

    ctx.clearRect(0, 0, layer.width, layer.height);
    var players_count = players.length;
    for (let i = 0; i < players_count; i++) {
        drawPlayer(ctx, players[i]);
    }
}

function drawPlayer(ctx, player) {
    ctx.beginPath();
    ctx.arc(meterToPx(player.x), meterToPx(player.y), meterToPx(player.radius), 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
}