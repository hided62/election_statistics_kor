// ==UserScript==
// @name         개표진행 지방선거 2022
// @namespace    https://hided.net/
// @version      0.1
// @description  개표 진행 상황을 보여줍니다. 각 시군구별 개별 개표율을 합산한 득표율을 보여줍니다.
// @author       Hide_D
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @match        http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml
// @downloadURL  https://raw.githubusercontent.com/hided62/election_statistics_kor/main/dist/election2022_6.user.js
// @updateURL    https://raw.githubusercontent.com/hided62/election_statistics_kor/main/dist/election2022_6.user.js
// @grant        none
// ==/UserScript==
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 194:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.subsNull = subsNull;
function subsNull(data, nullData) {
    if (data === null || data === "" || data === undefined) {
        return nullData;
    }
    return data;
}


/***/ }),

/***/ 440:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.toNumber = toNumber;
function toNumber(value) {
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string") {
        return Number(value);
    }
    throw new Error(`Cannot convert ${value} to number`);
}


/***/ }),

/***/ 168:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports["기호제거"] = 기호제거;
function 기호제거(text) {
    return text.replace(/\||{|}|_|-|\[|\]|\(|\)|·|!|\?|,| |/gi, "");
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

var _toNumber = __webpack_require__(440);
var _subsNull = __webpack_require__(194);
var _기호제거 = __webpack_require__(168);
const 정당코드 = {
    더불어민주당: {
        정당: "\uB354\uBD88\uC5B4\uBBFC\uC8FC\uB2F9",
        색상: "#196CD1"
    },
    국민의힘: {
        정당: "\uAD6D\uBBFC\uC758\uD798",
        색상: "#E61E2B"
    },
    정의당: {
        정당: "\uC815\uC758\uB2F9",
        색상: "#FFCC00"
    },
    기본소득당: {
        정당: "\uAE30\uBCF8\uC18C\uB4DD\uB2F9",
        색상: "#777777"
    },
    녹색당: {
        정당: "\uB179\uC0C9\uB2F9",
        색상: "#777777"
    },
    독도당: {
        정당: "\uB3C5\uB3C4\uB2F9",
        색상: "#777777"
    },
    진보당: {
        정당: "\uC9C4\uBCF4\uB2F9",
        색상: "#777777"
    },
    통일한국당: {
        정당: "\uD1B5\uC77C\uD55C\uAD6D\uB2F9",
        색상: "#777777"
    },
    한류연합당: {
        정당: "\uD55C\uB958\uC5F0\uD569\uB2F9",
        색상: "#777777"
    },
    무소속: {
        정당: "\uBB34\uC18C\uC18D",
        색상: "#777777"
    }
};
const 지역코드 = {
    서울특별시: 1,
    부산광역시: 2,
    대구광역시: 3,
    인천광역시: 4,
    광주광역시: 5,
    대전광역시: 6,
    울산광역시: 7,
    세종특별자치시: 8,
    경기도: 9,
    강원도: 10,
    충청북도: 11,
    충청남도: 12,
    전라북도: 13,
    전라남도: 14,
    경상북도: 15,
    경상남도: 16,
    제주특별자치도: 17
};
const $ = jQuery.noConflict(true);
//KST 2022-06-01 15:50
//Replace ',' => ''
//From: ^([가-힣]+)\s+((\d+)\s+){3,3}(\d+)\s+(\d+)\s+(\d+)\s+[\d\.]+%\s*$
//To:  $1: [$4, $5],
const 총투표수 = {
    서울특별시: {
        종로구: [
            28092,
            31174
        ],
        중구: [
            25492,
            25302
        ],
        용산구: [
            44309,
            43364
        ],
        성동구: [
            60667,
            56149
        ],
        광진구: [
            67526,
            63630
        ],
        동대문구: [
            70251,
            59906
        ],
        중랑구: [
            75147,
            75607
        ],
        성북구: [
            85530,
            83873
        ],
        강북구: [
            55861,
            56889
        ],
        도봉구: [
            65313,
            60385
        ],
        노원구: [
            108378,
            94382
        ],
        은평구: [
            87836,
            94153
        ],
        서대문구: [
            62871,
            59397
        ],
        마포구: [
            74750,
            69162
        ],
        양천구: [
            90391,
            82340
        ],
        강서구: [
            113168,
            103660
        ],
        구로구: [
            83373,
            73219
        ],
        금천구: [
            45550,
            43705
        ],
        영등포구: [
            79772,
            70613
        ],
        동작구: [
            77048,
            80147
        ],
        관악구: [
            93648,
            96465
        ],
        서초구: [
            86262,
            69104
        ],
        강남구: [
            111563,
            84256
        ],
        송파구: [
            135746,
            122480
        ],
        강동구: [
            91471,
            86331
        ]
    },
    부산광역시: {
        중구: [
            8264,
            8385
        ],
        서구: [
            22378,
            20086
        ],
        동구: [
            16556,
            18748
        ],
        영도구: [
            21206,
            22538
        ],
        부산진구: [
            66823,
            57996
        ],
        동래구: [
            53718,
            43065
        ],
        남구: [
            52768,
            46438
        ],
        북구: [
            60114,
            44185
        ],
        해운대구: [
            75660,
            61055
        ],
        기장군: [
            31402,
            21366
        ],
        사하구: [
            58633,
            47617
        ],
        금정구: [
            48175,
            42997
        ],
        강서구: [
            25248,
            17186
        ],
        연제구: [
            43880,
            32649
        ],
        수영구: [
            32482,
            30253
        ],
        사상구: [
            40890,
            32311
        ]
    },
    대구광역시: {
        중구: [
            13567,
            11354
        ],
        동구: [
            63861,
            45888
        ],
        서구: [
            33267,
            25862
        ],
        남구: [
            26654,
            19834
        ],
        북구: [
            77214,
            55360
        ],
        수성구: [
            79174,
            57805
        ],
        달서구: [
            95240,
            61488
        ],
        달성군: [
            47169,
            27386
        ]
    },
    인천광역시: {
        중구: [
            27111,
            24089
        ],
        동구: [
            13006,
            13545
        ],
        미추홀구: [
            74491,
            68479
        ],
        연수구: [
            71195,
            64794
        ],
        남동구: [
            95673,
            84496
        ],
        부평구: [
            90024,
            82321
        ],
        계양구: [
            70397,
            58836
        ],
        서구: [
            93668,
            89017
        ],
        강화군: [
            16312,
            19597
        ],
        옹진군: [
            5099,
            7063
        ]
    },
    광주광역시: {
        동구: [
            14116,
            18834
        ],
        서구: [
            37367,
            45781
        ],
        남구: [
            26880,
            34228
        ],
        북구: [
            48106,
            66766
        ],
        광산구: [
            44983,
            44701
        ]
    },
    대전광역시: {
        동구: [
            41477,
            40239
        ],
        중구: [
            46200,
            40082
        ],
        서구: [
            85732,
            76929
        ],
        유성구: [
            72573,
            58318
        ],
        대덕구: [
            35888,
            29503
        ]
    },
    울산광역시: {
        중구: [
            49764,
            37259
        ],
        남구: [
            63213,
            48861
        ],
        동구: [
            30515,
            28817
        ],
        북구: [
            44910,
            32273
        ],
        울주군: [
            45636,
            38954
        ]
    },
    세종특별자치시: {
        세종특별자치시: [
            60074,
            65812
        ]
    },
    경기도: {
        수원시장안구: [
            48634,
            40128
        ],
        수원시권선구: [
            89855,
            62620
        ],
        수원시팔달구: [
            39561,
            31031
        ],
        수원시영통구: [
            71973,
            58289
        ],
        성남시수정구: [
            48796,
            47171
        ],
        성남시중원구: [
            39910,
            40686
        ],
        성남시분당구: [
            129617,
            89310
        ],
        의정부시: [
            94170,
            72322
        ],
        안양시만안구: [
            53067,
            46002
        ],
        안양시동안구: [
            75301,
            61339
        ],
        부천시: [
            153614,
            136047
        ],
        광명시: [
            67492,
            56164
        ],
        평택시: [
            105386,
            77019
        ],
        양주시: [
            48314,
            37373
        ],
        동두천시: [
            17968,
            18375
        ],
        안산시상록구: [
            71865,
            50328
        ],
        안산시단원구: [
            62726,
            43705
        ],
        고양시덕양구: [
            121408,
            91049
        ],
        고양시일산동구: [
            59863,
            43080
        ],
        고양시일산서구: [
            58318,
            44778
        ],
        과천시: [
            18449,
            17018
        ],
        의왕시: [
            40874,
            30361
        ],
        구리시: [
            42132,
            31503
        ],
        남양주시: [
            148211,
            102143
        ],
        오산시: [
            40903,
            28710
        ],
        화성시: [
            150180,
            127561
        ],
        시흥시: [
            98400,
            71426
        ],
        군포시: [
            60329,
            46937
        ],
        하남시: [
            65188,
            57583
        ],
        파주시: [
            101648,
            63442
        ],
        여주시: [
            24016,
            22365
        ],
        이천시: [
            42016,
            38024
        ],
        용인시처인구: [
            53417,
            40594
        ],
        용인시수지구: [
            68083,
            49334
        ],
        용인시기흥구: [
            109318,
            90317
        ],
        안성시: [
            37997,
            36129
        ],
        김포시: [
            105090,
            66809
        ],
        광주시: [
            70813,
            57158
        ],
        포천시: [
            30364,
            29263
        ],
        연천군: [
            11664,
            9489
        ],
        양평군: [
            27320,
            29275
        ],
        가평군: [
            16228,
            14434
        ]
    },
    강원도: {
        춘천시: [
            62603,
            56247
        ],
        원주시: [
            76168,
            65646
        ],
        강릉시: [
            48396,
            44501
        ],
        동해시: [
            17940,
            19006
        ],
        삼척시: [
            15614,
            18445
        ],
        태백시: [
            9524,
            11549
        ],
        정선군: [
            10080,
            10789
        ],
        속초시: [
            17565,
            16257
        ],
        고성군: [
            8604,
            7194
        ],
        양양군: [
            7630,
            7504
        ],
        인제군: [
            8375,
            9090
        ],
        홍천군: [
            18198,
            16205
        ],
        횡성군: [
            12323,
            13910
        ],
        영월군: [
            10331,
            10564
        ],
        평창군: [
            11251,
            12670
        ],
        화천군: [
            6349,
            6715
        ],
        양구군: [
            5715,
            6103
        ],
        철원군: [
            11960,
            8779
        ]
    },
    충청북도: {
        청주시상당구: [
            40119,
            31412
        ],
        청주시서원구: [
            39872,
            31964
        ],
        청주시흥덕구: [
            51771,
            35016
        ],
        청주시청원구: [
            39753,
            24803
        ],
        충주시: [
            42827,
            38701
        ],
        제천시: [
            29116,
            28329
        ],
        단양군: [
            7690,
            8644
        ],
        영동군: [
            11400,
            14150
        ],
        보은군: [
            7753,
            10727
        ],
        옥천군: [
            12405,
            14500
        ],
        음성군: [
            17925,
            19535
        ],
        진천군: [
            16119,
            15314
        ],
        괴산군: [
            9697,
            12989
        ],
        증평군: [
            7900,
            7826
        ]
    },
    충청남도: {
        천안시서북구: [
            65733,
            40915
        ],
        천안시동남구: [
            57332,
            39327
        ],
        공주시: [
            23693,
            24000
        ],
        보령시: [
            23412,
            25110
        ],
        아산시: [
            62542,
            42588
        ],
        서산시: [
            34713,
            30568
        ],
        태안군: [
            16140,
            16386
        ],
        금산군: [
            14785,
            11821
        ],
        논산시: [
            24694,
            22588
        ],
        계룡시: [
            8266,
            9105
        ],
        당진시: [
            31178,
            27482
        ],
        부여군: [
            16622,
            17193
        ],
        서천군: [
            12880,
            14431
        ],
        홍성군: [
            22217,
            19899
        ],
        청양군: [
            8840,
            9776
        ],
        예산군: [
            18789,
            16942
        ]
    },
    전라북도: {
        전주시완산구: [
            56743,
            54151
        ],
        전주시덕진구: [
            44363,
            40471
        ],
        군산시: [
            37997,
            39986
        ],
        익산시: [
            44317,
            53033
        ],
        정읍시: [
            20647,
            29932
        ],
        남원시: [
            14750,
            26885
        ],
        김제시: [
            16401,
            23346
        ],
        완주군: [
            16034,
            21989
        ],
        진안군: [
            5879,
            10089
        ],
        무주군: [
            5290,
            10342
        ],
        장수군: [
            5458,
            8558
        ],
        임실군: [
            6031,
            10835
        ],
        순창군: [
            5652,
            12203
        ],
        고창군: [
            11943,
            21034
        ],
        부안군: [
            10032,
            15746
        ]
    },
    전라남도: {
        목포시: [
            32831,
            56036
        ],
        여수시: [
            51891,
            46227
        ],
        순천시: [
            57867,
            56952
        ],
        나주시: [
            19447,
            29475
        ],
        광양시: [
            30396,
            32353
        ],
        담양군: [
            9042,
            16009
        ],
        장성군: [
            7637,
            17589
        ],
        곡성군: [
            6178,
            11632
        ],
        구례군: [
            7127,
            9459
        ],
        고흥군: [
            13962,
            29138
        ],
        보성군: [
            9324,
            13086
        ],
        화순군: [
            13049,
            17015
        ],
        장흥군: [
            7943,
            14278
        ],
        강진군: [
            7243,
            13708
        ],
        완도군: [
            10919,
            17220
        ],
        해남군: [
            14337,
            18655
        ],
        진도군: [
            7571,
            12046
        ],
        영암군: [
            10078,
            16646
        ],
        무안군: [
            15046,
            22924
        ],
        영광군: [
            11015,
            19072
        ],
        함평군: [
            7020,
            10389
        ],
        신안군: [
            8145,
            17479
        ]
    },
    경상북도: {
        포항시북구: [
            55000,
            38921
        ],
        포항시남구: [
            43611,
            35480
        ],
        울릉군: [
            2519,
            3987
        ],
        경주시: [
            50329,
            49882
        ],
        김천시: [
            27717,
            34607
        ],
        안동시: [
            35641,
            33219
        ],
        구미시: [
            73388,
            53999
        ],
        영주시: [
            27316,
            25116
        ],
        영천시: [
            24473,
            22930
        ],
        상주시: [
            23938,
            27315
        ],
        문경시: [
            16044,
            21743
        ],
        예천군: [
            12566,
            14792
        ],
        경산시: [
            54279,
            34197
        ],
        청도군: [
            12778,
            13080
        ],
        고령군: [
            8443,
            7788
        ],
        성주군: [
            10146,
            14947
        ],
        칠곡군: [
            21072,
            16687
        ],
        군위군: [
            5521,
            11705
        ],
        의성군: [
            11912,
            21635
        ],
        청송군: [
            7334,
            8692
        ],
        영양군: [
            3988,
            7110
        ],
        영덕군: [
            9619,
            10894
        ],
        봉화군: [
            8695,
            9343
        ],
        울진군: [
            11934,
            14629
        ]
    },
    경상남도: {
        창원시의창구: [
            48420,
            33856
        ],
        창원시성산구: [
            59254,
            38740
        ],
        창원시마산합포구: [
            40329,
            34453
        ],
        창원시마산회원구: [
            43495,
            32026
        ],
        창원시진해구: [
            36724,
            30476
        ],
        진주시: [
            73757,
            65405
        ],
        통영시: [
            29044,
            26418
        ],
        고성군: [
            13152,
            14893
        ],
        사천시: [
            25778,
            25157
        ],
        김해시: [
            101926,
            74480
        ],
        밀양시: [
            24100,
            22287
        ],
        거제시: [
            45454,
            42526
        ],
        의령군: [
            7929,
            9293
        ],
        함안군: [
            15488,
            13841
        ],
        창녕군: [
            16026,
            15742
        ],
        양산시: [
            75843,
            45722
        ],
        하동군: [
            10160,
            17607
        ],
        남해군: [
            10952,
            14056
        ],
        함양군: [
            9999,
            14713
        ],
        산청군: [
            8894,
            11867
        ],
        거창군: [
            14743,
            17260
        ],
        합천군: [
            12764,
            13093
        ]
    },
    제주특별자치도: {
        제주시: [
            109333,
            86746
        ],
        서귀포시: [
            40913,
            35330
        ]
    }
};
jQuery(function($1) {
    function mergeObject(계) {
        let result = {};
        for (const [key, value] of Object.entries(계.items)){
            result[key] = value;
        }
        return result;
    }
    const trToObj = function($tr, ruleset) {
        const result = {};
        $1($tr).find("td").each(function(idx) {
            let arr = $1(this).text().split("(");
            let text = (0, _기호제거).기호제거(arr[0]).trim();
            let floatNum = parseFloat(text);
            let num = parseInt(text);
            if (text.toString() == `${num}`) {
                text = num;
            } else if (text == `${floatNum}`) {
                text = floatNum;
            }
            const key = ruleset.get(idx);
            if (key === undefined) {
                return;
            }
            result[key] = text;
        });
        return result;
    };
    class ElectionV {
        constructor(필터, 구별키, is개표단위){
            this.필터 = 필터;
            this.구별키 = 구별키;
            this.is개표단위 = is개표단위;
            this.$표 = $1("#table01");
            [this.headerInfo, this.partyInfo] = this.parseHeader();
            if (!is개표단위) {
                this.thQuery1 = "thead tr:eq(0) th";
                this.thQuery2 = "tbody tr:eq(0) td";
                this.thOffset = 0;
            } else {
                this.thQuery1 = "thead tr:eq(0) th";
                this.thQuery2 = "thead tr:eq(1) th";
                this.thOffset = 4;
            }
        }
        getStoreKey() {
            return JSON.stringify(this.필터);
        }
        getGroupKey() {
            const storeKey = [];
            for (const key of this.구별키){
                storeKey.push(this.필터[key]);
            }
            return storeKey.join("_");
        }
        extendRuleset($tds, ruleBase, partyInfo, offset) {
            const ruleset = new Map(ruleBase);
            let xpos = offset;
            $tds.each(function(idx) {
                const text = (0, _기호제거).기호제거(this.innerText);
                console.log(text);
                if (offset == 0 && idx < 2) {
                    xpos += 1;
                    return;
                }
                if (text !== "") {
                    const arr = text.split("\n");
                    if (arr.length == 1) {
                        ruleset.set(xpos, text);
                    } else {
                        if (arr[0] === "") {
                            xpos += 1;
                            return;
                        }
                        if (arr[0] == "\uBB34\uC18C\uC18D") {
                            arr[0] += arr[1];
                        }
                        partyInfo[arr[0]] = arr[1];
                        ruleset.set(xpos, text);
                    }
                }
                xpos += 1;
            });
            return ruleset;
        }
        parseHeader() {
            const ruleset = new Map();
            const partyInfo = {};
            let xpos = 0;
            this.$표.find(this.thQuery1).each(function() {
                let $th = $1(this);
                let text = (0, _기호제거).기호제거($th.text()).trim();
                console.log(text);
                const colspan = parseInt((0, _subsNull).subsNull($th.attr("colspan"), "1"));
                if (text !== "") {
                    ruleset.set(xpos, text);
                }
                xpos += colspan;
            });
            const headerInfo = this.extendRuleset(this.$표.find(this.thQuery2), ruleset, partyInfo, this.thOffset);
            return [
                headerInfo,
                partyInfo
            ];
        }
        parse일반() {
            const $표 = this.$표;
            const headerInfo = this.headerInfo;
            //console.log('header', headerInfo, partyInfo);
            const 총계 = {
                items: {},
                계: 0
            };
            for (const 소속1 of Object.keys(정당코드)){
                총계.items[소속1] = 0;
            }
            $표.find("tbody tr:gt(0)").each(function() {
                const $this = $1(this);
                const 투표구 = trToObj($this, headerInfo);
                if (투표구.시도명 == "\uD569\uACC4" || 투표구.구시군명 == "\uD569\uACC4") {
                    return;
                }
                if (투표구.구시군명 == "" || 투표구.시도명 == "") {
                    return;
                }
                //console.log('투표구', 투표구);
                if (!("\uAC1C\uD45C\uC728" in 투표구)) {
                    투표구.개표율 = 100.0;
                }
                if (투표구.개표율 === 0) {
                    return;
                }
                const invMult = 100.0 / 투표구.개표율;
                총계.계 += 투표구.계 * invMult;
                for (const 소속 of Object.keys(정당코드)){
                    총계.items[소속] += Number(투표구[소속]) * invMult;
                }
            });
            let date = new Date();
            총계.시간 = date.toLocaleTimeString("en-GB");
            //console.log(총계);
            localStorage.setItem("\uB300\uD1B5\uB839\uC9C0\uC5ED_" + (0, _subsNull).subsNull(필터1.도시, "\uC804\uCCB4"), JSON.stringify(총계));
            if (필터1.도시 !== "") {
                const 지역목록 = JSON.parse((0, _subsNull).subsNull(localStorage.getItem("\uB300\uD1B5\uB839\uC9C0\uC5ED_\uBAA9\uB85D"), "{}"));
                지역목록[필터1.도시] = date;
                localStorage.setItem("\uB300\uD1B5\uB839\uC9C0\uC5ED_\uBAA9\uB85D", JSON.stringify(지역목록));
            }
            const groupKey = this.getGroupKey();
            const 지역목록 = JSON.parse((0, _subsNull).subsNull(localStorage.getItem(`일반_목록_${groupKey}`), "{}"));
            const storeKey = this.getStoreKey();
            지역목록[storeKey] = date;
            localStorage.setItem(`일반_목록_${groupKey}`, JSON.stringify(지역목록));
            localStorage.setItem(`일반_${storeKey}`, JSON.stringify(총계));
        }
        parse개표단위() {
            console.log(필터1.타입);
            const $표 = $1("#table01");
            if (필터1.구시군 === "") {
                필터1.구시군 = 필터1.도시;
            }
            const headerInfo = this.headerInfo;
            console.log("header", headerInfo);
            const 총계_사전 = {
                items: {},
                계: 0
            };
            const 총계_본 = {
                items: {},
                계: 0
            };
            for (const 소속2 of Object.keys(정당코드)){
                총계_사전.items[소속2] = 0;
                총계_본.items[소속2] = 0;
            }
            const 구분1 = {
                거소선상투표: true,
                재외투표: true,
                재외투표공관: true,
                관외사전투표: true
            };
            const 구분2 = {
                관내사전투표: true
            };
            //let 읍면동 = '';
            $표.find("tbody tr:gt(0)").each(function() {
                const $this = $1(this);
                const 투표구 = trToObj($this, headerInfo);
                if (투표구.읍면동명 == "\uD569\uACC4") {
                    return;
                }
                if (투표구.투표구명 == "\uC18C\uACC4") {
                    return;
                }
                const is사전투표 = (0, _subsNull).subsNull(구분1[투표구.읍면동명], (0, _subsNull).subsNull(구분2[투표구.투표구명], false));
                //console.log('투표구', 투표구);
                const 총계_대상 = is사전투표 ? 총계_사전 : 총계_본;
                총계_대상.계 = 투표구.계 + (0, _subsNull).subsNull(총계_대상.계, 0);
                for (const 소속 of Object.keys(정당코드)){
                    총계_대상.items[소속] = Number(투표구[소속]) + (0, _subsNull).subsNull(총계_대상.items[소속], 0);
                }
            });
            const [본투표수, 사전투표수] = 총투표수[필터1.도시][필터1.구시군];
            console.log(본투표수, 사전투표수);
            const 본개표율 = 총계_본.계 / 본투표수;
            const 사전개표율 = 총계_사전.계 / 사전투표수;
            for (const key of Object.keys(총계_사전)){
                총계_사전.items[key] /= 사전개표율;
            }
            for (const key1 of Object.keys(총계_본)){
                총계_본.items[key1] /= 본개표율;
            }
            let date = new Date();
            총계_사전.시간 = date.toLocaleTimeString("en-GB");
            총계_본.시간 = date.toLocaleTimeString("en-GB");
            console.log(필터1, 총계_사전, 총계_본);
            const groupKey = this.getGroupKey();
            const 지역목록 = JSON.parse((0, _subsNull).subsNull(localStorage.getItem(`개표단위_목록_${groupKey}`), "{}"));
            const storeKey = this.getStoreKey();
            지역목록[storeKey] = date;
            localStorage.setItem(`개표단위_목록_${groupKey}`, JSON.stringify(지역목록));
            localStorage.setItem(`개표단위_사전_${storeKey}`, JSON.stringify(총계_사전));
            localStorage.setItem(`개표단위_본_${storeKey}`, JSON.stringify(총계_본));
        }
        display일반() {
            const headerInfo = new Map(this.headerInfo);
            headerInfo.set(1, "\uC2DC\uAC04");
            this.$표.append("<tr><td></td></tr>");
            const groupKey = this.getGroupKey();
            const 지역목록 = JSON.parse((0, _subsNull).subsNull(localStorage.getItem(`일반_목록_${groupKey}`), "{}"));
            if (!지역목록) {
                return;
            }
            const 총계 = {
                items: {},
                계: 0
            };
            for (const 지역키 of Object.keys(지역목록)){
                const 지역정보 = JSON.parse(localStorage.getItem(`일반_${지역키}`) ?? "{}");
                if (!지역정보) {
                    continue;
                }
                this.$표.append(toTr(mergeObject(지역정보), headerInfo, 지역키));
                for (const [정당, value] of Object.entries(지역정보.items)){
                    if (!(정당 in 정당코드)) {
                        continue;
                    }
                    총계.items[정당] = value + (0, _subsNull).subsNull(총계.items[정당], 0);
                    총계.계 = value + (0, _subsNull).subsNull(총계.계, 0);
                }
            }
            const 비율 = {};
            for (const [코드, value] of Object.entries(총계.items)){
                비율[코드] = (value / 총계["\uACC4"] * 100).toFixed(2) + "%";
            }
            this.$표.append(toTr(mergeObject(총계), headerInfo, "\uACC4"));
            this.$표.append(toTr(비율, headerInfo, ""));
        }
        display개표단위() {
            const headerInfo = this.headerInfo;
            //const 지역목록 = JSON.parse(subsNull(localStorage.getItem('대통령지역_목록'), '{}'));
            const 총계 = {
                items: {},
                계: 0
            };
            this.$표.append("<tr><td></td></tr>");
            const groupKey = this.getGroupKey();
            const storeKey = this.getStoreKey();
            for (const 지역 of Object.keys(지역코드)){
                const 도시목록 = JSON.parse((0, _subsNull).subsNull(localStorage.getItem(`개표단위_목록_${groupKey}`), "{}"));
                if (!Object.keys(도시목록).length) {
                    continue;
                }
                console.log("\uAC1C\uD45C\uB2E8\uC704", 지역);
                const 세부_사전_계 = {
                    items: {},
                    계: 0
                };
                const 세부_본_계 = {
                    items: {},
                    계: 0
                };
                for (const _r of Object.keys(도시목록)){
                    const 세부_사전 = JSON.parse(localStorage.getItem(`개표단위_사전_${storeKey}`) ?? "{}");
                    const 세부_본 = JSON.parse(localStorage.getItem(`개표단위_본_${storeKey}`) ?? "{}");
                    const target = [
                        [
                            세부_사전_계,
                            세부_사전
                        ],
                        [
                            세부_본_계,
                            세부_본
                        ], 
                    ];
                    for (const [세부계, 세부] of target){
                        console.log(세부계, 세부);
                        세부계.계 = 세부.계 + (0, _subsNull).subsNull(세부계.계, 0);
                        for (const 정당 of Object.keys(정당코드)){
                            const value = 세부.items[정당];
                            세부계.items[정당] = value + (0, _subsNull).subsNull(세부계.items[정당], 0);
                            총계.items[정당] = value + (0, _subsNull).subsNull(총계.items[정당], 0);
                            총계.계 = value + (0, _subsNull).subsNull(총계.계, 0);
                        }
                    }
                }
                this.$표.append(toTr(mergeObject(세부_사전_계), headerInfo, `${지역}(사전)`));
                this.$표.append(toTr(mergeObject(세부_본_계), headerInfo, `${지역}(본)`));
            }
            const 비율 = {};
            for (const [코드, value] of Object.entries(총계.items)){
                비율[코드] = (value / 총계.계 * 100).toFixed(2) + "%";
            }
            this.$표.append(toTr(mergeObject(총계), headerInfo, "\uACC4"));
            this.$표.append(toTr(비율, headerInfo, ""));
        }
    }
    const 필터1 = {
        타입: (0, _기호제거).기호제거($1(".r_title h4").text()),
        선거명: (0, _기호제거).기호제거($1("#electionName").text()),
        도시: (0, _기호제거).기호제거($1("#cityName").text()),
        구시군: (0, _기호제거).기호제거($1("#townName").text()),
        선거구: (0, _기호제거).기호제거($1("#sggCityName").text())
    };
    console.log("\uD544\uD130", 필터1);
    $1(function() {
        //다른 모드는 다른 코드 참고
        if (필터1.선거명 == "\uC2DC\uB3C4\uC9C0\uC0AC\uC120\uAC70") {
            if (필터1.타입 == "\uAC1C\uD45C\uC9C4\uD589\uC0C1\uD669") {
                const obj = new ElectionV(필터1, [
                    "\uD0C0\uC785",
                    "\uC120\uAC70\uBA85",
                    "\uB3C4\uC2DC"
                ], true);
                obj.parse일반();
                if (필터1.도시 == "") {
                    obj.display개표단위();
                    obj.display일반();
                }
            }
            if (필터1.타입 == "\uAC1C\uD45C\uB2E8\uC704\uBCC4\uAC1C\uD45C\uACB0\uACFC") {
                const obj = new ElectionV(필터1, [
                    "\uD0C0\uC785",
                    "\uC120\uAC70\uBA85",
                    "\uB3C4\uC2DC"
                ], true);
                obj.display개표단위();
            }
        } else {
            console.log("\uD574\uB2F9 \uC5C6\uC74C");
            return;
        }
    });
    //안한다
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    const toTr = function(arr, ruleset, name) {
        let html = '<tr><td class="firstTh" style="letter-spacing:-1px;">' + name + "</td>";
        const maxLen = Math.max(...ruleset.keys());
        for(let i = 0; i < maxLen; i++){
            const code = ruleset.get(i);
            if (code === undefined) {
                continue;
            }
            if (!(code in arr)) {
                html += '<td class="alignR"></td>\n';
            } else {
                let value = arr[code];
                if (typeof value === "number") {
                    value = numberWithCommas((0, _toNumber).toNumber(value));
                }
                html += `<td class="alignR">${value}</td>\n`;
            }
        }
        html += "</tr>";
        return $1(html);
    };
});

})();

/******/ })()
;