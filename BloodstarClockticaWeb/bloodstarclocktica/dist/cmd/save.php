<?php
    include('shared.php');
    requirePost();
    $data = getPayload();

    $saveName = requireField($data, 'saveName');

    $customEdition = requireField($data, 'edition');
    writeEditionFile($saveName, $customEdition);

    echo json_encode(array('success' => true));
?>