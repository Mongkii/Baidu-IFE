function addOptionInFieldset(fieldset, label_text, checkbox_name, checkbox_value) {
    var option = document.createElement("label");
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = checkbox_name;
    checkbox.value = checkbox_value;
    option.appendChild(checkbox);
    option.innerHTML += label_text; // 为 checkbox 添加文字 label
    fieldset.appendChild(option);
}

function createOptions(fieldset, property) {
    var option_list = [];
    for (let i = 0; i < sourceData.length; i++) {
        let same_item_found = false; // 标记是否在查重列表中出现了相同的内容
        for (let x = 0; x < option_list.length; x++) {
            if (sourceData[i][property] == option_list[x]) {
                same_item_found = true;
                break;
            }
        }
        if (!same_item_found) {
            option_list.push(sourceData[i][property]); // 将该项添加到查重列表
            addOptionInFieldset(fieldset, sourceData[i][property], property, sourceData[i][property]); // 将该项添加到 select 组
        }
    }

    var hr = document.createElement("hr"); // 为了样式美观，插入分隔线
    fieldset.appendChild(hr);

    addOptionInFieldset(fieldset, "全选", property, "all"); // 添加全选
}

function selectAll(fieldset) { // 按题目要求进行的实现。不过个人感觉"全选"按钮设置为取消勾选时，全部不选上/或返回全选前勾选情况，会更好
    var options = fieldset.querySelectorAll("input[type='checkbox']");
    for (let i = 0; i < options.length; i++) {
        options[i].checked = true;
    }
}

function checkNumOfSelected(e, fieldset) {
    var options = fieldset.querySelectorAll("input[type='checkbox']:not([value='all'])");
    var num_of_selected = 0; // 记录被选中项的数量
    var select_all = fieldset.querySelector("input[value='all']");

    for (let i = 0; i < options.length; i++) {
        if (options[i].checked) {
            num_of_selected += 1;
        }
    }

    if (num_of_selected == options.length) { // 根据被选中项数量决定进行什么操作
        select_all.checked = true;
    } else {
        select_all.checked = false;
        if (num_of_selected == 0) {
            e.target.checked = true;
        }
    }
}