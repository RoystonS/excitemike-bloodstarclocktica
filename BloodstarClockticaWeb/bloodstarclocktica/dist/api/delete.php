<?php
    header('Content-Type: application/json;');
    include('shared.php');
    requirePost();
    $request = getPayload();
    $token = requireField($request, 'token');
    $tokenPayload = verifySession($token);

    $username = $tokenPayload['username'];
    validateUsername($username);

    $saveName = requireField($request, 'saveName');
    validateFilename($saveName);
    
    deleteEdition($username, $saveName);

    echo('true');
    
    // remove an entire edition from the server
    function deleteEdition($username, $saveName) {
        $userSaveDir = join_paths('../usersave', $username);
        $editionFolder = join_paths($userSaveDir, $saveName);

        // edition save directory
        deleteDirectory($editionFolder);

        // publish directory
        deleteDirectory(join_paths('../p', $saveName));
    }

    // remove a directoy and files within from the server
    // NOTE: does not handle subdirectories yet, just files
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