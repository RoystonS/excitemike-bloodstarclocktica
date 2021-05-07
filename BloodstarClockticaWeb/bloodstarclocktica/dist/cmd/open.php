<?php
    include('shared.php');
    requirePost();
    $request = getPayload();

    $saveName = requireField($request, 'saveName');
    validateFilename($saveName);

    $check = requireField($request, 'check');
    checkHash($saveName, $check);
    
    $data = readSaveFile($saveName);
    
    echo('{"data":'.$data.'}');
?>