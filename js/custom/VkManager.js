/**
 * Created by sabir on 11.12.14.
 */

var VkManager = function(){
    var self = this;
    this.users = [];
    this.onlineStatuses = [];
    this.onlineTime = 1000 * 40;
    this.updateTimeout = 20 * 1000;
    this.selectedUser = undefined;
    this.userHistoryTimeout = 24 * 60 * 60 * 1000;
    this.selectedHistory = [];

    this.init = function(){
        initParse();
        self.initSearchInput();
        self.iniStatsButtons();
        self.initTrashButton();
        self.loadUsers(function(){
           self.drawUsers();
            self.initTimer();
        });
    }

    this.loadUsers = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserItem'));
        q.limit(1000);
        q.find(function(list){
            self.users = list;
            callback();
        });
    }

    this.getUserCardHtml = function(u){
        var s = '';
        s+='<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 switch-item accounting">'
        + '<section class="panel">'
        + '<div class="thumb">'
        + '<img class="img-responsive" alt="Responsive image" src="' + u.get('avatar') + '">'
        + '</div>'
        + '<div class="panel-body">'
        + '<div class="switcher-content">'
        + '<p >'
        + u.get('firstName') + ' ' + u.get('lastName') + ''
        + '<a class="pull-right mr5" href="http://vk.com/' + u.get('vkId') + '" ><i class="ti-link"></i></a>'
        + '<a class="pull-right mr5 statsButton" data-id="' + u.id + '"  href="javascript: void(0);" ><i class="ti-stats-up"></i></a> '
        + '<a class="pull-right mr5 trashButton" data-id="' + u.id + '"  href="javascript: void(0);" ><i class="ti-trash"></i></a> '
        + '</p>'
        + '<span href="javascript:;" class="show small" ><span  data-id="' + u.id + '" class="vkStatus"></span></span>'
        + '</div>'
        + '</div>'
        + '</section>'
        + '</div>';
        return s;
    }

    this.drawUsers = function(){
        var s = '';
        var list = self.users;
        console.log(list);
        for (var i in list){
            s+=self.getUserCardHtml(list[i]);
        }
        $('#users').html(s);
        $('#usersNumber').html(self.users.length);
        //container = $(".feed").isotope({
        //    resizable: true,
        //    itemSelector: ".switch-item",
        //    layoutMode: "masonry"
        //});
    }


    this.initSearchInput = function(){
        $(document).keypress(function(e) {
            if(e.which != 13) {
                return;
            }
            console.log('enter pressed');
            var vkId = $('#searchInput').val().trim();
            vkId = vkId.replace('https://', '').replace('http://', '').replace('www.vk.com', '').replace('vk.com', '').replace('www.vkontakte.ru', '').replace('vkontakte.ru', '').replace('/', '');
            console.log('vkId = ' + vkId);
            if (vkId == undefined || vkId == ''){
                toastr.error('Вы не ввели vkId');
                return;
            }
            self.addVkId(vkId);

        });
    }

    this.addVkId = function(vkId){
        enablePreloader();
        $.ajax({
            url: 'add.php?vkId=' + vkId,
            success: function(data){
                console.log(data);
                disablePreloader();
                window.location.href = window.location.href;
            },
            error: function(e, p){
                disablePreloader();
                window.location.href = window.location.href;
                console.log(e, p);
            }
        });
    }

    this.tickUpdateStatuses = function(){
        self.loadOnlineStatuses(function(){
            var list = self.users;
            $('.vkStatus').removeClass('online');
            $('.vkStatus').removeClass('offline');
            for (var i in list){
                var u = list[i];
                var online = self.isOnline(u.get('vkId'));
                console.log(u.get('vkId') + ' is online =  ' + online);
                if (online == true){
                    $('.vkStatus[data-id="' + u.id + '"]').html('online');
                    $('.vkStatus[data-id="' + u.id + '"]').addClass('online');
                    if (self.isMobileOnline(u.get('vkId'))){
                        $('.vkStatus[data-id="' + u.id + '"]').html('<i class="ti-mobile"></i>online');
                    }
                }else{
                    $('.vkStatus[data-id="' + u.id + '"]').html('offline');
                    $('.vkStatus[data-id="' + u.id + '"]').addClass('offline');
                }
            }
        });
    }

    this.loadOnlineStatuses = function(callback){
        var q = new Parse.Query(Parse.Object.extend('UserStatus'));
        q.equalTo('online', 1);
        var date = new Date( (new Date()).getTime() - self.onlineTime);
        q.greaterThan("createdAt", date);
        q.limit(1000);
        q.find(function(list){
            self.onlineStatuses = list;
            console.log(list);
            callback();
        });
    }

    this.isOnline = function(vkId){
        var list = self.onlineStatuses;
        for (var i in list){
            if (list[i].get('vkId') == vkId){
                return true;
            }
        }
        return false;
    }

    this.isMobileOnline = function(vkId){
        var list = self.onlineStatuses;
        for (var i in list){
            if ((list[i].get('vkId') == vkId) && (list[i].get('mobile_online') == 1)){
                return true;
            }
        }
        return false;
    }

    this.initTimer = function(){
        self.tickUpdateStatuses();
        setInterval(function(){
            self.tickUpdateStatuses();
        }, self.updateTimeout);
    }

    this.iniStatsButtons = function(){
        $('body').on('click', '.statsButton', function(){
            var uId = $(this).attr('data-id');
            self.selectedUser = self.getUserById(uId);
            self.prepareModal();
            self.loadUserHistory(function(){
                self.drawPlot();
            });
        });
    }

    this.initTrashButton = function(){
        $('body').on('click', '.trashButton', function(){
            var uId = $(this).attr('data-id');
            var u = self.getUserById(uId);
            if (confirm('Действительно хотите удалить этого пользователя?') == false){
                return;
            }
            enablePreloader();
            u.destroy({
                success: function(){
                    disablePreloader();
                    toastr.success('Удален');
                    setTimeout(function(){ window.location.href = window.location.href}, 500);
                }
            });
        });


    }

    this.prepareModal = function(){
        var u = self.selectedUser;
        $('#userModal').modal();
        $('#userModalName').html(u.get('lastName') + ' ' + u.get('firstName'));
    }

    this.getUserById = function(id){
        var list = self.users;
        for (var i in list){
            if (list[i].id == id){
                return list[i];
            }
        }
        return undefined;
    }

    this.loadUserHistory = function(callback){
        var u = self.selectedUser;
        console.log(u.get('vkId'));
        enablePreloader();
        var q = new Parse.Query(Parse.Object.extend('UserStatus'));
        q.limit(1000);
        q.equalTo('vkId', u.get('vkId'));
        q.equalTo('online', 1);
        var date = new Date( (new Date()).getTime() - self.userHistoryTimeout);
        //q.greaterThan("createdAt", date);
        q.addAscending('createdAt');
        q.find(function(list){
            self.selectedHistory = list;
            //console.log(list);
            disablePreloader();
            callback();
        });
    }

    this.drawPlot = function(){
        var d = self.selectedHistory;
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
                color: "#FFFFFF"
            }
        ]


        console.log(arr);
        $.plot($('#bar-chart'), barData, {
            grid: {
                hoverable: false,
                clickable: false,
                labelMargin: 3,
                color: '#FFFFFF',
                borderColor: '#FFFFFF',
                borderWidth: 0
            },
            xaxis: {
                //min: new Date().getTime() - 24 * 3600 * 1000,
                //max: (new Date()).getTime(),
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
                axisLabelPadding: 5
            },
            yaxis: {
                tickLength: 0
            },
            stack: true
        });
    }

}