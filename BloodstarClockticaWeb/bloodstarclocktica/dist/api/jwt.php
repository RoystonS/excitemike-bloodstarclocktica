<?php

// bail because the session token didn't check out
function rejectSession($message){
    header('HTTP/1.0 400 Bad Request');
    if (empty($message)){
        echo json_encode(array('error' =>'log in required'));
    } else {
        echo json_encode(array('error' =>'log in required', 'message'=>$message));
    }
    exit();
    return false;
}

// decode strings that are url-safe base64 encoded
function urlsafeB64Decode($input){
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $input .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($input, '-_', '+/'));
}

// verify a session token - returns username when successful
function verifySession($token){
    try {
        $secretKey = file_get_contents('../../protected/secretkey');

        $parts = explode('.',$token);
        if (3 !== count($parts)) {
            return rejectSession('Token not formatted correctly');
        }
        list($header, $payload, $signature) = $parts;
        $decodedHeader = json_decode(urlsafeB64Decode($header));
        $decodedPayload = json_decode(urlsafeB64Decode($payload), true);
        $decodedSignature = json_decode(urlsafeB64Decode($signature));
        $alg = $supported_algs[$header->alg];

        // weird wrinkle for ES256
        if ($header->alg === 'ES256') {
            return rejectSession('ES256 not supported');
        }

        $jwks = json_decode(file_get_contents('../../protected/jwks.json'),true);

        $jwtKey = $decodedHeader->kid;

        if (!verifySig("$header.$payload", $decodedSignature, $secretKey, $header->alg)){
            return rejectSession('Signature verification failed');
        }

        $timestamp = time();
        $leeway = 60;
        if (array_key_exists('iss', $decodedPayload) && $decodedPayload['iss'] !== 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_sjVd8VWL9'){
            return rejectSession('Token not valid until '.date(DateTime::ISO8601, $decodedPayload->nbf));
        }
        if (array_key_exists('nbf',$decodedPayload) && $decodedPayload['nbf'] > ($timestamp + $leeway)){
            return rejectSession('Token not valid until '.date(DateTime::ISO8601, $decodedPayload->nbf));
        }
        if (array_key_exists('iat', $decodedPayload) && $decodedPayload['iat'] > ($timestamp + $leeway)) {
            return rejectSession('Token not valid until '.date(DateTime::ISO8601, $decodedPayload->iat));
        }
        if (array_key_exists('exp', $decodedPayload) && ($timestamp - $leeway) >= $decodedPayload['exp']) {
            return rejectSession('Token expired');
        }
        if (!array_key_exists('cognito:username', $decodedPayload)){
            return rejectSession('No username specified');
        }
        return $decodedPayload['cognito:username'];
    } catch (Exception $e) {
        return rejectSession('Error: '.$e->getMessage());
    }
    return false;
}

function verifySig($headerAndPayloadStr, $signatureStr, $secretKey, $alg) {
    $algMap = array(
        'RS256' => 'SHA256',
        'RS384' => 'SHA384',
        'RS512' => 'SHA512',
    );
    if (!array_key_exists($alg, $algMap)){
        return rejectSession('Unsupported crypto algorithm: '.$alg);
    }
    $success = openssl_verify($headerAndPayloadStr, $signatureStr, $secretKey, $algMap[$alg]);
    if ($success === 1) {
        return true;
    } elseif ($success === 0) {
        return false;
    }
    return rejectSession('OpenSSL error: '.openssl_error_string());
}
?>