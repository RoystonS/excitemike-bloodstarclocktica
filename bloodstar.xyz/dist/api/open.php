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
    
    // it's already JSON, so we just need to wrap it
    echo('{"data":'.$data.'}');
?>