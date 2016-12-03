/** 定数 */
var IAttr = {
    PREFIX: {
        MMN:"mmn_"
    },
    JSON_KEY: {
        DEFAULT:"mmn_default",
        CURRENT_GROUP:"mmn_current_group"
    },
    LOCAL_STRAGE_KEY: {
        GROUP_ID_LIST:"mmn_group_id_list"
    },
    KAZE_MAP: [
        {jap:"東", eng:"east"},
        {jap:"南", eng:"south"},
        {jap:"西", eng:"west"},
        {jap:"北", eng:"north"}
    ]
};

var m_maxMember = 4;
var m_gameDateInfo;

/** イニシャライズ */
$(function() {
    // テストデータ追加用
    //GameDataUtil.Test.setTestData();

    var jsonKey = GameDataUtil.Cookie.get(IAttr.JSON_KEY.CURRENT_GROUP);
    var jsonData = GameDataUtil.locStorage.getJson(jsonKey);
    var gameDateInfo = new GameData(jsonKey, jsonData);
    gameDateInfo.createUserInfoMap();
    m_gameDateInfo = gameDateInfo;
});

var GameDataUtil = {
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
    pushMapList: function(map, key, value) {
        if(!this.isNotEmpty(map[key])) {
            map[key] = [];
        }
        map[key].push(value);
    },
    Map:{
        containsKey: function(map, key) {
            return !GameDataUtil.isEmpty(map[key]);
        }
    },
    isNotEmpty: function(value) {
        if(value === undefined || !value) {
            return false;
        }
        return true;
    },
    getMapLength: function(map) {
        var length = 0;
        for(var i in map) {
            length++;
        }
        return length;
    },
    deepCopyUserInfo: function(userInfo){
        return new UserInfo(userInfo.id, userInfo.name, userInfo.index);
    },
    /* 数字の合計を求める */
    getSum: function(numberList){
        var sum = 0;
        for(var i in numberList){
            var number = numberList[i];
            if(!this.isNumber(number)) {
                alert("数字以外のものが入っています。: " + number);
                return null;
            } else {
                sum = sum + parseInt(number);
            }
        }
        return sum;
    },
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
    },
    /* 数字の判定 */
    isNumber: function(number){
        if(isNaN(number) || isNaN(parseInt(number))) {
            return false;
        }
        return true;
    },

    /* データ戻しようのテストメソッド */
    Test: {
        setTestData: function() {
            $.getJSON("data/gameData.json" , function(data) {
                var dateInfo = new GameData(DEFAULT_JSON_KEY, data);
                dateInfo.createUserInfoMap();
                dateInfo.saveJsonData(dateInfo.convertJSONData());
            });
        }
    }
};

var GameData = function(jsonKey, jsonData) {
    PRI = [];
    PUB = this;

    PRI.jsonKey = null;
    PRI.jsonData = null;
    PRI.userInfoMap = {};
    PRI.gameInfoMap = {};

    new function() {
        PRI.jsonKey = jsonKey;
        PRI.jsonData = jsonData;
    };

// 読み込みデータからユーザ情報を作成
    PUB.createUserInfoMap = function() {
        PRI.gameInfoMap = {};
        for(var i in PRI.jsonData.game) {
            var info = PRI.jsonData.game[i];
            PRI.gameInfoMap[info.id] = new GameDetailInfo(info.id, info.title, info.date,
					            			info.startTime,info.endTime, info.field, info.rate,
					            			info.description, info.uma, info.chip, info.oka, info.chipMap,
					            			info.tobisho, info.hakoshita);
        }
        userInfoMap = {};
        for(var i in PRI.jsonData.user) {
            var userData = PRI.jsonData.user[i];
            var userInfo = new UserInfo(userData.id, userData.name, userData.index);
            userInfoMap[userData.id] = userInfo;
        }
        for(var h in PRI.jsonData.gameDetail){
            var gameDetail = PRI.jsonData.gameDetail[h];
            var gameDetailInfo = PRI.gameInfoMap[gameDetail.gameId];
             // ユーザ得点情報追加
            var userPointInfoMap = {};
            for(var userId in userInfoMap) {
                var userInfo = GameDataUtil.deepCopyUserInfo(userInfoMap[userId]);
                userPointInfoMap[userId] = userInfo;
            }
            var pointInfoMap = {};
            for(var i in gameDetail.gameData){
                var gameData = gameDetail.gameData[i];
                var count = parseInt(gameData.count);
                for(var j in gameData.pointInfo){
                    var pointData = gameData.pointInfo[j];
                    var pointInfo = new PointInfo(count, pointData.point, pointData.userId, pointData.kazeEng, pointData.rank, pointData.score, pointData.isTobashi);
                    GameDataUtil.pushMapList(pointInfoMap, count, pointInfo);
                    userInfoMap[pointData.userId].pointInfoMap[count] = pointInfo;
                    // ユーザ得点情報追加
                    userPointInfoMap[pointInfo.userId].pointInfoMap[count] = pointInfo;
                }
            }
            gameDetailInfo.pointInfoMap = pointInfoMap;
            // ユーザ得点情報追加
            gameDetailInfo.userPointInfoMap = userPointInfoMap;
        }
        PRI.userInfoMap = userInfoMap;
        PUB.sortUserInfoList(this.userInfoList);
    };

    /*+ 表示データ作成 start */
    PUB.getUserPointInfo = function(gameId, userId) {
        var gameDetailInfo = PRI.gameInfoMap[gameId];
        return gameDetailInfo.userPointInfoMap[userId];
    };
    PUB.getGameUserCountData = function(gameId, userId, count) {
    	return PUB.getUserPointInfo(gameId, userId).pointInfoMap[count];
    };
    PUB.getUsedUserInfoMap = function(gameId) {
        var userInfoMap = {};
        for(var userId in PRI.userInfoMap){
            if(PUB.isUsedUserByGameId(gameId, userId)) {
                var userInfo = PRI.userInfoMap[userId];
                userInfoMap[userId] = PRI.userInfoMap[userId];
            }
        }
        return userInfoMap;
    };
    /* チップ情報取得 */
    PUB.getChipRateByGameUser = function(gameId, userId) {
        var gameDetailInfo = PRI.gameInfoMap[gameId];
        var chip = gameDetailInfo["chip"];
        var chipValue = PUB.getChipByGameUser(gameId, userId);
        var chipRate = Number(chip) * chipValue;
        return chipRate;
    };
    PUB.getChipByGameUser = function(gameId, userId) {
		var chipValue = 0;
        var gameDetailInfo = PRI.gameInfoMap[gameId];
    	var chipMap = gameDetailInfo["chipMap"];
    	if (chipMap !== undefined) {
           	chipValue = chipMap[userId];
           	if(chipValue === undefined) { chipValue = 0; }
    	}
        return Number(chipValue);
    };

    /* ポイントの合計取得 */
    PUB.getPointSumByGameUser = function(gameId, userId) {
        var gameDetailInfo = PRI.gameInfoMap[gameId];
        var userPointInfo = gameDetailInfo.userPointInfoMap[userId];
        if(userPointInfo) {
            return PUB.getPointSum(userPointInfo.pointInfoMap);
        }
        return null;
    };
    PUB.getPointSum = function(pointInfoList){
        var numberList = [];
        for(var i in pointInfoList){
            numberList.push(pointInfoList[i].point);
        }
        return GameDataUtil.getSum(numberList);
    };
    /* 素点の合計取得 */
    PUB.getScoreSum = function(pointInfoList){
        var numberList = [];
        for(var i in pointInfoList){
            numberList.push(pointInfoList[i].score);
        }
        return GameDataUtil.getSum(numberList);
    };

    /* 素点の合計取得 */
    PUB.getRankPoint = function(uma, rank){
    	var umaList = uma.split("-");
    	var uma2_3 = Number(umaList[0]);
    	var uma1_4 = Number(umaList[1]);
    	var rankPoint = 0;
    	switch (rank) {
			case 1:
				rankPoint = uma1_4;
				break;
			case 2:
				rankPoint = uma2_3;
				break;
			case 3:
				rankPoint = uma2_3 * -1;
				break;
			case 4:
				rankPoint = uma1_4 * -1;
				break;
		}
        return rankPoint;
    };

    /* 指定した回戦目のデータを取得 */
    PUB.getCountUserData = function(gameId, count) {
        var getCountUserDataList = [];
        var gameDetailInfo = PRI.gameInfoMap[gameId];
        // ゲーム情報あり
        if(GameDataUtil.isNotEmpty(gameDetailInfo)) {
            // データ編集ケース
            var editFlg = true;
            var pointInfoList = gameDetailInfo.pointInfoMap[count];
            // 得点新規
            if(!GameDataUtil.isNotEmpty(pointInfoList)) {
                editFlg = false;
                // データ追加ケース (前回のユーザ情報があれば引き継ぎ)
                pointInfoList = gameDetailInfo.pointInfoMap[Number(count)-1];
            }
            for(var i in pointInfoList) {
                var pointInfo = pointInfoList[i];
                var newUserInfo = GameDataUtil.deepCopyUserInfo(PRI.userInfoMap[pointInfo.userId]);
                newUserInfo.pointInfoMap = {};
                var point = editFlg ? pointInfo.point : ""; // 追加の場合はデータを引きつがない
                var rank = editFlg ? pointInfo.rank : ""; // 追加の場合はデータを引きつがない
                var score = editFlg ? pointInfo.score : ""; // 追加の場合はデータを引きつがない
                var isTobashi = editFlg ? pointInfo.isTobashi : ""; // 追加の場合はデータを引きつがない
                newUserInfo.pointInfoMap[count] = new PointInfo(count, point, pointInfo.userId, pointInfo.kazeEng, rank, score, isTobashi);
                getCountUserDataList.push(newUserInfo);
            }
        }
        // データ追加ケース (新規作成)
        if(getCountUserDataList.length == 0) {
            // 保存されたデータがなかったら、人数分の空データを作成する
            for(var i in IAttr.KAZE_MAP) {
                var userInfo = new UserInfo("", "", "");
                userInfo.pointInfoMap[count] = new PointInfo(count, "", "", IAttr.KAZE_MAP[i].eng, "", "", "");
                getCountUserDataList.push(userInfo);
            }
        }
        PUB.sortUserInfoList(getCountUserDataList);
        return getCountUserDataList;
    };

    /*+ JSON保存 start */
    /* JSON保存処理 */
    PUB.saveJsonData = function(jsonData) {
        GameDataUtil.locStorage.saveJson(PRI.jsonKey, jsonData);
    };
    /* 得点情報追加・編集 start */
    /* 得点情報を追加 */
    PUB.savePointInfo = function(gameId, gameDataInfo) {
        var jsonData = PUB.convertJSONData();
        var editFlg = false;
        for(var i in jsonData.gameDetail){
            if(jsonData.gameDetail[i].gameId == gameId) {
                for(var j in jsonData.gameDetail[i].gameData) {
                    if(jsonData.gameDetail[i].gameData[j].count == gameDataInfo.count) {
                        jsonData.gameDetail[i].gameData[j] = gameDataInfo;
                        editFlg = true;
                        break;
                    }
                }
            }
        }
        // 編集ではなかったら、追加
        if(!editFlg) {
            for(var i in jsonData.gameDetail){
                if(jsonData.gameDetail[i].gameId == gameId) {
                    jsonData.gameDetail[i].gameData.push(gameDataInfo);
                }
            }
        }
        PUB.saveJsonData(jsonData);
    };
    /** 得点情報を削除 */
    PUB.deletePointInfo = function(gameId, count) {
        var jsonData = PUB.convertJSONData();
        for(var i in jsonData.gameDetail){
            if(jsonData.gameDetail[i].gameId == gameId) {
                for(var j in jsonData.gameDetail[i].gameData) {
                    if(jsonData.gameDetail[i].gameData[j].count == count) {
                        jsonData.gameDetail[i].gameData.splice(j, 1);
                        break;
                    }
                }
            }
        }
        PUB.saveJsonData(jsonData);
    };

    /* ユーザ情報追加・編集 start */
    /** ユーザ情報を追加 */
    PUB.addUserInfo = function(addUserInfo) {
        var jsonData = PUB.convertJSONData();
        var editFlg = false;
        for(var i in jsonData.user) {
            if(jsonData.user[i].id == addUserInfo.id) {
            	jsonData.user[i] = addUserInfo;
                editFlg = true;
                break;
            }
        }
        // 編集ではなかったら、追加
        if(!editFlg) {
            jsonData.user.push(addUserInfo);
        }
        PUB.saveJsonData(jsonData);
    };
    /** ユーザ情報を削除 */
    PUB.deleteUserInfo = function(userId) {
        var jsonData = PUB.convertJSONData();
        var userInfo = PRI.userInfoMap[userId];
        if(GameDataUtil.getMapLength(userInfo.pointInfoMap) > 0) {
            alert("ユーザ「" + userInfo.name + "」は、得点があるため削除できません。");
            return null;
        }
        for(var i in jsonData.user){
            var jsonUserInfo = jsonData.user[i];
            if(jsonUserInfo.id == userId) {
                jsonData.user.splice(i, 1);
                break;
            }
        }
        PUB.saveJsonData(jsonData);
        return userInfo.name;
    };

    /* ゲーム情報追加・編集 start */
    /** ゲーム情報を追加 */
    PUB.addGameDetailInfo = function(addGameDetailInfo) {
        var jsonData = PUB.convertJSONData();
        var isAdd = true;
        for(var i in jsonData.game) {
            if(jsonData.game[i].id == addGameDetailInfo.id) {
                jsonData.game[i] = addGameDetailInfo;
                isAdd = false;
                break;
            }
        }
        if(isAdd) {
            jsonData.game.push(addGameDetailInfo);
        }
        PUB.saveJsonData(jsonData);
    };
    /** ゲーム情報を削除 */
    PUB.deleteGameDetailInfo = function(gameId) {
        var jsonData = PUB.convertJSONData();
        for(var i in jsonData.game) {
            var jsonGameInfo = jsonData.game[i];
            if(jsonGameInfo.id === gameId) {
                jsonData.game.splice(i, 1);
                break;
            }
        }
        // 詳細情報も消す
        for(var i in jsonData.gameDetail){
            if(jsonData.gameDetail[i].gameId === gameId) {
                jsonData.gameDetail.splice(i, 1);
                break;
            }
        }
        PUB.saveJsonData(jsonData);
    };

    /* JSON形式のデータ作成 */
    PUB.convertJSONData = function() {
        var jsonData = {};
        PUB.sortUserInfoList(PRI.userInfoList);
        jsonData["user"] = PUB.convertUserToJSON();
        jsonData["game"] = PUB.convertGameToJSON();
        // gameDetail
        jsonData["gameDetail"] = PUB.convertGameDetailToJSON();
        return jsonData;
    };
    /* 保存形式のユーザ情報作成 */
    PUB.convertUserToJSON = function() {
        var userDataList = [];
        for(var i in PRI.userInfoMap) {
            userDataList.push(PRI.userInfoMap[i].getJSONData());
        }
        return userDataList;
    };
    /* 保存形式のゲーム情報を作成 */
    PUB.convertGameToJSON = function() {
        var gameDataList = [];
        for(var i in PRI.gameInfoMap) {
            gameDataList.push(PRI.gameInfoMap[i].getJSONData());
        }
        return gameDataList;
    };
    /* 保存形式のゲーム情報を作成 */
    PUB.convertGameDetailToJSON = function() {
        var gameDetailDataList = [];
        for(var gameId in PRI.gameInfoMap) {
            var pointInfoMap = PRI.gameInfoMap[gameId].pointInfoMap;
            var gameDataList = [];
            for(var count in pointInfoMap) {
                var pointInfoList = pointInfoMap[count];
                // point情報設定
                var pointDataList = [];
                for(var k in pointInfoList) {
                    pointDataList.push(pointInfoList[k].getJSONData());
                }
                var gameData = {};
                gameData["count"] = count;
                gameData["pointInfo"] = pointDataList;
                gameDataList.push(gameData);
            }
            var gameDetailData = {};
            gameDetailData["gameId"] = gameId;
            gameDetailData["gameData"] = gameDataList;
            gameDetailDataList.push(gameDetailData);
        }
        return gameDetailDataList;
    };

    /** その他 */
    /* ユーザ情報リストをindexの小さい順にソート */
    PUB.sortUserInfoList = function(userInfoList) {
        GameDataUtil.sortList(userInfoList, "index");
    };

    /** プロパティ */
    PUB.getGameInfoById = function(gameId) {
        if(GameDataUtil.getMapLength(PRI.gameInfoMap) > 0) {
            return PRI.gameInfoMap[gameId];
        }
        return null;
    };
    PUB.getCurrentGroup = function() {
    	var currentGroup = GameDataUtil.Cookie.get(IAttr.JSON_KEY.CURRENT_GROUP);
    	currentGroup = currentGroup.replace(IAttr.MMN, "");
        return currentGroup;
    };
    PUB.getGameInfoMap = function() {
        return PRI.gameInfoMap;
    };
    PUB.getUserInfoMap = function() {
        return PRI.userInfoMap;
    };
    PUB.isUsedUserByGameId = function(gameId, userId) {
        var userPointInfo = PUB.getUserPointInfo(gameId, userId);
        if(GameDataUtil.getMapLength(userPointInfo.pointInfoMap) > 0) {
            return true;
        }
        return false;
    };

    PUB.getGameMaxCount = function(gameId) {
        var maxCount = 0;
        if(GameDataUtil.getMapLength(PRI.gameInfoMap) > 0) {
            for(var count in PRI.gameInfoMap[gameId].pointInfoMap) {
                if(Number(count) > Number(maxCount)) {
                    maxCount = Number(count);
                }
            }
        }
        return maxCount;
    };
};


/**
 * ゲーム詳細情報
 * id ゲームID
 * title タイトル
 * date 日程
 * startTime 開始時間
 * endTime 終了時間
 * field 場所
 * rate レート
 * description 概要
 * uma ウマ
 * chip チップ
 * oka オカ
 * chipMap チップマップ(key:userId)
 * tobisho 飛び賞
 * hakoshita 箱下清算有無
 * userPointInfoMap ユーザ得点情報マップ(key:userId)
 * pointInfoMap 得点情報マップ(key:gameCount)
*/
function GameDetailInfo(id, title, date, startTime, endTime, field, rate, description, uma,
						chip, oka, chipMap, tobisho, hakoshita) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.field = field;
    this.rate = rate;
    this.description = description;
    this.uma = uma;
    this.chip = chip;
    this.oka = oka;
    this.chipMap = chipMap;
    this.tobisho = tobisho;
    this.hakoshita = hakoshita;
    this.userPointInfoMap = {};
    this.pointInfoMap = {};

    /* JSONData */
    this.getJSONData = function() {
        var JSONData = {};
        JSONData["id"] = this.id;
        JSONData["title"] = this.title;
        JSONData["date"] = this.date;
        JSONData["startTime"] = this.startTime;
        JSONData["endTime"] = this.endTime;
        JSONData["field"] = this.field;
        JSONData["rate"] = this.rate;
        JSONData["description"] = this.description;
        JSONData["uma"] = this.uma;
        JSONData["chip"] = this.chip;
        JSONData["oka"] = this.oka;
        JSONData["chipMap"] = this.chipMap;
        JSONData["tobisho"] = this.tobisho;
        JSONData["hakoshita"] = this.hakoshita;
        return JSONData;
    };
};

/**
 * ユーザ情報
 * id ユーザID
 * name ユーザ名
 * index 表示順
 * pointInfoMap 得点情報マップ
*/
function UserInfo(id, name, index){
    this.id = id;
    this.name = name;
    this.index = index;
    this.pointInfoMap = {};
    /* JSONData */
    this.getJSONData = function() {
        var JSONData = {};
        JSONData["id"] = this.id;
        JSONData["name"] = this.name;
        JSONData["index"] = this.index;
        return JSONData;
    };
};
/**
 * 得点情報
 * count 〜回戦目
 * point 得点
 * userId ユーザID
 * kazeEng ~家(席)
 * rank 順位
 * score 素点
 * isTobashi 飛ばしフラグ
*/
function PointInfo(count, point, userId, kazeEng, rank, score, isTobashi){
    this.count = count;
    this.point = parseInt(point);
    this.userId = userId;
    this.kazeEng = kazeEng;
    this.rank = rank;
    this.score = parseInt(score);
    this.isTobashi = isTobashi;
    /* JSONData */
    this.getJSONData = function() {
        var JSONData = {};
        JSONData["point"] = this.point;
        JSONData["userId"] = this.userId;
        JSONData["kazeEng"] = this.kazeEng;
        JSONData["rank"] = this.rank;
        JSONData["score"] = this.score;
        JSONData["isTobashi"] = this.isTobashi;
        return JSONData;
    };

    this.isTobi = function() {
    	return this.score < 0;
    };
};