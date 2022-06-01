import { toNumber } from "./util/toNumber";
import { subsNull } from "./util/subsNull";
import { 기호제거 } from "./util/기호제거";

declare const jQuery: JQueryStatic;

type t총계 = {
  items: Record<string, number>;
  계: number;
  시간?: string;
};

type t필터 = {
  타입: string;
  선거명: string;
  도시: string;
  구시군: string;
  선거구: string;
};

interface t개별투표 {
  개표율: number;
  계: number;
}

type t일반단위 = {
  시도명: string;
  구시군명: string;
  선거구명: string;
  읍면동명: string;
  개표율: number;
  계: number;
  [key: string]: number | string;
};

type t개표단위 = {
  읍면동명: string;
  구분: string;
  계: number;
  [key: string]: number | string;
};

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

const invalidThKey = new Set([
  "구시군명",
  "선거구명",
  "읍면동명",
  "선거인수",
  "투표수",
  "기권수",
  "무효투표수",
  "개표율",
  "계",
  "구분",
  "items",
]);

type RuleSet = Map<number, string>;

const $ = jQuery.noConflict(true);

//KST 2022-06-01 21:00
//Replace ',' => ''
//From: ^([가-힣]+)\s+((\d+)\s+){3,3}(\d+)\s+(\d+)\s+(\d+)\s+[\d\.]+%\s*$
//To:  $1: [$4, $5],
const 총투표수: Record<string, Record<string, [number, number]>> = {
  서울특별시: {
    종로구: [39494, 31174],
    중구: [34980, 25303],
    용산구: [61427, 43364],
    성동구: [83617, 56157],
    광진구: [93374, 63632],
    동대문구: [97073, 59907],
    중랑구: [102109, 75611],
    성북구: [118383, 83873],
    강북구: [76514, 56893],
    도봉구: [88026, 60385],
    노원구: [150777, 94386],
    은평구: [121823, 94156],
    서대문구: [87581, 59397],
    마포구: [105867, 69170],
    양천구: [127358, 82343],
    강서구: [157316, 103666],
    구로구: [114876, 73219],
    금천구: [62122, 43708],
    영등포구: [110498, 70613],
    동작구: [107237, 80151],
    관악구: [130350, 96469],
    서초구: [122759, 69106],
    강남구: [157290, 84261],
    송파구: [190830, 122480],
    강동구: [127727, 86331],
  },
  부산광역시: {
    중구: [10745, 8385],
    서구: [26967, 20086],
    동구: [22095, 18749],
    영도구: [27695, 22541],
    부산진구: [91324, 58003],
    동래구: [73750, 43065],
    남구: [72066, 46447],
    북구: [81896, 44191],
    해운대구: [103722, 61055],
    기장군: [42902, 21366],
    사하구: [79301, 47619],
    금정구: [59870, 43002],
    강서구: [34340, 17186],
    연제구: [59393, 32649],
    수영구: [44662, 30256],
    사상구: [55390, 32287],
  },
  대구광역시: {
    중구: [18154, 11354],
    동구: [85124, 45894],
    서구: [40585, 25862],
    남구: [34858, 19834],
    북구: [105224, 55368],
    수성구: [99715, 57814],
    달서구: [130766, 61490],
    달성군: [64069, 27392],
  },
  인천광역시: {
    중구: [33279, 24089],
    동구: [15396, 13545],
    미추홀구: [91824, 68485],
    연수구: [99529, 64795],
    남동구: [127559, 84496],
    부평구: [120310, 82325],
    계양구: [85896, 58836],
    서구: [129358, 89020],
    강화군: [19493, 19597],
    옹진군: [5630, 7063],
  },
  광주광역시: {
    동구: [19541, 18835],
    서구: [52162, 45783],
    남구: [37278, 34230],
    북구: [71104, 66766],
    광산구: [64136, 44706],
  },
  대전광역시: {
    동구: [53809, 40239],
    중구: [60237, 40082],
    서구: [115903, 76929],
    유성구: [91264, 58321],
    대덕구: [46628, 29505],
  },
  울산광역시: {
    중구: [61136, 37261],
    남구: [85909, 48861],
    동구: [42019, 28817],
    북구: [56206, 32275],
    울주군: [60493, 38954],
  },
  세종특별자치시: {
    세종특별자치시: [83948, 65812],
  },
  경기도: {
    수원시장안구: [66076, 40128],
    수원시권선구: [111245, 62620],
    수원시팔달구: [48059, 31031],
    수원시영통구: [102270, 58289],
    성남시수정구: [59746, 47171],
    성남시중원구: [53794, 40688],
    성남시분당구: [161383, 89312],
    의정부시: [115692, 72326],
    안양시만안구: [65045, 46002],
    안양시동안구: [94516, 61343],
    부천시: [211551, 136053],
    광명시: [83326, 56165],
    평택시: [131104, 77075],
    양주시: [57805, 37377],
    동두천시: [21382, 18376],
    안산시상록구: [88642, 50330],
    안산시단원구: [77945, 43707],
    고양시덕양구: [150032, 91057],
    고양시일산동구: [74188, 43085],
    고양시일산서구: [80274, 44782],
    과천시: [25651, 17018],
    의왕시: [50214, 30363],
    구리시: [56688, 31507],
    남양주시: [197231, 102150],
    오산시: [54531, 28710],
    화성시: [209157, 127567],
    시흥시: [123718, 71426],
    군포시: [81341, 46938],
    하남시: [82167, 57583],
    파주시: [123697, 63451],
    여주시: [28284, 22365],
    이천시: [50714, 38029],
    용인시처인구: [64508, 40595],
    용인시수지구: [86570, 49338],
    용인시기흥구: [150950, 90322],
    안성시: [45634, 36129],
    김포시: [129106, 66810],
    광주시: [94995, 57168],
    포천시: [38511, 29264],
    연천군: [13306, 9493],
    양평군: [34153, 29277],
    가평군: [18731, 14434],
  },
  강원도: {
    춘천시: [81505, 56251],
    원주시: [91888, 65654],
    강릉시: [57444, 44501],
    동해시: [23043, 19006],
    삼척시: [19102, 18447],
    태백시: [10991, 11549],
    정선군: [11288, 10789],
    속초시: [20836, 16257],
    고성군: [9583, 7197],
    양양군: [9168, 7504],
    인제군: [9450, 9090],
    홍천군: [20734, 16205],
    횡성군: [13830, 13912],
    영월군: [12237, 10565],
    평창군: [12695, 12670],
    화천군: [7120, 6715],
    양구군: [6704, 6103],
    철원군: [13676, 8780],
  },
  충청북도: {
    청주시상당구: [48195, 31416],
    청주시서원구: [48351, 31964],
    청주시흥덕구: [63302, 35017],
    청주시청원구: [47872, 24803],
    충주시: [51037, 38701],
    제천시: [34479, 28329],
    단양군: [8773, 8655],
    영동군: [13001, 14151],
    보은군: [8819, 10727],
    옥천군: [14347, 14500],
    음성군: [21079, 19538],
    진천군: [19241, 15315],
    괴산군: [10732, 12989],
    증평군: [9216, 7826],
  },
  충청남도: {
    천안시서북구: [81477, 40917],
    천안시동남구: [69881, 39327],
    공주시: [27463, 24000],
    보령시: [27430, 25114],
    아산시: [76748, 42593],
    서산시: [41662, 30570],
    태안군: [18333, 16386],
    금산군: [16858, 11823],
    논산시: [31232, 22588],
    계룡시: [10203, 9105],
    당진시: [37412, 27483],
    부여군: [19230, 17193],
    서천군: [14855, 14432],
    홍성군: [25825, 19899],
    청양군: [9911, 9776],
    예산군: [21826, 16945],
  },
  전라북도: {
    전주시완산구: [71264, 54154],
    전주시덕진구: [56466, 40476],
    군산시: [47140, 39989],
    익산시: [54201, 53040],
    정읍시: [24346, 29935],
    남원시: [17640, 26875],
    김제시: [19327, 23346],
    완주군: [19517, 22003],
    진안군: [6527, 10089],
    무주군: [5926, 10344],
    장수군: [6034, 8559],
    임실군: [6803, 10836],
    순창군: [6391, 12203],
    고창군: [13619, 21037],
    부안군: [11748, 15749],
  },
  전라남도: {
    목포시: [40953, 56036],
    여수시: [63019, 46231],
    순천시: [71481, 56954],
    나주시: [23568, 29475],
    광양시: [36867, 32353],
    담양군: [10603, 16012],
    장성군: [8919, 17589],
    곡성군: [7011, 11633],
    구례군: [7959, 9459],
    고흥군: [15537, 29138],
    보성군: [10473, 13088],
    화순군: [15415, 17018],
    장흥군: [8979, 14279],
    강진군: [8237, 13710],
    완도군: [12574, 17230],
    해남군: [16579, 18671],
    진도군: [8359, 12046],
    영암군: [12080, 16655],
    무안군: [18409, 22932],
    영광군: [12753, 19072],
    함평군: [7839, 10389],
    신안군: [8937, 17479],
  },
  경상북도: {
    포항시북구: [66847, 38952],
    포항시남구: [54973, 35482],
    울릉군: [2809, 3987],
    경주시: [59769, 49887],
    김천시: [32672, 34607],
    안동시: [41312, 33225],
    구미시: [90581, 54003],
    영주시: [31184, 25116],
    영천시: [28785, 22931],
    상주시: [27047, 27318],
    문경시: [18643, 21743],
    예천군: [14708, 14793],
    경산시: [65876, 34197],
    청도군: [14233, 13086],
    고령군: [9634, 7788],
    성주군: [11691, 14947],
    칠곡군: [25289, 16690],
    군위군: [6145, 11705],
    의성군: [13300, 21638],
    청송군: [8156, 8692],
    영양군: [4423, 7110],
    영덕군: [10672, 10895],
    봉화군: [9541, 9343],
    울진군: [13691, 14629],
  },
  경상남도: {
    창원시의창구: [60975, 33862],
    창원시성산구: [74088, 38740],
    창원시마산합포구: [49468, 34457],
    창원시마산회원구: [53847, 32026],
    창원시진해구: [44683, 30528],
    진주시: [89781, 65413],
    통영시: [34827, 26419],
    고성군: [15418, 14893],
    사천시: [30380, 25157],
    김해시: [128930, 74482],
    밀양시: [28280, 22289],
    거제시: [56795, 42527],
    의령군: [8936, 9294],
    함안군: [18235, 13841],
    창녕군: [18649, 15744],
    양산시: [92672, 45730],
    하동군: [11504, 17608],
    남해군: [13163, 14057],
    함양군: [11303, 14713],
    산청군: [10062, 11868],
    거창군: [17504, 17260],
    합천군: [14274, 13093],
  },
  제주특별자치도: {
    제주시: [129686, 86757],
    서귀포시: [48392, 35335],
  },
};

jQuery(function ($) {
  function mergeObject(계: t총계): Record<string, string | number> {
    let result: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(계.items)) {
      result[key] = Math.floor(Number(value));
    }

    for (const [key, value] of Object.entries(계)) {
      if (typeof value === "string") {
        result[key] = value;
        continue;
      }
      if (typeof value === "number") {
        result[key] = Math.floor(value);
      }
    }

    console.log(result);

    return result;
  }

  const trToObj = function (
    $tr: JQuery<HTMLElement>,
    ruleset: RuleSet
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

        const key = ruleset.get(idx);
        if (key === undefined) {
          return;
        }

        result[key] = text;
      });

    return result;
  };

  class ElectionV {
    protected $표: JQuery<HTMLElement>;
    protected headerInfo: RuleSet;
    protected partyInfo: Record<string, string>;

    protected thQuery1: string;
    protected thQuery2: string;
    protected thOffset: number;

    constructor(
      public readonly 필터: t필터,
      public readonly 그룹키: (keyof t필터)[],
      public readonly 세부키: (keyof t필터)[]
    ) {
      this.$표 = $("#table01");

      if (필터.타입 === "개표진행상황") {
        this.thQuery1 = "thead tr:eq(0) th";
        this.thQuery2 = "tbody tr:eq(0) td";
        this.thOffset = 0;
      } else if (필터.타입 === "개표단위별개표결과") {
        this.thQuery1 = "thead tr:eq(0) th";
        this.thQuery2 = "thead tr:eq(1) th";
        this.thOffset = 4;
      } else {
        throw new Error("잘못된 타입입니다.");
      }

      [this.headerInfo, this.partyInfo] = this.parseHeader();
    }

    protected getStoreKey(): string {
      const stores: Record<string, string> = {};
      for (const [key, val] of Object.entries(this.필터)) {
        if (!val) {
          continue;
        }
        stores[key] = val;
      }
      return JSON.stringify(stores);
    }

    protected getCategoryKey(): string {
      const storeKey: string[] = [];
      for (const key of this.그룹키) {
        storeKey.push(this.필터[key]);
      }
      storeKey.pop();
      return storeKey.join("_");
    }

    protected getGroupKey(): string {
      const storeKey: string[] = [];
      for (const key of this.그룹키) {
        storeKey.push(this.필터[key]);
      }
      return storeKey.join("_");
    }

    protected getGroupDetailKey(): string {
      const storeKey: string[] = [];
      for (const key of this.그룹키) {
        storeKey.push(this.필터[key]);
      }
      for (const key of this.세부키) {
        storeKey.push(this.필터[key]);
      }
      return storeKey.join("_");
    }

    protected extendRuleset(
      $tds: JQuery<HTMLElement>,
      ruleBase: RuleSet,
      partyInfo: Record<string, string>,
      offset: number
    ) {
      const ruleset = new Map(ruleBase);

      let xpos = offset;
      $tds.each(function (idx) {
        const text = 기호제거(this.innerText);
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
    }

    protected parseHeader(): [RuleSet, Record<string, string>] {
      const ruleset = new Map<number, string>();
      const partyInfo: Record<string, string> = {};
      let xpos = 0;
      this.$표.find(this.thQuery1).each(function () {
        let $th = $(this);
        let text = 기호제거($th.text()).trim();
        console.log(text);
        const colspan = parseInt(subsNull($th.attr("colspan"), "1"));

        if (text !== "") {
          ruleset.set(xpos, text);
        }

        xpos += colspan;
      });

      const headerInfo = this.extendRuleset(
        this.$표.find(this.thQuery2),
        ruleset,
        partyInfo,
        this.thOffset
      );

      return [headerInfo, partyInfo];
    }

    public parse일반() {
      const $표 = this.$표;

      const headerInfo = this.headerInfo;
      console.log("header", headerInfo, this.partyInfo);

      const 총계: t총계 = { items: {}, 계: 0 };

      for (const 후보 of headerInfo.values()) {
        if (invalidThKey.has(후보)) {
          continue;
        }
        총계.items[후보] = 0;
      }

      $표.find("tbody tr:gt(0)").each(function () {
        const $this = $(this);
        const 투표구 = trToObj($this, headerInfo) as t일반단위;

        if (투표구.시도명 == "합계" || 투표구.구시군명 == "합계") {
          return;
        }

        if (투표구.구시군명 == "" || 투표구.시도명 == "") {
          return;
        }

        //console.log("투표구", 투표구);

        if (!("개표율" in 투표구)) {
          투표구.개표율 = 100.0;
        }

        if (투표구.개표율 <= 0.01) {
          return;
        }

        const invMult = 100.0 / 투표구.개표율;

        총계.계 += 투표구.계 * invMult;

        for (const 후보 of Object.keys(투표구)) {
          if (invalidThKey.has(후보)) {
            continue;
          }
          //console.log('후보', 후보, 투표구[후보], invMult);
          총계.items[후보] += Number(투표구[후보]) * invMult;
        }
      });

      let date = new Date();
      총계.시간 = date.toLocaleTimeString("en-GB");

      const categoryKey = this.getCategoryKey();
      //const groupKey = this.getGroupKey();
      const 지역목록 = JSON.parse(
        subsNull(localStorage.getItem(`일반_목록_${categoryKey}`), "{}")
      );
      const storeKey = this.getStoreKey();
      지역목록[storeKey] = [Array.from(headerInfo.entries()), date];
      localStorage.setItem(`일반_목록_${categoryKey}`, JSON.stringify(지역목록));

      console.log("계", 총계);
      localStorage.setItem(`일반_${storeKey}`, JSON.stringify(총계));
    }

    public parse개표단위() {
      console.log(필터.타입);

      const $표 = $("#table01");

      if (필터.구시군 === "") {
        필터.구시군 = 필터.도시;
      }

      const headerInfo = this.headerInfo;
      console.log("header", headerInfo);

      const 총계_사전: t총계 = { items: {}, 계: 0 };
      const 총계_본: t총계 = { items: {}, 계: 0 };

      for (const 소속 of Object.values(headerInfo)) {
        if (invalidThKey.has(소속)) {
          continue;
        }
        총계_사전.items[소속] = 0;
        총계_본.items[소속] = 0;
      }

      //선거일투표
      const 구분1: Record<string, boolean> = {
        거소선상투표: true,
        재외투표: true,
        재외투표공관: true,
        관외사전투표: true,
      };

      const 구분2: Record<string, boolean> = {
        관내사전투표: true,
      };

      //let 읍면동 = '';
      $표.find("tbody tr:gt(0)").each(function () {
        const $this = $(this);
        const 투표구 = trToObj($this, headerInfo) as t개표단위;

        if (투표구.읍면동명 == "합계") {
          return;
        }

        if (투표구.구분 == "소계") {
          return;
        }

        if (투표구.구분 == "계") {
          return;
        }

        const is사전투표 = subsNull<boolean>(
          구분1[투표구.읍면동명],
          subsNull(구분2[투표구.구분], false)
        );

        console.log("개표단위", 투표구, is사전투표);

        const 총계_대상 = is사전투표 ? 총계_사전 : 총계_본;

        총계_대상.계 = 투표구.계 + subsNull(총계_대상.계, 0);
        for (const 후보 of Object.keys(투표구)) {
          if (invalidThKey.has(후보)) {
            continue;
          }
          총계_대상.items[후보] =
            Number(투표구[후보]) + subsNull(총계_대상.items[후보], 0);
        }
      });

      const [본투표수, 사전투표수] = 총투표수[필터.도시][필터.구시군];
      const 본개표율 = 총계_본.계 / 본투표수;
      const 사전개표율 = 총계_사전.계 / 사전투표수;
      console.log(본투표수, 본개표율, 사전투표수, 사전개표율);


      for (const key of Object.keys(총계_사전.items)) {
        총계_사전.items[key] /= 사전개표율;
      }
      총계_사전.계 /= 사전개표율;

      for (const key of Object.keys(총계_본.items)) {
        총계_본.items[key] /= 본개표율;
      }
      총계_본.계 /= 본개표율;

      let date = new Date();
      총계_사전.시간 = date.toLocaleTimeString("en-GB");
      총계_본.시간 = date.toLocaleTimeString("en-GB");

      console.log(필터, 총계_사전, 총계_본);

      const categoryKey = this.getCategoryKey();
      const groupKey = this.getGroupKey();
      const groupDetailKey = this.getGroupDetailKey();
      const 지역목록 = JSON.parse(
        subsNull(localStorage.getItem(`개표단위_목록_${categoryKey}`), "{}")
      );
      지역목록[groupKey] = Array.from(headerInfo.entries());

      const 지역세부목록 = JSON.parse(
        subsNull(
          localStorage.getItem(`개표단위_세부목록_${groupKey}`),
          "{}"
        )
      );
      const storeKey = this.getStoreKey();
      지역세부목록[storeKey] = date;

      localStorage.setItem(
        `개표단위_목록_${categoryKey}`,
        JSON.stringify(지역목록)
      );
      localStorage.setItem(
        `개표단위_세부목록_${groupKey}`,
        JSON.stringify(지역세부목록)
      );

      localStorage.setItem(
        `개표단위_사전_${storeKey}`,
        JSON.stringify(총계_사전)
      );
      localStorage.setItem(`개표단위_본_${storeKey}`, JSON.stringify(총계_본));
      console.log("사전", 총계_사전);
      console.log("본", 총계_본);
    }

    public display일반() {
      this.$표.append("<tr><td></td></tr>");

      const groupKey = this.getGroupKey();
      const 지역목록: Record<string, [[number, string][], string]> = JSON.parse(
        localStorage.getItem(`일반_목록_${groupKey}`) ?? "{}"
      );
      console.log("지역목록", 지역목록);
      if (!지역목록) {
        return;
      }

      const 총계: t총계 = { items: {}, 계: 0 };

      //let lastHeader: RuleSet | undefined = undefined;

      for (const [지역키, [rawHeader]] of Object.entries(지역목록)) {
        const 지역구분 = JSON.parse(지역키) as t필터;
        const 지역이름: string[] = [];
        for (const key of this.그룹키) {
          if (key == "선거명") {
            continue;
          }
          const value = 지역구분[key];
          if (!value) {
            continue;
          }
          지역이름.push(value);
        }

        const headerInfo: RuleSet = new Map(rawHeader);
        headerInfo.set(1, "시간");
        //lastHeader = headerInfo;

        const 지역정보 = JSON.parse(
          localStorage.getItem(`일반_${지역키}`) ?? "{}"
        ) as t총계;
        if (!지역정보) {
          continue;
        }

        const tHeader: Record<string, string> = {};
        for (const name of headerInfo.values()) {
          tHeader[name] = name.split("_").join("<br>\n");
        }

        this.$표.append(toTr(tHeader, headerInfo, 지역이름.join("\n")));
        this.$표.append(
          toTr(mergeObject(지역정보), headerInfo, 지역이름.join("\n"))
        );
        for (const [후보, value] of Object.entries(지역정보.items)) {
          총계.items[후보] = value + 총계.items[후보] ?? 0;
          총계.계 = value + 총계.계 ?? 0;
        }
      }

      const 비율: Record<string, string> = {};
      for (const [코드, value] of Object.entries(총계.items)) {
        비율[코드] = ((value / 총계["계"]) * 100).toFixed(2) + "%";
      }

      /*
      if (lastHeader) {
        this.$표.append(toTr(mergeObject(총계), lastHeader, "계"));
        //this.$표.append(toTr(비율, lastHeader, ""));
      }
      */
    }

    public display개표단위() {
      const headerInfo = this.headerInfo;
      //const 지역목록 = JSON.parse(subsNull(localStorage.getItem('대통령지역_목록'), '{}'));

      //총계는 대선에만?
      //const 총계: t총계 = { items: {}, 계: 0 };

      this.$표.append("<tr><td></td></tr>");
      const categoryKey = this.getCategoryKey();
      const groupKey = this.getGroupKey();
      const 지역목록: Record<string, [number, string][]> = JSON.parse(
        subsNull(localStorage.getItem(`개표단위_목록_${categoryKey}`), "{}")
      );
      console.log("지역목록", 지역목록);
      if (!지역목록) {
        return;
      }

      for (const [groupKey, rawHeader] of Object.entries(지역목록)) {
        const 지역이름 = groupKey.split("_");
        지역이름.shift();

        const headerInfo: RuleSet = new Map(rawHeader);
        headerInfo.set(1, "시간");

        const 지역세부목록 = JSON.parse(
          subsNull(
            localStorage.getItem(`개표단위_세부목록_${groupKey}`),
            "{}"
          )
        );
        if (!Object.keys(지역세부목록).length) {
          continue;
        }

        const 세부_사전_계: t총계 = { items: {}, 계: 0 };
        const 세부_본_계: t총계 = { items: {}, 계: 0 };
        const 세부_전체_계: t총계 = { items: {}, 계: 0 };

        const tHeader: Record<string, string> = {};
        for (const name of headerInfo.values()) {
          tHeader[name] = name.split("_").join("<br>\n");
        }
        this.$표.append(toTr(tHeader, headerInfo, 지역이름.join("\n")));

        for (const storeKey of Object.keys(지역세부목록)) {
          console.log("개표단위", storeKey);
          const 세부_사전: t총계 = JSON.parse(
            localStorage.getItem(`개표단위_사전_${storeKey}`) ?? "{}"
          );
          const 세부_본: t총계 = JSON.parse(
            localStorage.getItem(`개표단위_본_${storeKey}`) ?? "{}"
          );

          const target = [
            [세부_사전_계, 세부_사전],
            [세부_본_계, 세부_본],
          ];
          for (const [세부계, 세부] of target) {
            console.log(세부계, 세부);

            if(세부계.시간 === undefined){
              세부계.시간 = 세부.시간;
            }
            else if(세부.시간 !== undefined){
              세부계.시간 = 세부.시간 < 세부계.시간 ? 세부.시간 : 세부계.시간;
            }

            세부계.계 = 세부.계 + subsNull(세부계.계, 0);
            세부_전체_계.계 = 세부.계 + subsNull(세부_전체_계.계, 0);

            for (const 후보 of Object.keys(세부.items)) {
              if (invalidThKey.has(후보)) {
                continue;
              }
              const value = 세부.items[후보];
              세부계.items[후보] = value + subsNull(세부계.items[후보], 0);
              세부_전체_계.items[후보] =
                value + subsNull(세부_전체_계.items[후보], 0);
            }
          }
        }

        this.$표.append(toTr(mergeObject(세부_사전_계), headerInfo, `(사전)`));
        this.$표.append(toTr(mergeObject(세부_본_계), headerInfo, `(본)`));
        this.$표.append(toTr(mergeObject(세부_전체_계), headerInfo, `계`));
      }
    }
  }

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
        const obj = new ElectionV(필터, ["선거명", "도시"], []);
        if (필터.도시 == "") {
          obj.display개표단위();
          obj.display일반();
        } else {
          obj.parse일반();
        }
      }
      if (필터.타입 == "개표단위별개표결과") {
        const obj = new ElectionV(필터, ["선거명", "도시"], ["구시군"]);
        obj.parse개표단위();
      }
    } else {
      console.log("해당 없음");
      return; //안한다
    }
  });

  function numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const toTr = function (
    arr: Record<string, string | number>,
    ruleset: RuleSet,
    name: string
  ) {
    let html =
      '<tr><td class="firstTh" style="letter-spacing:-1px;">' + name + "</td>";

    const maxLen = Math.max(...ruleset.keys());

    for (let i = 0; i < maxLen; i++) {
      const code = ruleset.get(i);
      if (code === undefined) {
        continue;
      }
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
});
