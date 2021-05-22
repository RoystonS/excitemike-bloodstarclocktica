<?php

// error out if edition json does not look valid
function validateBoolean($value) {
    if ('boolean' !== gettype($value)){
        echo '{"error":"invalid boolean"}';
        exit();
    }
}

// error out if edition does not look valid
function validateEdition($edition) {
    if (!is_array($edition) || !array_key_exists('meta', $edition)){
        echo '{"error":"invalid edition data"}';
        exit();
    }
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

?>