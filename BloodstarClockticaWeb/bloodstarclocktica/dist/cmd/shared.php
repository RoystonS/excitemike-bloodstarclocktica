<?php
    header('Content-Type: application/json;');
    $saveDir = '../save';
    
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

    // error out if not POST
    function requirePost() {
        if (strtolower($_SERVER['REQUEST_METHOD']) != 'post')
        {
            echo '{"error":"must use POST request method"}';
            exit();
        }
    }

    // decode payload as json
    function getPayload() {
        return json_decode(file_get_contents('php://input'), true);
    }

    // error if field is not set in array, otherwise, return that field
    function requireField($arr, $fieldName) {
        if (array_key_exists($fieldName, $arr))
        {
            return $arr[$fieldName];
        }
        else
        {
            echo json_encode(array("error" => "field \"$fieldName\" is missing"));
            exit();
        }
    }

    // encode as json and write to save directory
    function writeEditionFile($saveName, $data) {
        global $saveDir;
        validateFilename($saveName);

        // ensure directory exists
        if (!file_exists($saveDir)) {
            mkdir($saveDir, 0777, true);
        }
        $editionFolder = join_paths($saveDir, $saveName);
        if (!file_exists($editionFolder)) {
            $success = mkdir($editionFolder, 0777, true);
            if (!$success) {
                echo json_encode(array('error' =>"could not make directory for '$saveName'"));
                exit();
            }
        }

        $editionFile = join_paths($editionFolder, 'edition');
        $file = fopen($editionFile, 'w');
        if (!$file) {
            echo json_encode(array('error' =>"error writing file '$saveName'"));
            exit();
        }

        try {
            fwrite($file, json_encode($data));
        } catch (Exception $e) {
            echo json_encode(array('error' =>"error writing file '$saveName'"));
            exit();
        } finally {
            fclose($file);
        }
    }

    // read file in save directory and decode as json
    function readEditionFile($saveName) {
        global $saveDir;
        validateFilename($saveName);
        $editionFolder = join_paths($saveDir, $saveName);
        $editionFile = join_paths($editionFolder, 'edition');
        return file_get_contents($editionFile);
    }

    // error out if filename invalid
    function validateFilename($filename) {
        if (!preg_match("/^[0-9a-zA-Z.]+$/", $filename)) {
            echo '{"error":"invalid saveName"}';
            exit();
        }
    }

    // error out if hashes don't match
    function checkHash($saveName, $checkValue) {
        $hashResult = hashFunc($saveName);
        if ($hashResult != $checkValue) {
            echo json_encode(array('error' =>"failed hash check"));
            exit();
        }
    }

    // binary data to ${id}.png in save directory
    function writeImage($saveName, $id, $binaryData) {
        global $saveDir;
        validateFilename($saveName);

        // ensure directory exists
        if (!file_exists($saveDir)) {
            mkdir($saveDir, 0777, true);
        }
        $editionFolder = join_paths($saveDir, $saveName);
        if (!file_exists($editionFolder)) {
            $success = mkdir($editionFolder, 0777, true);
            if (!$success) {
                echo json_encode(array('error' =>"could not make directory for '$saveName'"));
                exit();
            }
        }

        $path = join_paths($editionFolder, $id.'.png');

        try {
            file_put_contents($path, $binaryData);
        } catch (Exception $e) {
            echo json_encode(array('error' =>"error writing file '$path'"));
            exit();
        }
    }
?>