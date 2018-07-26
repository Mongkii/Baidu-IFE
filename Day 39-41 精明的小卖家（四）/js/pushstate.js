function filterByHash() {
    var raw_filter = decodeURIComponent(window.location.hash);
    var product_filter = raw_filter.match(/product=(.+)&/)[1].split("+"),
        region_filter = raw_filter.match(/&region=(.+)/)[1].split("+");
    checkOptionFromFilter("product", product_filter);
    checkOptionFromFilter("region", region_filter);
}

function checkOptionFromFilter(property, filter) {
    var options = document.querySelectorAll("input[name='" + property + "']");
    if (filter[0] == "all") {
        for (let i = 0; i < options.length; i++) {
            options[i].checked = true;
        }
    } else {
        for (let i = 0; i < options.length; i++) {
            options[i].checked = false; // 回复至未选择状态
            if (isInTheFilter(options[i].value, filter)) {
                options[i].checked = true;
            }
        }
    }
}

function setHashFromFilters() {
    var product_hash = makeHashURLFromFilter("product"),
        region_hash = makeHashURLFromFilter("region");
    var hash = product_hash + "&" + region_hash; // 本想用 encodeURIComponent() 转码，但不转码浏览器也能正常支持，可读性也更好，所以没这么做
    history.pushState(null, null, "#" + hash);
}

function makeHashURLFromFilter(property) {
    var checked = [];
    var options = document.querySelectorAll("input[name='" + property + "']");
    for (let i = 0; i < options.length; i++) {
        if (options[i].checked) {
            checked.push(options[i].value);
        }
    }
    var output = checked.join("+");
    if (/all/.test(output)) { // 为了可读性，当包含全选时，只显示 "all"
        output = "all";
    }
    output = property + "=" + output;
    return output;
}