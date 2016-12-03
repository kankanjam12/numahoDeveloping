/** 定数 */
var CulcAttr = {
	HAI_TYPE: {
		KANTSU:"KANTSU",
		ANKO:"ANKO",
		SHUNTSU:"SHUNTSU",
		TOITSU:"TOITSU",
		RYANMEN:"RYANMEN",
		KANTYAN:"KANTYAN",
		PENTYAN:"PENTYAN",
		TANKI:"TANKI"
	}
};

var Culculator = function() {
	CC_PRI = {};
    CC_PUB = this;

    CC_PUB.culculate = function(haiInfoList) {
    	haiInfoList.sort(
			function(a, b) {
				var aVal = a["haiNum"];
				var bVal = b["haiNum"];
				if(aVal < bVal) { return -1; }
				if(aVal > bVal) { return 1; }
				return 0;
			}
    	);
    	return CC_PUB.divideHaiList(haiInfoList);
	};

    CC_PUB.divideHaiList = function(haiInfoList) {
    	var haiTypeMap = CC_PRI.divideHaiType(haiInfoList);
    	for ( var i in list) {
			var value = list[i];
		}
    	return CC_PUB.divideFinalHaiList(haiInfoList);
    };

    CC_PRI.divideHaiType = function(haiInfoList) {
    	var haiTypeMap = {};
    	for (var i in haiInfoList) {
			var haiInfo = haiInfoList[i];
			var type = haiInfo["haiType"];
			COMMON.Map.pushMapList(haiTypeMap, type, haiInfo);
		}
    	return haiTypeMap;
    };

	// 色々な組み合わせがあるので、連続して判定する
    // 待ち牌判定(４枚判定)
    CC_PUB.divideFinalHaiList = function(haiInfoList) {
    	var mentsuGroupList = [];
    	if(haiInfoList.length === 4) {
    		var hai1 = haiInfoList[0];
    		var hai2 = haiInfoList[1];
    		var hai3 = haiInfoList[2];
    		var hai4 = haiInfoList[3];
    		// 4枚判定
    		CC_PRI.judge4(hai1, hai2, hai3, hai4, mentsuGroupList);
    		// 3枚判定
    		CC_PRI.judge3(hai1, hai2, hai3, hai4, mentsuGroupList);
    		CC_PRI.judge3(hai1, hai2, hai4, hai3, mentsuGroupList);
    		CC_PRI.judge3(hai1, hai3, hai4, hai2, mentsuGroupList);
    		CC_PRI.judge3(hai2, hai3, hai4, hai1, mentsuGroupList);
    		// 2枚判定
    		CC_PRI.judge2(hai1, hai2, hai3, hai4, mentsuGroupList);
    		CC_PRI.judge2(hai1, hai3, hai2, hai4, mentsuGroupList);
    		CC_PRI.judge2(hai1, hai4, hai2, hai3, mentsuGroupList);
    	}
    	return mentsuGroupList;
	};
	// 4枚判定
	CC_PRI.judge4 = function(hai1, hai2, hai3, hai4, mentsuGroupList) {
		var hai1Num = hai1["haiNum"];
		var hai2Num = hai2["haiNum"];
		var hai3Num = hai3["haiNum"];
		var hai4Num = hai4["haiNum"];
		if(hai1Num === hai2Num && hai2Num === hai3Num && hai3Num === hai4Num) {
			var mentsuList = [];
			mentsuList.push(new CulcStructure.MentsuInfo([hai1, hai2, hai3, hai4], CulcAttr.HAI_TYPE.KANTSU));
   			mentsuGroupList.push(new CulcStructure.MentsuGroupInfo(mentsuList));
		}
	};
	// 3枚判定
	CC_PRI.judge3 = function(hai1, hai2, hai3, tankiHai, mentsuGroupList) {
		var type = CC_PRI.judgeMain3(hai1, hai2, hai3);
		if(type != null) {
			var mentsuList = [];
   			mentsuList.push(new CulcStructure.MentsuInfo([hai1, hai2, hai3], type));
   			mentsuList.push(new CulcStructure.MentsuInfo([tankiHai], CulcAttr.HAI_TYPE.TANKI));
   			mentsuGroupList.push(new CulcStructure.MentsuGroupInfo(mentsuList));
		}
	};
	CC_PRI.judgeMain3 = function(hai1, hai2, hai3) {
		var hai1Num = hai1["haiNum"];
		var hai2Num = hai2["haiNum"];
		var hai3Num = hai3["haiNum"];
		if(hai1["haiType"] === hai2["haiType"] && hai2["haiType"] === hai3["haiType"]) {
			var difference = hai2Num - hai1Num;
			var difference2 = hai3Num - hai2Num;
			if(difference === 1 && difference2 === 1) {
				return CulcAttr.HAI_TYPE.SHUNTSU;
			} else if(difference === 0 && difference2 === 0) {
				return CulcAttr.HAI_TYPE.ANKO;
			}
		}
		return null;
	};
	// 2枚セット判定
	CC_PRI.judge2 = function(haiA1, haiA2, haiB1, haiB2, mentsuGroupList) {
		var typeA = CC_PRI.judgeMain2(haiA1, haiA2);
		var typeB = CC_PRI.judgeMain2(haiB1, haiB2);
		if(typeA != null && typeB != null) {
			var mentsuList = [];
   			mentsuList.push(new CulcStructure.MentsuInfo([haiA1, haiA2], typeA));
   			mentsuList.push(new CulcStructure.MentsuInfo([haiB1, haiB2], typeB));
   			mentsuGroupList.push(new CulcStructure.MentsuGroupInfo(mentsuList));
		}
	};
	CC_PRI.judgeMain2 = function(hai1, hai2) {
		var hai1Num = hai1["haiNum"];
		var hai2Num = hai2["haiNum"];
		if(hai1["haiType"] === hai2["haiType"]) {
			var difference = hai2Num - hai1Num;
			if(difference === 2) {
				return CulcAttr.HAI_TYPE.KANTYAN;
			} else if(difference === 1) {
				if(hai1["haiPureNum"] === 1 || hai2["haiPureNum"] === 9) {
					return CulcAttr.HAI_TYPE.PENTYAN;
				} else {
					return CulcAttr.HAI_TYPE.SHUNTSU;
				}
			} else if(difference === 0) {
				return CulcAttr.HAI_TYPE.TOITSU;
			}
		}
		return null;
	};
};
var CulcStructure = {
	MentsuGroupInfo: function(mentsuInfoList) {
		this.mentsuInfoList = mentsuInfoList;

		this.toString = function() {
			var mentsuTxt = "";
			for (var i in this.mentsuInfoList) {
				if(mentsuTxt !== "") {
					mentsuTxt = mentsuTxt + ", ";
				}
				var mentsuInfo= this.mentsuInfoList[i];
				mentsuTxt = mentsuTxt + "[" + mentsuInfo.toString() + "]";
			}
			return mentsuTxt;
		};
	},
	MentsuInfo: function(haiInfoList, type) {
		this.haiInfoList = haiInfoList;
		this.type = type;

		this.toString = function() {
			var haiTxt = "";
			for (var i in this.haiInfoList) {
				if(haiTxt !== "") {
					haiTxt = haiTxt + ",";
				}
				var haiInfo = this.haiInfoList[i];
				haiTxt = haiTxt + haiInfo["haiNum"];
			}
			return type + ":[" + haiTxt + "]";
		};
	},
	HaiInfo: function(index, haiNum) {
		var haiType = 0;
		var haiPureNum = 0;
		var init = new function() {
			haiType = COMMON.Num.substr(haiNum, 0, 1);
			haiPureNum = COMMON.Num.substr(haiNum, 1, 1);
		};

		this.index = index;
		this.haiNum = haiNum;
		this.haiType = haiType;
		this.haiPureNum = haiPureNum;
		this.haiName;
	}
};