/**
 * Created by sabir on 13.12.14.
 */

var UserManager = function(){
    var self = this;

    this.loggedIn = false;
    this.vkId = undefined;
    this.firstName = undefined;
    this.lastName = undefined;
    this.avatar = undefined;
    this.history = undefined;
    this.onlineTime = 40 * 1000;
    this.updateTimeout = 20 * 1000;
    this.online = false;
    //this.onlineTime = 0;
    this.totalTime = 0;
    this.barTime = 20 ;


    this.init = function(){
        initParse();
        console.log('init occured');
        self.initLogoutLink();
        self.preparePage();
    }


    this.preparePage = function(){
        self.loadUserFromCookie();

        //todo: drop this line
        //self.loggedIn = true;

        if (self.loggedIn == false){
            return;
        }
        $('.vkHidden').show();

        $('.center_fixed').css('top', '80px');
        $('.h1').addClass('animated swing');
        $('.h1').css('font-size', '62px');

        $('#userImage').show();

        $('#userImage').addClass('animated tada');

        $('#userName').html(self.firstName + ' ' + self.lastName);
        $('#userImage').attr('src', self.avatar);


        $('#userName').addClass('animated zoomIn');

        $('#subtitle').hide();
        $('#dropButton').hide();

        self.loadUserHistory(function(){
            self.prepareOnlineText();
            self.drawPlot();

            $('#bar-chart').addClass('animated bounce');
        });
        //self.loadUserHistory(function(){
        //    $('#status').removeClass('online');
        //    $('#userImage').removeClass('online');
        //    $('#status').css('opacity', 1);
        //
        //    setTimeout(function(){
        //        $('#status').addClass('animated swing');
        //    }, 500);
        //
        //    if (self.isOnline() == true){
        //        $('#status').html('online');
        //        $('#status').addClass('online');
        //        $('#userImage').addClass('online');
        //    }else{
        //        $('#status').html('offline');
        //    }
        //});

        self.initUpdateTimer();
    }



    this.loadUserFromCookie = function(){
        if ($.cookie('vkId') == undefined){
            self.loggedIn = false;
            return;
        }else{
            self.loggedIn = true;
        }
        self.vkId = $.cookie('vkId');
        self.firstName = $.cookie('firstName');
        self.lastName = $.cookie('lastName');
        self.avatar = $.cookie('avatar');
    }


    this.loadUserHistory = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserStatus'));
        q.limit(1000);
        q.equalTo('vkId', self.vkId);
        q.equalTo('online', 1);
        q.addDescending('createdAt');
        q.find(function(list){
            self.history = list;
            callback();
        });
    }

    this.prepareOnlineText = function(){
        console.log('prepareOnlineText occured');
        //console.log(self.history);
        var onlineTime = self.barTime * self.history.length;
        console.log('onlineTime = ', onlineTime);
        if (self.history.length == 0){
            //$('#onlineText').html('Вы еще не были в сети. Подождите некоторое время...');
            return;
        }else{
            var minT = moment(self.history[self.history.length - 1].createdAt).format('X');
            var maxT = moment(self.history[0].createdAt).format('X') ;
            var dt = Math.abs(maxT - minT);
            console.log('dt = ', dt);
            var dur = moment.duration({'seconds': dt});
            //alert(onlineText);
            //console.log(onlineText);
        }

    }

    this.isOnline = function(){
        if (self.history.length == 0){
            return false;
        }
        var l = self.history[0];
        var t = moment(l.createdAt).format('X') * 1000
        var dt = (new Date()).getTime() - t;
        //console.log('dt = ', dt);
        return (dt < self.onlineTime);
    }

    this.initLogoutLink = function(){
        $('#logoutLink').bind('click', function(){
            $.removeCookie('vkId');
            window.location.href = window.location.href;
        });
    }



    this.checkStatus = function(callback){
        //alert('check');
        //console.log('checking');
        var q = new Parse.Query(Parse.Object.extend('UserStatus'));
        q.limit(1);
        q.equalTo('vkId', self.vkId);
        q.addDescending('createdAt');
        q.find(function(list){
            if (list.length == 0){
                self.online = false;
                callback();
                return;
            }

            //console.log(list[0]);

            var t = moment(list[0].createdAt).format('X') * 1000
            var dt = (new Date()).getTime() - t;
            //console.log(dt);
            self.online = (dt < self.onlineTime);
            callback();
        });

    }

    this.onTimerTick = function(){
        $('#status').removeClass('online');
        $('#status').removeClass('animated');
        $('#status').removeClass('swing');
        $('#userImage').removeClass('online');
        //console.log('online = ', self.online);
        if (self.online == true){
            $('#status').html('online');
            $('#status').addClass('online');
            setTimeout(function(){$('#status').addClass('animated swing');}, 5);
            $('#userImage').addClass('online');
        }else{
            $('#status').html('offline');
        }
    }

    this.initUpdateTimer = function(){
        console.log('initUpdateTimer occured');
        self.checkStatus(function(){
            self.onTimerTick();
        });
        setInterval(function(){
            self.checkStatus(function(){
                self.onTimerTick();
            });
        }, self.updateTimeout);
    }

    this.drawPlot = function(){
        console.log('drawPlot');
        var d = self.history;
        var arr = [];
        for (var i in d){
            //console.log(d[i].createdAt);
            arr.push([moment(d[i].createdAt).format('X') * 1000, 1]);
        }
        var barData = [
            {
                data: arr,
                bars: {
                    show: true,
                    barWidth: 30 * 1000,
                    fill: true,
                    lineWidth: 0,
                    order: 1,
                    fillColor: "#1ce091"
                },
                color: "white"
            },
            {
                data: [[new Date().getTime(), 1], [new Date().getTime() + 600 * 1000, 1]],
                bars: {
                    show: true,
                    barWidth: 30 * 1000,
                    fill: true,
                    lineWidth: 0,
                    order: 1,
                    fillColor: "#FFFFFF"
                },
                color: "white"
            }
        ]


        //console.log(arr);
        $.plot($('#bar-chart'), barData, {
            grid: {
                hoverable: true,
                clickable: true,
                labelMargin: 3,
                color: '#1ce091',
                borderColor: 'white',
                borderWidth: 0
            },
            xaxis: {
                //min: new Date().getTime() - 24 * 3600 * 1000,
                max: (new Date()).getTime() + 600 * 1000,
                mode: "time",
                timeformat: "%h:%m",
                //tickSize: [1, "minute"],
                //monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                tickLength: 1,
                timezone: "browser",
                //axisLabel: 'Month',
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                //axisLabelFontFamily: 'Open Sans, Arial, Helvetica, Tahoma, sans-serif',
                axisLabelPadding: 5,
                color: '#FFFFFF'
            },
            tooltip: true,
            tooltipOpts : {
                content : getTooltip,
                defaultTheme : false
            },
            yaxis: {
                tickLength: 0
            },
            stack: true
        });

        var previousPoint = null;
        moment.lang('ru');
        $("#bar-chart").bind("plothover", function (event, pos, item) {
            if (item) {
                //if (previousPoint != item.datapoint) {
                    previousPoint = item.datapoint;

                    $("#tooltip").remove();
                    var x = item.datapoint[0],
                        y = item.datapoint[1] - item.datapoint[2];

                    console.log(x);
                    $('#hoverText').html(moment(x).format('MMM, D HH:mm:SS'));
                    $('#hoverText').show();
                    $('#hoverText').fadeOut(3000);
                //}
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;
            }
        });

    }

}

function getTooltip(label, x, y) {
    return "Your sales for " + x + " was $" + y;
}