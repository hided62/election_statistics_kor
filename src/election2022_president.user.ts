// ==UserScript==
// @name         개표진행 대선 2022
// @namespace    https://hided.net/
// @version      0.99
// @description  개표 진행 상황을 보여줍니다. 각 시군구별 개별 개표율을 합산한 득표율을 보여줍니다.
// @author       HideD
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @match        http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml
// @updateURL    https://hided.net/gs_script/election2022.user.js
// @grant        none
// ==/UserScript==

import { toNumber } from "./util/toNumber";
import { subsNull } from "./util/subsNull";

declare const jQuery: JQueryStatic;

type t필터 = {
  타입: string;
  선거명: string;
  도시: string;
  구시군: string;
};

type t총계 = {
  items: Record<string, number>;
  계: number;
  시간?: string;
};

type t세부투표구 = {
  시도명: string;
  구시군명: string;
  개표율: number;
  계: number;
};

type t대선투표구 = {
  읍면동명: string;
  투표구명: string;
  계: number;
};

type KVMap<V> = {
  [key: string]: V;
};

type ForwardRuleSet<T extends string> = Record<T, number>;
type ReverseRuleSet<T extends string> = Record<number, T>;
type RuleSet<T extends string> = {
  forward: ForwardRuleSet<T>;
  reverse: ReverseRuleSet<T>;
};

declare global {
  interface Window {
    $: JQueryStatic;
    jQuery: JQueryStatic;
    필터: t필터;
  }
}

(function () {
  "use strict";
  const $ = jQuery.noConflict(true);

  window.$ = $;
  window.jQuery = $;

  const 총투표수: Record<string, Record<string, [number, number]>> = {
    서울특별시: {
      종로구: [45968, 54502],
      중구: [41617, 43432],
      용산구: [74090, 77981],
      성동구: [100819, 96419],
      광진구: [118460, 116995],
      동대문구: [123865, 108362],
      중랑구: [133149, 127727],
      성북구: [143179, 149863],
      강북구: [98939, 100543],
      도봉구: [114606, 101414],
      노원구: [185724, 163583],
      은평구: [156470, 161532],
      서대문구: [105731, 104634],
      마포구: [130782, 125443],
      양천구: [154234, 147140],
      강서구: [203592, 186650],
      구로구: [145069, 127859],
      금천구: [83199, 73844],
      영등포구: [137012, 126580],
      동작구: [129637, 141882],
      관악구: [166564, 174203],
      서초구: [147805, 130065],
      강남구: [193835, 160896],
      송파구: [232438, 221106],
      강동구: [161291, 152090],
    },
    부산광역시: {
      중구: [13125, 14282],
      서구: [34276, 35511],
      동구: [28070, 31212],
      영도구: [34488, 37209],
      부산진구: [124292, 109186],
      동래구: [97826, 81940],
      남구: [92244, 81330],
      북구: [108170, 80960],
      해운대구: [138612, 120882],
      기장군: [64145, 42007],
      사하구: [108605, 87949],
      금정구: [79107, 76107],
      강서구: [47877, 36612],
      연제구: [76901, 62535],
      수영구: [59844, 58172],
      사상구: [75765, 60930],
    },
    대구광역시: {
      중구: [26272, 25060],
      동구: [128013, 104993],
      서구: [60401, 53503],
      남구: [53398, 44570],
      북구: [167865, 126975],
      수성구: [151527, 134026],
      달서구: [218230, 150428],
      달성군: [103085, 63214],
    },
    인천광역시: {
      중구: [47347, 42978],
      동구: [20212, 20710],
      미추홀구: [135588, 117774],
      연수구: [135429, 114692],
      남동구: [180059, 149704],
      부평구: [172610, 143419],
      계양구: [106300, 87564],
      서구: [187675, 158470],
      강화군: [21773, 26701],
      옹진군: [5645, 9266],
    },
    광주광역시: {
      동구: [26360, 47520],
      서구: [80534, 122115],
      남구: [56768, 92054],
      북구: [114546, 181125],
      광산구: [118112, 146378],
    },
    대전광역시: {
      동구: [72302, 70505],
      중구: [79356, 71871],
      서구: [158937, 146045],
      유성구: [116398, 114602],
      대덕구: [61983, 53417],
    },
    울산광역시: {
      중구: [76157, 66944],
      남구: [114686, 94913],
      동구: [53757, 44838],
      북구: [78794, 59523],
      울주군: [75920, 69971],
    },
    세종특별자치시: {
      세종특별자치시: [102699, 129157],
    },
    경기도: {
      수원시장안구: [103222, 80680],
      수원시권선구: [135028, 100130],
      수원시팔달구: [63983, 55642],
      수원시영통구: [134135, 105053],
      성남시수정구: [78588, 82416],
      성남시중원구: [72329, 69987],
      성남시분당구: [185356, 150141],
      의정부시: [166960, 128105],
      안양시만안구: [83022, 79782],
      안양시동안구: [113593, 103036],
      부천시: [286923, 246630],
      광명시: [106442, 92244],
      평택시: [194887, 143904],
      양주시: [79949, 65667],
      동두천시: [29258, 28279],
      안산시상록구: [128081, 94183],
      안산시단원구: [112049, 80895],
      고양시덕양구: [172745, 150311],
      고양시일산동구: [109522, 87424],
      고양시일산서구: [111464, 85887],
      과천시: [26371, 27823],
      의왕시: [61476, 51642],
      구리시: [72978, 54739],
      남양주시: [272703, 187856],
      오산시: [83885, 51213],
      화성시: [302509, 239546],
      시흥시: [184899, 132304],
      군포시: [104530, 78562],
      하남시: [109333, 99531],
      파주시: [175845, 121450],
      여주시: [35436, 37131],
      이천시: [69148, 68392],
      용인시처인구: [89495, 72926],
      용인시수지구: [136477, 114299],
      용인시기흥구: [159540, 129913],
      안성시: [60367, 57023],
      김포시: [181053, 121207],
      광주시: [135617, 109269],
      포천시: [48990, 46995],
      연천군: [14680, 14224],
      양평군: [37718, 45351],
      가평군: [20533, 21986],
    },
    강원도: {
      춘천시: [96972, 89650],
      원주시: [113135, 113106],
      강릉시: [70100, 71788],
      동해시: [28411, 29104],
      삼척시: [20089, 23554],
      태백시: [11522, 15517],
      정선군: [10988, 13911],
      속초시: [25589, 26930],
      고성군: [9607, 9612],
      양양군: [9365, 10351],
      인제군: [9676, 12160],
      홍천군: [22118, 24577],
      횡성군: [13914, 18720],
      영월군: [12453, 14518],
      평창군: [12710, 16644],
      화천군: [7097, 9397],
      양구군: [6557, 7972],
      철원군: [14619, 13227],
    },
    충청북도: {
      청주시상당구: [66045, 56157],
      청주시서원구: [67060, 57665],
      청주시흥덕구: [92788, 70894],
      청주시청원구: [69607, 48228],
      충주시: [65632, 70207],
      제천시: [42210, 44881],
      단양군: [9027, 11166],
      영동군: [12799, 18996],
      보은군: [8505, 14212],
      옥천군: [14963, 19279],
      음성군: [26314, 32001],
      진천군: [25052, 26880],
      괴산군: [10608, 16811],
      증평군: [10549, 12104],
    },
    충청남도: {
      천안시서북구: [141402, 96799],
      천안시동남구: [90675, 67565],
      공주시: [31688, 37174],
      보령시: [30616, 35103],
      아산시: [109884, 83047],
      서산시: [53085, 55935],
      태안군: [18520, 23528],
      금산군: [16745, 16953],
      논산시: [37658, 35854],
      계룡시: [11701, 16292],
      당진시: [49930, 50950],
      부여군: [20596, 23374],
      서천군: [15387, 19738],
      홍성군: [31278, 31138],
      청양군: [9453, 12137],
      예산군: [26103, 25247],
    },
    전라북도: {
      전주시완산구: [100127, 131308],
      전주시덕진구: [93963, 122007],
      군산시: [74000, 103327],
      익산시: [75334, 113981],
      정읍시: [25534, 49560],
      남원시: [16987, 39525],
      김제시: [19697, 38328],
      완주군: [23546, 40077],
      진안군: [5276, 13579],
      무주군: [5779, 11650],
      장수군: [4696, 11535],
      임실군: [5729, 14330],
      순창군: [6058, 13831],
      고창군: [12821, 25887],
      부안군: [11499, 25351],
    },
    전라남도: {
      목포시: [48790, 96059],
      여수시: [78566, 111058],
      순천시: [81361, 111082],
      나주시: [25940, 55106],
      광양시: [44155, 56724],
      담양군: [10227, 24405],
      장성군: [8175, 23490],
      곡성군: [5595, 15122],
      구례군: [6116, 13017],
      고흥군: [15124, 32051],
      보성군: [9744, 19580],
      화순군: [16507, 28644],
      장흥군: [7850, 19200],
      강진군: [7365, 17595],
      완도군: [11065, 24225],
      해남군: [15160, 33283],
      진도군: [7756, 13988],
      영암군: [11661, 25673],
      무안군: [20774, 40786],
      영광군: [12021, 24301],
      함평군: [7010, 16287],
      신안군: [7282, 21933],
    },
    경상북도: {
      포항시북구: [94420, 88627],
      포항시남구: [76619, 75573],
      울릉군: [2407, 4246],
      경주시: [74801, 98961],
      김천시: [38517, 57059],
      안동시: [48022, 58942],
      구미시: [137399, 115762],
      영주시: [29953, 40820],
      영천시: [33708, 37236],
      상주시: [26189, 42270],
      문경시: [18715, 31003],
      예천군: [14307, 24821],
      경산시: [98166, 78159],
      청도군: [14345, 16607],
      고령군: [9548, 12719],
      성주군: [11680, 20332],
      칠곡군: [37138, 34354],
      군위군: [6796, 11357],
      의성군: [12222, 27022],
      청송군: [7455, 11334],
      영양군: [4146, 8191],
      영덕군: [9238, 16659],
      봉화군: [8969, 13738],
      울진군: [14993, 18554],
    },
    경상남도: {
      창원시의창구: [82221, 60873],
      창원시성산구: [97396, 72646],
      창원시마산합포구: [61952, 58978],
      창원시마산회원구: [70044, 55195],
      창원시진해구: [60951, 58234],
      진주시: [113713, 114530],
      통영시: [41411, 38668],
      고성군: [15807, 18521],
      사천시: [33130, 38641],
      김해시: [183735, 144794],
      밀양시: [33337, 36910],
      거제시: [72606, 72976],
      의령군: [7955, 11134],
      함안군: [20693, 21096],
      창녕군: [18725, 22676],
      양산시: [131726, 88779],
      하동군: [10638, 21447],
      남해군: [12697, 17603],
      함양군: [10534, 16422],
      산청군: [10023, 14890],
      거창군: [18511, 22886],
      합천군: [12797, 18473],
    },
    제주특별자치도: {
      제주시: [159192, 137632],
      서귀포시: [55972, 56850],
    },
  };

  jQuery(function ($) {
    const raw후보정보 = [
      [1, "이재명", "더불어민주당", "#196CD1"],
      [2, "윤석열", "국민의힘", "#E61E2B"],
      [3, "심상정", "정의당", "#FFCC00"],
      [4, "오준호", "기본소득당", "#777777"],
      [5, "허경영", "국가혁명당", "#777777"],
      [6, "이백윤", "노동당", "#777777"],
      [7, "옥은호", "새누리당", "#777777"],
      [8, "김경재", "신자유민주연합", "#777777"],
      [9, "조원진", "우리공화당", "#777777"],
      [10, "김재연", "진보당", "#777777"],
      [11, "이경희", "통일한국당", "#777777"],
      [12, "김민찬", "한류연합당", "#777777"],
    ];

    const 정당코드 = raw후보정보.reduce(function (map, obj) {
      map[obj[2]] = {
        기호: obj[0],
        후보명: obj[1],
        정당: obj[2],
        색상: obj[3],
      };
      return map;
    }, {});

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
      제주특별자치도: 17,
    };

    // eslint-disable-next-line no-unused-vars
    const 후보코드 = raw후보정보.reduce(function (map, obj) {
      map[obj[1]] = {
        기호: obj[0],
        후보명: obj[1],
        정당: obj[2],
        색상: obj[3],
      };
      return map;
    }, {});

    let 기호제거 = function (text: string): string {
      // | { } _ - [ ] ( ) · ! ? , (공백)
      return text.replace(/\||{|}|_|-|\[|\]|\(|\)|·|!|\?|,| |/gi, "");
    };

    const 필터: t필터 = {
      타입: 기호제거($(".r_title h4").text()),
      선거명: 기호제거($("#electionName").text()),
      도시: 기호제거($("#cityName").text()),
      구시군: 기호제거($("#townName").text()),
    };
    console.log("필터", 필터);
    window.필터 = 필터;

    $(function () {
      //다른 모드는 다른 코드 참고
      if (필터.선거명 == "대통령선거") {
        if (필터.타입 == "개표진행상황") {
          parse대통령세부();
          if (필터.도시 == "") {
            display대통령();

            display대통령개표단위();
          }
        }
        if (필터.타입 == "개표단위별개표결과") {
          parse대통령개표단위();
        }
        //parse대통령();
      } else {
        console.log("해당 없음");
        return; //안한다
      }
    });

    const trToObj = function <T extends string>(
      $tr: JQuery<HTMLElement>,
      ruleset: ReverseRuleSet<T>
    ): Record<T, string | number> {
      const result: Record<string, string | number> = {};
      $($tr)
        .find("td")
        .each(function (idx) {
          let arr = $(this).text().split("(");
          let text: number | string = 기호제거(arr[0]).trim();

          let floatNum = parseFloat(text);
          let num = parseInt(text);

          if (text.toString() == `${num}`) {
            text = num;
          } else if (text == `${floatNum}`) {
            text = floatNum;
          }

          if (ruleset[idx] === "") {
            return;
          }

          //result[idx] = text;
          if (!(idx in ruleset)) {
            return;
          }
          result[ruleset[idx]] = text;
        });

      return result;
    };

    function numberWithCommas(x: number): string {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const modifyRuleset = function (
      $tds: JQuery<HTMLElement>,
      ruleBase: RuleSet<string>,
      partyInfo: Record<string, string>,
      offset = 0
    ) {
      const forward = { ...ruleBase.forward };
      const reverse = { ...ruleBase.reverse };

      let xpos = offset;
      $tds.each(function (idx) {
        const text = 기호제거(this.innerText);
        console.log(text);
        if (offset == 0 && idx < 2) {
          xpos += 1;
          return;
        }

        if (text !== "") {
          const arr = text.split("\n");
          if (arr.length == 1) {
            forward[text] = xpos;
            reverse[xpos] = text;
          } else {
            if (arr[0] === "") {
              xpos += 1;
              return;
            }
            if (arr[0] == "무소속") {
              arr[0] += arr[1];
            }
            partyInfo[arr[0]] = arr[1];
            forward[arr[0]] = xpos;
            reverse[xpos] = arr[0];
          }
        }

        xpos += 1;
      });
      return { forward, reverse };
    };

    const toTr = function <T extends string>(
      arr: Record<T, string | number>,
      ruleset: ReverseRuleSet<T>,
      name: string
    ) {
      let html =
        '<tr><td class="firstTh" style="letter-spacing:-1px;">' +
        name +
        "</td>";

      let len = Object.keys(ruleset).length;
      for (let idx = 1; idx < len; idx += 1) {
        if (!(idx in ruleset)) {
          break;
        }

        let code = ruleset[idx];
        if (!(code in arr)) {
          html += '<td class="alignR"></td>\n';
        } else {
          let value = arr[code];
          if (typeof value === "number") {
            value = numberWithCommas(toNumber(value));
          }
          html += `<td class="alignR">${value}</td>\n`;
        }
      }

      html += "</tr>";
      return $(html);
    };

    function mergeObject(계: t총계): Record<string, string|number>{
        let result: Record<string, string|number> = {};
        for(const [key, value] of Object.entries(계.items)){
            result[key] = value;
        }

        return result;
    }

    const parseHeader = function (
      $표: JQuery<HTMLElement>
    ): [RuleSet<string>, Record<string, string>] {
      const forward: Record<string, number> = {};
      const reverse: Record<number, string> = {};
      const partyInfo: Record<string, string> = {};
      let xpos = 0;
      $표.find("thead tr:eq(0) th").each(function () {
        let $th = $(this);
        let text = 기호제거($th.text()).trim();
        console.log(text);
        const colspan = parseInt(subsNull($th.attr("colspan"), "1"));

        if (text !== "") {
          forward[text] = xpos;
          reverse[xpos] = text;
        }

        xpos += colspan;
      });

      const headerInfo = modifyRuleset(
        $표.find("tbody tr:eq(0) td"),
        { forward, reverse },
        partyInfo
      );

      return [headerInfo, partyInfo];
    };

    const parseHeader2 = function ($표: JQuery<HTMLElement>) {
      const forward: Record<string, number> = {};
      const reverse: Record<number, string> = {};
      const partyInfo: Record<string, string> = {};
      let xpos = 0;
      $표.find("thead tr:eq(0) th").each(function () {
        let $th = $(this);
        let text = 기호제거($th.text()).trim();
        console.log(text);
        const colspan = parseInt(subsNull($th.attr("colspan"), "1"));

        if (text !== "") {
          forward[text] = xpos;
          reverse[xpos] = text;
        }

        xpos += colspan;
      });

      const headerInfo = modifyRuleset(
        $표.find("thead tr:eq(1) th"),
        { forward, reverse },
        partyInfo,
        4
      );

      return [headerInfo, partyInfo];
    };

    const parse대통령개표단위 = function () {
      console.log("대통령개표단위");

      const $표 = $("#table01");

      if (필터.구시군 === "") {
        필터.구시군 = 필터.도시;
      }

      const [headerInfo] = parseHeader2($표);
      console.log("header", headerInfo);

      const 총계_사전: t총계 = { items: {}, 계: 0 };
      const 총계_본: t총계 = { items: {}, 계: 0 };

      for (const 소속 of Object.keys(정당코드)) {
        총계_사전.items[소속] = 0;
        총계_본.items[소속] = 0;
      }

      const 구분1 = {
        거소선상투표: true,
        재외투표: true,
        재외투표공관: true,
        관외사전투표: true,
      };

      const 구분2 = {
        관내사전투표: true,
      };

      //let 읍면동 = '';
      $표.find("tbody tr:gt(0)").each(function () {
        const $this = $(this);
        const 투표구 = trToObj($this, headerInfo) as t대선투표구;

        if (투표구.읍면동명 == "합계") {
          return;
        }

        /*
            if (투표구.읍면동명 != '') {
                읍면동 = 투표구.읍면동명;
            }
            */

        if (투표구.투표구명 == "소계") {
          return;
        }

        const is사전투표 = subsNull<boolean>(
          구분1[투표구.읍면동명],
          subsNull(구분2[투표구.투표구명], false)
        );

        //console.log('투표구', 투표구);

        const 총계_대상 = is사전투표 ? 총계_사전 : 총계_본;

        총계_대상.계 = 투표구.계 + subsNull(총계_대상.계, 0);
        for (const 소속 of Object.keys(정당코드)) {
          총계_대상.items[소속] =
            투표구[소속] + subsNull(총계_대상.items[소속], 0);
        }
      });

      const [본투표수, 사전투표수] = 총투표수[필터.도시][필터.구시군];
      console.log(본투표수, 사전투표수);
      const 본개표율 = 총계_본.계 / 본투표수;
      const 사전개표율 = 총계_사전.계 / 사전투표수;

      for (const key of Object.keys(총계_사전)) {
        총계_사전[key] /= 사전개표율;
      }

      for (const key of Object.keys(총계_본)) {
        총계_본[key] /= 본개표율;
      }

      let date = new Date();
      총계_사전.시간 = date.toLocaleTimeString("en-GB");
      총계_본.시간 = date.toLocaleTimeString("en-GB");

      console.log(필터.구시군, 총계_사전, 총계_본);

      localStorage.setItem(
        `대통령세부_사전_${필터.도시}_${필터.구시군}`,
        JSON.stringify(총계_사전)
      );
      localStorage.setItem(
        `대통령세부_본_${필터.도시}_${필터.구시군}`,
        JSON.stringify(총계_본)
      );
      const 지역목록 = JSON.parse(
        subsNull(localStorage.getItem(`대통령세부_목록_${필터.도시}`), "{}")
      );
      지역목록[필터.구시군] = date;
      localStorage.setItem(
        `대통령세부_목록_${필터.도시}`,
        JSON.stringify(지역목록)
      );
    };

    const parse대통령세부 = function () {
      console.log("대통령세부");

      const $표 = $("#table01");

      const [headerInfo] = parseHeader($표);
      //console.log('header', headerInfo, partyInfo);

      const 총계: t총계 = { items: {}, 계: 0 };

      for (const 소속 of Object.keys(정당코드)) {
        총계.items[소속] = 0;
      }

      $표.find("tbody tr:gt(0)").each(function () {
        const $this = $(this);
        const 투표구 = trToObj($this, headerInfo) as t세부투표구;

        if (투표구.시도명 == "합계" || 투표구.구시군명 == "합계") {
          return;
        }

        if (투표구.구시군명 == "" || 투표구.시도명 == "") {
          return;
        }

        //console.log('투표구', 투표구);

        if (!("개표율" in 투표구)) {
          투표구.개표율 = 100.0;
        }

        if (투표구.개표율 === 0) {
          return;
        }

        const invMult = 100.0 / 투표구.개표율;

        총계.계 += 투표구.계 * invMult;

        for (const 소속 of Object.keys(정당코드)) {
          총계[소속] += 투표구[소속] * invMult;
        }
      });

      let date = new Date();
      총계.시간 = date.toLocaleTimeString("en-GB");

      //console.log(총계);

      localStorage.setItem(
        "대통령지역_" + subsNull(필터.도시, "전체"),
        JSON.stringify(총계)
      );
      if (필터.도시 !== "") {
        const 지역목록 = JSON.parse(
          subsNull(localStorage.getItem("대통령지역_목록"), "{}")
        );
        지역목록[필터.도시] = date;
        localStorage.setItem("대통령지역_목록", JSON.stringify(지역목록));
      }
    };

    const display대통령개표단위 = function () {
      const $표 = $("#table01");
      const [headerInfo] = parseHeader($표);
      //const 지역목록 = JSON.parse(subsNull(localStorage.getItem('대통령지역_목록'), '{}'));

      const 총계: t총계 = { items: {}, 계: 0 };

      $표.append("<tr><td></td></tr>");
      for (const 지역 of Object.keys(지역코드)) {
        const 도시목록 = JSON.parse(
          subsNull(localStorage.getItem(`대통령세부_목록_${지역}`), "{}")
        );
        if (!Object.keys(도시목록).length) {
          continue;
        }
        console.log("개표단위", 지역);

        const 세부_사전_계: t총계 = { items: {}, 계: 0 };
        const 세부_본_계: t총계 = { items: {}, 계: 0 };

        for (const 구시군 of Object.keys(도시목록)) {
          const 세부_사전: t총계 = JSON.parse(
            localStorage.getItem(`대통령세부_사전_${지역}_${구시군}`)
          );
          const 세부_본: t총계 = JSON.parse(
            localStorage.getItem(`대통령세부_본_${지역}_${구시군}`)
          );

          const target = [
            [세부_사전_계, 세부_사전],
            [세부_본_계, 세부_본],
          ];
          for (const [세부계, 세부] of target) {
            console.log(세부계, 세부);

            세부계.계 = 세부.계 + subsNull(세부계.계, 0);

            for (const 정당 of Object.keys(정당코드)) {
              const value = 세부[정당];
              세부계.items[정당] = value + subsNull(세부계.items[정당], 0);
              총계.items[정당] = value + subsNull(총계.items[정당], 0);
              총계.계 = value + subsNull(총계.계, 0);
            }
          }
        }

        $표.append(toTr(mergeObject(세부_사전_계), headerInfo, `${지역}(사전)`));
        $표.append(toTr(mergeObject(세부_본_계), headerInfo, `${지역}(본)`));
      }

      const 비율 = {};
      for (const [코드, value] of Object.entries(총계.items)) {
        비율[코드] = ((value / 총계.계) * 100).toFixed(2) + "%";
      }
      $표.append(toTr(mergeObject(총계), headerInfo, "계"));
      $표.append(toTr(비율, headerInfo, ""));
    };

    const display대통령 = function () {
      const $표 = $("#table01");
      const [headerInfo] = parseHeader($표);
      headerInfo.forward.시간 = 1;
      headerInfo.reverse[1] = "시간";
      //const 지역목록 = JSON.parse(subsNull(localStorage.getItem('대통령지역_목록'), '{}'));

      const 총계: t총계 = {계: 0, items: {}};

      $표.append("<tr><td></td></tr>");
      for (const 지역 of Object.keys(지역코드)) {
        const 도시정보: t총계 = JSON.parse(
          subsNull(localStorage.getItem(`대통령지역_${지역}`), "{}")
        );
        if (!도시정보) {
          continue;
        }
        $표.append(toTr(mergeObject(도시정보), headerInfo, 지역));
        for (const [정당, value] of Object.entries(도시정보.items)) {
          if (!(정당 in 정당코드)) {
            continue;
          }

          총계[정당] = value + subsNull(총계[정당], 0);
          총계.계 = value + subsNull(총계.계, 0);
        }
      }

      const 비율: Record<string, string> = {};
      for (const [코드, value] of Object.entries(총계.items)) {
        비율[코드] = ((value / 총계["계"]) * 100).toFixed(2) + "%";
      }
      $표.append(toTr(mergeObject(총계), headerInfo, "계"));
      $표.append(toTr(비율, headerInfo, ""));
    };
  });
})();
