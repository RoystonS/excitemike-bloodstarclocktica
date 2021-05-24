<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $token = requireField($request, 'token');
    $tokenPayload = verifySession($token);

    $username = $tokenPayload['username'];
    validateUsername($username);

    $saveName = requireField($request, 'saveName');
    validateFilename($saveName);
    
    $data = readEditionFile($username, $saveName);
    
    echo('{"data":'.$data.'}');

    // read file in save directory and decode as json
    function readEditionFile($username, $saveName) {
        $userSaveDir = join_paths('../usersave', $username);
        $editionFolder = join_paths($userSaveDir, $saveName);
        $editionFile = join_paths($editionFolder, 'edition');
        try {
            $data = file_get_contents($editionFile);
            if ($data !== false) {
                return $data;
            }
        } catch (Exception $e) {
        }
        echo json_encode(array('error' =>"file '$saveName' not found"));
        exit();
    }
?>