<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $token = requireField($request, 'token');
    $tokenPayload = verifySession($token);

    $username = $tokenPayload['username'];
    validateUsername($username);

    $email = requireField($tokenPayload, 'email');
    validateEmail($email);

    $mysqli = makeMysqli();
    $escapedUsername = $mysqli->real_escape_string($username);
    $escapedEmail = $mysqli->real_escape_string($email);
    if (false===$mysqli->query("DELETE FROM `hash` WHERE `hash`.`email` = '$escapedEmail'")){
        echo json_encode(['error'=>'Error deleting user']);
        exit();
    }
    if (false===$mysqli->query("DELETE FROM `reset` WHERE `reset`.`email` = '$escapedEmail'")){
        echo json_encode(['error'=>'Error deleting user']);
        exit();
    }
    if (false===$mysqli->query("DELETE FROM `unconfirmed` WHERE `unconfirmed`.`email` = '$escapedEmail'")){
        echo json_encode(['error'=>'Error deleting user'.]);
        exit();
    }
    if (false===$mysqli->query("DELETE FROM `users` WHERE `users`.`email` = '$escapedEmail'")){
        echo json_encode(['error'=>'Error deleting user']);
        exit();
    }

    try {
        $userSaveDir = join_paths('../usersave', $username);
        deleteDirectory($userSaveDir);
        $publishDir = join_paths('../usersave', $username);
        deleteDirectory($userSaveDir);
    } catch (Exception $e) {
        echo json_encode(['error'=>'Error deleting user data']);
        exit();
    }

    echo('true');

    // remove a directory and its files and subdirectories from the server
    function deleteDirectory($path) {
        if (is_dir($path)) {
            $subPaths = glob(join_paths($path, '*'));
            foreach ($subPaths as $subPath) {
                if (is_dir($subPath)){
                    deleteDirectory($subPath);
                } else {
                    unlink($subPath);
                }
            }
            rmdir($path);
        }
    }
?>