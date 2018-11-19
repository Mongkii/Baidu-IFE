class Player {
    constructor(vnum, burst, stamina, skill, power) {
        this.radius = 1;
        this.team = NaN; // 队员所属队伍，可用值 0 和 1
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

        this.angle = getTargetAngle(this.x, this.y, x, y);

        var place_now = getDistance(x, y, this.x, this.y), // 球员与终点的上次与这次的距离差，用于判断是否到达终点
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
                place_now = getDistance(x, y, this.x, this.y);
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
            angle_offset = Math.PI / 6 * - Math.abs(man_ball_angle - Math.PI / 2) / 3 * getGaussianRandom(0, 0.05 * sigma_base);
        }

        var actual_angle = getGaussianRandom(angle + angle_offset, Math.PI / 20 * sigma_base * sigma_offset), // 为了不让球员太菜，标准差设置得比较小
            actual_v = getGaussianRandom(v, v / 30 * sigma_base);
        actual_v = actual_v < 0 ? 0 : actual_v > max_kick_v ? max_kick_v : actual_v;

        clearInterval(ball.timer); // 让球停止当前运动
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
        this.v = start_v;
        this.angle = angle;
        var unit_time = 1000 / interval;
        this.timer = setInterval(() => {
            if (this.v > 0 && stayInBound(this, ground)) {
                this.v += ground.ball_acc / unit_time;
                this.x += this.v * Math.cos(this.angle) / unit_time;
                this.y += this.v * Math.sin(this.angle) / unit_time;
            } else {
                this.v = 0;
                clearInterval(this.timer);
            }
        }, interval);
    }
}

/* ---- 虽然建立一个 Team 类便于管理，但在此项目中，直接将 team 指定为队员属性更好操作 ----
class Team {
    constructor() {
        this.list = [];
    }

    check(player) {
        var index = this.list.indexOf(player);
        if (index !== -1) {
            return index + 1; // 避免返回 0 导致 T/F 判断错误
        }
        return false;
    }

    assign(player) {
        if (!this.check(player)) {
            this.list.push(player);
        }
    }

    remove(player) {
        var index = this.check(player);
        if (index) {
            this.list.splice(index - 1, 1);
        }
    }

    clear() {
        this.list = [];
    }
}
*/


class Ground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.ball_acc = -5; // 球在球场运动的阻力，为了观赏性设置为 -5，真实阻力比这应该大
        this.gate_0 = { // 左球门，将球门抽象为一个点
            x: 0,
            y: height / 2
        }
        this.gate_1 = {
            x: width,
            y: height / 2
        }
    }
}