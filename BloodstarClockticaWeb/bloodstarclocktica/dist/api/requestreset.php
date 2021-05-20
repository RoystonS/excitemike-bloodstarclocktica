<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $usernameOrEmail = requireField($request, 'usernameOrEmail');

    $mysqli = makeMysqli();
    if (false === strpos($usernameOrEmail, '@')) {
        $escapedUsername = $mysqli->real_escape_string($usernameOrEmail);
        $result = $mysqli->query("SELECT `email` FROM `users` WHERE `users`.`name` = '$escapedUsername' LIMIT 1;");
        if (false===$result){
            echo json_encode(array("error" => 'sql error '.$mysqli->error));
            exit();
        }
        if (0===$result->num_rows){
            echo json_encode(array("error" => "no such username or email \"$usernameOrEmail\""));
            exit();
        }
        $results = $result->fetch_all();
        $email = $results[0][0];
    } else {
        $email = $usernameOrEmail;
    }

    $sqlEscapedEmail = $mysqli->real_escape_string($email);
    $htmlEscapedEmail = htmlspecialchars($email);
    $urlEscapedEmail = urlencode($email);
    $confirmCode = sprintf('%06d', random_int(0,999999));
    $confirmHash = password_hash("$confirmCode:$email", PASSWORD_BCRYPT, ['cost'=>10]);
    $escapedConfirmHash = $mysqli->real_escape_string($escapedConfirmHash);

    $secondsPerDay = 60 * 60 * 24;
    $timeLimit = 1 * $secondsPerDay;
    $expiration = time() + $timeLimit;
    $result = $mysqli->query("INSERT INTO `reset` (`email`, `expiration`, `confirmHash`) VALUES ('$sqlEscapedEmail', $expiration, '$escapedConfirmHash');");
    if (false===$result){
        echo json_encode(array('error' => 'could not reset password'));
        exit();
    }

    $link = "https://www.bloodstar.xyz/api/reset.php?code=$confirmCode&email=$urlEscapedEmail";
    $headers = "MIME-Version: 1.0\r\n"
             . "Content-type: text/html; charset=iso-8859-1\r\n"
             . "From: no-reply@bloodstar.xyz\r\n"
             . "Reply-To: no-reply@bloodstar.xyz\r\n"
             . "X-Mailer: PHP/" . phpversion();
    $body = '<html><body>'
          . "<p>A password reset was requested for $htmlEscapedEmail. Click the link below or copy and paste into your browser to reset your Bloodstar Clocktica password for this account.</p>"
          . "<p><a href=\"$link\">$link</a></p>"
          . '<p>If you don\'t want to reset your password, you can ignore this email.</p>'
          . '</body></html>';
    if (!mail($email, 'Bloodstar Clocktica password reset', $body, $headers)){
        echo json_encode(array('error'=>'failed to send password reset email'));
        exit();
    }

    echo json_encode(array('email'=>$email));

    // TODO: test clearing expired
    $leeway = 60;
    $killTime = time() + $leeway;
    try {
        $result = $mysqli->query("DELETE FROM `reset` WHERE `reset`.`expiration` < $killTime;");
    } catch (Exception $e) {
        // ignore
    }
?>