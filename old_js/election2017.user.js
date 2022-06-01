// ==UserScript==
// @name         개표진행 대선 2017
// @namespace    https://hided.net/
// @version      0.90
// @description  개표 진행 상황을 보여줍니다. (현재 개발중)
// @author       HideD
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js
// @match        http://info.nec.go.kr/electioninfo/electionInfo_report.xhtml
// @updateURL    https://hided.net/gs_script/election2017.user.js
// @grant        none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

jQuery(function($) {
    var raw후보정보 = [
        [1, '문재인', '더불어민주당', '#1271B5'],
        [2, '홍준표', '자유한국당', '#CC0000'],
        [3, '안철수', '국민의당', '#046240'],
        [4, '유승민', '바른정당', '#777777'],
        [5, '심상정', '정의당', '#FFE400'],
        [6, '조원진', '새누리당', '#777777'],
        [7, '오영국', '경제애국당', '#777777'],
        [8, '장성민', '국민대통합당', '#777777'],
        [9, '이재오', '늘푸른한국당', '#777777'],
        [10, '김선동', '민중연합당', '#777777'],
        [11, '이경희', '한국국민당', '#777777'],
        [12, '윤홍식', '홍익당', '#777777'],
        [13, '김민찬', '무소속', '#777777']
    ];

    var 정당코드 = raw후보정보.reduce(function(map, obj) {
        map[obj[2]] = {
            '기호': obj[0],
            '후보명': obj[1],
            '정당': obj[2],
            '색상': obj[3],
        };
        return map;
    }, {});

    var 후보코드 = raw후보정보.reduce(function(map, obj) {
        map[obj[1]] = {
            '기호': obj[0],
            '후보명': obj[1],
            '정당': obj[2],
            '색상': obj[3],
        };
        return map;
    }, {});

    var 지역코드 = {
        "서울특별시": 1,
        "부산광역시": 2,
        "대구광역시": 3,
        "인천광역시": 4,
        "광주광역시": 5,
        "대전광역시": 6,
        "울산광역시": 7,
        "세종특별자치시": 8,
        "경기도": 9,
        "강원도": 10,
        "충청북도": 11,
        "충청남도": 12,
        "전라북도": 13,
        "전라남도": 14,
        "경상북도": 15,
        "경상남도": 16,
        "제주특별자치도": 17
    };

    var 기호제거 = function(text) {
        // | { } _ - [ ] ( ) · ! ? , (공백)
        return text.replace(/\||{|}|_|-|\[|\]|\(|\)|·|!|\?|,| |/gi, '');
    };



    $(function() {
        var 필터 = {
            '선거명': 기호제거($('#electionName').text()),
            '도시': 기호제거($('#cityName').text()),
            '선거구': 기호제거($('#townName').text())
        };
        console.log(필터);
        window.필터 = 필터;

        var is비례 = false;
        if (필터.선거명 == '국회의원선거') {
            parse지역구();
        } else if (필터.선거명 == '비례대표국회의원선거') {
            parse비례대표();
        } else if (필터.선거명 == '대통령선거') {
            parse대통령선거();
        } else {
            console.log('해당 없음');
            return; //안한다
        }
    });

    var trToObj = function($tr, ruleset) {
        var result = {};
        $($tr).find('td').each(function(idx) {

            var arr = $(this).text().split('(');
            var text = $.trim(기호제거(arr[0]));

            var floatNum = parseFloat(text);
            var num = parseInt(text);

            if (text.toString() == num) {
                text = num;
            } else if (text == floatNum) {
                text = floatNum;
            }

            if (ruleset[idx] === '') {
                return true;
            }

            result[idx] = text;
            result[ruleset[idx]] = text;
        });

        return result;
    };

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var modifyRuleset = function($tds, ruleBase, partyInfo) {
        var ruleset = {};
        for (var key in ruleBase) {
            ruleset[key] = ruleBase[key];
        }
        xpos = 0;
        $tds.each(function(idx) {
            var text = 기호제거(this.innerText);

            if (idx < 2) {
                xpos += 1;
                return true;
            }

            if (text !== '') {
                var arr = text.split('\n');
                if (arr.length == 1) {
                    ruleset[text] = xpos;
                    ruleset[xpos] = text;
                } else {
                    if (arr[0] === '') {
                        xpos += 1;
                        return true;
                    }
                    if (arr[0] == '무소속') {
                        arr[0] += arr[1];
                    }
                    partyInfo[arr[0]] = arr[1];
                    ruleset[arr[0]] = xpos;
                    ruleset[xpos] = arr[0];
                }

            }

            xpos += 1;
        });
        return ruleset;
    };

    var toTr = function(arr, ruleset, name) {
        var html = '<tr><td class="firstTh" style="letter-spacing:-1px;">' + name + '</td>';

        var len = Object.keys(ruleset).length;
        for (var idx = 1; idx < len; idx += 1) {
            if (!(idx in ruleset)) {
                break;
            }

            var code = ruleset[idx];
            if (!(code in arr)) {
                html += '<td class="alignR"></td>\n';
            } else {
                var value = arr[code];
                if (typeof(value) == "number") {
                    value = numberWithCommas(parseInt(value));
                }
                html += '<td class="alignR">' + value + '</td>\n';
            }
        }

        html += '</tr>';
        return $(html);
    };

    var getMaxKeyByVal = function(dict) {
        let maxval = -1;
        let maxkey = 0;
        for (var key in dict) {
            if (dict[key] > maxval) {
                maxkey = key;
                maxval = dict[key];
            }
        }
        return maxkey;
    };


    var calc좌석 = function(dict) {

        var 계 = 0;
        var key;

        let arr = {};
        for (key in dict) {
            arr[key] = dict[key];
        }

        if ('계' in arr) {
            delete arr.계;
        }

        if ('시간' in arr) {
            delete arr.시간;
        }


        for (key in arr) {
            계 += arr[key];
        }

        console.log(계);
        for (key in arr) {
            if (arr[key] < 0.03 * 계) {
                계 -= arr[key];
                delete arr[key];
            }
        }


        var raw좌석 = {};
        var 좌석점 = {};
        var 좌석 = {};
        var 총좌석 = 0;

        console.log(arr);

        for (key in arr) {
            raw좌석[key] = 47 * arr[key] / 계;
            좌석[key] = parseInt(raw좌석[key]);
            좌석점[key] = raw좌석[key] - 좌석[key];

            총좌석 += 좌석[key];
        }

        while (총좌석 < 47) {
            var maxKey = getMaxKeyByVal(좌석점);
            delete 좌석점[maxKey];

            좌석[maxKey] += 1;
            총좌석 += 1;
        }

        return [좌석, raw좌석];

    };

    var parse비례대표 = function() {
        console.log('비례대표');


        var $표 = $('#table01');

        var headerInfo = {};
        var partyInfo = {};
        var xpos = 0;
        $표.find('thead tr:eq(0) th').each(function(idx) {
            var $th = $(this);
            var text = $.trim(기호제거($th.text()));
            var colspan = $th.attr('colspan');
            if (colspan === undefined) {
                colspan = 1;
            } else {
                colspan = parseInt(colspan);
            }

            if (text !== '') {
                headerInfo[text] = xpos;
                headerInfo[xpos] = text;
            }

            xpos += colspan;
        });

        headerInfo = modifyRuleset($표.find('tbody tr:eq(0) td'), headerInfo, partyInfo);

        //console.log(headerInfo);

        var 총계 = { '계': 0 };
        var 소속;

        for (소속 in 정당코드) {
            총계[소속] = 0;
        }

        $표.find('tbody tr:gt(0)').each(function(idx) {
            var $this = $(this);
            var 투표구 = trToObj($this, headerInfo);

            if (투표구.시도명 == '합계' || 투표구.구시군명 == '합계') {
                return true;
            }

            //console.log(투표구);
            if (!('개표율' in 투표구)) {
                투표구.개표율 = 100.00;
            }

            if (투표구.개표율 === 0) {
                return true;
            }

            var invMult = 100.0 / 투표구.개표율;

            총계.계 += 투표구.계 * invMult;

            for (소속 in 정당코드) {
                총계[소속] += 투표구[소속] * invMult;
            }
        });

        var date = new Date();
        총계.시간 = date.toISOString();

        console.log(총계);

        if (필터.도시 !== '') {
            localStorage.setItem('비례_' + 필터.도시, JSON.stringify(총계));
            return;
        }

        var 총계2 = { '계': 0 };
        for (소속 in 정당코드) {
            총계2[소속] = 0;
        }

        for (var 도시 in 지역코드) {

            var obj도시 = localStorage.getItem('비례_' + 도시);
            if (!obj도시) {
                console.log(도시, '없음');
                continue;
            }
            obj도시 = JSON.parse(obj도시);
            //console.log(obj도시);
            총계2.계 += obj도시.계;

            for (소속 in 정당코드) {
                총계2[소속] += obj도시[소속];
            }
        }

        //console.log(총계2);



        var html총계1 = toTr(총계, headerInfo, '예측 전체');
        var html총계2 = toTr(총계2, headerInfo, '예측 지역');


        var 총계1좌석 = calc좌석(총계);
        var 총계2좌석 = calc좌석(총계2);

        console.log(총계1좌석);
        //console.log(총계2좌석);

        var 총계1좌석r = {};
        var 총계2좌석r = {};

        for (소속 in 총계1좌석[0]) {
            총계1좌석r[소속] = 총계1좌석[0][소속] + '<br><small>(' + 총계1좌석[1][소속].toFixed(3) + ')</small>';
            총계2좌석r[소속] = 총계2좌석[0][소속] + '<br><small>(' + 총계2좌석[1][소속].toFixed(3) + ')</small>';
        }

        console.log(총계1좌석r);

        $표.append(html총계1);
        $표.append(toTr(총계1좌석r, headerInfo, '좌석 전체'));
        $표.append(html총계2);
        $표.append(toTr(총계2좌석r, headerInfo, '좌석 지역'));
    };

    var grayLevel = function(color) {
        if (color.length == 4) {
            return 17 * (parseInt(color.substr(1, 1), 16) + parseInt(color.substr(2, 1), 16) + parseInt(color.substr(3, 1), 16)) / 3;
        }
        return (parseInt(color.substr(1, 2), 16) + parseInt(color.substr(3, 2), 16) + parseInt(color.substr(5, 2), 16)) / 3;
    };

    var parse지역구 = function() {
        console.log('지역구');
        var $표 = $('#table01');
        console.log($표);

        //JSON.stringify

        var headerBase = {};

        var partyInfos = {};
        var xpos = 0;
        $표.find('thead tr:eq(0) th').each(function(idx) {
            var $th = $(this);
            var text = $.trim(기호제거($th.text()));



            var colspan = $th.attr('colspan');
            if (colspan === undefined) {
                colspan = 1;
            } else {
                colspan = parseInt(colspan);
            }

            if (text !== '') {
                headerBase[text] = xpos;
                headerBase[xpos] = text;
            }

            xpos += colspan;
        });

        //console.log(headerInfo);


        var headerInfo = {};

        console.log(headerInfo);

        window.partyInfos = partyInfos;

        var 선거구 = {};

        var 현재선거구;
        var obj선거구;
        var partyInfo;
        var 소속;

        $표.find('tbody tr').each(function(idx) {
            var $this = $(this);
            var 투표구 = trToObj($this, headerInfo);
            //
            if (투표구.선거구명 !== '') {
                현재선거구 = 투표구.선거구명;

                obj선거구 = { '계': 0 };
                선거구[현재선거구] = obj선거구;
                obj선거구.선거구명 = 현재선거구;

                partyInfo = {};
                partyInfos[현재선거구] = partyInfo;
                headerInfo = modifyRuleset($(this).find('td'), headerBase, partyInfo);
                obj선거구.header = headerInfo;
                obj선거구.party = partyInfo;

                for (소속 in partyInfo) {
                    obj선거구[소속] = 0;
                }

                obj선거구.main = $this;

                return true;
            }
            if (투표구.구시군명 == '소계') {
                //console.log(투표구);
                obj선거구.sub = $this.find('td');
                return true;
            }
            //console.log(투표구);

            if (!('개표율' in 투표구)) {
                투표구.개표율 = 100.00;
            }

            if (투표구.개표율 === 0) {
                return true;
            }

            var invMult = 100.0 / 투표구.개표율;

            obj선거구.계 += 투표구.계 * invMult;

            for (소속 in partyInfo) {
                obj선거구[소속] += 투표구[소속] * invMult;
            }
            //console.log(obj선거구);
        });

        var 정당;
        var 당선수 = { '무소속': 0 };
        for (정당 in 정당코드) {
            당선수[정당] = 0;
        }

        window.선거구 = 선거구;
        for (var 선거구명 in 선거구) {
            obj선거구 = 선거구[선거구명];
            console.log(obj선거구);

            if (obj선거구.계 === 0) {
                continue;
            }

            var submode = ('sub' in obj선거구);

            var $target = obj선거구.main.next().find('td');


            //console.log($sub);

            var max = -1;
            var maxPos = -1;
            for (소속 in obj선거구.party) {
                var pos소속 = obj선거구.header[소속];
                var value = obj선거구[소속] / obj선거구.계;

                if (submode) {
                    $target.eq(pos소속).html((value * 100).toFixed(2) + "%").css('font-weight', 'bold');
                } else {
                    $target.eq(pos소속).css('font-weight', 'bold');
                }


                if (max < value) {
                    max = value;
                    maxPos = pos소속;
                }
            }
            if (maxPos >= 0) {
                $target.eq(maxPos).css('color', 'red');
                정당 = obj선거구.header[maxPos];
                let color = '#777777';
                if (정당 in 정당코드) {
                    color = 정당코드[obj선거구.header[maxPos]];
                    당선수[정당] += 1;
                } else {
                    당선수.무소속 += 1;
                }
                var obj = obj선거구.main.find('td:eq(0)');
                obj.css('background', color);

                if (grayLevel(color) < 128) {
                    obj.css('color', '#ffffff');
                } else {
                    obj.css('color', '#000000');
                }
            }

        }

        console.log(당선수);
        $('.result_top').append('<br><div id="result_s"></div><br>');
        var $result_s = $('#result_s');
        $result_s.css({
            'display': 'inline-block',
            'padding': '8px 7px 6px 20px',
            'color': '#3C4E73',
            'font-weight': 'normal',
            'float': 'right',
            'min-width': '10%',
            'margin-bottom': '10px',
            'border-top': '2px solid #62888D',
            'border-left': '1px solid #CCCCCC',
            'border-right': '1px solid #CCCCCC',
            'border-bottom': '1px solid #62888D',
            'background': '#DEE7E7'
        });

        while (true) {
            var max정당 = getMaxKeyByVal(당선수);
            var max당선 = 당선수[max정당];
            delete 당선수[max정당];
            if (max당선 < 1) {
                break;
            }

            let color;
            if (max정당 in 정당코드) {
                color = 정당코드[max정당];
            } else {
                color = '#777777';
            }

            $result_s.append('<span><span style="width:14px;height:14px;display:inline-block;line-height:14px;margin-bottom:-2px;background-color:' + color + ';"></span>' + max정당 + ':' + max당선 + '</span> &nbsp;');

            console.log(max정당, max당선);

        }

    };

});