<?php
    // error out if this edition is not marked for sharing with this user
    function validatePermission($user, $owner, $edition) {
        $mysqli = makeMysqli();
        $escapedUser = $mysqli->real_escape_string($username);
        $escapedOwner = $mysqli->real_escape_string($owner);
        $escapedEdition = $mysqli->real_escape_string($edition);
        $result = $mysqli->query("SELECT 1 FROM `share` WHERE `owner` = '$escapedOwner' AND `edition` = '$escapedEdition' AND `user` IN ('$escapedUser', 'EVERYONE');");
        if (false===$result){
            echo json_encode(array("error" => 'sql error'));
            exit();
        }
        if (0===$result->num_rows){
            echo json_encode(['error' => 'this file is not shared with you']);
            exit();
        }
    }
?>