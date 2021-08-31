<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $token = requireField($request, 'token');
    $tokenPayload = verifySession($token);
    $username = $tokenPayload['username'];
    $userSaveDir = join_paths('../usersave', $username);
    
    if (!file_exists($userSaveDir)) {
        mkdir($userSaveDir, 0777, true);
    }

    $items = scandir($userSaveDir);
    if (!$items) {
        echo json_encode(array('error' => 'could not scan directory'));
        exit();
    }

    $yourFiles = array();
    foreach ($items as $key => $value) {
        if ($value == '.') {continue;}
        if ($value == '..') {continue;}
        $filepath = join_paths($userSaveDir, $value);
        if (is_dir($filepath)) {
            array_push($yourFiles, $value);
        }
    }

    // old client expects only a 'files' field
    if (!array_key_exists('includeShared', $request)) {
        echo json_encode(array('files' => $yourFiles));
        exit();
    }
    
    $sharedFiles = getSharedFiles($username);
    echo json_encode(array('files' => $yourFiles, 'shared' => $sharedFiles));

    function getSharedFiles($username) {
        $mysqli = makeMysqli();
        $escapedUser = $mysqli->real_escape_string($username);
        $result = $mysqli->query("SELECT `share`.`owner`, `share`.`edition` FROM `share` WHERE `owner` <> '$escapedUser' AND (`share`.`user` = '$escapedUser' OR `share`.`user` = 'EVERYONE');");
        if (false===$result){
            echo json_encode(array("error" => 'sql error'));
            exit();
        }
        $sharedFiles = array();
        $results = $result->fetch_all();
        foreach ($results as $row) {
            list($owner, $edition) = $row;
            if (!array_key_exists($owner, $sharedFiles)) {
                $sharedFiles[$owner] = array();
            }
            array_push($sharedFiles[$owner], $edition);
        }

        return $sharedFiles;
    }
?>