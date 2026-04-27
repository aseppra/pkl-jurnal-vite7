<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Setting;
use App\Models\Siswa;

echo "PKL Start: " . Setting::getValue('pkl_start') . "\n";
echo "PKL End: " . Setting::getValue('pkl_end') . "\n";

$siswa = Siswa::first();
if ($siswa) {
    echo "First Siswa: " . $siswa->name . " (ID: " . $siswa->id . ")\n";
}
