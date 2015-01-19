<?php

require 'vendor/autoload.php';

use Parse\ParseObject;
use Parse\ParseQuery;
use Parse\ParseACL;
use Parse\ParsePush;
use Parse\ParseUser;
use Parse\ParseInstallation;
use Parse\ParseException;
use Parse\ParseAnalytics;
use Parse\ParseFile;
use Parse\ParseCloud;
use Parse\ParseClient;

$client_id = '4679561'; // ID приложения
$client_secret = '1eE3poogCt0lnm1xrEe6'; // Защищённый ключ
$redirect_uri = 'http://stopvk.com/auth.php';

if(isset($_GET['code'])) {
    echo $_GET['code'];
    $params = array(
            'client_id' => $client_id,
            'client_secret' => $client_secret,
            'code' => $_GET['code'],
            'redirect_uri' => $redirect_uri
        );
    $token = json_decode(file_get_contents('https://oauth.vk.com/access_token' . '?' . urldecode(http_build_query($params))), true);

        if (isset($token['access_token'])) {
            $params = array(
                'uids'         => $token['user_id'],
                'fields'       => 'uid,first_name,last_name,screen_name,sex,bdate,photo_big',
                'access_token' => $token['access_token']
            );
            $userInfo = json_decode(file_get_contents('https://api.vk.com/method/users.get' . '?' . urldecode(http_build_query($params))), true);

             if (isset($userInfo['response'][0]['uid'])) {
                   $userInfo = $userInfo['response'][0];
                   $result = true;
             }
        }


    	if ($result) {
            echo "Социальный ID пользователя: " . $userInfo['uid'] . '<br />';
            echo "Имя пользователя: " . $userInfo['first_name'] . '<br />';
            echo "Ссылка на профиль пользователя: " . $userInfo['screen_name'] . '<br />';
            echo "Пол пользователя: " . $userInfo['sex'] . '<br />';
            echo "День Рождения: " . $userInfo['bdate'] . '<br />';
            echo '<img src="' . $userInfo['photo_big'] . '" />'; echo "<br />";
        }


        setcookie("vkId", $userInfo['screen_name']);
        setcookie("firstName", $userInfo['first_name']);
        setcookie("lastName", $userInfo['last_name']);
        setcookie("avatar", $userInfo['photo_big']);


        ParseClient::initialize("91FsXB0dNm3V9zsgNHjmVICfKSLhl1vSuFIE4d9s", "Fkb09emtblzbi0ezz12gMva89IzbWtaYvFDfUsaR", "7IVUIyvc8DNvmtaokB577dTjw6JM2pdFWKcwwOW3" );

        $u = ParseObject::create("UserItem");
        $u->set("vkId", $userInfo['screen_name']);
        $u->set("firstName", $userInfo['first_name']);
        $u->set("lastName", $userInfo['last_name']);
        $u->set("avatar", $userInfo['photo_big']);

        try {
          echo 'saving';
          $u->save();
           header('Location: index.html');
          echo 'New object created with objectId: ' . $u->getObjectId();
        } catch (ParseException $ex) {
            echo 'failed';
            header('Location: index.html');
        }

}else{
    header('Location: index.html');
}


?>