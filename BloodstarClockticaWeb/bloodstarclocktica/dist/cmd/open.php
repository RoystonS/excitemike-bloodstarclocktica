<?php
    include('shared.php');
    requirePost();
    $request = getPayload();

    $saveName = requireField($request, 'saveName');

    $check = requireField($request, 'check');
    checkHash($saveName, $check);
    
    $data = readEditionFile($saveName);
    
    echo('{"data":'.$data.'}');
?>