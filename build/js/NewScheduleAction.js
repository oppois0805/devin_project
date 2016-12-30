/* 2016/1/20  create by devin*/


var ScheduleObj = (function() {
    var param,
        //時段編號
        IndexNumber = 0,
        //滑鼠位置
        currentMousePos = { x: -1, y: -1 },
        //暫存案確定後當下的狀態
        AfterHtml = "",
        //TimeLineIDk
        TimeLineid = "",
        //Chartid
        Chartid = "",
        //Verticalid
        Verticalid = "",
        //P:尖峰,M:休息,F:離峰
        default_state = "F",
        default_Someone_Light = 80,
        default_Unmanned_Light = 20,
        default_array = [];

    //error message
    errormessage = ["起始請勿大於結束時間。", "時段至少30分鐘。"];

    //初始化object集合
    var initObject = {
        myProperty: 'init',
        //初始化TimeLine BackGroup
        InitBackGroup: function() {
            InitBackGroup();
        },
        //初始化TimeLine
        InitTimeLine: function() {
            InitTimeLine();
        },
        //初始化拖拉
        init: function(IndexNumber) {
            init(IndexNumber);
        },
        //初始化Chart
        InitChart: function(state) {
            InitChart(state);
        },
        //初始化Slider
        InitChartControl: function() {
            //初始化slider連動初始化chart,當改變slider則變更chart
            InitChartControl();
        },
        //初始化現在時間block
        InitNowTimeBlock: function() {
            InitNowTimeBlock();
        },
        //初始化已選擇的block
        InitActiveBlock: function() {
            InitActiveBlock();
        },
        InitPicker: function() {
            InitPicker();
        }
    };

    /*===Init Start===*/

    //綁定排程按鈕事件
    function bind() {
        //點擊變更時間狀態
        $("div[name=state]").click(function() {
            $("div[name=state]").each(function(index, el) {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
        });

        //點擊新增時段
        $("#addtime").unbind().click(function(event) {
            var start_time = ReturnTime($("#addtime_start select:eq(0) option:selected").text(), $("#addtime_start select:eq(1) option:selected").text());
            var end_time = ReturnTime($("#endtime_start select:eq(0) option:selected").text(), $("#endtime_start select:eq(1) option:selected").text());
            var nowid;
            var countid = 0;
            var newarray = [];

            if (start_time < end_time && (end_time - start_time) >= 18) {

                //刪除覆蓋
                $(param.Data).each(function(index, el) {
                    var nowstart = ReturnTime(el.startTime.split(":")[0], el.startTime.split(":")[0]);
                    var endtime = isNaN(el.endTime) ? ((nowstart) + ((parseInt(el.keepTime) / 5) * 3)) : el.endTime;

                    if (end_time >= endtime && start_time <= nowstart) {
                        delete param.Data[index];
                        if (start_time === 106) {
                            nowid = 0;
                        }

                        if (param.Data[param.Data.length] === undefined && param.Data[param.Data.length - 1] === undefined) {
                            param.Data = [];
                        }
                    }
                });

                if (param.Data[parseInt(param.Data.length) - 1] !== undefined || (end_time === 970 && start_time !== 106)) {

                    var newarray = [];
                    //重新排序
                    $(param.Data).each(function(index, el) {
                        if (el !== undefined) {
                            newarray.push(el);
                            countid++;
                        }
                    });

                    try {
                        param.Data = newarray[0].toArray();
                    } catch (err) {
                        param.Data = newarray;
                    }

                    $(param.Data).each(function(index, el) {
                        if (el !== undefined) {
                            var nowstart = ReturnTime(el.startTime.split(":")[0], el.startTime.split(":")[1]);
                            var nowendtime = (isNaN(el.endTime)) ? ((nowstart) + ((parseInt(el.keepTime) / 5) * 3)) : el.endTime;

                            //當起始與結束都在某一區段
                            if ((start_time >= nowstart && start_time <= nowendtime) && (end_time >= nowstart && end_time <= nowendtime)) {
                                //增加區段被切掉的後區段
                                addtime(param.Data.length, param.Data[index].scheduleType, $("#endtime_start select:eq(0) option:selected").text() + ":" + $("#endtime_start select:eq(1) option:selected").text(), nowendtime, param.Data[index].onValue, param.Data[index].offValue)
                                nowid = parseInt(index) + 1;
                            }

                            //當起始值在某一區段則將該區段結束時間替代
                            if (start_time >= nowstart && start_time <= nowendtime) {
                                param.Data[index].endTime = start_time;
                                nowid = parseInt(index) + 1;
                            }
                            //當結束值在某一區段則將該區段開始時間替代
                            else if (end_time >= nowstart && end_time <= nowendtime) {
                                var test = ReturnTime($("#endtime_start select:eq(0) option:selected").text(), $("#endtime_start select:eq(1) option:selected").text()) - ReturnTime(param.Data[index].startTime.split(":")[0], param.Data[index].startTime.split(":")[0]);
                                param.Data[index].endTime = nowendtime;
                                param.Data[index].startTime = $("#endtime_start select:eq(0) option:selected").text() + ":" + $("#endtime_start select:eq(1) option:selected").text();

                            }
                        }
                    });
                } else {
                    $(".js-nowtimeid").attr("nowtimeid", 0);
                }

                nowid = (start_time === 106) ? 0 : nowid;

                //目前編輯的區段
                $(".js-nowtimeid").attr("nowtimeid", nowid);

                //關閉modal
                $('#myAddtimeModal').modal('toggle');

                //新增區段
                addtime(param.Data.length, default_state, $("#addtime_start select:eq(0) option:selected").text() + ":" + $("#addtime_start select:eq(1) option:selected").text(), end_time, default_Someone_Light, default_Unmanned_Light)

                initObject.InitTimeLine();

            } else if (start_time > end_time) {
                $(".js-errormessage").text(errormessage[0]);
            } else if ((end_time - start_time) < 18) {
                $(".js-errormessage").text(errormessage[1]);
            }
        });

        //Bootstrap modal關閉事件
        $('#myAddtimeModal').on('hidden.bs.modal', function() {
            //reset select
            //不能使用deslectAll,會衝到休假日下拉選單
            $("#addtime_start button").each(function() {
                $(this).find("span:eq(0)").text("00");
                $(this).find("ul li").removeClass("selected");
                $(this).find("ul li:eq(0)").addClass("selected");
            });
            $("#addtime_start .DialogContent_row_time select").val('0');
            $("#addtime_start ul").find("li").removeClass("selected");
            $("#addtime_start ul").find("li:eq(0)").addClass("selected");

            $("#endtime_start button").each(function() {
                $(this).find("span:eq(0)").text("00");
                $(this).find("ul li").removeClass("selected");
                $(this).find("ul li:eq(0)").addClass("selected");
            });
            $("#endtime_start .DialogContent_row_time select").val('0');
            $("#endtime_start ul").find("li").removeClass("selected");
            $("#endtime_start ul").find("li:eq(0)").addClass("selected");

            //reset error
            $(".js-errormessage").text("");
        })

        //點擊開啟所有時間
        $(".schedule_eyes").click(function() {
            if ($(this).hasClass("active")) {
                $("div[name=timepointer]").each(function() {
                    if ($(".js-nowtimeid").attr("nowtimeid") !== $(this).attr("class").split(" ")[0].split("_")[1]) {
                        $(this).css("display", "none");
                        $(this).css("display", "none");
                        $(this).find("div").css("display", "none");
                        $(this).find("div").css("display", "none");
                    }
                });
                $(this).removeClass("active");
            } else {
                $("div[name=timepointer]").each(function() {
                    $(this).css("display", "");
                    $(this).css("display", "");
                    $(this).find("div").css("display", "");
                    $(this).find("div").css("display", "");
                });
                $(this).addClass("active");
            }
        });

        //擷取滑鼠位置用於時間軸取代時間軸
        $(document).mousemove(function(event) {
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
            //console.log("x:" + currentMousePos.x + "," + "y;" + currentMousePos.y)
        });

        //Reset
        $("#ResetButton").click(function() {
            $(".js-nowtimeid").attr("nowtimeid", "");
            CDEC.light.getZoneSchedule(param.ZoneId, param.FloorId, param.RtuId,
                function(data) {
                    var interactiveStatus = true;
                    $(data.schedules).each(function(index, el) {
                        if (el.interactiveStatus === false) {
                            interactiveStatus = false;
                            return false;
                        }
                    });

                    var option = {
                        BaseUrl: "~",
                        TimeLineid: "TimeLine",
                        Chartid: "ChartBlock",
                        Data: data.schedules,
                        CompanyId: param.CompanyId,
                        ZoneId: param.ZoneId,
                        FloorId: param.FloorId,
                        RtuId: param.RtuId,
                        leaseId: param.LeaseId,
                        interactiveStatus: interactiveStatus
                    }
                    param.Data = option.Data;
                    initObject.InitTimeLine();
                    setTimeout(function() { initObject.InitNowTimeBlock() }, 600);
                });
        });

        //圖表上方有人無人亮度
        $(".schedule_top_someonetag , .schedule_top_unmannedtag").click(function() {
            if ($(this).hasClass("active")) {

                $(this).removeClass("active");

                if ($(this).hasClass("schedule_top_someonetag")) {
                    $(this).find("div").eq(0).css("background-color", "#bfb7b7");
                }

                if ($(this).hasClass("schedule_top_unmannedtag")) {
                    $(this).find("div").eq(0).css("background-color", "#bfb7b7");
                }

            } else {
                $(this).addClass("active");

                if ($(this).hasClass("schedule_top_someonetag")) {
                    $(this).find("div").eq(0).css("background-color", "#FFF056");
                }

                if ($(this).hasClass("schedule_top_unmannedtag")) {
                    $(this).find("div").eq(0).css("background-color", "#D4BF47");
                }
            }

            initObject.InitChart();
        });

        //傳送設定
        $("#SaveButton").click(function() {
            var ReturnFormat = "",
                checkError = false,
                SortAfterArray = $('div[name=Draw]').sort(function(a, b) {
                    // convert to integers from strings
                    a = parseInt($(a).css("left"), 10);
                    b = parseInt($(b).css("left"), 10);
                    // compare
                    if (a > b) {
                        return 1;
                    } else if (a < b) {
                        return -1;
                    } else {
                        return 0;
                    }
                }),
                FcuId = "";
            checkLoadData = true,
                requestArray = [];

            if (SortAfterArray.size() > 0) {
                openLoading();
                SortAfterArray.each(function() {
                    var request = {};
                    nowid = $(this)[0].className.split('_')[1];
                    if (CheckMin(nowid)) {
                        $("SomeoneBlock_" + nowid).animate({ backgroundColor: 'rgba(255,255,255,0.2)' }, 100);
                        $("SomeoneBlock_" + nowid).animate({ backgroundColor: 'rgb(' + $(this).css("background-color") + ')' }, 100);
                        $("SomeoneBlock_" + nowid).animate({ backgroundColor: 'rgba(255,255,255,0.2)' }, 100);
                        $("SomeoneBlock_" + nowid).animate({ backgroundColor: 'rgb(' + $(this).css("background-color") + ')' }, 100);
                        checkError = true;
                    }

                    request['scheduleType'] = GetStringByState($(this).attr("timestate"));
                    request['controlStatus'] = GetControlStatusByState($(this).attr("timestate"));
                    request['startTime'] = ReturnReTime((parseInt($(this).attr("starttime"))));
                    request['keepTime'] = Math.round(((Math.round(($(this).attr("endtime") - 106) / 3) * 5)) - ((Math.round(($(this).attr("starttime") - 106) / 3) * 5)));
                    request['value'] = parseInt($(this).attr("someonelight"));
                    request['interactiveStatus'] = (request['scheduleType'] === "M") ? false : param.interactiveStatus;

                    $.ajax({
                        url: Router.action('Schedule', 'GetPercenBuffer'),
                        type: 'POST',
                        async: false,
                        cache: false,
                        data: {
                            zoneid: parseInt(param.ZoneId),
                            someonelight: parseInt($(this).attr("someonelight")),
                            unmannedlight: parseInt($(this).attr("unmannedlight"))
                        },
                        dataType: "json",
                        success: function(data) {
                            request['onValue'] = data.onValue;
                            request['closeTime'] = data.buffer_time;
                            request['offValue'] = data.offValue;
                            //interactiveLight = ($(this).attr("someonelight") * (parseFloat(data.percentage_buffer_stage)) / 100) + "&"
                            //           + data.buffer_time + "&" + $(this).attr("unmannedlight");
                        }.bind(this),
                        error: function() {
                            checkLoadData = false;
                        }
                    });
                    requestArray.push(request);
                });

                //Get Fcuid
                $.ajax({
                    url: Router.action('Schedule', 'GetFcuId'),
                    type: 'POST',
                    async: false,
                    cache: false,
                    data: { floorId: parseInt(param.FloorId), zondeId: param.ZoneId },
                    dataType: "json",
                    success: function(data) {
                        FcuId = data;
                    }.bind(this),
                    error: function() {
                        checkLoadData = false;
                    }
                });

                if (!checkError && checkLoadData) {
                    $.post(Router.action('Schedule', 'UpdateZoneListConfigFile'), { floorId: param.FloorId, leaseId: param.leaseId, interactiveStatus: param.interactiveStatus });
                    //照明設定
                    CDEC.light.setZoneSchedule(param.ZoneId, param.CDECFloorId, param.RtuId, requestArray, function(LightData) { console.log(LightData); });

                    //空調設定
                    CDEC.ac.setFcuSchedule(param.CDECFloorId, param.RtuId, FcuId, requestArray, function(AcData) { console.log(AcData); });
                    alertify.logPosition("bottom right").closeLogOnClick(true).success("排程設定完成。");
                } else if (checkError) {
                    alertify.logPosition("bottom right").closeLogOnClick(true).error(Resources.Schedule.TimeSettingError);
                    $(".alertify-logs.right").css("right", "5px");
                } else {
                    alertify.logPosition("bottom right").closeLogOnClick(true).error("讀取資料失敗。");
                    $(".alertify-logs.right").css("right", "5px");
                }

                setTimeout(closeLoading(), 3000);
            } else {
                alertify.logPosition("bottom right");
                alertify.closeLogOnClick(true).success("请新增时间区段。");
                $(".alertify-logs.right").css("right", "5px");
            }
        });
    }

    //初始化TimeLine BackGroup
    function InitBackGroup() {
        //rgb(191, 183, 183)
        $("." + param.TimeLineid).html("<div class=\"BarBackGround\" style=\" z-index:700;width: 886px;height: 3px;position: absolute;margin:-13px 0 0 94px;background-color: #081a2e;\"></div>" +
            "<div class=\"BarLimit\" style=\" width: 886px;height: 3px;position: absolute;margin: -13px 0 0 106px;\"></div>" +
            "<div class=\"BarBlock\" style=\" z-index:700;width: 864px;height: 3px;position: absolute;margin: -13px 0 0 106px;background-color: #081a2e;z-index: 5;\"></div>" +
            " <div class=\"TimeLineBlock\"></div>");

        initObject.InitTimeLine();
        setTimeout(function() { initObject.InitNowTimeBlock() }, 600);
    }

    //初始化TimeLine
    function InitTimeLine() {
        var IndexNumber = 0,
            DisplayCheck = ($(".schedule_eyes").hasClass('active')) ? "" : "none",
            nowtimeid = $(".js-nowtimeid").attr("nowtimeid");

        $(".TimeLineBlock").html('');

        try {
            param.Data = param.Data[0].toArray();
        } catch (err) {
            param.Data = param.Data;
        }

        param.Data = $.map(param.Data, function(value, index) {
            if (value !== undefined) {
                return [value];
            }
        });

        //排序畫面上的timeline
        param.Data = $(param.Data).sort(function(a, b) {
            // convert to integers from strings
            a = parseInt(ReturnTime(a.startTime.split(':')[0], a.startTime.split(':')[1]));
            b = parseInt(ReturnTime(b.startTime.split(':')[0], b.startTime.split(':')[1]));
            // compare
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0;
            }
        });

        for (var i = 0; i < param.Data.length; i++) {

            var NewBlockLeft = 0,
                starttime = ReturnTime(param.Data[i].startTime.split(':')[0], param.Data[i].startTime.split(':')[1]),
                //將分鐘換算為有幾個五分鐘，幾個五分鐘去*3來算需要幾個PX
                endtime = (isNaN(param.Data[i].endTime)) ? ((starttime) + ((parseInt(param.Data[i].keepTime) / 5) * 3)) : param.Data[i].endTime,
                state = "",
                NewWidth = endtime - starttime,
                Neighborhood_Block = "",
                zindex = (parseInt(nowtimeid) === i) ? "z-index:1040" : "z-index:1000",
                border = (parseInt(nowtimeid) === i) ? "border:4px solid rgb(0, 0, 0)" : "border:4px solid rgba(0, 0, 0, 0)",
                background = (parseInt(nowtimeid) === i) ? "background:linear-gradient(to bottom, #fefcea 3%,#f1da36 100%)" : "background:linear-gradient(to bottom, rgba(0,0,0,0) 3%,rgba(0,0,0,0) 100%)",
                left = starttime,
                SomeoneLight = (param.interactiveStatus === false) ? param.Data[i].value : param.Data[i].onValue,
                UnmannedLight = param.Data[i].offValue;

            switch (param.Data[i].scheduleType) {
                // 尖峰時段
                case "P":
                    state = 0;
                    break;
                    // 休息時段
                case "M":
                    state = 1;
                    break;
                    // 離峰時段
                case "F":
                    state = 2;
                    break;
            }

            if (i === 0) {
                Neighborhood_Block = "right_block_id='" + (i + 1) + "'";
            } else if (i === parseInt(param.Data.length - 1)) {
                Neighborhood_Block = "left_block_id='" + (i - 1) + "'";
            } else {
                Neighborhood_Block = "left_block_id='" + (i - 1) + "' right_block_id='" + (i + 1) + "'";
            }

            $('.TimeLineBlock').append(

                '<div id="Draw_' + i + '" ' + Neighborhood_Block + ' order="' + i + '"  OldState="' + state + '" SomeoneLight="' + SomeoneLight + '" UnmannedLight="' + UnmannedLight + '"  TimeState="' + state + '"  starttime="' + starttime + '" endtime="' + endtime + '" class="Draw_' + i + '" name="Draw" style="background-color:#081a2e;width: ' + NewWidth + 'px; height: 3px;top:340px;left:' + (left) + 'px;position: absolute; z-index: 800;"><div class="RangeBar_' + i + ' RangeBar" style="width: ' + NewWidth + 'px; height: 2px; position: absolute; opacity: 1; z-index: 10; background-color: #081a2e);"></div></div>'

                + '<div class="pointS_' + i + '" style="width: 9px; height: 9px;' + 'border-radius: 99em;border:3px solid #000;top:334px;left:' + (left + 3) + 'px; position: absolute;z-index: 900;background-color: rgba(255,255,255,1);"></div>' + '<div class="divS_' + i + '" name="timepointer" style="width: 22px; height: 22px;top: 330px;display:' + DisplayCheck + ';border-radius: 99em;' + border + ';box-sizing:border-box;left:' + (left) + 'px; position: absolute;' + zindex + ';' + background + ';cursor:pointer;">' + '<div id="timeS_' + i + '" class="timeS_' + i + '" name="timeblock" style="font-size:12px;width: 48px;position: absolute;margin: 27px 0px 0px -20px;text-align: center;background-color: rgba(255,255,255,0.7);color:rgba(0,0,0,.3);border-radius: 3px;padding: 3px;display:' + DisplayCheck + '">' + ReturnReTime(left) + '</div>' + '</div>'

                + '<div class="pointE_' + i + '" style="width: 9px; height: 9px;' + 'border-radius: 99em;border:3px solid #000;top:334px;left:' + (left + NewWidth + 3) + 'px; position: absolute;z-index: 900;background-color: rgba(255,255,255,1);"></div>' + '<div class="divE_' + i + '" name="timepointer" style="width: 22px; height: 22px;top: 330px;display:' + DisplayCheck + ';border-radius: 99em;' + border + ';box-sizing:border-box;left:' + (left + NewWidth) + 'px;position: absolute;' + zindex + ';' + background + ';cursor:pointer;">' + '<div id="timeE_' + i + '" class="timeE_' + i + '" name="timeblock" style="font-size:12px;width: 48px;position: absolute;margin: 27px 0px 0px -20px;text-align: center;background-color: rgba(255,255,255,0.7);color:rgba(0,0,0,.3);border-radius: 3px;padding: 3px;display:' + DisplayCheck + '">' + ReturnReTime(parseInt(endtime)) + '</div>' + '</div>'

                + '<div class="Model_' + i + '" style="width: ' + NewWidth + 'px; height: 20px; position: absolute; display: none; margin: 40px 0px 0px 0;left:' + left + 'px;" oldleft_s="0" oldleft_e="0" maxleft="' + (parseInt(endtime)) + '"></div>'
            );
        }

        for (var i = 0; i < param.Data.length; i++) {
            $(".divS_" + i + "," + ".divE_" + i).on({
                mouseover: function() {
                    $(this).css("z-index", "1100").find("div").css("color", "rgba(0,0,0,1)");
                },
                mouseleave: function() {
                    $(this).css("z-index", "1040").find("div").css("color", "rgba(0,0,0,.3)");
                },
                mouseup: function() {
                    $(this).css("z-index", "1040").find("div").css("color", "rgba(0,0,0,.3)");
                }
            });
        }

        //初始化Bar
        initObject.init(nowtimeid);

        //初始化chart
        initObject.InitChart();
        AfterHtml = $(".TimeLineBlock").html();
    }

    //初始化拖拉
    function init(IndexNumber) {
        var eyes_state = $(".schedule_eyes").hasClass('active');
        $(".divS_" + IndexNumber).draggable({
            grid: [3, 0],
            axis: "x",
            containment: ".BarLimit",
            start: function() {
                var FillupId = $(".Draw_" + IndexNumber).attr("left_block_id");

                //儲存記錄起始的指標位置，用於新增為定義指示
                $(".Model_" + IndexNumber).attr("DivS_Left", $(".divS_" + IndexNumber).css('left'));
                $(".Model_" + IndexNumber).attr("DivE_Left", $(".divE_" + IndexNumber).css('left'));

                $(".pointS_" + IndexNumber).css("display", "none");
                $(".pointE_" + FillupId).css("display", "none");

                //移動z-index提升
                $(this).css("z-index", 1100);
            },
            stop: function(e) {
                //移動z-index還原
                $(this).css("z-index", 1000);

                var FillupId = $(".Draw_" + IndexNumber).attr("left_block_id");

                //開始小於結束則刪除
                if (parseInt($(".divE_" + IndexNumber).css("left")) <= parseInt($(".divS_" + IndexNumber).css("left"))) {
                    param.Data[IndexNumber].onValue = default_Someone_Light;
                    param.Data[IndexNumber].offValue = default_Unmanned_Light;
                    param.Data[IndexNumber].scheduleType = "P";

                    //當是休息則關閉無人亮度
                    var Unmanned = $("#Unmanned_Bar");
                    Unmanned.bootstrapSlider("enable");

                    $(".js-statebtn div").each(function(index, el) {
                        $(this).removeClass('active');
                    });
                    $(".js-statebtn div:eq(0)").addClass('active');

                } else {

                    $(".RangeBar_" + IndexNumber).css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - ((parseInt($(this).position().left)) - parseInt($(".Model_" + IndexNumber).css("left").replace("px", "")))));
                    $(".RangeBar_" + IndexNumber).parent().css("left", parseInt($(".Model_" + IndexNumber).css("left")) + (parseInt($(this).position().left - parseInt($(".Model_" + IndexNumber).css("left").replace("px", "")))));
                    $(".RangeBar_" + IndexNumber).parent().css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - (((parseInt($(this).position().left)) - parseInt($(".Model_" + IndexNumber).css("left").replace("px", ""))))));

                    // //偏移調整指示
                    // $(".divS_" + IndexNumber).css("left", parseInt($(".Draw_" + IndexNumber).css("left").replace('px', '')));

                    //判斷是否蓋到現有的
                    var relX = getPosition(document.getElementById("Draw_" + $(this).attr("class").split(' ')[0].split('_')[1])).x,
                        //根據Draw的Y去擷取位置
                        relY = getPosition(document.getElementById("Draw_" + $(this).attr("class").split(' ')[0].split('_')[1])).y,
                        //使用物件位置用於適用所有視窗大小去擷取元素
                        elem = getAllElementsFromPoint(relX, relY),
                        //被覆蓋的block id
                        OverWriteID = elem[4].className.toString().split('_')[1],
                        //起始時間
                        divS_Time = parseInt(ReturnTime($(".divS_" + IndexNumber + " div").text().split(':')[0], $(".divS_" + IndexNumber + " div").text().split(':')[1])),
                        //結束時間
                        divE_OverWrite_Time = ReturnTime($(".divS_" + OverWriteID + " div").text().split(':')[0], $(".divS_" + OverWriteID + " div").text().split(':')[1]);

                    //計算當超過最左邊  
                    if (parseInt($(".divS_" + IndexNumber).css("left").replace("px", "")) <= 106) {
                        $(".js-nowtimeid").attr("nowtimeid", 0);
                    }
                    //一般覆蓋
                    else if (!$(".schedule_eyes").hasClass('active') && elem[0].className.toString().split(' ')[0].split('_')[1] !== elem[4].className.toString().split('_')[1] && elem[5].className !== "BarLimit" && (elem[1].className.toString().split('_')[0] !== "pointS" && elem[3].className.toString().split('_')[0] !== "pointS") ||
                        ($(".schedule_eyes").hasClass('active') && elem[5].className !== "BarLimit" && elem[6].className !== "BarLimit" && elem[11].className !== "BarLimit" && (elem[1].className.toString().split('_')[0] !== "pointS" && elem[3].className.toString().split('_')[0] !== "pointS"))) {

                        if (parseInt(elem[2].className.toString().split('_')[1]) - parseInt(elem[4].className.toString().split('_')[1]) === 1) {
                            if (parseInt($(this).css("left")) === parseInt($(".divS_" + OverWriteID).css("left"))) {
                                $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID)));
                            } else {
                                $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID) + 1));
                            }
                        } else if (parseInt(elem[2].className.toString().split('_')[1]) - parseInt(elem[4].className.toString().split('_')[1]) === 2) {
                            $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID) + 1));
                        } else if (elem[1].className.toString().split('_')[0] === "pointS") {
                            $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID) - 1));
                        } else {
                            if ($(".schedule_eyes").hasClass('active')) {
                                $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID) - 1));
                            } else {
                                $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID) + 1));
                            }
                        }

                        if ($(".schedule_eyes").hasClass('active') && parseInt($(this).css("left")) === parseInt($(".divS_" + OverWriteID).css("left"))) {
                            OverWriteID = (parseInt(elem[6].className.toString().split('_')[1]) === 0) ? 0 : elem[6].className.toString().split('_')[1];
                        } else {
                            OverWriteID = (parseInt(elem[4].className.toString().split('_')[1]) === 0) ? 0 : elem[4].className.toString().split('_')[1];
                        }

                        //當拖拉起始大於覆蓋結束才進行覆蓋
                        param.Data[OverWriteID].endTime = divS_Time;

                    }
                    //當白點堆疊時額外判斷
                    else if (elem[1].className.toString().split('_')[0] === "pointS" ||
                        elem[2].className.toString().split('_')[0] === "pointS" ||
                        elem[3].className.toString().split('_')[0] === "pointS") {

                        OverWriteID = (parseInt(elem[1].className.toString().split(' ')[0].split('_')[1]) === 0) ? 0 : elem[1].className.toString().split(' ')[0].split('_')[1];

                        divE_OverWrite_Time = ReturnTime($(".divS_" + OverWriteID + " div").text().split(':')[0], $(".divS_" + OverWriteID + " div").text().split(':')[1]);
                        //更新data
                        param.Data[OverWriteID].endTime = divS_Time;
                        if (divS_Time <= divE_OverWrite_Time) {
                            $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID)));
                        } else {
                            $(".js-nowtimeid").attr("nowtimeid", (parseInt(OverWriteID) + 1));
                        }
                    } else {
                        $(".js-nowtimeid").attr("nowtimeid", (parseInt(IndexNumber)));
                    }

                    //當托拉起始點沒有左邊的block進行新增
                    if (parseInt($(".Draw_" + IndexNumber).attr("order")) - 1 >= 0) {
                        param.Data[FillupId].endTime = divS_Time;
                        param.Data[FillupId].onValue = parseInt($(".Draw_" + FillupId).attr("someonelight"));
                        param.Data[FillupId].offValue = parseInt($(".Draw_" + FillupId).attr("UnmannedLight"));
                    } else if (parseInt($(".divS_" + IndexNumber).css("left").replace("px", "")) > 106) {
                        AddBlock($(this), "left");
                        $(".js-nowtimeid").attr("nowtimeid", (parseInt(IndexNumber) + 1));
                    }

                    //更新data
                    param.Data[IndexNumber].startTime = $(".divS_" + IndexNumber + " div").text();
                    param.Data[IndexNumber].endTime = ReturnTime($(".divE_" + IndexNumber + " div").text().split(':')[0], $(".divE_" + IndexNumber + " div").text().split(':')[1]);
                    param.Data[IndexNumber].onValue = parseInt($(".Draw_" + IndexNumber).attr("someonelight"));
                    param.Data[IndexNumber].offValue = parseInt($(".Draw_" + IndexNumber).attr("UnmannedLight"));

                }

                //完全蓋過的進行刪除
                OvershadowedDiv(IndexNumber);

                //更新Chart資訊
                initObject.InitTimeLine();

                $(".pointS_" + IndexNumber).attr("display", "");
                $(".pointE_" + FillupId).attr("display", "");

            },
            drag: function(event, ui) {

                $(".RangeBar_" + IndexNumber).css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - ((parseInt($(this).position().left) - $(".Model_" + IndexNumber).attr("oldleft_s")) - parseInt($(".Model_" + IndexNumber).css("left").replace("px", "")))));
                $(".RangeBar_" + IndexNumber).parent().css("left", parseInt($(".Model_" + IndexNumber).css("left")) + (parseInt($(this).position().left - parseInt($(".Model_" + IndexNumber).css("left").replace("px", "")))));
                $(".RangeBar_" + IndexNumber).parent().css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - (((parseInt($(this).position().left) - $(".Model_" + IndexNumber).attr("oldleft_s")) - parseInt($(".Model_" + IndexNumber).css("left").replace("px", ""))))));
                $(".divS_" + IndexNumber + " div").html(ReturnReTime(parseInt($(".divS_" + IndexNumber).css("left").replace("px", ""))));
                $(".timeFixedS_" + IndexNumber).html(ReturnReTime(parseInt($(".divS_" + IndexNumber).css("left").replace("px", ""))));
            }
        });

        $(".divE_" + IndexNumber).draggable({
            grid: [3, 0],
            axis: "x",
            containment: ".BarLimit",
            start: function() {
                var FillupId = $(".Draw_" + IndexNumber).attr("right_block_id");

                $(".RangeBar_" + IndexNumber).css("opacity", "0.7");
                $(".RangeBar_" + IndexNumber).css("z-index", "9999");

                //儲存記錄起始的指標位置，用於新增為定義指示
                $(".Model_" + IndexNumber).attr("DivS_Left", $(".divS_" + IndexNumber).css('left'));
                $(".Model_" + IndexNumber).attr("DivE_Left", $(".divE_" + IndexNumber).css('left'));

                $(".pointE_" + IndexNumber).css("display", "none");
                $(".pointS_" + FillupId).css("display", "none");
            },
            stop: function(e) {
                $(".pointE_" + IndexNumber).attr("display", "");
                $(".pointS_" + FillupId).attr("display", "");

                //移動結束則還原為不透明
                $(".RangeBar_" + IndexNumber).css("opacity", "1");
                $(".RangeBar_" + IndexNumber).css("z-index", "10");

                var FillupId = $(".Draw_" + IndexNumber).attr("right_block_id"),
                    AddPx = 0;

                //當起始點大於結束點則代表還原預設值
                if (parseInt($(".divE_" + IndexNumber).css("left")) <= parseInt($(".divS_" + IndexNumber).css("left"))) {
                    param.Data[IndexNumber].onValue = default_Someone_Light;
                    param.Data[IndexNumber].offValue = default_Unmanned_Light;
                    param.Data[IndexNumber].scheduleType = "P";

                    //當是休息則關閉無人亮度
                    var Unmanned = $("#Unmanned_Bar");
                    Unmanned.bootstrapSlider("enable");

                    $(".js-statebtn div").each(function(index, el) {
                        $(this).removeClass('active');
                    });
                    $(".js-statebtn div:eq(0)").addClass('active');
                } else {

                    $(".RangeBar_" + IndexNumber).css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - ((parseInt($(".Model_" + IndexNumber).attr("maxleft").replace("px", "")) - (parseInt($(this).position().left)) - $(".Model_" + IndexNumber).attr("OldLeft_e")))));
                    $(".RangeBar_" + IndexNumber).parent().css("width", AddPx + (parseInt($(".Model_" + IndexNumber).css("width")) - ((parseInt($(".Model_" + IndexNumber).attr("maxleft").replace("px", "")) - (parseInt($(this).position().left)) - $(".Model_" + IndexNumber).attr("OldLeft_e")))));

                    //判斷是否蓋到現有的
                    var relX = 19 + parseInt(getPosition(document.getElementById("Draw_" + $(this).attr("class").split(' ')[0].split('_')[1])).x) +
                        parseInt($(".Draw_" + $(this).attr("class").split(' ')[0].split('_')[1]).css('width')) +
                        AddPx;
                    //根據Draw的Y去擷取位置
                    var relY = getPosition(document.getElementById("Draw_" + $(this).attr("class").split(' ')[0].split('_')[1])).y;
                    //使用物件位置用於適用所有視窗大小去擷取元素
                    var elem = getAllElementsFromPoint(relX, relY);
                    var divE_Time = parseInt(ReturnTime($(".divE_" + IndexNumber + " div").text().split(':')[0], $(".divE_" + IndexNumber + " div").text().split(':')[1]));
                    //被覆蓋的block id
                    var OverWriteID = elem[2].className.toString().split('_')[1];

                    //當白點堆疊時額外判斷
                    if (elem[1].className.toString().split('_')[0] === "pointS" || elem[3].className.toString().split('_')[0] === "pointS") {
                        param.Data[OverWriteID].startTime = $(".divE_" + IndexNumber + " div").text();
                        param.Data[OverWriteID].endTime = ReturnTime($(".divE_" + OverWriteID + " div").text().split(":")[0], $(".divE_" + OverWriteID + " div").text().split(":")[1]);
                        param.Data[OverWriteID].onValue = parseInt($(".Draw_" + OverWriteID).attr("someonelight"));
                        param.Data[OverWriteID].offValue = parseInt($(".Draw_" + OverWriteID).attr("UnmannedLight"));
                    } else if (
                        elem.length > 6 && elem[2].className.toString() !== "BarLimit" && elem[3].className.toString() !== "BarLimit" && elem[4].className.toString() !== "BarLimit" && elem[6].className.toString() !== "BarLimit" && elem[9].className.toString() !== "BarLimit") {
                        param.Data[OverWriteID].startTime = $(".divE_" + IndexNumber + " div").text();
                        param.Data[OverWriteID].endTime = ReturnTime($(".divE_" + OverWriteID + " div").text().split(":")[0], $(".divE_" + OverWriteID + " div").text().split(":")[1]);
                        param.Data[OverWriteID].onValue = parseInt($(".Draw_" + OverWriteID).attr("someonelight"));
                        param.Data[OverWriteID].offValue = parseInt($(".Draw_" + OverWriteID).attr("UnmannedLight"));
                    }

                    //當托拉結束點沒有右邊的block進行新增
                    if (parseInt($(".Draw_" + IndexNumber).attr("order")) + 1 < param.Data.length) {
                        param.Data[FillupId].startTime = $(".divE_" + IndexNumber + " div").text();
                        param.Data[FillupId].endTime = ReturnTime($(".divE_" + FillupId + " div").text().split(':')[0], $(".divE_" + FillupId + " div").text().split(':')[1]);
                        param.Data[FillupId].onValue = parseInt($(".Draw_" + FillupId).attr("someonelight"));
                        param.Data[FillupId].offValue = parseInt($(".Draw_" + FillupId).attr("UnmannedLight"));
                    } else if (parseInt($(".divE_" + IndexNumber).css("left").replace("px", "")) < 963) {
                        AddBlock($(this), "right");
                    }

                    //更新data
                    param.Data[IndexNumber].endTime = divE_Time;
                    param.Data[IndexNumber].onValue = parseInt($(".Draw_" + IndexNumber).attr("someonelight"));
                    param.Data[IndexNumber].offValue = parseInt($(".Draw_" + IndexNumber).attr("UnmannedLight"));
                }

                //完全蓋過的進行刪除
                OvershadowedDiv(IndexNumber);
                //更新Chart資訊
                initObject.InitTimeLine();

            },
            drag: function(event, ui) {
                $(".RangeBar_" + IndexNumber).css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - ((parseInt($(".Model_" + IndexNumber).attr("maxleft").replace("px", "")) - (parseInt($(this).position().left)) - $(".Model_" + IndexNumber).attr("OldLeft_e")))));
                $(".RangeBar_" + IndexNumber).parent().css("width", (parseInt($(".Model_" + IndexNumber).css("width")) - ((parseInt($(".Model_" + IndexNumber).attr("maxleft").replace("px", "")) - (parseInt($(this).position().left)) - $(".Model_" + IndexNumber).attr("OldLeft_e")))));
                $(".divE_" + IndexNumber + " div").html(ReturnReTime(parseInt($(".divE_" + IndexNumber).css("left").replace("px", ""))));
            }
        });

    }

    //初始化Chart
    function InitChart(state) {

        //排序畫面上的timeline
        var SortAfterArray = $('div[name=Draw]').sort(function(a, b) {
            // convert to integers from strings
            a = parseInt($(a).css("left"), 10);
            b = parseInt($(b).css("left"), 10);
            // compare
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0;
            }
        });

        $('#' + param.Chartid).html('');
        SortAfterArray.each(function() {
            var DrawId = $(this).attr("id").split("_")[1];
            if (parseInt($(this).attr("endtime") - parseInt($(this).attr("starttime"))) !== 0 && parseInt($(this).css("width").replace('px', '')) !== 0) {
                //chart變化與事件綁定
                ChartChange($(this), DrawId);
            }
            initObject.InitActiveBlock();
        });

    }

    //初始化Slider
    function InitChartControl() {

        //bootstrap-slider Bug 無法使用$(this).change("slide", function (slideEvt),slideEvt.value取值, 因此抓取tooltip-inner的值
        //Progress
        $("input[name=ProgressBar]").each(function() {
            $(this).bootstrapSlider({
                min: 0,
                max: 100,
                value: 0,
                step: 10,
                tooltip_position: 'bottom'
            });
        });

        $("#Someone_Bar").unbind().on("change", function() {
            $(".schedule_setblock_barblock_left .js-barvalue").text($(this).parent().parent().find(".tooltip-inner").text() + "%");
            $(".Draw_" + $(".js-nowtimeid").attr("nowtimeid")).attr("someonelight", $(this).parent().parent().find(".tooltip-inner").text());
            param.Data[$(".js-nowtimeid").attr("nowtimeid")].onValue = $(this).parent().parent().find(".tooltip-inner").text();
            //更新Chart資訊
            ChartChange($(".Draw_" + $(".js-nowtimeid").attr("nowtimeid")), $(".js-nowtimeid").attr("nowtimeid"));
        });

        $("#Unmanned_Bar").unbind().on("change", function() {
            $(".schedule_setblock_barblock_right .js-barvalue").text($(this).parent().parent().find(".tooltip-inner").text() + "%");
            $(".Draw_" + $(".js-nowtimeid").attr("nowtimeid")).attr("unmannedlight", $(this).parent().parent().find(".tooltip-inner").text());
            param.Data[$(".js-nowtimeid").attr("nowtimeid")].offValue = $(this).parent().parent().find(".tooltip-inner").text();
            //更新Chart資訊
            ChartChange($(".Draw_" + $(".js-nowtimeid").attr("nowtimeid")), $(".js-nowtimeid").attr("nowtimeid"));
        });

        //狀態按鈕
        $(".js-statebtn div").each(function(index, el) {

            $(this).click(function() {

                $(".js-statebtn div").each(function(index, el) {
                    $(this).removeClass('active');
                });
                $(this).addClass('active');

                $("#Draw_" + $(".js-nowtimeid").attr("nowtimeid")).attr("timestate", $(this).attr("state"));
                param.Data[$(".js-nowtimeid").attr("nowtimeid")].state = $(this).attr("state");

                var Unmanned = $("#Unmanned_Bar");

                switch ($(this).attr("state")) {
                    // 尖峰時段
                    case "0":
                        param.Data[$(".js-nowtimeid").attr("nowtimeid")].scheduleType = "P";
                        break;
                        // 休息時段
                    case "1":
                        param.Data[$(".js-nowtimeid").attr("nowtimeid")].scheduleType = "M";
                        break;
                        // 離峰時段
                    case "2":
                        param.Data[$(".js-nowtimeid").attr("nowtimeid")].scheduleType = "F";
                        break;
                }

                if (index === 1) {
                    var Draw = $("#Draw_" + $(".js-nowtimeid").attr("nowtimeid"));
                    //set無人
                    UnmannedValue = 0;
                    Unmanned.parent().find(".slider-selection").css("width", UnmannedValue + "%");
                    Unmanned.parent().find(".slider-track-high").css("width", (100 - UnmannedValue + "%"));
                    Unmanned.parent().find(".slider-track div").eq(3).css("left", UnmannedValue + "%");
                    Unmanned.parent().find(".tooltip.tooltip-main.bottom").css("left", UnmannedValue + "%");
                    Unmanned.parent().find(".slider-handle").css("left", UnmannedValue + "%");
                    Unmanned.attr("data-value", UnmannedValue);
                    Unmanned.attr("value", UnmannedValue);
                    Draw.attr("unmannedlight", 0);
                    $(".schedule_setblock_barblock_right .js-barvalue").text(UnmannedValue + "%");

                    param.Data[$(".js-nowtimeid").attr("nowtimeid")].offValue = 0;

                    //休息則不能拉動
                    Unmanned.bootstrapSlider("disable");

                    ChartChange($(".Draw_" + $(".js-nowtimeid").attr("nowtimeid")), $(".js-nowtimeid").attr("nowtimeid"));
                } else {
                    Unmanned.bootstrapSlider("enable");
                }

            });
        });

        //remove tooltip
        $(".tooltip").each(function() {
            $(this).css('display', 'none');
        });
    }

    //初始化點擊現在時間的block
    function InitNowTimeBlock() {
        var currentdate = new Date(),
            datetime = (parseInt(currentdate.getHours()) * 60) + parseInt(currentdate.getMinutes());

        $("div[name=block]").each(function() {
            var number = $(this).attr("class").split("_")[1];

            if ($(this).attr("class").split("_")[0] === "SomeoneBlock" && datetime > ((parseInt($(".Draw_" + number).attr("starttime")) - 106) / 3) * 5 && datetime < (((parseInt($(".Draw_" + number).attr("endtime") - 106) / 3) * 5))) {
                //被選擇的block
                $(this).click();
            }
        });

    }

    //選擇已被的block
    function InitActiveBlock() {
        var number = $(".js-nowtimeid").attr("nowtimeid");
        $(".SomeoneBlock_" + number).css("background-color", "rgba(255,240,86,1)");
        $(".UnmannedBlock_" + number).css("background-color", "rgba(212,191,71,1)");
        $(".SomeoneBlock_" + number).css({
            backgroundColor: "rgba(255,240,86,1)",
            border: "2px solid rgba(255,255,255,1)"
        });

        $(".UnmannedBlock_" + number).css({
            backgroundColor: "rgba(212,191,71,1)",
            "border-Left": "2px solid rgba(255,255,255,1)",
            "border-Top": "2px solid rgba(255,255,255,1)",
            "border-Right": "2px solid rgba(255,255,255,1)"
        });

        //顯示指標
        $(".divS_" + number).css("display", "");
        $(".divE_" + number).css("display", "");
        $(".divS_" + number + " .TimeTiptop").css("display", "none");
        $(".divE_" + number + " .TimeTiptop").css("display", "none");
        $(".timeS_" + number).css("display", "");
        $(".timeE_" + number).css("display", "");

        //標示目前編輯的是哪個區段,用於儲存使用
        $(".js-nowtimeid").attr("nowtimeid", number);

        //Change Dialog
        ChangeSettingBlock(number);
    }


    //初始化日曆
    var InitPicker = function(args) {
        var data = ["11/01/2016", "11/02/2016"],
            week = [0, 6];
            
        //顯示設定休假日
        $(".button-holiday").show();

        //現在當前月份的已選日期
        var nowMonthArray = [];
        var $datepicker = $('#datepicker').multiDatesPicker({
            altField: '#altField',
            changeMonth: true,
            onChangeMonthYear: function(nextY, nextM, i) {

                //取得換頁前的、年、月、日
                // var nowMonthArray = $datepicker.multiDatesPicker('getDates'),
                //     nowYear = nowMonthArray[0].split('/')[2],
                //     nowMonth = nowMonthArray[0].split('/')[0],

                //確定是否更改過
                // CDEC.light.getMaskDays(args.CompanyId, args.CDECFloorId, args.RtuId, nowYear, nowMonth,
                //     function(data) {
                //         var dateArray = [];

                //         $(getDateArray(data)).each(function(index, el) {
                //             dateArray.push(padLeft(el.split('/')[0], 2) + "/" + padLeft(el.split('/')[1], 2) + "/" + el.split('/')[2]);
                //         });

                //         if (arraysEqual(dateArray, nowMonthArray)) {
                //             swal({
                //                     title: "確定送出設定?",
                //                     type: "info",
                //                     showCancelButton: true,
                //                     closeOnConfirm: false,
                //                     showLoaderOnConfirm: true,
                //                     confirmButtonColor: "#DD6B55",
                //                     confirmButtonText: Resources.Schedule.ScheduleDialogSetButton,
                //                     cancelButtonText: Resources.Schedule.ScheduleDialogCancelButton
                //                 },
                //                 function(isConfirm) {

                //                     if (isConfirm) {
                //                         sendSetting(nowMonthArray, args);
                //                     }

                //                 });
                //         }

                //     });

                var dateArray = [];

                $(data).each(function(index, el) {
                    dateArray.push(padLeft(el.split('/')[0], 2) + "/" + padLeft(el.split('/')[1], 2) + "/" + el.split('/')[2]);
                });

                // if (arraysEqual(dateArray, nowMonthArray)) {
                //     swal({
                //             title: "確定送出設定?",
                //             type: "info",
                //             showCancelButton: true,
                //             closeOnConfirm: false,
                //             showLoaderOnConfirm: true,
                //             confirmButtonColor: "#DD6B55",
                //             confirmButtonText: Resources.Schedule.ScheduleDialogSetButton,
                //             cancelButtonText: Resources.Schedule.ScheduleDialogCancelButton
                //         },
                //         function(isConfirm) {

                //             if (isConfirm) {
                //                 sendSetting(nowMonthArray, args);
                //             }

                //         });
                // }

                //取得當月遮罩日期
                // CDEC.light.getMaskDays(args.CompanyId, args.CDECFloorId, args.RtuId, nextY, nextM,
                //     function (data) {
                //         var dateArray = [];

                //         //reset multiDatesPicker
                //         $datepicker = $("#datepicker").multiDatesPicker('resetDates');

                //         $datepicker.multiDatesPicker('addDates', getDateArray(data));
                //     });

                $datepicker = $("#datepicker").multiDatesPicker('resetDates');

                $datepicker.multiDatesPicker('addDates', data);

            },
            changeYear: true
        });

        //modal關閉後reset datepiker
        $('#myHolidayModal').on('hidden.bs.modal', function() {
            $datepicker.multiDatesPicker('resetDates');

            //取得當月遮罩日期
            $datepicker.multiDatesPicker('addDates', getDateArray(data));
            // CDEC.light.getMaskDays(args.CompanyId, args.CDECFloorId, args.RtuId, parseInt($(".ui-datepicker-year").val()), parseInt($(".ui-datepicker-month").val()) + 1,
            //     function(data) {
            //         nowMonthArray = $datepicker.multiDatesPicker('getDates');
            //         $datepicker.multiDatesPicker('addDates', getDateArray(data));
            //     });

        });

        //取得最新資訊
        //if (typeof $("#floor option:first").val() !== 'undefined') {

        $("input[name=chk_group]").each(function(index, el) {
            if ($.inArray(parseInt($(el).val()), week) !== -1) {
                $(el).prop('checked', true);
            }
        });;
        $datepicker.multiDatesPicker('addDates', data);
        // CDEC.light.getMaskWeeks(args.CompanyId, args.CDECFloorId, args.RtuId,
        //     function(data) {
        //         $("input[name=chk_group]").each(function(index, el) {
        //             if ($.inArray(parseInt($(el).val()), data.days) !== -1) {
        //                 $(el).prop('checked', true);
        //             }
        //         });;

        //         //取得當月遮罩日期
        //         CDEC.light.getMaskDays(args.CompanyId, args.CDECFloorId, args.RtuId, parseInt($(".ui-datepicker-year").val()), parseInt($(".ui-datepicker-month").val()) + 1,
        //             function(data) {
        //                 nowMonthArray = $datepicker.multiDatesPicker('getDates');
        //                 $datepicker.multiDatesPicker('addDates', getDateArray(data));
        //             });
        //     });
        //remove today mark
        $('.ui-datepicker-current-day').removeClass('ui-state-highlight,ui-state-active,ui-state-hover,ui-datepicker-week-end');
        // }

        //點擊禮拜幾之後渲染該月所有該禮拜
        $("input[name=chk_group]").unbind().click(function() {
            if ($(this).prop("checked") === true) {
                $datepicker.multiDatesPicker('addDates', getAllDayByMonth(parseInt($(".ui-datepicker-year").val()), parseInt($(".ui-datepicker-month").val()) + 1, parseInt($(this).val())));
            } else {
                $datepicker.multiDatesPicker('removeDates', getAllDayByMonth(parseInt($(".ui-datepicker-year").val()), parseInt($(".ui-datepicker-month").val()) + 1, parseInt($(this).val())));
            }
        });

        //送出假日設定
        $("#HolidayDetermineBt").unbind().click(function() {
            sendSetting(nowMonthArray, args);
        });
    }

    /**
     * 判斷是否相同進行更新
     * @param {array} sourArr 來源日期陣列
     * @param {array} nowArr 現在日期陣列
     */
    function arraysEqual(sourArr, nowArr) {
        for (var i = sourArr.length; i--;) {
            //現在日期是否存在來源日期 或是
            //來源日期是否存在現在日期
            if ($.inArray(nowArr[i], sourArr) === -1 || $.inArray(sourArr[i], nowArr) === -1) {
                return true;
            }
        }
        return false;
    }

    /**
     * 傳送設定指令
     * @param {array} nowMonthArray 現在日期陣列
     * @param {obj} args 該樓層資訊
     */
    function sendSetting(nowMonthArray, args) {
        var checked = [],
            days = [];

        //set week
        $("input[name='chk_group']:checked").each(function() {
            checked.push((parseInt($(this).val()) === 0) ? 7 : parseInt($(this).val()));
        });

        // $.post(Router.action('Schedule', 'UpdateCompanyListConfigFile'), { floorId: args.FloorId, leaseId: args.leaseId, maskWeeks: checked },
        //     function(data) {
        //         if (data) {
        //             CDEC.light.setMaskWeeks(args.CompanyId, args.CDECFloorId, args.RtuId, checked, function(data) {
        //                 swal("設定完成!");
        //                 console.log(data);
        //             });
        //         }
        //     },
        //     "json");

        // //set day
        // $(nowMonthArray).each(function(index, el) {
        //     days.push(parseInt(el.split('/')[1]));
        // });

        // CDEC.light.setMaskDays(args.CompanyId, args.CDECFloorId, args.RtuId, parseInt($(".ui-datepicker-year").val()), parseInt($(".ui-datepicker-month").val()), days,
        //     function(data) {
        //         swal("設定完成!");
        //         console.log(data);
        //     });
    }

    /**
     * 變更日期格式
     * @param {obj} sourceObj 來源物件
     */
    function getDateArray(sourceObj) {
        var DateArray = [];
        $.each(sourceObj.days, function(index, value) {
            DateArray.push((parseInt(sourceObj.month)) + "/" + value + "/" + sourceObj.year);
        });
        return DateArray
    }

    /**
     * 左邊補0
     * @param {str} str 需要補0的字串
     * @param {len} lenght 要補0的長度
     */
    function padLeft(str, lenght) {
        if (str.length >= lenght)
            return str;
        else
            return padLeft("0" + str, lenght);
    }

    /**
     * 取得該月所有該禮拜的日期
     * @param {string} year 年
     * @param {string} month 月
     * @param {string} week 取得的禮拜
     */
    function getAllDayByMonth(year, month, week) {
        var getTot = daysInMonth(month, year);
        var result = [];

        for (var i = 1; i <= getTot; i++) {
            var newDate = new Date(year, parseInt(month) - 1, i);

            if (newDate.getDay() === week) {
                result.push(month + "/" + i + "/" + year);
            }
        }

        return result;
    }

    /**
     * 取得該月所有天數
     * @param {string} year 年
     * @param {string} month 月
     */
    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    /*===Init End===*/

    function getAllDayByMonth(year, month, week) {
        var getTot = daysInMonth(month, year);
        var result = [];

        for (var i = 1; i <= getTot; i++) {
            var newDate = new Date(year, parseInt(month) - 1, i);

            if (newDate.getDay() === week) {
                result.push(month + "/" + i + "/" + year);
            }
        }

        return result;
    }

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    function getDateOfISOWeek(w, y) {
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    function GetDateArray(data) {
        var DateArray = [];
        $.each(data.days, function(index, value) {
            DateArray.push(data.month + "/" + value + "/" + data.year);
        });
        return DateArray
    }

    function addtime(id, state, starttime, endtime, someonelight, unmannedlight) {
        var TimeLineArray = {
            scheduleType: state,
            startTime: starttime,
            endTime: endtime,
            onValue: someonelight,
            offValue: unmannedlight,
            value: someonelight,
            interactiveStatus: true,
            StartTimeValue: parseInt(ReturnTime(starttime.split(':')[0], starttime.split(':')[1]))
        };

        $(param.Data).each(function(index, el) {
            if (el.interactiveStatus === false) {
                TimeLineArray.interactiveStatus = false;
                return false;
            }
        });

        param.Data.push(TimeLineArray);

        $(param.Data).each(function(index, el) {
            if (el.endTime === 106) {
                delete param.Data[index];
            }
        });
    }

    function ChartChange(obj, drawid) {

        var NewWidth = 0,
            unmannedhtml = "",
            someonehtml = "",
            bordercolor = (drawid === $(".js-nowtimeid").attr("nowtimeid")) ? "rgba(255,255,255,1)" : "rgba(255,255,255,.3)",
            someonecolor = (drawid === $(".js-nowtimeid").attr("nowtimeid")) ? "rgba(255,240,86,1)" : "rgba(255,240,86,.3)",
            unmannedcolor = (drawid === $(".js-nowtimeid").attr("nowtimeid")) ? "rgba(212,191,71,1)" : "rgba(212,191,71,.3)",
            someoneHeight = (120 * (obj.attr("someonelight") / 100)) + (120 * (obj.attr("unmannedlight") / 100)),
            unmannedHeight = 120 * (obj.attr("unmannedlight") / 100),
            parentStarttime = 0,
            parentEndtime = 0,
            NewWidth = parseInt(obj.css("width").replace('px', '')),
            Initleft = parseInt(obj.css("left").replace('px', '')) - 86.5;

        if (drawid === 0) {
            Initleft = Initleft + (parentEndtime - parentStarttime);
        }

        var interactiveStatus = true;
        $(param.Data).each(function(index, el) {
            if (el.interactiveStatus === false) {
                interactiveStatus = false;
                return false;
            }
        });

        if (interactiveStatus) {
            if ($(".schedule_top_someonetag").hasClass("active") === true && $(".schedule_top_unmannedtag").hasClass("active") === false) {
                someoneHeight = (120 * (obj.attr("someonelight") / 100));
                someonehtml = '<div class="SomeoneBlock_' + drawid + '" name="block" style="width:' + (NewWidth) + 'px;height:0px;display:block;background-color:' + someonecolor + ';position:absolute;bottom:0;left:' + (Initleft) + 'px;cursor:pointer;border: 2px solid ' + bordercolor + ';box-sizing:border-box"></div>';
            } else if ($(".schedule_top_someonetag").hasClass("active") === false && $(".schedule_top_unmannedtag").hasClass("active") === true) {
                unmannedhtml = '<div class="UnmannedBlock_' + drawid + '" name="block" style="width:' + NewWidth + 'px;height:0px;display:block;background-color:' + unmannedcolor + ';position:absolute;bottom:0;left:' + (Initleft) + 'px;cursor:pointer;border: 2px solid ' + bordercolor + ';box-sizing:border-box"></div>';
            } else if ($(".schedule_top_unmannedtag").hasClass("active") === true && $(".schedule_top_someonetag").hasClass("active") === true) {
                someonehtml = '<div class="SomeoneBlock_' + drawid + '" name="block" style="width:' + (NewWidth) + 'px;height:0px;display:block;background-color:' + someonecolor + ';position:absolute;bottom:0;left:' + (Initleft) + 'px;cursor:pointer;border: 2px solid ' + bordercolor + ';box-sizing:border-box"></div>';
                unmannedhtml = '<div class="UnmannedBlock_' + drawid + '" name="block" style="width:' + NewWidth + 'px;height:0px;display:block;background-color:' + unmannedcolor + ';position:absolute;bottom:0;left:' + (Initleft) + 'px;cursor:pointer;border-top: 2px solid ' + bordercolor + ';border-left: 2px solid ' + bordercolor + ';border-right: 2px solid ' + bordercolor + ';box-sizing:border-box"></div>';
            }
        } else {
            someoneHeight = (120 * (obj.attr("someonelight") / 100)) * 2;
            someonehtml = '<div class="SomeoneBlock_' + drawid + '" name="block" style="width:' + (NewWidth) + 'px;height:10px;display:block;background-color:' + someonecolor + ';position:absolute;bottom:0;left:' + (Initleft) + 'px;cursor:pointer;border: 2px solid ' + bordercolor + ';box-sizing:border-box"></div>';
        }


        $(".SomeoneBlock_" + drawid).remove();
        $(".UnmannedBlock_" + drawid).remove();

        $('#' + param.Chartid).append(someonehtml + unmannedhtml);

        $(".SomeoneBlock_" + drawid).unbind().animate({
            height: someoneHeight
        }, 600, function() {
            $("#someoneZeroPresent").css("display", "");
            BindBlockClick($(".SomeoneBlock_" + drawid));
        });

        $(".UnmannedBlock_" + drawid).unbind().animate({
            height: unmannedHeight
        }, 600, function() {
            BindBlockClick($(".UnmannedBlock_" + drawid));
        });

    }

    function BindBlockClick(obj) {

        if (obj !== undefined) {
            var number = obj.attr("class").split('_')[1];
            obj.hover(function() {
                if (number !== $(".js-nowtimeid").attr("nowtimeid")) {
                    $(".SomeoneBlock_" + number).css({
                        "border-top": "2px solid rgba(255, 255, 255, 0.7)",
                        "border-left": "2px solid rgba(255, 255, 255, 0.7)",
                        "border-right": "2px solid rgba(255, 255, 255, 0.7)"
                    });
                    $(".UnmannedBlock_" + number).css({
                        "border-top": "2px solid rgba(255, 255, 255, 0.7)",
                        "border-left": "2px solid rgba(255, 255, 255, 0.7)",
                        "border-right": "2px solid rgba(255, 255, 255, 0.7)"
                    });
                }
            }, function() {
                if (number !== $(".js-nowtimeid").attr("nowtimeid")) {
                    $(".SomeoneBlock_" + number).css({
                        "border-top": "2px solid rgba(255, 255, 255, 0.298039)",
                        "border-left": "2px solid rgba(255, 255, 255, 0.298039)",
                        "border-right": "2px solid rgba(255, 255, 255, 0.298039)"
                    });
                    $(".UnmannedBlock_" + number).css({
                        "border-top": "2px solid rgba(255, 255, 255, 0.298039)",
                        "border-left": "2px solid rgba(255, 255, 255, 0.298039)",
                        "border-right": "2px solid rgba(255, 255, 255, 0.298039)"
                    });
                }
            });

            obj.click(function() {

                //判斷是否開啟檢視時間
                $("div[name=Draw]").each(function() {
                    var Number = $(this).attr("class").split(' ')[0].split('_')[1];
                    if (!$(".schedule_eyes").hasClass('active')) {
                        $(".divE_" + Number).css("display", "none");
                        $(".timeS_" + Number).css("display", "none");
                        $(".timeE_" + Number).css("display", "none");
                        $(".divE_" + Number).css("z-index", "1000");

                        $(".divS_" + Number).css({
                            display: "none",
                            "z-index": 1000,
                        });
                    }

                    $(".divS_" + Number + ", .divE_" + Number).css({
                        "background": "linear-gradient(to bottom, rgba(0,0,0,0) 3%,rgba(0,0,0,0) 100%)",
                        "z-index": 1000,
                        "border": "4px solid rgba(0,0,0,0)"
                    });

                    $(".SomeoneBlock_" + Number).css("border", "2px solid rgba(255,255,255,.3)");
                    $(".UnmannedBlock_" + Number).css("border", "2px solid rgba(255,255,255,.3)");
                });

                //顯示指標
                $(".divS_" + number).css("display", "");
                $(".divS_" + number + " .TimeTiptop").css("display", "none");
                $(".divS_" + number).css("background", "linear-gradient(to bottom, #fefcea 3%,#f1da36 100%)");
                $(".divS_" + number).css("border", "4px solid rgb(0, 0, 0)");
                $(".divS_" + number).css("z-index", "1040");

                $(".divE_" + number).css("display", "");
                $(".divE_" + number + " .TimeTiptop").css("display", "none");
                $(".divE_" + number).css("background", "linear-gradient(to bottom, #fefcea 3%,#f1da36 100%)");
                $(".divE_" + number).css("border", "4px solid rgb(0, 0, 0)");
                $(".divE_" + number).css("z-index", "1040");

                $(".timeS_" + number).css("display", "");
                $(".timeE_" + number).css("display", "");

                //標示目前編輯的是哪個區段,用於儲存使用
                $(".js-nowtimeid").attr("nowtimeid", number);

                $("div[name=block]").each(function() {
                    if ($(this).attr("class").split('_')[0] === "SomeoneBlock") {
                        $(this).css("background-color", "rgba(255, 240, 86, .3)");

                    } else if ($(this).attr("class").split('_')[0] === "UnmannedBlock") {
                        $(this).css("background-color", "rgba(212, 191, 71, .3)");

                    }
                })

                $(".SomeoneBlock_" + number).css({
                    backgroundColor: "rgba(255,240,86,1)",
                    "border-Left": "2px solid rgba(255,255,255,1)",
                    "border-Top": "2px solid rgba(255,255,255,1)",
                    "border-Right": "2px solid rgba(255,255,255,1)"
                });

                $(".UnmannedBlock_" + number).css({
                    backgroundColor: "rgba(212,191,71,1)",
                    "border-Left": "2px solid rgba(255,255,255,1)",
                    "border-Top": "2px solid rgba(255,255,255,1)",
                    "border-Right": "2px solid rgba(255,255,255,1)"
                });

                //當是休息則關閉無人亮度
                var Unmanned = $("#Unmanned_Bar");
                if ($(".Draw_" + number).attr("timestate") === "1") {
                    Unmanned.bootstrapSlider("disable");
                } else {
                    Unmanned.bootstrapSlider("enable");
                }

                //setting block 按鈕初始化
                $(".js-statebtn div").each(function(index, el) {
                    $(this).removeClass('active');
                });
                $(".js-statebtn div:eq(" + $(".Draw_" + number).attr("timestate") + ")").addClass('active');

                //Change Dialog
                ChangeSettingBlock(number);

                //初始化Bar
                initObject.init(number);
            });
        }

    }

    //for init(),Check是否小於30min
    function CheckMin(IndexNumber) {
        if (parseInt($(".Draw_" + IndexNumber).css("width"), 10) < 18) {
            return true;
        } else {
            return false;
        }
    }

    //for init(),回傳反向換算數時間(02:00 = > 120)
    function ReturnTime(Hour, Min) {
        return Math.floor((((Number(Hour * 60)) + Number(Min)) / 5) * 3) + 106;
    }

    //for init(),回傳時間換算的數值(120 = > 02:00)
    function ReturnReTime(TimeNumber) {

        var NewTimeNumber = TimeNumber - 106;
        var Hour = (Math.round(NewTimeNumber / 3) * 5) / 60;
        var Min = (Math.floor(NewTimeNumber / 3) * 5) % 60;

        if (NewTimeNumber < 0) {
            return "00 : 00";
        } else {
            return ((Hour < 10) ? '0' + Math.floor(Hour) : Math.floor(Hour)) + " : " + ((Min < 10) ? '0' + Min : Min);
        }
    }

    //for init(),擷取同一位置上重疊的元素
    function getAllElementsFromPoint(x, y) {
        var elements = [];
        var display = [];
        //判斷同一線上Y是否有東西
        var item = document.elementFromPoint(x, y);
        while (item && item !== document.body && item !== window && item !== document && item !== document.documentElement) {
            elements.push(item);
            display.push(item.style.display);
            item.style.display = "none";
            item = document.elementFromPoint(x, y);
        }
        // restore display property
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = display[i];
        }
        return elements;
    }

    //for init(),根據element get xy
    function getPosition(element) {
        var xPosition = 0;
        var yPosition = 0;

        while (element) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }
        return { x: xPosition, y: yPosition };
    }

    //for init(),完全蓋過的進行刪除
    function OvershadowedDiv(IndexNumber) {
        $("div[name=Draw]").each(function(index, el) {
            var number = $(this).attr("class").split(' ')[0].split('_')[1],
                s_nowdraw = parseInt($(this).css("left").replace("px", "")),
                s_overwirtedraw = parseInt($(".Draw_" + IndexNumber).css('left').replace("px", "")),
                e_nowdraw = (parseInt($(this).css("left").replace("px", "")) + parseInt($(this).css("width").replace("px", ""))),
                e_overwirtedraw = (parseInt($(".Draw_" + IndexNumber).css('left').replace("px", "")) + parseInt($(".Draw_" + IndexNumber).css('width').replace("px", "")));

            // console.log("s_nowdraw=" + s_nowdraw + ">=" + "s_overwirtedraw=" + s_overwirtedraw);
            // console.log("e_nowdraw=" + e_nowdraw + "<=" + "e_overwirtedraw=" + e_overwirtedraw);
            // console.log("--------- " + index + " ----------");

            if ($(this).attr("class").split('_')[1].toString() !== IndexNumber.toString()) {
                if (((s_nowdraw >= s_overwirtedraw) && (e_nowdraw <= e_overwirtedraw)) || parseInt(ReturnTime(param.Data[number].startTime.split(":")[0], param.Data[number].startTime.split(":")[1])) - param.Data[number].endTime === 0) {

                    //被覆蓋的order給予覆蓋的
                    $(".Draw_" + IndexNumber).attr("order", $(".Draw_" + number).attr("order"));
                    $(".RangeBar_" + number).remove();
                    $(".divS_" + number).remove();
                    $(".divE_" + number).remove();
                    $(".pointS_" + number).remove();
                    $(".pointE_" + number).remove();
                    $(".Model_" + number).remove();
                    $(".Draw_" + number).remove();

                    //更新data
                    delete param.Data[number];
                }

            }

        });

        var newarray = [],
            countid = 0;
        $(param.Data).each(function(index, el) {
            if (el !== undefined) {
                newarray.push(el);
                countid++;
            }
        });
        param.Data = [];
        param.Data = newarray;

    }

    //for 取消dialog事件,復原上一步TimeLine狀態
    function RecoveryTimeLine() {

        $("div[name=Draw]").each(function() {
            var id = $(this).attr("class").split('_')[1];
            $(".divS_" + id).remove();
            $(".divE_" + id).remove();
            $(".RangeBar_" + id).remove();
            $(".Model_" + id).remove();
            $(".Draw_" + id).remove();
        });

        $(".TimeLineBlock").append(AfterHtml);

        $("div[name=Draw]").each(function() {
            //初始化Bar
            initObject.init($(this).attr("class").split('_')[1]);
        });

    }

    //for 開啟dialog事件,點擊後開啟並變更settingBlock
    function ChangeSettingBlock(number) {

        var Draw = $("#Draw_" + number);
        //set有人
        var someone = $("#Someone_Bar");
        var Unmanned = $("#Unmanned_Bar");
        var someoneValue = (Draw.attr("SomeoneLight") === undefined) ? 0 : Draw.attr("SomeoneLight");

        someone.parent().find(".slider-selection").css("width", someoneValue + "%");
        someone.parent().find(".slider-track-high").css("width", (100 - parseInt(someoneValue) + "%"));
        someone.parent().find(".slider-track div").eq(3).css("left", someoneValue + "%");
        someone.parent().find(".tooltip.tooltip-main.bottom").css("left", someoneValue + "%");
        someone.parent().find(".slider-handle").css("left", someoneValue + "%");
        someone.attr("data-value", someoneValue);
        someone.attr("value", someoneValue);
        $(".schedule_setblock_barblock_left .js-barvalue").text(someoneValue + "%");

        //set無人
        var UnmannedValue = (Draw.attr("UnmannedLight") === undefined) ? 0 : Draw.attr("UnmannedLight");
        Unmanned.parent().find(".slider-selection").css("width", UnmannedValue + "%");
        Unmanned.parent().find(".slider-track-high").css("width", (100 - UnmannedValue + "%"));
        Unmanned.parent().find(".slider-track div").eq(3).css("left", UnmannedValue + "%");
        Unmanned.parent().find(".tooltip.tooltip-main.bottom").css("left", UnmannedValue + "%");
        Unmanned.parent().find(".slider-handle").css("left", UnmannedValue + "%");
        Unmanned.attr("data-value", UnmannedValue);
        Unmanned.attr("value", UnmannedValue);
        $(".schedule_setblock_barblock_right .js-barvalue").text(UnmannedValue + "%");
    };

    //for 確定dialog事件,填滿空白未定義區域
    function AddBlock(obj, position) {
        switch (position) {
            case "left":
                addtime(param.Data.length, 0, "00:00", ReturnTime(parseInt(obj.find("div").text().split(":")[0]), parseInt(obj.find("div").text().split(":")[1])), 80, 20);

                param.Data[0].startTime = obj.find("div").text();
                param.Data[0].keepTime = param.Data[0].keepTime - (parseInt(obj.find("div").text().split(":")[0]) * 60 + parseInt(obj.find("div").text().split(":")[1]));

                //設定js-nowtimeid
                $(".js-nowtimeid").attr("nowtimeid", "1");
                break;
            case "right":
                //新增新區域
                addtime(param.Data.length, 0, obj.find("div").text(), ReturnTime(24, 00), 80, 20);

                param.Data[parseInt(param.Data.length) - 2].endTime = obj.find("div").text();
                param.Data[parseInt(param.Data.length) - 2].keepTime = param.Data[0].keepTime - (parseInt(obj.find("div").text().split(":")[0]) * 60 + parseInt(obj.find("div").text().split(":")[1]));

                //設定js-nowtimeid
                $(".js-nowtimeid").attr("nowtimeid", parseInt(param.Data.length) - 2);
                break;
        }

        //排序畫面上的timeline
        param.Data = $(param.Data).sort(function(a, b) {
            // convert to integers from strings
            a = parseInt(ReturnTime(a.startTime.split(':')[0], a.startTime.split(':')[1]));
            b = parseInt(ReturnTime(b.startTime.split(':')[0], b.startTime.split(':')[1]));
            // compare
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0;
            }
        });

        initObject.InitTimeLine();
    }

    //根據狀態回傳顏色
    function GetColorByState(state) {
        var color = "";
        switch (state) {
            //尖峰
            case 0:
                color = "240, 104, 70";
                break;
                //休息
            case 1:
                color = "166, 72, 49";
                break;
                //離峰
            case 2:
                color = "77, 33, 22";
                break;
                //錯誤
            case 3:
                color = "255, 33, 33";
                break;
                //未定義
            case 4:
                color = "191, 183, 183";
                break;
        }

        return color;
    }

    function GetStringByState(state) {
        var resultStirng = "";
        switch (state) {
            //尖峰
            case '0':
                resultStirng = "P"
                break;
                //休息
            case '1':
                resultStirng = "M"
                break;
                //離峰
            case '2':
            case 'null':
                resultStirng = "F"
                break;
        }
        return resultStirng;
    }

    function GetControlStatusByState(state) {
        return (state == '2') ? '0' : '1';
    }

    function CheckZoom() {
        window.onresize = function onresize() {
            var device = param.detectZoom.device();

            if ((parseFloat(device) < 1 || parseFloat(device) > 1) && !$('#MaskForZoom').hasClass('in')) {
                if ($('#myModal').hasClass('in')) {
                    $('#myModal').modal('hide');
                    //初始化Chart
                    initObject.InitChart('');
                }

                $(".BarBlock").css("z-index", "100");
                $(".BarBackGround").css("z-index", "100");

                $("div[name=Draw]").each(function() {
                    var Number = $(this).attr("class").split('_')[1];
                    $(".divS_" + Number).css("display", "none");
                    $(".divE_" + Number).css("display", "none");
                    $(".Draw_" + Number).css("z-index", "250");
                });

                //儲存目前時間軸狀態
                AfterHtml = $('.TimeLineBlock').html();

                $("#MaskForZoom").modal({
                    backdrop: "static"
                });
            } else if (parseFloat(device) === 1) {
                if ($('#MaskForZoom').hasClass('in')) {
                    $('#MaskForZoom').modal('hide');
                }
            }
        }
        onresize();
    }

    function openLoading() {
        $.blockUI({
            message: '<h3><img src="images/loading.gif"/></h3>'
        }, 9999999);
    }

    function closeLoading() {
        $.unblockUI();
    }

    return {
        init: function(option) {
            param = option;
            param.IndexNumber = 0;
            default_array = param.Data;
            //調整數值全部向左left 106px
            param.Data = $(param.Data).each(function(index, el) {
                param.Data[index].StartTime = param.Data[index].StartTime + 106;
                param.Data[index].EndTime = param.Data[index].EndTime + 106;
            });

            //init 下拉選單
            $('#addtime_start select,#endtime_start select').selectpicker({
                size: 9
            });

            if (($("." + param.TimeLineid).length > 0)) {

                $(".button-holiday").css("display", "block");

                $(param.Data).each(function(index, el) {
                    if (el.interactiveStatus === false) {
                        param.interactiveStatus = false;
                        return false;
                    }
                });

                if (param.interactiveStatus) {
                    //判斷當有連動則顯示左上有人無人選向
                    $(".schedule_top_someonetag").css("display", "flex");
                    $(".schedule_top_unmannedtag").css("display", "flex");
                    $(".schedule_setblock_barblock_right").css("display", "flex");
                    $(".schedule_setblock_bottom_value:eq(1)").css("display", "flex");
                } else {
                    //判斷當無連動隱藏無人亮度
                    $(".schedule_setblock_barblock_right").css("display", "none");
                    $(".schedule_setblock_bottom_value:eq(1)").css("display", "none");
                }

                //判斷版面是否100%
                // CheckZoom();
                //綁定排程按鈕事件
                bind();
                //初始化InitBackGroup
                initObject.InitBackGroup();
                //初始化slider
                initObject.InitChartControl();
                //初始化Picker
                initObject.InitPicker();

            } else {
                console.log("初始化失敗。");
            }
        }
    };

}());
