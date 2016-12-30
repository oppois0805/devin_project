var dashboard = (function() {

    /**
     * 0,晴天
     * 1,雨
     * 2,雲
     * 3,雷
     */
    var weatherCodeArray = [
        [31, 32, 33, 34, 36],
        [9, 10, 11, 12, 39, 40],
        [23, 26, 27, 28, 29, 30, 44],
        [3, 4, 37, 38, 47]
    ];

    /**
     * chart color
     */
    var blackcolor = [
        [0, 'rgba(8,26,46, 1)'],
        [0.5, 'rgba(8,26,46, 0.5)'],
        [1, 'rgba(8,26,46, 0)']
    ];

    /**
     * chart color
     */
    var whitecolor = [
        [0, 'rgba(255,255,255, 1)'],
        [0.5, 'rgba(255,255,255, .5)'],
        [1, 'rgba(255,255,255, 0)'],
    ];

    /**
     * reference 
     * url:http://taqm.epa.gov.tw/taqm/tw/fpmi.aspx
     * <= 23 優, <= 41 良, <= 53輕度汙染, <= 64 中度汙染, >= 71 重度汙染 
     */
    var pm25Array = [
        [0, 23],
        [24, 41],
        [42, 53],
        [54, 64],
        [65, 71],
        [72, 500]
    ];

    /**
     * unit obj
     */
    var unit = {
        percentage: "%",
        temperature: "°C",
        pm25: "ppm"
    }

    /**
     * init objs
     */
    var objs;

    /**
     * pm2.5 source 
     */
    var flickerAPI = "http://opendata2.epa.gov.tw/AQX.json";


    //========== init ==========//

    /**
     * 初始化所有內容
     */
    function initOption(city) {

        //渲染各weather widget class
        renderWeather(city, objs.$weatherWidget);

        //渲染各pm25 widget class
        renderPm25(city, objs.$pm25Widget);

        //根據地區查詢天氣
        getBysimpleWeather(city, function(weather) {
            //渲染七天的天氣
            renderWeek(weather, objs.$weekWeather);
            //渲染溫度
            renderTemperature(weather, objs.$temperature);
            //渲染progress
            renderProgress(weather, objs.progress, city);
        });

        //位置渲染
        renderLoaction(city, objs.$location);

        //日期渲染
        renderDate(objs.$date);

        //時間渲染
        renderTime(objs.$time);

        //每秒
        setInterval(function() {
            //每秒日期渲染
            renderDate(objs.$date);
            //每秒時間渲染
            renderTime(objs.$time);
        }, 1000);
    }

    /**
     * 初始化google定位,並根據位置去查詢天氣
     */
    function initialize() {
        geocoder = new google.maps.Geocoder();

        //successFunction 成功後去執行
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }
    }

    /**
     * 初始化line chart
     * @param {obj} option 初始化的物件
     */
    function initchart(option, obj) {
        obj.highcharts({
            chart: {
                type: 'areaspline'
            },
            title: {
                text: ''
            },
            legend: {
                enabled: true
            },
            exporting: {
                buttons: {
                    contextButton: {
                        enabled: false
                    }
                }
            },
            xAxis: {
                visible: false,
            },
            yAxis: {
                visible: false,
            },
            tooltip: {
                formatter: function() {
                    return "溫度: " + this.y + "°C";
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: option.chartcolor
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            chart: {
                backgroundColor: 'rgba(255,255,255,0)',
                polar: true,
                type: 'line'
            },
            series: [{
                showInLegend: false,
                type: 'area',
                name: '溫度',
                data: option.data,
                zones: [{
                    value: 0,
                    color: option.linecolor
                }, {
                    value: 100,
                    color: option.linecolor
                }]
            }]
        });
    }

    /**
     * 初始化progress
     * @param {obj} option 初始化的物件
     */
    function initprogress(value, obj) {
        var val = (value / obj.data("maxvalue")),
            color = JSON.parse('[' + obj.data("color") + ']');

        $(obj).gradientProgressBar({
            value: val,
            size: 147,
            lineCap: "round",
            thickness: 10,
            animation: {
                duration: 3000
            },
            fill: {
                gradient: color
            }
        }).on('progress-bar-animation-progress ', function(event, animationProgress, stepValue) {
            var number = obj.data("maxvalue") * stepValue;

            obj.parent().parent().find('#progressvalue').html(Math.round(number));
            obj.parent().parent().find('#percentagevalue').html(Math.round(number));
        });
    }

    //========== render ==========//

    /**
     * 根據pm25變換class
     */
    function renderPm25(city, renderobj) {
        $(renderobj).each(function(index, el) {
            getBysimpleWeather(city, function(weather) {
                getPm25(weather, city, function(value, widget) {
                    $(pm25Array).each(function(index, el) {
                        if (value >= el[0] && value <= el[1]) {
                            $(widget).removeClass($(widget).attr("class").split(/\s+/)[1]);
                            $(widget).addClass($(widget).attr("class").split(" ")[0] + "--lv" + (index + 1) + "_" + $(widget).data("style"));
                            $(widget).find(".js-pm25_value").text(value);
                        }
                    });
                }, el);
            });
        });
    }

    /**
     * 根據天氣變換class
     */
    function renderWeather(city, renderobj) {
        $(renderobj).each(function(index, el) {
            var widget = el;
            //render content by city
            getBysimpleWeather(city, function(weather) {
                //修改widget class
                $.each(weatherCodeArray, function(index, el) {
                    if ($.inArray(parseInt(weather.code), el) !== -1) {
                        $(widget).removeClass($(widget).attr("class").split(/\s+/)[1]);
                        /**
                         * 0,晴天 1,雨 2,雲 3,雷
                         */
                        switch (index) {
                            case 0:
                                $(widget).addClass($(widget).attr("class").split(" ")[0] + "--sunny_" + $(widget).data("style"));
                                break;
                            case 1:
                                $(widget).addClass($(widget).attr("class").split(" ")[0] + "--rain_" + $(widget).data("style"));
                                break;
                            case 2:
                                $(widget).addClass($(widget).attr("class").split(" ")[0] + "--cloudy_" + $(widget).data("style"));
                                break;
                            case 3:
                                $(widget).addClass($(widget).attr("class").split(" ")[0] + "--thunder_" + $(widget).data("style"));
                                break;
                        }

                    }
                });
            });
        });
    }

    /**
     * 渲染位置
     * @param {string} city
     * @param {obj} option render obj
     */
    function renderLoaction(city, renderobj) {
        renderobj.text(city);
    }

    /**
     * 渲染一周天氣
     * @param {obj} weather weather obj
     * @param {obj} option render obj
     */
    function renderWeek(weather, renderobj) {
        $(renderobj).each(function(index, el) {
            var appendhtml = "",
                style = ($(el).parent().parent().parent().data("style") !== undefined) ? $(el).parent().parent().parent().data("style") : $(el).parent().parent().data("style"),
                chartOption = { data: [] };

            $(weather.forecast).each(function(index, el) {

                var weekel = el,
                    imgurl;
                console.log(weekel.code);
                if (index > 6) {
                    return false;
                } else {

                    $.each(weatherCodeArray, function(index, el) {
                        if ($.inArray(parseInt(weekel.code), el) !== -1) {
                            /**
                             * 0,晴天 1,雨 2,雲 3,雷
                             */
                            switch (index) {
                                case 0:
                                    imgurl = "/images/5_dashboard/environment_met_image/weathersunny-week-" + style + ".png";
                                    break;
                                case 1:
                                    imgurl = "/images/5_dashboard/environment_met_image/weatherrainy-week-" + style + ".png";
                                    break;
                                case 2:
                                    imgurl = "/images/5_dashboard/environment_met_image/weathercloudy-week-" + style + ".png";
                                    break;
                                case 3:
                                    imgurl = "/images/5_dashboard/environment_met_image/weatherthunder-week-" + style + ".png";
                                    break;
                            }

                        }

                    });

                    chartOption.data.push(parseInt(weekel.alt.high));

                    appendhtml += "<div>" +
                        "<span>" + parseDate(weekel.date.split(" ")[1]) + "/" + weekel.date.split(" ")[0] + "</span>" +
                        "<span>" + parseDay(weekel.day) + "</span>" +
                        "<img src='" + imgurl + "'>" +
                        " </div>";
                }
            });

            //加入html
            $(el).prepend(appendhtml);

            //渲染chart
            renderWeekChart(chartOption, style, $(el).find(".js-weekChart"));
        });

    }

    /**
     * 渲染chart
     * @param {obj} chartOption 六天的溫度
     * @param {string} style 目前的widget style
     * @param {obj} style render obj
     */
    function renderWeekChart(chartOption, style, renderobj) {
        //初始化chart
        if (style === "opacity") {
            chartOption.chartcolor = blackcolor;
            chartOption.linecolor = "#081a2e";
        } else {
            chartOption.chartcolor = whitecolor;
            chartOption.linecolor = "#FFF";
        }
        initchart(chartOption, renderobj);
    }

    /**
     * 渲染室內外環境
     * @param {obj} weather weather obj
     * @param {obj} option render obj
     */
    function renderProgress(weather, renderobj, city) {
        $(renderobj).each(function(index, el) {
            if (el.length !== 0) {
                switch (Object.keys(el)[0]) {
                    case "$temperature":
                        initprogress(weather.alt.high, el.$temperature);
                        break;
                    case "$humidity":
                        initprogress(weather.humidity, el.$humidity);
                        break;
                    case "$CO2":
                        initprogress(weather, el.$CO2);
                        break;
                    case "$pm25":
                        getPm25(weather, city, initprogress, el.$pm25);
                        break;
                }
            }
        });
    }

    /**
     * 渲染溫度
     */
    function renderTemperature(weather, renderobj) {
        renderobj.text(weather.alt.temp + unit.temperature);
    }

    /**
     * 渲染現在時間
     */
    function renderTime(renderobj) {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        renderobj.text(h + ":" + m);
    }

    /**
     * 渲染現在日期
     */
    function renderDate(renderobj) {
        var today = new Date();
        //alert(today.getUTCDate())
        var y = today.getUTCFullYear();
        var m = parseInt(today.getUTCMonth()) + 1;
        var d = today.getUTCDate();
        renderobj.text(y + "年" + m + "月" + d + "日");
    }

    //========== parser ==========//

    function parseDay(En) {
        switch (En) {
            case "Sun":
                return "(日)";
                break;
            case "Mon":
                return "(一)";
                break;
            case "Tue":
                return "(二)";
                break;
            case "Wed":
                return "(三)";
                break;
            case "Thu":
                return "(四)";
                break;
            case "Fri":
                return "(五)";
                break;
            case "Sat":
                return "(六)";
                break;
        }
    }

    function parseDate(En) {
        switch (En) {
            case "Jan":
                return "1";
                break;
            case "Feb":
                return "2";
                break;
            case "Mar":
                return "3";
                break;
            case "Apr":
                return "4";
                break;
            case "May":
                return "5";
                break;
            case "Jun":
                return "6";
                break;
            case "jul":
                return "7";
                break;
            case "Aug":
                return "8";
                break;
            case "Sep":
                return "9";
                break;
            case "Oct":
                return "10";
                break;
            case "Nov":
                return "11";
                break;
            case "Dec":
                return "12";
                break;
        }
    }

    //========== check ==========//

    /**
     * 判斷時間是否需要增加0
     * example: 02:20 
     */
    function checkTime(i) {
        if (i < 10) {
            i = "0" + i
        }; // add zero in front of numbers < 10
        return i;
    }

    //========== vendor ==========//

    /**
     * 使用simpleWeather js 根據城市取得資訊
     * @param {string} city 城市名稱
     * @param {function} 執行程式碼
     */
    function getBysimpleWeather(city, fuc) {
        var WeatherOption = {
            location: city,
            woeid: '',
            unit: 'f',
            success: function(weather, wind, fun) {
                fuc(weather, wind, fun);
            },
            error: function(error) {
                console.log('error:' + error);
            }
        };
        $.simpleWeather(WeatherOption);
    }

    /**
     * 取得PM25資訊後渲染
     * @param {obj} weather 
     * @param {string} city
     * @param {function} function 
     * @param {obj} renderobj
     */
    function getPm25(weather, city, fuc, renderobj) {
        $.getJSON(flickerAPI, {
                tags: city,
                tagmode: "any",
                format: "json"
            })
            .done(function(data) {
                var count = 0,
                    pm25 = 0;

                $(data).each(function(index, el) {
                    if (el.County === city) {
                        pm25 += parseInt(el["PM2.5"]);
                        count++;
                    }
                });

                weather.pm25 = Math.floor(pm25 / count);
                fuc(weather.pm25, renderobj);
            });
    }

    //========== google api ==========//

    var geocoder;

    //Get the latitude and the longitude;
    function successFunction(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        codeLatLng(lat, lng);
    }

    function errorFunction() {
        initOption("新北市");
        // alert("Geocoder failed");
    }

    function codeLatLng(lat, lng) {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, lng);
        var returnName = "";

        geocoder.geocode({
            'latLng': latlng
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results[1]);
                if (results[1]) {
                    //find country name
                    for (var i = 0; i < results[0].address_components.length; i++) {
                        for (var b = 0; b < results[0].address_components[i].types.length; b++) {

                            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                            if (results[0].address_components[i].types[b] == "administrative_area_level_1" || results[0].address_components[i].types[b] == "administrative_area_level_2") {
                                //this is the object you are looking for
                                city = results[0].address_components[i];
                                break;
                            }

                        }
                    }
                    //根據地理位置去查詢氣象
                    initOption(city.short_name.replace("台", "臺"));
                } else {
                    alert("No results found");
                }
            } else {
                // alert("Geocoder failed due to: " + status);
                //根據地理位置去查詢氣象
                initOption("新北市");
            }
        });

        return returnName;
    }

    return {
        init: function(option) {
            objs = option;
            initialize();
        }
    }
}());
