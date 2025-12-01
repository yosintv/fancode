<?php

   if (!isset($_GET['url'])) {
       http_response_code(400);
       die('URL parameter is missing.');
   }

   $url = $_GET['url'];

   if (!filter_var($url, FILTER_VALIDATE_URL)) {
       http_response_code(400);
       die('Invalid URL.');
   }






   $ch = curl_init();
   curl_setopt($ch, CURLOPT_URL, $url);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
   curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
   $response = curl_exec($ch);
   $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
   curl_close($ch);

   if ($httpCode !== 200) {
       http_response_code($httpCode);
       die('Failed to fetch the content.');
   }




   
   if (strpos($url, '.m3u8') !== false) {
       $baseUrl = dirname($url) . '/';
       $response = preg_replace_callback('/(https?:\/\/[^\s]+|(?<=\n)[^#\n][^\s]+)/', function ($matches) use ($baseUrl) {
           $originalUrl = $matches[0];
           if (strpos($originalUrl, 'http') !== 0) {
               $originalUrl = $baseUrl . $originalUrl;
           }
           return "proxy.php?url=" . urlencode($originalUrl);
       }, $response);
   }

   header('Content-Type: application/vnd.apple.mpegurl');
   echo $response;
?>
