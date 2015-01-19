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

ParseClient::initialize("91FsXB0dNm3V9zsgNHjmVICfKSLhl1vSuFIE4d9s", "Fkb09emtblzbi0ezz12gMva89IzbWtaYvFDfUsaR", "7IVUIyvc8DNvmtaokB577dTjw6JM2pdFWKcwwOW3" );



if(isset($_GET['vkId'])) {
    $vkId = $_GET['vkId'];
    $json = file_get_contents('http://stopvk.com:5015/info?vkId=' . $vkId);
    $obj = json_decode($json);
    $firstName = $obj->response[0]->first_name;
    $lastName = $obj->response[0]->last_name;
    $avatar = $obj->response[0]->photo_max;

    $u = ParseObject::create("UserItem");
    $u->set("vkId", $vkId);
    $u->set("firstName", $firstName);
    $u->set("lastName", $lastName);
    $u->set("avatar", $avatar);
    try {
        $u->save();
              echo json_encode($u);
        } catch (ParseException $ex) {
            echo json_encode($ex);
        }
}

?>