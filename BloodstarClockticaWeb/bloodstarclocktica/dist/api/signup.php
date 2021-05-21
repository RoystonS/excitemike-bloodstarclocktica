<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $username = requireField($request, 'username');
    $password = requireField($request, 'password');
    $email = requireField($request, 'email');

    $mysqli = makeMysqli();

    // TODO: validate

    // verify name & email not taken
    $escapedUsername = $mysqli->real_escape_string($username);
    $escapedEmail = $mysqli->real_escape_string($email);
    $result = $mysqli->query("SELECT `name`,`email` FROM `users` WHERE `users`.`name` = '$escapedUsername' OR `users`.`email` = '$escapedEmail' LIMIT 1;");
    if (0!==$result->num_rows){
        list($foundName,$foundEmail) = $result->fetch_all()[0];

        if (($foundName===$username)&&($foundEmail===$email)){
            // user is restarting sign up, which is fine
        } else if ($foundEmail===$email){
            echo json_encode('emailTaken');
            exit();
        } else {
            echo json_encode('usernameTaken');
            exit();
        }
    }

    // insert into unconfirmed table for the next step to see
    $secondsPerDay = 60 * 60 * 24;
    $reservationDuration = 1 * $secondsPerDay;
    $expiration = time() + $reservationDuration;
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost'=>10]);
    $confirmCode = sprintf('%06d', random_int(0,999999));
    $confirmHash = password_hash("$confirmCode:$email", PASSWORD_BCRYPT, ['cost'=>10]);
    if (false===$mysqli->query("INSERT IGNORE INTO `users` (`email`, `name`) VALUES ('$escapedEmail', '$escapedUsername');")){
        //TODO: don't output the error
        $error = $mysqli->error;
        echo json_encode(['error'=>"Error creating user: $error"]);
        exit();
    }
    $escapedHash = $mysqli->real_escape_string($hash);
    $escapedConfirmHash = $mysqli->real_escape_string($confirmHash);
    if (false === $mysqli->query('INSERT INTO `unconfirmed` (`email`, `expiration`, `hash`, `confirmHash`) '
                                ."VALUES ('$escapedEmail', $expiration, '$escapedHash', '$escapedConfirmHash') "
                                .'ON DUPLICATE KEY UPDATE '
                                .'`expiration`=VALUES(`expiration`), '
                                .'`hash`=VALUES(`hash`), '
                                .'`confirmHash`=VALUES(`confirmHash`) '
                                .';')){
        //TODO: don't output the error
        $error = $mysqli->error;
        echo json_encode(['error'=>"Error storing confirmation code hash: $error"]);
        exit();
    }

    // send email with the code
    $escapeEmail = urlencode($email);
    $headers = "MIME-Version: 1.0\r\n"
             . "Content-type: text/html; charset=iso-8859-1\r\n"
             . "From: no-reply@bloodstar.xyz\r\n"
             . "Reply-To: no-reply@bloodstar.xyz\r\n"
             . "X-Mailer: PHP/" . phpversion();
    $body = '<html><body>'
          . '<p>Use the code below to finish creating your account.</p>'
          . "<p style=\"font-size:larger;\">$confirmCode</a>"
          . '</body></html>';
    if (!mail($email, 'Bloodstar Clocktica sign-up confirmation', $body, $headers)){
        echo json_encode(array('error'=>'failed to send confirmation email'));
        exit();
    }

    echo 'true';

    // TODO: test clearing expired
    $leeway = 60;
    $killTime = time() + $leeway;
    try {
        $result = $mysqli->query("DELETE FROM `unconfirmed` WHERE `unconfirmed`.`expiration` < $killTime;");
    } catch (Exception $e) {
        // ignore
    }
?>
