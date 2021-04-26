<?php
    header('Content-Type: application/json', true);

    $result = array('success' => true);

    // I don't think this is actually doing anything
    $request_headers = apache_request_headers();
    if (array_key_exists ('Origin', $request_headers)) {
        header('Access-Control-Allow-Origin: ' . $request_headers['Origin'], true);
    }

    echo json_encode($result);
?>