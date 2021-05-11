<?php
    include('shared.php');
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
    function makeScript($saveData) {
        $scriptData = array();

        if (array_key_exists('meta', $saveData)){
            $inMeta = $saveData['meta'];
            $outMeta = array('id'=>'_meta');

            copyField($inMeta, 'name', $outMeta, 'name');
            copyField($inMeta, 'author', $outMeta, 'author');
            copyField($inMeta, 'logo', $outMeta, 'logo');

            $scriptData[] = &$outMeta;
        }

        $charactersById = array();

        if (array_key_exists('characterList', $saveData)){
            $characterList = $saveData['characterList'];
            foreach ($characterList as $inCharacter) {
                unset($outCharacter); // make sure it's a new variable each time through the loop, because we need to pass out references

                // skip if not supposed to be exported
                if (array_key_exists('export', $inCharacter)) {
                    if (!$inCharacter['export']) {continue;}
                }

                $outCharacter = array();
                if (array_key_exists('id', $inCharacter)) {
                    $id = $inCharacter['id'];
                    $outCharacter['id'] = $id;
                    $charactersById[$id] = &$outCharacter;
                }
                copyField($inCharacter, 'unStyledImage', $outCharacter, 'image');
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
                $charactersById[$id]['firstNight'] = $i + 1;
                $i = $i + 1;
            }
        }
        if (array_key_exists('otherNightOrder', $saveData)){
            $otherNightOrder = $saveData['otherNightOrder'];
            $i = 1;
            foreach ($otherNightOrder as $id) {
                $character = &$charactersById[$id];
                $character['otherNight'] = $i + 1;
                $i = $i + 1;
            }
        }

        return $scriptData;
    }

    // read save file
    $data = readEditionFile($saveName);
    $data = json_decode($data, true);

    // build script.json from it
    $script = makeScript($data);

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

    echo json_encode(array(
        'success' => true,
        'script'=>'https://www.bloodstar.xyz/p/'.$saveName.'/script.json',
        'almanac'=>'https://www.bloodstar.xyz/p/'.$saveName.'/almanac.html')
    );
?>