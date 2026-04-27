<?php 

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'], // 👈 IMPORTANT

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // 👈 IMPORTANT

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];