var TodoUtil = {
	JSON_KEY: "TODO",

	create: function(){
        var todoInfoList = [];
        var todoDataList = this.Json.get();
        for(var i in todoDataList) {
        	var info = todoDataList[i];
        	var todoInfo = new TodoInfo(info.id, info.title, info.detail,
        				info.finFlg, info.result, info.addDate, info.finDate);
        	todoInfoList.push(todoInfo);
        }
        return todoInfoList;
	},
	getById: function(todoId){
        var todoInfo = null;
        if(todoId !== undefined) {
    		var todoInfoList = this.create();
    	    for(var i in todoInfoList){
    	        if(todoInfoList[i].id === todoId) {
    	        	todoInfo = todoInfoList[i];
    	        	break;
    	        }
            }
        }
        return todoInfo;
	},
	/* todo情報を追加 */
	saveData: function(todoInfo){
		var todoInfoList = this.create();
	    var editFlg = false;
	    for(var i in todoInfoList){
	        if(todoInfoList[i].id === todoInfo.id) {
	        	todoInfoList[i] = todoInfo;
	        	editFlg = true;
	        	break;
	        }
	    }
	    // 編集ではなかったら、追加
	    if(!editFlg) {
	    	todoInfoList.push(todoInfo.getJSONData());
	    }
        this.Json.save(todoInfoList);
    },
    /* todo情報を削除 */
    deleteData: function(todoId) {
		var todoInfoList = this.create();
	    for(var i in todoInfoList){
	        if(todoInfoList[i].id === todoId) {
	        	todoInfoList.splice(i, 1);
	        	break;
	        }
	    }
        this.Json.save(todoInfoList);
    },
    Json: {
    	get: function(){
    	    return GameDataUtil.locStorage.getJson(TodoUtil.JSON_KEY);
    	},
    	save: function(jsonData){
            GameDataUtil.locStorage.saveJson(TodoUtil.JSON_KEY, jsonData);
        }
    },
    getMaxNumber: function(){
    	var maxId = 0;
		var todoInfoList = this.create();
	    for(var i in todoInfoList){
	    	var todoInfo = todoInfoList[i];
	    	var id = Number(todoInfo.id);
	    	if (maxId < id) {
	    		maxId = id;
			}
	    }
    	return maxId + 1;
    }
};

/**
 * Todo情報
 * id id
 * title タイトル
 * detail 詳細
 * finFlg 完了フラグ
 * result 結果
 * addDate 追加日
 * finDate 完了日
*/
function TodoInfo(id, title, detail, finFlg, result, addDate, finDate){
    this.id = id;
    this.title = title;
    this.detail = detail;
    this.finFlg = finFlg;
    this.result = result;
    this.addDate = addDate;
    this.finDate = finDate;
    /* JSONData */
    this.getJSONData = function() {
        var JSONData = {};
        JSONData["id"] = this.id;
        JSONData["title"] = this.title;
        JSONData["detail"] = this.detail;
        JSONData["finFlg"] = this.finFlg;
        JSONData["result"] = this.result;
        JSONData["addDate"] = this.addDate;
        JSONData["finDate"] = this.finDate;
        return JSONData;
    };
};