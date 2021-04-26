<?php
    include('shared.php');
    requirePost();
    $request = getPayload();

    $saveName = requireField($request, 'saveName');
    validateFilename($saveName);

    $check = requireField($request, 'check');
    checkHash($saveName, $check);
    
    $data = readSaveFile($saveName);
    // TODO: fix unnecessary round trip decoding and re-encoding as json
    echo json_encode(array('data' => $data));
?>