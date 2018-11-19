var draw_config = {
    width: 800,
    height: 600,
    scale: 1 // 米转为像素的比例尺
};

function getRandom(min, max, integer = true) {
    if (integer) {
        return Math.floor(min + (max - min + 1) * Math.random());
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
    var sum = (Math.sin(angle_1) * Math.sin(angle_2) + Math.cos(angle_1) * Math.cos(angle_2)).toFixed(5); // 用点乘计算两角度间的夹角。为了避免四舍五入导致最后结果略大于 1，要限制小数位数
    return Math.acos(sum);
}

function getTargetAngle(from_x, from_y, to_x, to_y) { // 计算前往的角度并将角度范围换算为 0~2PI
    var width = to_x - from_x,
        height = to_y - from_y;

    var angle = Math.atan(height / width);
    if (width < 0) { // atan 范围为 (-PI/2)~(PI/2)，因此要对角度修正，使角度范围是 0~2PI
        angle += Math.PI;
    } else if (angle < 0) {
        angle += 2 * Math.PI;
    }
    if (isNaN(angle)) {
        return getRandom(0, 2 * Math.PI, false);
    }
    return angle;
}

function stayInBound(object, ground) { // 检测物体是否在边界内，若不在，则将其定在边界，并返回 false
    var out_of_bound = object.x < 0 || object.y < 0 || object.x > ground.width || object.y > ground.height;
    if (out_of_bound) {
        object.x = object.x < 0 ? 0 : object.x > ground.width ? ground.width : object.x;
        object.y = object.y < 0 ? 0 : object.y > ground.height ? ground.height : object.y;
    }
    return !out_of_bound;
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function getClosestPlayer(origin, players) {
    var min_distance = Infinity,
        min_player = false;
    for (let i = 0; i < players.length; i++) {
        let current_distance = getDistance(origin.x, origin.y, players[i].x, players[i].y);
        if (current_distance < min_distance && players[i] !== origin) {
            min_distance = current_distance;
            min_player = players[i];
        }
    }
    return min_player;
}

function playerHaveBall(player, ball) {
    if (getDistance(player.x, player.y, ball.x, ball.y) < 0.2) { // 判定当球员与球小于一定距离时，将持球队员返回
        return player;
    }
    return false;
}

function playerRandomRun(player, ground) {
    if (player.v === 0 && Math.random() > 0.7) { // 为了让球员走走停停，当随机到大于 0.7 的数时才跑动
        let x = getRandom(0, ground.width),
            y = getRandom(0, ground.height);
        player.run(x, y, ground);
    }
}

function playerChaseBall(player, ball, ground) {
    clearInterval(player.timer);
    player.run(ball.x, ball.y, ground);
}

function playerStopBall(player, ball, ground) {
    ball.angle = player.angle;
    if (player.v === 0) {
        ball.v = 0;
    } else {
        let distance = player.v * 1;
        let v0 = Math.sqrt(-2 * ground.ball_acc * distance); // 计算初速度，使球到目标地点速度正好为 0
        player.kick(player.angle, v0, ball, ground);
        playerChaseBall(player, ball, ground);
    }
}

function playerPassBall(player, to_player, ball, ground) {
    var angle, distance, v0;
    if (to_player.v === 0) {
        angle = getTargetAngle(player.x, player.y, to_player.x, to_player.y);
        distance = getDistance(player.x, player.y, to_player.x, to_player.y);
    } else {
        // 假设球运动的平均速度为对方 2 倍速度，「以本球员为圆心，v球 * t 为半径」形成的圆与「以对方为起点，v人 为斜率」的射线有交点。即射线上一点在圆的半径上
        let a = (Math.sin(to_player.angle) * Math.sin(to_player.angle) + Math.cos(to_player.angle) * Math.cos(to_player.angle) - 4) / 4, // 计算求根公式的参数
            b = ((to_player.x - player.x) * Math.cos(to_player.angle) + (to_player.y - player.y) * Math.sin(to_player.angle)) / (2 * to_player.v), // 为简化计算，假设对方球员匀速运动
            c = ((to_player.x - player.x) * (to_player.x - player.x) + (to_player.y - player.y) * (to_player.y - player.y)) / (4 * to_player.v * to_player.v);
        let t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a),
            t2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        let t = Math.min(t1, t2);
        if (t < 0 && t2 >= 0) {
            t = t2;
        } else {
            t = 0;
        }

        let to_x = to_player.x + to_player.v * Math.cos(to_player.angle) * t,
            to_y = to_player.y + to_player.v * Math.sin(to_player.angle) * t;
        angle = getTargetAngle(player.x, player.y, to_x, to_y);
        distance = getDistance(player.x, player.y, to_x, to_y);
    }
    v0 = Math.sqrt(-2 * ground.ball_acc * distance);
    player.kick(angle, v0, ball, ground);
}

function playerBringBall(player, ball, ground) {
    if (playerHaveBall(player, ball)) {
        ball.angle = player.angle;
        let distance = player.v * 1;
        let v0 = Math.sqrt(player.v * player.v / 4 - 2 * ground.ball_acc * distance); // 令带球之后球速为当前球员速度 1/2
        player.kick(player.angle, v0, ball, ground);
    }
    playerChaseBall(player, ball, ground);
}

function playerShootBall(player, ball, ground) {
    var chance_lmr, chance_ud, chance;
    switch (getRandom(1, 3)) { // 左中右射门几率差别
        case 1:
        case 3:
            chance_lmr = 0.8;
            break;
        case 2:
            chance_lmr = 1;
            break;
    }
    switch (getRandom(1, 2)) { // 上下射门几率差别
        case 1:
            chance_ud = 0.8;
            break;
        case 2:
            chance_ud = 1;
            break;
    }
    chance = chance_lmr * chance_ud;
    var gate;
    gate = player.team === 0 ? ground.gate_1 : ground.gate_0;
    var ini_angle = getTargetAngle(player.x, player.y, gate.x, gate.y);
    var angle = getGaussianRandom(ini_angle, Math.PI / 6 * (1 - 0.8 * chance)); // 用几率将射门角度做修正
    var v0 = -2 * ground.ball_acc * getDistance(player.x, player.y, gate.x, gate.y);
    player.kick(angle, v0, ball, ground);
}

function getActionControl() {
    var chase_ball_players = [],
        have_ball_player = false;
    return function (players, ball, ground) {
        if (chase_ball_players.length > 0) {
            for (let i = 0; i < chase_ball_players.length; i++) {
                have_ball_player = playerHaveBall(chase_ball_players[i], ball);
                if (have_ball_player) {
                    clearInterval(chase_ball_players[1 - i].timer);
                    chase_ball_players[1 - i].v = 0; // 让另一方停止抢球，从而去做随机运动
                    chase_ball_players = [];
                    break;
                } else {
                    playerChaseBall(chase_ball_players[i], ball, ground);
                }
            }
        } else if (have_ball_player) {
            var what_to_do = getRandom(1,10);
            if (what_to_do < 2) {
                playerStopBall(have_ball_player, ball, ground);
            } else if (what_to_do < 6) {
                let to_player = getClosestPlayer(have_ball_player, players[have_ball_player.team]); // 规定 players.team 取值 0/1，就是为了在这种地方稍微减弱耦合
                playerPassBall(have_ball_player, to_player, ball, ground);
                chase_ball_players.push(to_player);
                chase_ball_players.push(getClosestPlayer(ball, players[1 - have_ball_player.team])); // 让对方队员来抢球
                have_ball_player = false;
            } else if (what_to_do < 9) {
                playerBringBall(have_ball_player, ball, ground);
            } else {
                playerShootBall(have_ball_player, ball, ground);
                have_ball_player = false;
            }
        } else {
            chase_ball_players.push(getClosestPlayer(ball, players[0]));
            chase_ball_players.push(getClosestPlayer(ball, players[1]));
        }
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < players[i].length; j++) {
                if (players[i][j] !== chase_ball_players[0] && players[i][j] !== chase_ball_players[1] && players[i][j] !== have_ball_player) {
                    playerRandomRun(players[i][j], ground);
                }
            }
        }
    }
}

function drawStatic(div, ground) { // 绘制静态内容
    var background = document.createElement("canvas"),
        layer = document.createElement("canvas"); // layer 用于放置动画
    layer.width = background.width = draw_config.width;
    draw_config.height = Math.round(draw_config.width / ground.width * ground.height); // 为了便捷，将长宽比设为与球场相同
    layer.height = background.height = draw_config.height;

    draw_config.scale = draw_config.width / ground.width;

    var ctx = background.getContext("2d");

    ctx.fillStyle = "#59A345";
    ctx.fillRect(0, 0, background.width, background.height);
    ctx.fillStyle = "#3E8F49";
    ctx.fillRect(0, background.height/2-background.height*0.27/2, background.width*0.08, background.height*0.27);
    ctx.fillRect(background.width-background.width*0.08, background.height/2-background.height*0.27/2, background.width*0.08, background.height*0.27);

    div.appendChild(background);
    div.appendChild(layer);

    return layer; // 将 layer 返回，便于后续绘图
}

function meterToPx(meter) {
    return Math.round(meter * draw_config.scale);
}

function drawAnimation(layer, players, ball) {
    var ctx = layer.getContext("2d");
    var team_color = ["#F5B940", "#981E45"];

    ctx.clearRect(0, 0, layer.width, layer.height);
    for (let i = 0; i < 2; i++) {
        var players_count = players[i].length;
        for (let j = 0; j < players_count; j++) {
            drawPlayer(ctx, players[i][j], team_color[i]);
        }
    }
    drawBall(ctx, ball);
}

function drawPlayer(ctx, player, color) {
    ctx.beginPath();
    ctx.arc(meterToPx(player.x), meterToPx(player.y), meterToPx(player.radius), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawBall(ctx, ball) {
    ctx.beginPath();
    ctx.arc(meterToPx(ball.x), meterToPx(ball.y), meterToPx(ball.radius), 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
}