/**
 * Created by sabir on 02.11.14.
 */

function initParse(){
    var appId = '91FsXB0dNm3V9zsgNHjmVICfKSLhl1vSuFIE4d9s';
    var jsKey = 'rfraaw02sBRPfIPrVcEwn1S0gSpfeBFgYcJd3LIh';
    Parse.initialize(appId, jsKey);
}

function gup( name )
{
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return null;
    else
        return results[1];
}

function enablePreloader(){
    $('.gallery-loader').removeClass('hide');
}

function disablePreloader(){
    $('.gallery-loader').addClass('hide');
}

function loadVimeoImgSrc(vimeoId, callback){
    $.ajax({
        type:'GET',
        url: 'http://vimeo.com/api/v2/video/' + vimeoId + '.json',
        jsonp: 'callback',
        dataType: 'jsonp',
        success: function(data){
            var thumbnail_src = data[0].thumbnail_large;
            callback(thumbnail_src);
        }
    });
}