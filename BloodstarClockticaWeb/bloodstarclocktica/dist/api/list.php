<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $token = requireField($request, 'token');
    $userName = verifySession($token);
    $userSaveDir = join_paths('../usersave', $userName);
    
    if (!file_exists($userSaveDir)) {
        mkdir($userSaveDir, 0777, true);
    }

    $items = scandir($userSaveDir);
    if (!$items) {
        echo json_encode(array('error' => 'could not scan directory'));
        exit();
    }

    $list = array();
    foreach ($items as $key => $value) {
        if ($value == '.') {continue;}
        if ($value == '..') {continue;}
        $filepath = join_paths($userSaveDir, $value);
        if (is_dir($filepath)) {
            array_push($list, $value);
        }
    }

    echo json_encode(array('files' => $list));
?>