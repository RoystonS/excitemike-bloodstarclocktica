<?php
    include('shared.php');
    requirePost();
    $data = getPayload();

    $saveName = requireField($data, 'saveName');
    validateFilename($saveName);

    $check = requireField($data, 'check');
    checkHash($saveName, $check);

    $customEdition = requireField($data, 'customEdition');
    writeSaveFile($saveName, $customEdition);

    echo json_encode(array('success' => true));
?>