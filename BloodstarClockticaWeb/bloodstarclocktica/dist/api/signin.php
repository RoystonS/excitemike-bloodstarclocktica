<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $usernameOrEmail = requireField($request, 'usernameOrEmail');
    $password = requireField($request, 'password');

    $mysqli = makeMysqli();
    if (false === strpos($usernameOrEmail, '@')) {
        $escapedEmail = $mysqli->real_escape_string($usernameOrEmail);
        $result = $mysqli->query("SELECT `hash`,`name` FROM `hash` INNER JOIN `users` ON `users`.`email` = `hash`.`email` WHERE `users`.`name` = \"$escapedEmail\" LIMIT 1;");
    } else {
        $escapedUsername = $mysqli->real_escape_string($usernameOrEmail);
        $result = $mysqli->query("SELECT `hash`,`name` FROM `hash` WHERE `hash`.`email` = \"$escapedUsername\" LIMIT 1;");
    }
    if (0===$result->num_rows){
        echo json_encode(array("error" => "no such username or email \"$usernameOrEmail\""));
        exit();
    }
    $results = $result->fetch_all();
    list($hash, $username) = $results[0];
    if (!password_verify($password, $hash)) {
        echo json_encode(array("error" => "password did not match"));
        exit();
    }

    $secondsPerDay = 60 * 60 * 24;
    $tokenDuration = 1 * $secondsPerDay;
    $expiration = time() + $tokenDuration;

    $token = createToken($username, $expiration);

    echo json_encode(array('token' => $token,'expiration' => $expiration));
?>