<?php
    function join_paths($a, $b) {
        return join('/', array(trim($a, '/'), trim($b, '/')));
    }

    header('Content-Type: application/json;');
    if (strtolower($_SERVER['REQUEST_METHOD']) != 'post')
    {
        echo '{"error":"must use POST request method"}';
        exit();
    }
    if (empty($_FILES))
    {
        echo '{"error":"no files"}';
        exit();
    }

    if (isset($_POST["bloodid"]))
    {
        $bloodid = $_POST["bloodid"];
    }
    else
    {
        echo '{"error":"no id provided"}';
        exit();
    }

    if (!preg_match("/[0-9a-fA-F.]/", $bloodid)) {
        echo '{"error":"invalid id"}';
        exit();
    }

    // verify all files before moving any
    foreach($_FILES as $filename => $data)
    {
        if (!preg_match('/^[0-9a-z_\-\.]*$/', $filename)) {
            echo json_encode(array('error' => ('invalid filename "' . $filename . '"')));
            exit();
        }
        if (!preg_match('/(\.png|\.html|\.json)$/', $filename)) {
            echo '{"error":"invalid file extension"}';
            exit();
        }
        switch ($_FILES[$filename]['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                echo '{"error":"no file sent"}';
                exit();
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                echo '{"error":"Exceeded filesize limit."}';
                exit();
            default:
                echo '{"error":"Unknown error."}';
                exit();
        }
        if ($_FILES[$filename]['size'] > 524288) {
            echo '{"error":"Exceeded filesize limit."}';
            exit();
        }
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimetype = $finfo->file($_FILES[$filename]['tmp_name']);
        switch ($mimetype) {
            case 'image/png':
            case 'application/json':
            case 'text/html':
                break;
            default:
                echo json_encode(array('error' => "invalid mimetype \"$mimetype\""));
                exit();
        }
    }
    
    // seems valid! move them!
    $output_directory = join_paths('..', $uniqid);
    if (!file_exists($output_directory)) {
        mkdir($output_directory, 0777, true);
    }

    foreach($_FILES as $filename => $data) {
        $output_path = join_paths($output_directory, basename($filename));
        if (!move_uploaded_file($_FILES[$filename]['tmp_name'], $output_path)) {
            echo json_encode(array('error' => "error moving file \"$output_path\""));
            exit();
        }
    }
    echo json_encode(array('success' => true));
?>