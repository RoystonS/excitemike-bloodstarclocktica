<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $token = requireField($request, 'token');
    $tokenPayload = verifySession($token);

    $saveName = requireField($request, 'saveName');
    validateFilename($saveName);

    $id = requireField($data, 'id');
    validateCharacterId($id);

    $isSource = requireField($data, 'isSource');
    validateBoolean($isSource);

    $dataUri = requireField($data, 'image');
    $base64 = preg_replace('/^.*,/', '', $dataUri);
    $decodedImage = base64_decode($base64);
    if (false === $decodedImage) {
        echo '{"error":"invalid image data"}';
        exit();
    }
    
    $username = $tokenPayload['username'];
    validateUsername($username);

    writeImage($username, $saveName, $id, $isSource, $decodedImage);

    echo json_encode(array('success' => true));

    // binary data to ${id}.png in save directory
    function writeImage($username, $saveName, $id, $isSource, $binaryData) {
        $userSaveDir = join_paths('../usersave', $userName);
        if (!file_exists($userSaveDir)) {
            mkdir($userSaveDir, 0777, true);
        }
        
        $editionFolder = join_paths($userSaveDir, $saveName);
        if (!file_exists($editionFolder)) {
            $success = mkdir($editionFolder, 0777, true);
            if (!$success) {
                echo json_encode(array('error' =>"could not make directory for '$saveName'"));
                exit();
            }
        }

        $suffix = $isSource ? '.src.png' : '.png';
        
        $path = join_paths($editionFolder, $id.$suffix);

        try {
            file_put_contents($path, $binaryData);
        } catch (Exception $e) {
            echo json_encode(array('error' =>"error writing file '$saveName'"));
            exit();
        }
    }
?>
