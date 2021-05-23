<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $code = requireField($request, 'code');
    $email = requireField($request, 'email');
    $password = requireField($request, 'password');

    // TODO: validate email and code

    $mysqli = makeMysqli();

    // get code hash to validate
    $escapedEmail = $mysqli->real_escape_string($email);
    $result = $mysqli->query("SELECT `expiration`,`confirmHash` FROM `reset` WHERE `reset`.`email` = '$escapedEmail' LIMIT 1;");
    if (false === $result) {
        //TODO: don't output the error
        $error = $mysqli->error;
        echo json_encode(['error'=>"Error retrieving code hash: $error"]);
        exit();
    }
    if (0===$result->num_rows){
        echo json_encode(['error'=>'Reset request missing or expired']);
        exit();
    }
    list($expiration,$confirmHash) = $result->fetch_all()[0];

    // verify code
    if (!password_verify("$code:$email", $confirmHash)){
        echo json_encode('badCode');
        exit();
    }

    // expiration
    // TODO: TEST EXPIRATION
    $timestamp = time();
    $leeway = 60;
    if (($timestamp - $leeway) >= $expiration) {
        $mysqli->query("DELETE FROM `reset` WHERE `reset`.`email` = \'$escapedEmail\';");
        echo json_encode('expired');
        exit();
    }

    // looks good. store new password hash
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost'=>10]);
    $escapedHash = $mysqli->real_escape_string($hash);
    if (false===$mysqli->query("UPDATE `hash` SET `hash`.`hash`='$escapedHash' WHERE `hash`.`email`='$escapedEmail' LIMIT 1;")){
        //TODO: don't output the error
        $error = $mysqli->error;
        echo json_encode(['error'=>"Could not store password hash: $error"]);
        exit();
    }

    if (!$mysqli->query("DELETE FROM `reset` WHERE `reset`.`email` = '$escapedEmail';")){
        //TODO: don't output the error
        $error = $mysqli->error;
        echo json_encode(['error'=>"Could not delete record: $error"]);
        exit();
    }
    
    // TODO: this code is duped in signin. extract to shared.php
    $secondsPerDay = 60 * 60 * 24;
    $tokenDuration = 1 * $secondsPerDay;
    $expiration = time() + $tokenDuration;
    $response = $mysqli->query("SELECT `name` FROM `users` WHERE `users`.`email` = '$escapedEmail' LIMIT 1;");
    if (false===$response){
        //TODO: don't output the error
        $error = $mysqli->error;
        echo json_encode(['error'=>"Error looking up username: $error"]);
        exit();
    }
    $username = $result->fetch_all()[0][0];
    $token = createToken($email, $username, $expiration);
    echo json_encode(array('token' => $token,'expiration' => $expiration,'email'=>$email,'username'=>$username));
?>