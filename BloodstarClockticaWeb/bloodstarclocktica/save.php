<?php
    function join_paths($a, $b) {
        return join('/', array(trim($a, '/'), trim($b, '/')));
    }
    function truncate32bit($x) {
        if ($x & 0x80000000) {
            $x = ((~$x & 0xFFFFFFFF) + 1) * -1;
        } else {
            $x = $x & 0xFFFFFFFF;
        }
        return $x;
    }
    function hashFunc($input) {
        $hash = 0;
        $input .= '; So say we all.';
        for($i=0; $i<strlen($input); $i++) {
            $c = $input[$i];
            $hash = truncate32bit( (($hash<<5)-$hash) + ord($c) );
        }
        return $hash;
    }
    function checkKey($key) {
        switch ($key) {
            case 'bloodId': return true;
            case 'check': return true;
            case 'meta.json': return true;
            case 'logo.jpg': return true;
            default:
                return preg_match('/^processed_images\/\w+[.]png$/', $key) ||
                preg_match('/^roles\/\w+[.]json$/', $key) ||
                preg_match('/^src_images\/\w+[.]png$/', $key);
        }
        return false;
    }

    header('Content-Type: application/json;');

    if (strtolower($_SERVER['REQUEST_METHOD']) != 'post')
    {
        echo '{"error":"must use POST request method"}';
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data["bloodId"]))
    {
        $bloodId = $data["bloodId"];
    }
    else
    {
        echo '{"error":"no id provided"}';
        exit();
    }

    if (!preg_match("/^[0-9a-fA-F.]+$/", $bloodId)) {
        echo '{"error":"invalid id"}';
        exit();
    }

    // check hash
    if (isset($data["check"]))
    {
        $check = $data["check"];
    }
    else
    {
        echo '{"error":"no id provided"}';
        exit();
    }

    $hashResult = hashFunc($bloodId);
    if ($hashResult != $check) {
        echo json_encode(array('error' =>"failed hash check: '$check' vs '$hashResult'"));
        exit();
    }

    foreach ( $data as $key => $value ) {
        if (!checkKey($key)) {
            echo json_encode(array('error' =>"bad key: '$key'"));
            exit();
        }
        $found[$key] = $value;
    }

    // ensure directory exists
    $saveDir = './save';
    $output_directory = join_paths($saveDir, $bloodId);
    if (!file_exists($output_directory)) {
        mkdir($output_directory, 0777, true);
    }

    // write files
    foreach ( $data as $key => $value ) {
        if (($key == 'bloodId') || ($key == 'check')) {
            continue;
        }

        $file = fopen(join_paths($output_directory, $key), 'w');
        if (!$file) {
            echo json_encode(array('error' =>"error writing file '$key'"));
            exit();
        }
        try {
            fwrite($file, $value);
        } catch (Exception $e) {
            echo json_encode(array('error' =>"error writing file '$key'"));
            exit();
        } finally {
            fclose($file);
        }
    }
    echo json_encode(array('success' => true));
?>