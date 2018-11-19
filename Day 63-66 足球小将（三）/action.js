var draw_config = {
    width: 800,
    height: 600,
    scale: 1 // 米转为像素的比例尺
};

class Player {
    constructor(vnum, burst, stamina, skill, power) {
        this.radius = 1;
        this.x = 0;
        this.y = 0;
        this.angle = 0; // 球员面向的角度
        this.v = 0; // 球员当前速度
        this.current_dur = 0; // 球员当前处于最高速的时间
        this.timer = null; // 为了可以随时停止运动，将计时器设为对象本身属性
        this.vnum = vnum;
        this.burst = burst;
        this.stamina = stamina;
        this.skill = skill;
        this.power = power;
    }

    run(x, y, ground, interval = 10) { // interval：球员位置刷新间隔，默认为 10ms
        var vmax = 3 + 9 * (this.vnum - 1) / 98, // 球员最高速度
            acc_time = 4 - 3 * (this.burst - 1) / 98, // 球员加速至最高速所需时间
            duration = 10 + 5 * (this.stamina - 1) / 98; // 球员最高速持续时间

        if (this.v === 0) {
            this.current_dur = 0; // 当速度为 0 时重置当前处于最高速时间，以便于 timer 不断开启停止时能保持速度，同时兼具还原体力功能
        }

        var width = x - this.x,
            height = y - this.y;
        this.angle = Math.atan(height / width);
        if (width < 0) { // atan 范围为 (-PI/2)~(PI/2)，因此要对角度修正，使角度范围是 0~2PI
            this.angle += Math.PI;
        } else if (this.angle < 0) {
            this.angle += 2 * Math.PI;
        }
        var place_now = Math.sqrt(width * width + height * height), // 球员与终点的上次与这次的距离差，用于判断是否到达终点
            place_last = place_now + 1;

        var unit_time = 1000 / interval; // 单位时间
        this.timer = setInterval(() => {
            if (place_last - place_now > 0) { // 未到达终点前（即距离差在不断缩小）
                if (this.current_dur < duration) { // 球员处于未力竭时
                    if (this.v < vmax) {
                        this.v += vmax / (acc_time * unit_time);
                    } else {
                        this.current_dur += 1 / unit_time;
                        this.v = vmax;
                    }
                } else {
                    this.v = vmax / 2; // 设力竭后速度稳定为极速 1/2
                }
                this.x += this.v * Math.cos(this.angle) / unit_time;
                this.y += this.v * Math.sin(this.angle) / unit_time;
                place_last = place_now;
                place_now = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
            } else if (this.v >= 0 && stayInBound(this, ground)) { // 到达终点后还要跑一段
                this.v -= 2 * vmax / (acc_time * unit_time); // 设减速度是加速度 2 倍
                this.x += this.v * Math.cos(this.angle) / unit_time;
                this.y += this.v * Math.sin(this.angle) / unit_time;
            } else { // 也可用 Promise 处理，这个 else 代码块的内容作为 .then() 的内容。使用 Promise 注意要 var that = this;
                this.v = 0;
                clearInterval(this.timer);
            }
        }, interval);
    }

    kick(angle, v, ball, ground) {
        var max_power_v = 5 + 45 * (this.power - 1) / 98,
            sigma_base = 10 - 8 * (this.skill - 1) / 98; // 标准差的基数
        var man_kick_angle = getBetweenAngle(angle, this.angle), // 球员角度与踢球角度的夹角
            man_ball_angle = getBetweenAngle(this.angle, ball.angle); // 球员角度与球运动角度的夹角
        var angle_offset = 0,
            sigma_offset = 1,
            max_kick_v = max_power_v;

        if (this.v > 0) { // 人运动时，有射出角度、力度的影响
            max_kick_v = max_power_v * (1.4 - man_kick_angle / Math.PI * 0.8);
            sigma_offset = Math.sqrt(1 + man_kick_angle / Math.PI);
        }
        if (ball.v > 0) { // 球运动时，有射出角度的影响
            angle_offset = Math.PI / 6 * -Math.abs(man_ball_angle - Math.PI / 2) / 3 * getGaussianRandom(0, 0.05 * sigma_base);
        }

        var actual_angle = getGaussianRandom(angle + angle_offset, Math.PI / 20 * sigma_base * sigma_offset), // 为了不让球员太菜，标准差设置得比较小
            actual_v = getGaussianRandom(v, v / 30 * sigma_base);
        actual_v = actual_v < 0 ? 0 : actual_v > max_kick_v ? max_kick_v : actual_v;

        ball.move(actual_angle, actual_v, ground);
    }
}

class Ball {
    constructor() {
        this.radius = 0.25;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.v = 0;
        this.timer = null; // 为了可以随时停止运动，将计时器设为对象本身属性
    }

    move(angle, start_v, ground, interval = 10) {
        var acc = -10;
        this.v = start_v;
        this.angle = angle;
        var unit_time = 1000 / interval;
        this.timer = setInterval(() => {
            if (this.v > 0 && stayInBound(this, ground)) {
                this.v += acc / unit_time;
                this.x += this.v * Math.cos(this.angle) / unit_time;
                this.y += this.v * Math.sin(this.angle) / unit_time;
            } else {
                this.v = 0;
                clearInterval(this.timer);
            }
        }, interval);
    }
}

function getRandom(min, max, integer = true) {
    if (integer) {
        return Math.ceil(min + (max - min + 1) * Math.random());
    }
    else {
        return min + Math.random() * max;
    }
}

function getGaussianRandom(mu, sigma) {
    do {
        var u = 2 * Math.random() - 1,
            v = 2 * Math.random() - 1,
            s = u * u + v * v;
    } while (s === 0 || s >= 1);
    var standard_output = u * Math.sqrt(-2 * Math.log(s) / s);
    return standard_output * sigma + mu;
}

function getBetweenAngle(angle_1, angle_2) {
    return Math.acos(Math.sin(angle_1) * Math.sin(angle_2) + Math.cos(angle_1) * Math.cos(angle_2)); // 用点乘计算两角度间的夹角
}

function stayInBound(object, ground) { // 检测物体是否在边界内，若不在，则将其定在边界，并返回 false
    var out_of_bound = object.x < 0 || object.y < 0 || object.x > ground.width || object.y > ground.height;
    if (out_of_bound) {
        object.x = object.x < 0 ? 0 : object.x > ground.width ? ground.width : object.x;
        object.y = object.y < 0 ? 0 : object.y > ground.height ? ground.height : object.y;
    }
    return !out_of_bound;
}

function getDistance(object_1, object_2) {
    return Math.sqrt((object_1.x - object_2.x) * (object_1.x - object_2.x) + (object_1.y - object_2.y) * (object_1.y - object_2.y));
}

function playerChaseBall(player, ball, ground) {
    clearInterval(player.timer);
    player.run(ball.x, ball.y, ground);
    if (getDistance(player, ball) < 0.2) { // 判定当球员与球小于一定距离时，将持球队员返回
        return player;
    }
}

function playerRun(player, ground) {
    if (player.v === 0 && Math.random() > 0.7) { // 为了让球员走走停停，当随机到大于 0.7 的数时才跑动
        let x = getRandom(0, ground.width),
            y = getRandom(0, ground.height);
        players.run(x, y, ground);
    }
}

function playerStopBall(player, ball, ground) {
    if (player.v === 0) {
        ball.v = 0;
    } else {
        
    }
}

function actionControl() {
    var chase_ball_players = [],
        have_ball_player = undefined;
    return function (players, ball, ground) {
        if (chase_ball_players.length > 0) {
            for (let i = 0; i < chase_ball_players.length; i++) {
                have_ball_player = playerChaseBall(chase_ball_players[i], ball, ground);
                if (have_ball_player) {
                    chase_ball_players = [];
                }
            }
        } else if (have_ball_player) {
            // TBD
        } else {
            for (let i = 0; i < 2; i++) {
                let min_distance = Infinity,
                    min_player = null;
                for (let j = 0; j < players[i].length; j++) {
                    let current_distance = getDistance(players[i][j], ball);
                    if (current_distance<min_distance) {
                        min_distance = current_distance;
                        min_player = players[i][j];
                    }
                }
                min_player?chase_ball_players.push(min_player):undefined; // 更加简洁的 if 写法
            }
        }
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < players[i].length; j++) {
                if (players[i][j] !== chase_ball_players[0] && players[i][j] !== chase_ball_players[1] && players[i][j] !== have_ball_player) {
                    playerRun(players[i][j], ground);
                }
            }
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

function drawAnimation(layer, players, ball) {
    var ctx = layer.getContext("2d");

    ctx.clearRect(0, 0, layer.width, layer.height);
    var players_count = players.length;
    for (let i = 0; i < players_count; i++) {
        drawPlayer(ctx, players[i]);
    }
    drawBall(ctx, ball);
}

function drawPlayer(ctx, player) {
    ctx.beginPath();
    ctx.arc(meterToPx(player.x), meterToPx(player.y), meterToPx(player.radius), 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
}

function drawBall(ctx, ball) {
    ctx.beginPath();
    ctx.arc(meterToPx(ball.x), meterToPx(ball.y), meterToPx(ball.radius), 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
}