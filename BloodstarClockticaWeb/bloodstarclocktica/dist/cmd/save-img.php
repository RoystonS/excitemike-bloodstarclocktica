<?php
    include('shared.php');
    requirePost();
    $data = getPayload();

    $saveName = requireField($data, 'saveName');
    $id = requireField($data, 'id');
    if (!is_string($id) || ($id==='')) {
        echo json_encode(array('error' =>"Missing id for image"));
        exit();
    }

    $check = requireField($data, 'check');
    checkHash($saveName, $check);

    $dataUri = requireField($data, 'image');
    $base64 = preg_replace('/^.*,/', '', $dataUri);

    writeImage($saveName, $id, base64_decode($base64));

    echo json_encode(array('success' => true));
?>