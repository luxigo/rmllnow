<?php

passthru("node rmllnow.js ?'".escapeshellarg($_SERVER['QUERY_STRING'])."'");

?>
