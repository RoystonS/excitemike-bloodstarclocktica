<?php
    header('Content-Type: application/json;');
    $saveDir = '../save';
    
    function join_paths($a, $b) {
        return join('/', array(trim($a, '/'), trim($b, '/')));
    }

    // error out if not POST
    function requirePost() {
        if (strtolower($_SERVER['REQUEST_METHOD']) === 'options') {
            // support options or else CORS pre-flight won't work, but don't do any work
            echo '{}';
            exit();
        }
        else if (strtolower($_SERVER['REQUEST_METHOD']) != 'post')
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
    // TODO: this function belongs in save.php
    function writeEditionFile($saveName, $data, $clobber) {
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

        if (!$clobber && file_exists($editionFile)) {
            echo json_encode(array('clobberWarning' => "Save file '$saveName' already exists"));
            exit();
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

        // TODO: look at edition data for a list of character ids(and add _meta). delete any old images that do not match one of those ids
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
        if (($filename==='') ||
            ($filename==='.')  ||
            ($filename==='..') ||
            !preg_match("/^[^\\/:\"?<>\\|]+$/", $filename))
        {
            echo '{"error":"invalid saveName"}';
            exit();
        }
    }

    // binary data to ${id}.png in save directory
    function writeImage($saveName, $id, $isSource, $binaryData) {
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

        $suffix = '.png';
        if ($isSource) {$suffix = '.src.png';}
        $path = join_paths($editionFolder, $id.$suffix);

        try {
            file_put_contents($path, $binaryData);
        } catch (Exception $e) {
            echo json_encode(array('error' =>"error writing file '$path'"));
            exit();
        }
    }
?>