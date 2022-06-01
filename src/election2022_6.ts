import { toNumber } from "./util/toNumber";
import { subsNull } from "./util/subsNull";
import { 기호제거 } from "./util/기호제거";

declare const jQuery: JQueryStatic;

type t필터 = {
  타입: string;
  선거명: string;
  도시: string;
  구시군: string;
  선거구: string;
};

type t총계 = {
  items: Record<string, number>;
  계: number;
  시간?: string;
};

type t구시군장투표구 = {
  선거구명: string;
  구시군명: string;
  개표율: number;
  계: number;
}

type t광역의회의원비례대표선거 = {
  구시군명: string;
  개표율: number;
  계: number;
}

type t의회의원선거 = {
  구시군명: string;
  선거구명: string;
  개표율: number;
  계: number;
}

type t세부투표구 = {
  시도명: string;
  구시군명: string;
  개표율: number;
  계: number;
};

type t투표구 = {
  읍면동명: string;
  투표구명: string;
  계: number;
};

type RuleSet = Map<number, string>;

const $ = jQuery.noConflict(true);

//KST 2022-06-01 15:50
//Replace ',' => ''
//From: ^([가-힣]+)\s+((\d+)\s+){3,3}(\d+)\s+(\d+)\s+(\d+)\s+[\d\.]+%\s*$
//To:  $1: [$4, $5],
const 총투표수: Record<string, Record<string, [number, number]>> = {
  서울특별시: {
    종로구: [28092, 31174],
    중구: [25492, 25302],
    용산구: [44309, 43364],
    성동구: [60667, 56149],
    광진구: [67526, 63630],
    동대문구: [70251, 59906],
    중랑구: [75147, 75607],
    성북구: [85530, 83873],
    강북구: [55861, 56889],
    도봉구: [65313, 60385],
    노원구: [108378, 94382],
    은평구: [87836, 94153],
    서대문구: [62871, 59397],
    마포구: [74750, 69162],
    양천구: [90391, 82340],
    강서구: [113168, 103660],
    구로구: [83373, 73219],
    금천구: [45550, 43705],
    영등포구: [79772, 70613],
    동작구: [77048, 80147],
    관악구: [93648, 96465],
    서초구: [86262, 69104],
    강남구: [111563, 84256],
    송파구: [135746, 122480],
    강동구: [91471, 86331],
  },
  부산광역시: {
    중구: [8264, 8385],
    서구: [22378, 20086],
    동구: [16556, 18748],
    영도구: [21206, 22538],
    부산진구: [66823, 57996],
    동래구: [53718, 43065],
    남구: [52768, 46438],
    북구: [60114, 44185],
    해운대구: [75660, 61055],
    기장군: [31402, 21366],
    사하구: [58633, 47617],
    금정구: [48175, 42997],
    강서구: [25248, 17186],
    연제구: [43880, 32649],
    수영구: [32482, 30253],
    사상구: [40890, 32311],
  },
  대구광역시: {
    중구: [13567, 11354],
    동구: [63861, 45888],
    서구: [33267, 25862],
    남구: [26654, 19834],
    북구: [77214, 55360],
    수성구: [79174, 57805],
    달서구: [95240, 61488],
    달성군: [47169, 27386],
  },
  인천광역시: {
    중구: [27111, 24089],
    동구: [13006, 13545],
    미추홀구: [74491, 68479],
    연수구: [71195, 64794],
    남동구: [95673, 84496],
    부평구: [90024, 82321],
    계양구: [70397, 58836],
    서구: [93668, 89017],
    강화군: [16312, 19597],
    옹진군: [5099, 7063],
  },
  광주광역시: {
    동구: [14116, 18834],
    서구: [37367, 45781],
    남구: [26880, 34228],
    북구: [48106, 66766],
    광산구: [44983, 44701],
  },
  대전광역시: {
    동구: [41477, 40239],
    중구: [46200, 40082],
    서구: [85732, 76929],
    유성구: [72573, 58318],
    대덕구: [35888, 29503],
  },
  울산광역시: {
    중구: [49764, 37259],
    남구: [63213, 48861],
    동구: [30515, 28817],
    북구: [44910, 32273],
    울주군: [45636, 38954],
  },
  세종특별자치시: {
    세종특별자치시: [60074, 65812],
  },
  경기도: {
    수원시장안구: [48634, 40128],
    수원시권선구: [89855, 62620],
    수원시팔달구: [39561, 31031],
    수원시영통구: [71973, 58289],
    성남시수정구: [48796, 47171],
    성남시중원구: [39910, 40686],
    성남시분당구: [129617, 89310],
    의정부시: [94170, 72322],
    안양시만안구: [53067, 46002],
    안양시동안구: [75301, 61339],
    부천시: [153614, 136047],
    광명시: [67492, 56164],
    평택시: [105386, 77019],
    양주시: [48314, 37373],
    동두천시: [17968, 18375],
    안산시상록구: [71865, 50328],
    안산시단원구: [62726, 43705],
    고양시덕양구: [121408, 91049],
    고양시일산동구: [59863, 43080],
    고양시일산서구: [58318, 44778],
    과천시: [18449, 17018],
    의왕시: [40874, 30361],
    구리시: [42132, 31503],
    남양주시: [148211, 102143],
    오산시: [40903, 28710],
    화성시: [150180, 127561],
    시흥시: [98400, 71426],
    군포시: [60329, 46937],
    하남시: [65188, 57583],
    파주시: [101648, 63442],
    여주시: [24016, 22365],
    이천시: [42016, 38024],
    용인시처인구: [53417, 40594],
    용인시수지구: [68083, 49334],
    용인시기흥구: [109318, 90317],
    안성시: [37997, 36129],
    김포시: [105090, 66809],
    광주시: [70813, 57158],
    포천시: [30364, 29263],
    연천군: [11664, 9489],
    양평군: [27320, 29275],
    가평군: [16228, 14434],
  },
  강원도: {
    춘천시: [62603, 56247],
    원주시: [76168, 65646],
    강릉시: [48396, 44501],
    동해시: [17940, 19006],
    삼척시: [15614, 18445],
    태백시: [9524, 11549],
    정선군: [10080, 10789],
    속초시: [17565, 16257],
    고성군: [8604, 7194],
    양양군: [7630, 7504],
    인제군: [8375, 9090],
    홍천군: [18198, 16205],
    횡성군: [12323, 13910],
    영월군: [10331, 10564],
    평창군: [11251, 12670],
    화천군: [6349, 6715],
    양구군: [5715, 6103],
    철원군: [11960, 8779],
  },
  충청북도: {
    청주시상당구: [40119, 31412],
    청주시서원구: [39872, 31964],
    청주시흥덕구: [51771, 35016],
    청주시청원구: [39753, 24803],
    충주시: [42827, 38701],
    제천시: [29116, 28329],
    단양군: [7690, 8644],
    영동군: [11400, 14150],
    보은군: [7753, 10727],
    옥천군: [12405, 14500],
    음성군: [17925, 19535],
    진천군: [16119, 15314],
    괴산군: [9697, 12989],
    증평군: [7900, 7826],
  },
  충청남도: {
    천안시서북구: [65733, 40915],
    천안시동남구: [57332, 39327],
    공주시: [23693, 24000],
    보령시: [23412, 25110],
    아산시: [62542, 42588],
    서산시: [34713, 30568],
    태안군: [16140, 16386],
    금산군: [14785, 11821],
    논산시: [24694, 22588],
    계룡시: [8266, 9105],
    당진시: [31178, 27482],
    부여군: [16622, 17193],
    서천군: [12880, 14431],
    홍성군: [22217, 19899],
    청양군: [8840, 9776],
    예산군: [18789, 16942],
  },
  전라북도: {
    전주시완산구: [56743, 54151],
    전주시덕진구: [44363, 40471],
    군산시: [37997, 39986],
    익산시: [44317, 53033],
    정읍시: [20647, 29932],
    남원시: [14750, 26885],
    김제시: [16401, 23346],
    완주군: [16034, 21989],
    진안군: [5879, 10089],
    무주군: [5290, 10342],
    장수군: [5458, 8558],
    임실군: [6031, 10835],
    순창군: [5652, 12203],
    고창군: [11943, 21034],
    부안군: [10032, 15746],
  },
  전라남도: {
    목포시: [32831, 56036],
    여수시: [51891, 46227],
    순천시: [57867, 56952],
    나주시: [19447, 29475],
    광양시: [30396, 32353],
    담양군: [9042, 16009],
    장성군: [7637, 17589],
    곡성군: [6178, 11632],
    구례군: [7127, 9459],
    고흥군: [13962, 29138],
    보성군: [9324, 13086],
    화순군: [13049, 17015],
    장흥군: [7943, 14278],
    강진군: [7243, 13708],
    완도군: [10919, 17220],
    해남군: [14337, 18655],
    진도군: [7571, 12046],
    영암군: [10078, 16646],
    무안군: [15046, 22924],
    영광군: [11015, 19072],
    함평군: [7020, 10389],
    신안군: [8145, 17479],
  },
  경상북도: {
    포항시북구: [55000, 38921],
    포항시남구: [43611, 35480],
    울릉군: [2519, 3987],
    경주시: [50329, 49882],
    김천시: [27717, 34607],
    안동시: [35641, 33219],
    구미시: [73388, 53999],
    영주시: [27316, 25116],
    영천시: [24473, 22930],
    상주시: [23938, 27315],
    문경시: [16044, 21743],
    예천군: [12566, 14792],
    경산시: [54279, 34197],
    청도군: [12778, 13080],
    고령군: [8443, 7788],
    성주군: [10146, 14947],
    칠곡군: [21072, 16687],
    군위군: [5521, 11705],
    의성군: [11912, 21635],
    청송군: [7334, 8692],
    영양군: [3988, 7110],
    영덕군: [9619, 10894],
    봉화군: [8695, 9343],
    울진군: [11934, 14629],
  },
  경상남도: {
    창원시의창구: [48420, 33856],
    창원시성산구: [59254, 38740],
    창원시마산합포구: [40329, 34453],
    창원시마산회원구: [43495, 32026],
    창원시진해구: [36724, 30476],
    진주시: [73757, 65405],
    통영시: [29044, 26418],
    고성군: [13152, 14893],
    사천시: [25778, 25157],
    김해시: [101926, 74480],
    밀양시: [24100, 22287],
    거제시: [45454, 42526],
    의령군: [7929, 9293],
    함안군: [15488, 13841],
    창녕군: [16026, 15742],
    양산시: [75843, 45722],
    하동군: [10160, 17607],
    남해군: [10952, 14056],
    함양군: [9999, 14713],
    산청군: [8894, 11867],
    거창군: [14743, 17260],
    합천군: [12764, 13093],
  },
  제주특별자치도: {
    제주시: [109333, 86746],
    서귀포시: [40913, 35330],
  },
};

jQuery(function ($) {
  const 정당코드: Record<
    string,
    {
      정당: string;
      색상: string;
    }
  > = {
    더불어민주당: { 정당: "더불어민주당", 색상: "#196CD1" },
    국민의힘: { 정당: "국민의힘", 색상: "#E61E2B" },
    정의당: { 정당: "정의당", 색상: "#FFCC00" },
    기본소득당: { 정당: "기본소득당", 색상: "#777777" },
    녹색당: { 정당: "녹색당", 색상: "#777777" },
    독도당: { 정당: "독도당", 색상: "#777777" },
    진보당: { 정당: "진보당", 색상: "#777777" },
    통일한국당: { 정당: "통일한국당", 색상: "#777777" },
    한류연합당: { 정당: "한류연합당", 색상: "#777777" },
    무소속: { 정당: "무소속", 색상: "#777777" },
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
    제주특별자치도: 17,
  };

  const 필터: t필터 = {
    타입: 기호제거($(".r_title h4").text()),
    선거명: 기호제거($("#electionName").text()),
    도시: 기호제거($("#cityName").text()),
    구시군: 기호제거($("#townName").text()),
    선거구: 기호제거($("#sggCityName").text()),
  };
  console.log("필터", 필터);

  $(function () {
    //다른 모드는 다른 코드 참고
    if (필터.선거명 == "시도지사선거") {
      if (필터.타입 == "개표진행상황") {
        parse세부();
        if (필터.도시 == "") {
          display일반_지역();

          display개표단위();
        }
      }
      if (필터.타입 == "개표단위별개표결과") {
        parse개표단위('구시군');
      }
    } else if(필터.선거명 == '구시군의장선거'){

    }else {
      console.log("해당 없음");
      return; //안한다
    }
  });

  const trToObj = function(
    $tr: JQuery<HTMLElement>,
    ruleset: RuleSet,
  ): Record<string, string | number> {
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

        if (!ruleset.has(idx)) {
          return;
        }

        const key = ruleset.get(idx);

        result[key] = text;
      });

    return result;
  };

  function numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const modifyRuleset = function (
    $tds: JQuery<HTMLElement>,
    ruleBase: RuleSet,
    partyInfo: Record<string, string>,
    offset = 0
  ) {

    const ruleset = new Map(ruleBase);

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
          ruleset.set(xpos, text);
        } else {
          if (arr[0] === "") {
            xpos += 1;
            return;
          }
          if (arr[0] == "무소속") {
            arr[0] += arr[1];
          }
          partyInfo[arr[0]] = arr[1];
          ruleset.set(xpos, text);
        }
      }

      xpos += 1;
    });
    return ruleset;
  };

  const toTr = function(
    arr: Record<string, string | number>,
    ruleset: RuleSet,
    name: string
  ) {
    let html =
      '<tr><td class="firstTh" style="letter-spacing:-1px;">' + name + "</td>";

    const maxLen = Math.max(...ruleset.keys());

    for (let i = 0; i < maxLen; i++) {
      if(!ruleset.has(i)){
        continue;
      }
      const code = ruleset.get(i);
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

  function mergeObject(계: t총계): Record<string, string | number> {
    let result: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(계.items)) {
      result[key] = value;
    }

    return result;
  }

  const parseHeader = function (
    $표: JQuery<HTMLElement>
  ): [RuleSet, Record<string, string>] {
    const ruleset = new Map<number, string>();
    const partyInfo: Record<string, string> = {};
    let xpos = 0;
    $표.find("thead tr:eq(0) th").each(function () {
      let $th = $(this);
      let text = 기호제거($th.text()).trim();
      console.log(text);
      const colspan = parseInt(subsNull($th.attr("colspan"), "1"));

      if (text !== "") {
        ruleset.set(xpos, text);
      }

      xpos += colspan;
    });

    const headerInfo = modifyRuleset(
      $표.find("tbody tr:eq(0) td"),
      ruleset,
      partyInfo
    );

    return [headerInfo, partyInfo];
  };

  const parseHeader2 = function ($표: JQuery<HTMLElement>): [RuleSet, Record<string, string>] {
    const ruleset = new Map<number, string>();
    const partyInfo: Record<string, string> = {};
    let xpos = 0;
    $표.find("thead tr:eq(0) th").each(function () {
      let $th = $(this);
      let text = 기호제거($th.text()).trim();
      console.log(text);
      const colspan = parseInt(subsNull($th.attr("colspan"), "1"));

      if (text !== "") {
        ruleset.set(xpos, text);
      }

      xpos += colspan;
    });

    const headerInfo = modifyRuleset(
      $표.find("thead tr:eq(1) th"),
      ruleset,
      partyInfo,
      4
    );

    return [headerInfo, partyInfo];
  };

  const parse개표단위 = function (subKey: '구시군'|'선거구') {
    console.log(필터.타입);

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
      const 투표구 = trToObj($this, headerInfo) as t투표구;

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
      `${필터.타입}_개표단위_사전_${필터.도시}_${필터.구시군}`,
      JSON.stringify(총계_사전)
    );
    localStorage.setItem(
      `${필터.타입}_개표단위_본_${필터.도시}_${필터.구시군}`,
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

  const parse세부 = function () {
    console.log(필터.타입);

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

  const display개표단위 = function () {
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

  const display일반_지역 = function () {
    const $표 = $("#table01");
    const [headerInfo] = parseHeader($표);
    headerInfo.set(1, '시간');

    const 총계: t총계 = { 계: 0, items: {} };

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
