var td_on_edit = {product: "", region: "", month: "", status: false}; // 当前正在编辑的 td 的属性。status 标识是否处于编辑状态
var do_blur_func = true; // 是否执行 blur 函数的标识符。原本不小心写成了闭包，多次打开编辑器可能导致内存占用过大

function createEditSign(td) {
    var sign = document.createElement("div");
    sign.id = "edit_sign";
    sign.style.width = sign.style.height = Math.round(getSizeOfTD(td, "padding").x * 1.2) + "px";
    td.appendChild(sign);
}

function deleteEditSign(td) {
    if (td) {  // 存在时才删除，避免报错。下同
        var sign = td.querySelector("#edit_sign");
        if (sign) {
            td.removeChild(sign);
        }
    }
}

function showEditor(td) {
    deleteEditSign(td);
    createEditorDiv(td);
    updateOnEditProperty(td);
    addEventForEditor(); // 待元素创建后再为其添加事件
}

function closeEditor() {
    var editor = document.querySelector("#editor_div");
    if (editor) { // 存在时才删除，避免报错
        editor.parentNode.removeChild(editor);
    }
    refreshOutput(); // td_on_edit 的复位也在此函数中执行。因为刷新了表格，所以无法做到在编辑框 onblur 的同时响应表格的 onlick
}

function createEditorDiv(td) {
    var div_height = getSizeOfTD(td, "p_and_c").y,
        div_width = Math.round(getSizeOfTD(td, "p_and_c").x * 1.5),
        input_width = getSizeOfTD(td, "p_and_c").x,
        btn_width = div_width - input_width,
        btn_height = div_height / 2;

    var editor_div = document.createElement("div");
    {
        editor_div.id = "editor_div";
        editor_div.style.height = div_height + "px";
        editor_div.style.width = div_width + "px";
    }

    var input = document.createElement("input");
    {
        input.id = "td_input";
        input.style.height = div_height + "px";
        input.style.width = input_width + "px";
        input.value = td.innerText;
    }

    var btn_div = document.createElement("div");
    {
        btn_div.className = "btn_div";
        btn_div.style.height = div_height;
        btn_div.style.width = btn_width;

        var btn_submit = document.createElement("button");
        {
            btn_submit.id = "edit_submit";
            btn_submit.type = "submit";
            btn_submit.value = "ok";
        }
        var btn_cancel = document.createElement("button");
        {
            btn_cancel.id = "edit_cancel";
            btn_cancel.type = "button";
            btn_cancel.value = "cancel";
        }
        btn_submit.style.height = btn_cancel.style.height = btn_height + "px";
        btn_submit.style.width = btn_cancel.style.width = btn_width + "px";

        btn_div.appendChild(btn_submit);
        btn_div.appendChild(btn_cancel);
    }

    editor_div.appendChild(input);
    editor_div.appendChild(btn_div);

    td.appendChild(editor_div);
}

function getSizeOfTD(td, property) {
    var td_style = getComputedStyle(td, null);
    var td_size = {};
    switch (property) {
        case "padding": // padding 取单侧数值
            td_size.x = parseInt(td_style.paddingRight);
            td_size.y = parseInt(td_style.paddingBottom);
            break;
        case "content":
            td_size.x = parseInt(td_style.width);
            td_size.y = parseInt(td_style.height);
            break;
        case "p_and_c": // padding + content 的值
            td_size.x = 2 * parseInt(td_style.paddingRight) + parseInt(td_style.width);
            td_size.y = 2 * parseInt(td_style.paddingBottom) + parseInt(td_style.height);
            break;
    }
    return td_size;
}

function updateOnEditProperty(td) {
    var th = document.querySelector("#output_table thead tr").children;
    if (th[0].innerHTML == "商品") {
        td_on_edit.product = td.parentNode.children[0].innerText;
        td_on_edit.region = td.parentNode.children[1].innerText;
    } else if (th[0].innerHTML == "地区") {
        td_on_edit.product = td.parentNode.children[1].innerText;
        td_on_edit.region = td.parentNode.children[0].innerText;
    }

    var td_index = getChildIndex(td, td.parentNode);
    td_on_edit.month = parseInt(th[td_index].innerText);
    td_on_edit.status = true;
}

function getChildIndex(child, parent) {
    var index = Number.NaN;
    var children = parent.children;
    for (let i = 0; i < children.length; i++) {
        if (child == children[i]) {
            index = i;
            break;
        }
    }
    return index;
}

function addEventForEditor() {
    var td_input = document.querySelector("#td_input"),
        btn_sumbit = document.querySelector("#edit_submit"),
        btn_cancel = document.querySelector("#edit_cancel");

    td_input.focus();
    td_input.select(); //定位焦点

    td_input.onblur = function () {
        if (do_blur_func) {
            closeEditor();
        } else {
            do_blur_func = true;
        }
    }
    td_input.onkeydown = function (e) {
        if (e.key == "Escape" || e.key == "Esc") {
            noBlurAndCancel();
        } else if (e.key == "Enter") {
            noBlurAndSubmit();
        }
    }

    btn_sumbit.onmousedown = btn_cancel.onmousedown = function () { // onclick 优先级低于 onblur，因此要用高优先级的 onmousedown 执行函数将 blur 无效化
        do_blur_func = false;
    }

    btn_sumbit.onclick = noBlurAndSubmit;
    btn_cancel.onclick = noBlurAndCancel;

    // ----将部分用到的函数打包，便于管理----
    function noBlurAndSubmit() {
        do_blur_func = false;
        if (saveChange(td_input)) {
            closeEditor();
        } else {
            td_input.focus();
            td_input.select(); // 重新定位焦点
        }
    }

    function noBlurAndCancel() {
        do_blur_func = false;
        closeEditor();
    }
    // ------------
}

function saveChange(input) {
    var result = false;
    if (isNaN(input.value)) {
        alert("请输入正确的数字！");
    } else {
        updateLocalStorage(input.value, td_on_edit.product, td_on_edit.region, td_on_edit.month);
        syncLocalStorage(sourceData);
        result = true;
    }
    return result;
}