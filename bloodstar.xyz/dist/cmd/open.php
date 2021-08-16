<?php
    include('shared.php');
    requirePost();
    $request = getPayload();

    $saveName = requireField($request, 'saveName');
    
    $data = readEditionFile($saveName);
    
    echo('{"data":'.$data.'}');
?>