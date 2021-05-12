<?php
    include('shared.php');
    requirePost();
    $data = getPayload();

    $saveName = requireField($data, 'saveName');
    $clobber = requireField($data, 'clobber');

    $customEdition = requireField($data, 'edition');
    writeEditionFile($saveName, $customEdition, $clobber);

    echo json_encode(array('success' => true));
?>