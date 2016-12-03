var COMMON = {
	isNotEmpty: function(value) {
	    if(value === undefined || !value) {
	        return false;
	    }
	    return true;
	},
	List: {
		/* 指定したキーでリストをソート */
		sortList: function(list, sortKey) {
		    if(list) {
		        list.sort(
		            function(a,b){
		                var aIndex = a[sortKey];
		                var bIndex = b[sortKey];
		                if(aIndex < bIndex) return -1;
		                if(aIndex > bIndex) return 1;
		                return 0;
		            }
		        );
		    }
		}
	},
	Map:{
		pushMapList: function(map, key, value) {
		    if(!COMMON.isNotEmpty(map[key])) {
		        map[key] = [];
		    }
		    map[key].push(value);
		},
		getLength: function(map) {
		    var length = 0;
		    for(var i in map) {
		        length++;
		    }
		    return length;
		},
	    containsKey: function(map, key) {
	        return !GameDataUtil.isEmpty(map[key]);
	    },
        convertMapToList: function(map, type) {
        	var list = [];
        	for(var i in map) {
				list.push(map[i]);
        	}
        	list.sort();
        	if (type === "desc") {
            	list.reverse(); // 新しい順に
			}
        	return list;
        }
	},
    Str: {
        right: function(str, length) {
        	return str.substr(str.length - length, length);
        }
    },
    Num: {
    	/* 数字の判定 */
    	isNumber: function(number){
    	    if(isNaN(number) || isNaN(parseInt(number))) {
    	        return false;
    	    }
    	    return true;
    	},
    	substr: function(num, start, length){
    		var numStr = num.toString();
    		var sliceStr = numStr.substr(start, length);
    		return Number(sliceStr);
    	}
    },
    Tag: {
		addSpanTd: function(parent, value, id) {
	        var span = this.Create.newSpan(value, name);
	        return this.appendChildAtTr(parent, span);
	    },
	    addTextBoxTd: function(parent, value, id, cls) {
	        var inputText = this.Create.newInput("text", value, id, cls);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addNumberTextBoxTd: function(parent, value, id, cls) {
	        var inputText = this.Create.newInput("number", value, id, cls);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addRadioBoxTd: function(parent, value, name, func) {
	        var inputText = this.Create.newRadioBoxTd(value, name, func);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addAInLi: function(parent, id, href, text) {
	        var aElem = this.Create.newA(id, href, text);
	        return this.appendChildAtOl(parent, aElem);
	    },
	    appendChildAtOl: function(ol, child) {
	        var li = $("<li>");
	        ol.append(li.append(child));
	        return li;
	    },
	    appendChildAtTr: function(tr, child) {
	        var td = $("<td>");
	        tr.append(td.append(child));
	        return td;
	    },
	    createDataTable: function() {
	    	var tableObj = this.Create.newTable("dataTable");
	    	tableObj.attr("border", "2");
	    	return tableObj;
	    },
	    Create: {
	        newSpan: function(value, id) {
	            var span = $("<span>");
	            span.attr("id", id);
	            span.text(value);
	            return span;
	        },
	        newInput: function(type, value, id, cls) {
	            var inputText = $("<input>");
	            inputText.attr("type", type);
	            inputText.attr("id", id);
	            inputText.addClass(cls);
	            inputText.val(value);
	            return inputText;
	        },
	        newSelectBox: function(valueTextMap, id) {
	            var selectElem = $("<select>");
	            selectElem.attr("id", id);
	            for(var value in valueTextMap) {
	                var text = valueTextMap[value];
	                var optionElem = $("<option>");
	                optionElem.val(value);
	                optionElem.text(text);
	                selectElem.append(optionElem);
	            }
	            return selectElem;
	        },
	        newRadioBoxTd: function(value, name, func) {
	            var inputText = $("<input>");
	            inputText.attr("type", "radio");
	            inputText.attr("name", name);
	            inputText.val(value);
	            inputText.on("change", func);
	            return inputText;
	        },
	        newButton: function(id, text, func) {
	            var jbutton = $("<button>");
	            jbutton.attr("id", id);
	            jbutton.text(text);
	            jbutton.on("click", func);
	            return jbutton;
	        },
	        newA: function(id, href, text) {
	            var aElem = $("<a>");
	            aElem.attr("id", id);
	            aElem.attr("href", href);
	            aElem.text(text);
	            return aElem;
	        },
	        newTable: function(id) {
	            var tableElem = $("<table>");
	            tableElem.attr("id", id);
	            return tableElem;
	        }
	    }
    },
    locStorage: {
        is: function(key) {
            return localStorage[key] != undefined;
        },
        get: function(key) {
            var data = "";
            if(this.is(key)) {
                data = localStorage[key];
            }
            return data;
        },
        getJson: function(key) {
            var jsonData = this.get(key);
            if(jsonData) {
                jsonData = JSON.parse(jsonData);
            }
            return jsonData;
        },
        getJsonString: function(key) {
            var jsonData = this.getJson(key);
            return window.JSON.stringify(jsonData);
        },
        saveJson: function(key, jsonData) {
            localStorage[key] = window.JSON.stringify(jsonData);
        }
    },
    Cookie: {
    	get: function(key){
    		return $.cookie(key);
    	},
    	set: function(key, value){
    		return $.cookie(key, value);
    	}
    },
    Event: {
		BUTTON_ID_PREFIX: "button_",
		ADD_BUTTON_ID_PREFIX: "add_button_",
		EDIT_BUTTON_ID_PREFIX: "edit_button_",
		DELETE_BUTTON_ID_PREFIX: "del_button_",

		// 編集ページ移動処理
		moveEditPage: function(page, params) {
		    var prefix = "?";
		    var url = page;
		    for(var i in params){
		        var param = params[i];
		        url = url + prefix + param;
		        prefix = "&";
		    }
		    window.location = url;
		},
		// パラメータUtil
		getParamByKey: function(key) {
		    var paramsArray = this.getParamMap();
		    var value = paramsArray[key];
		    return value;
		},
		getParamMap: function() {
		    var paramsArray = [];
		    var url = new String(location.href);
		    var parameters = url.split("?");
		    if(parameters.length == 2) {
		        var params = parameters[1].split("&");
		        for (var i = 0; i < params.length; i++) {
		            var neet = params[i].split("=");
		            paramsArray.push(neet[0]);
		            paramsArray[neet[0]] = neet[1];
		        }
		    }
		    return paramsArray;
		}
	},
	TagUtil: {
	    addSpanTd: function(parent, value, id) {
	        var span = this.Create.newSpanTd(value, id);
	        return this.appendChildAtTr(parent, span);
	    },
	    addTextBoxTd: function(parent, value, id, cls) {
	        var inputText = this.Create.newInput("text", value, id, cls);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addNumberTextBoxTd: function(parent, value, id, cls) {
	        var inputText = this.Create.newInput("number", value, id, cls);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addRadioBoxTd: function(parent, value, name, func, checked, disabled) {
	        var inputText = this.Create.newRadioBoxTd(value, name, func);
	        inputText.attr("checked", checked);
	        inputText.attr("disabled", disabled);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addCheckBoxTd: function(parent, id, cls, name, checked, disabled) {
	        var inputText = this.Create.newInput("checkbox", "", id, cls);
	        if(!COMMON.isNotEmpty(checked)) { checked = false; }
	        inputText.attr("checked", checked);
	        inputText.attr("disabled", disabled);
	        return this.appendChildAtTr(parent, inputText);
	    },
	    addAInLi: function(parent, id, href, text) {
	        var aElem = this.Create.newA(id, href, text);
	        return this.appendChildAtOl(parent, aElem);
	    },
	    appendButtonInA: function(parent, id, href, text) {
            var aElem = this.Create.newA(id, href);
            var buttonElem = this.Create.newButton("", text);
            aElem.append(buttonElem);
            parent.append(aElem);
            return aElem;
	    },
	    appendChildAtOl: function(ol, child) {
	        var li = $("<li>");
	        ol.append(li.append(child));
	        return li;
	    },
	    appendChildAtTr: function(tr, child) {
	        var td = $("<td>");
	        tr.append(td.append(child));
	        return td;
	    },
	    createDataTable: function() {
	    	var tableObj = this.Create.newTable("dataTable");
	    	tableObj.attr("border", "2");
	    	return tableObj;
	    },
	    Create: {
	        newSpanTd: function(value, id) {
	            var span = $("<span>");
	            span.attr("id", id);
	            span.text(value);
	            return span;
	        },
	        newInput: function(type, value, id, cls, name) {
	            var inputText = $("<input>");
	            inputText.attr("type", type);
	            inputText.attr("id", id);
	            inputText.addClass(cls);
	            inputText.val(value);
	            return inputText;
	        },
	        newSelectBox: function(valueTextMap, id) {
	            var selectElem = $("<select>");
	            selectElem.attr("id", id);
	            for(var value in valueTextMap) {
	                var text = valueTextMap[value];
	                var optionElem = $("<option>");
	                optionElem.val(value);
	                optionElem.text(text);
	                selectElem.append(optionElem);
	            }
	            return selectElem;
	        },
	        newRadioBoxTd: function(value, name, func) {
	            var inputText = $("<input>");
	            inputText.attr("type", "radio");
	            inputText.attr("name", name);
	            inputText.val(value);
	            inputText.on("change", func);
	            return inputText;
	        },
	        newButton: function(id, text, func) {
	            var jbutton = $("<button>");
	            jbutton.attr("id", id);
	            jbutton.text(text);
	            jbutton.on("click", func);
	            return jbutton;
	        },
	        newA: function(id, href, text) {
	            var aElem = $("<a>");
	            aElem.attr("id", id);
	            aElem.attr("href", href);
	            aElem.text(text);
	            return aElem;
	        },
	        newTable: function(id) {
	            var tableElem = $("<table>");
	            tableElem.attr("id", id);
	            return tableElem;
	        }
	    }
	}
};
