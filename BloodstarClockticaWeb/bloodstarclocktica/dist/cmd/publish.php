<?php
    include('shared.php');
    include('almanac.php');
    requirePost();
    $data = getPayload();

    $saveName = requireField($data, 'saveName');

    // copy field if it is present
    function copyField($srcArray, $srcName, &$dstArray, $dstName) {
        if (array_key_exists($srcName, $srcArray)){
            $dstArray[$dstName] = $srcArray[$srcName];
        }
    }

    // build the script object to convert to json
    function makeScript($saveData, $saveName) {
        $scriptData = array();

        if (array_key_exists('meta', $saveData)){
            $inMeta = $saveData['meta'];
            $outMeta = array('id'=>'_meta');

            copyField($inMeta, 'name', $outMeta, 'name');
            copyField($inMeta, 'author', $outMeta, 'author');

            // edition logo
            if (array_key_exists('logo', $inMeta)){
                if (preg_match("/^data:$/", $inMeta['logo'])) {
                    $outMeta['logo'] = $inMeta['logo'];
                } else {
                    $outMeta['logo'] = 'https://www.bloodstar.xyz/p/'.$saveName.'/_meta.png';
                }
            }

            $scriptData[] = &$outMeta;
        }

        $charactersById = array();

        if (array_key_exists('characterList', $saveData)){
            $characterList = $saveData['characterList'];
            foreach ($characterList as $inCharacter) {
                unset($outCharacter); // make sure it's a new variable each time through the loop, because we need to pass out references

                $id = $inCharacter['id'];

                // skip if not supposed to be exported
                if (array_key_exists('export', $inCharacter)) {
                    if (!$inCharacter['export']) {continue;}
                }

                $outCharacter = array();
                if (array_key_exists('id', $inCharacter)) {
                    $outCharacter['id'] = $id;
                    $charactersById[$id] = &$outCharacter;
                }

                // copy image over to publish directory
                if (array_key_exists('styledImage', $inCharacter)) {
                    if (preg_match("/^data:$/", $inCharacter['styledImage'])) {
                        $outCharacter['image'] = $inCharacter['styledImage'];
                    } else {
                        $outCharacter['image'] = 'https://www.bloodstar.xyz/p/'.$saveName.'/'.$id.'.png';
                    }
                }

                copyField($inCharacter, 'edition', $outCharacter, 'edition');
                copyField($inCharacter, 'firstNightReminder', $outCharacter, 'firstNightReminder');
                copyField($inCharacter, 'otherNightReminder', $outCharacter, 'otherNightReminder');
                if (array_key_exists('characterReminderTokens', $inCharacter)){
                    $outCharacter['reminders'] = explode("\n", $inCharacter['characterReminderTokens']);
                }
                if (array_key_exists('globalReminderTokens', $inCharacter)){
                    $outCharacter['remindersGlobal'] = explode("\n", $inCharacter['globalReminderTokens']);
                }
                copyField($inCharacter, 'setup', $outCharacter, 'setup');
                copyField($inCharacter, 'name', $outCharacter, 'name');
                copyField($inCharacter, 'team', $outCharacter, 'team');
                copyField($inCharacter, 'ability', $outCharacter, 'ability');

                $scriptData[] = &$outCharacter;
            }
        }

        // night order
        if (array_key_exists('firstNightOrder', $saveData)){
            $firstNightOrder = $saveData['firstNightOrder'];
            $i = 1;
            foreach ($firstNightOrder as $id) {
                if (array_key_exists($id, $charactersById)) {
                    $character = &$charactersById[$id];
                    if (array_key_exists('firstNightReminder', $character) && $character['firstNightReminder']!=='') {
                        $character['firstNight'] = $i + 1;
                        $i = $i + 1;
                    }
                }
            }
        }
        if (array_key_exists('otherNightOrder', $saveData)){
            $otherNightOrder = $saveData['otherNightOrder'];
            $i = 1;
            foreach ($otherNightOrder as $id) {
                if (array_key_exists($id, $charactersById)) {
                    $character = &$charactersById[$id];
                    if (array_key_exists('otherNightReminder', $character) && $character['otherNightReminder']!=='') {
                        $character['otherNight'] = $i + 1;
                        $i = $i + 1;
                    }
                }
            }
        }

        return $scriptData;
    }

    // read save file
    $data = readEditionFile($saveName);
    $data = json_decode($data, true);

    // build script.json from it
    $script = makeScript($data, $saveName);

    // ensure directory exists
    $publishDir = join_paths('../p', $saveName);
    if (!file_exists($publishDir)) {
        mkdir($publishDir, 0777, true);
    }

    // write file
    $scriptJsonPath = join_paths($publishDir, 'script.json');
    $file = fopen($scriptJsonPath, 'w');
    if (!$file) {
        echo json_encode(array('error' =>"error writing file '$saveName'"));
        exit();
    }
    try {
        fwrite($file, json_encode($script));
    } catch (Exception $e) {
        echo json_encode(array('error' =>"error writing script.json"));
        exit();
    } finally {
        fclose($file);
    }

    // move images
    $editionFolder = join_paths($saveDir, $saveName);
    foreach ($script as $character) {
        global $saveDir;
        $id = $character['id'];
        $filename = $id.'.png';
        $sourcePath = join_paths($editionFolder, $filename);
        $destinationPath = join_paths($publishDir, $filename);
        if (is_file($sourcePath)) {
            if (!copy($sourcePath, $destinationPath)){
                echo json_encode(array('error' =>'error copying '.$sourcePath.' to '.$destinationPath));
                exit();
            }
        }
    }
    // edition logo
    {
        global $saveDir;
        $filename = '_meta.png';
        $sourcePath = join_paths($editionFolder, $filename);
        $destinationPath = join_paths($publishDir, $filename);
        if (is_file($sourcePath)) {
            if (!copy($sourcePath, $destinationPath)){
                echo json_encode(array('error' =>'error copying '.$sourcePath.' to '.$destinationPath));
                exit();
            }
        }
    }

    // almanac
    {
        $almanac = makeAlmanac($data, $saveName);
        $almanacPath = join_paths($publishDir, 'almanac.html');
        try {
            file_put_contents($almanacPath, $almanac);
        } catch (Exception $e) {
            echo json_encode(array('error' =>"error writing almanac.html"));
            exit();
        }
    }
    // TODO: look at edition data for a list of character ids(and add _meta). delete any old images that do not match one of those ids

    echo json_encode(array(
        'success' => true,
        'script'=>'https://www.bloodstar.xyz/p/'.$saveName.'/script.json',
        'almanac'=>'https://www.bloodstar.xyz/p/'.$saveName.'/almanac.html')
    );
?>