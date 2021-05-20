<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $username = requireField($request, 'username');
    $password = requireField($request, 'password');
    $email = requireField($request, 'email');

    $mysqli = makeMysqli();

    // TODO: clear expired password confirmations on a cron job or something

    // verify name & email not taken
    $escapedUsername = $mysqli->real_escape_string($username);
    $escapedEmail = $mysqli->real_escape_string($email);
    $result = $mysqli->query("SELECT `name`,`email` FROM `users` WHERE `users`.`name` = '$escapedUsername' OR `users`.`email` = '$escapedEmail' LIMIT 1;");
    if (0!==$result->num_rows){
        list($foundName,$foundEmail) = $result->fetch_all()[0];
        if ($foundName===$username){
            echo json_encode('usernameTaken');
            exit();
        } else if ($foundEmail===$email){
            echo json_encode('emailTaken');
            exit();
        }
    }

    // insert
    $secondsPerDay = 60 * 60 * 24;
    $reservationDuration = 1 * $secondsPerDay;
    $expiration = time() + $reservationDuration;
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost'=>10]);
    $confirmCode = sprintf('%06d', random_int(0,999999));
    $confirmHash = password_hash("$confirmCode:$email", PASSWORD_BCRYPT, ['cost'=>10]);
    $mysqli->query("INSERT INTO `users` (`email`, `name`) VALUES ('$escapedEmail', '$escapedUsername');");
    $escapedExp = $mysqli->real_escape_string($expiration);
    $escapedHash = $mysqli->real_escape_string($hash);
    $escapedConfirmHash = $mysqli->real_escape_string($confirmHash);
    $mysqli->query("INSERT INTO `unconfirmed` (`email`, `expiration`, `hash`, `confirmHash`) VALUES ('$escapedEmail', '$escapedExp', '$escapedHash', '$escapedConfirmHash');");

    $escapeEmail = urlencode($email);
    $link = "https://www.bloodstar.xyz/api/confirm.php?code=$confirmCode&email=$escapeEmail";
    $headers = "MIME-Version: 1.0\r\n"
             . "Content-type: text/html; charset=iso-8859-1\r\n"
             . "From: no-reply@bloodstar.xyz\r\n"
             . "Reply-To: no-reply@bloodstar.xyz\r\n"
             . "X-Mailer: PHP/" . phpversion();
    $body = '<html><body>'
          . '<p>Click the link below or copy and paste into your browser to confirm your Bloodstar Clocktica account.</p>'
          . "<a href=\"$link\">$link</a>"
          . '</body></html>';
    if (!mail($email, 'Bloodstar Clocktica sign-up confirmation', $body, $headers)){
        echo json_encode(array('error'=>'failed to send confirmation email'));
        exit();
    }

    echo json_encode(true);
?>
