<?php
    header('Content-Type: text/html;');
?>
<html><body><p>
<?php
    include('shared.php');

    function confirm(){
        // don't do any work for anything other than GET
        if (strtolower($_SERVER['REQUEST_METHOD']) != 'get') {
            return;
        }
    
        $code = requireField($_GET, 'code');
        $email = requireField($_GET, 'email');
        // get signup data
        $mysqli = makeMysqli();
        $escapedEmail = $mysqli->real_escape_string($email);
        $result = $mysqli->query("SELECT `expiration`,`hash`,`confirmHash` FROM `unconfirmed` WHERE `unconfirmed`.`email` = '$escapedEmail' LIMIT 1;");
        if (0===$result->num_rows){
            $result = $mysqli->query("SELECT 1 FROM `hash` WHERE `hash`.`email` = '$escapedEmail' LIMIT 1;");
            if (0!==$result->num_rows){
                echo ("Email \"$escapedEmail\" already confirmed");
            } else {
                echo ("Email \"$escapedEmail\" not signed up");
            }
            return;
        }
        list($expiration,$hash,$confirmHash) = $result->fetch_all()[0];
    
        // verify code
        if (password_verify("$confirmCode:$email", $confirmHash)){
            echo ("Unrecognized code/email pair");
            return;
        }
    
        // expiration
        $timestamp = time();
        $leeway = 60;
        if (($timestamp - $leeway) >= $expiration) {
            $mysqli->query("DELETE FROM `users` WHERE `users`.`email` = \'$escapedEmail\';");
            echo ("Confirmation code expired");
            return;
        }
    
        // looks good. move to confirmed
        $escapedHash = $mysqli->real_escape_string($hash);
        $mysqli->query("INSERT INTO `hash` (`email`,`hash`) VALUES ('$escapedEmail', '$escapedHash');");
        if (!$mysqli->query("DELETE FROM `unconfirmed` WHERE `unconfirmed`.`email` = '$escapedEmail';")){
            $error = $mysqli->error;
            echo ("Could not delete record: $error");
            return;
        }
    
        //header("Location: https://www.bloodstar.xyz/");
        echo "User account confirmed for $email!";
    }

    confirm();
?>
</p><p><a href="https://www.bloodstar.xyz">Return to Bloodstar Clocktica</a></p></body></html>