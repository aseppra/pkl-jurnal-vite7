<?php
// Quick diagnostic script
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$total = \App\Models\Siswa::count();
$nullPembimbing = \App\Models\Siswa::whereNull('pembimbing_id')->count();
$hasPembimbing = \App\Models\Siswa::whereNotNull('pembimbing_id')->count();

echo "Total Siswa: $total\n";
echo "Has pembimbing_id: $hasPembimbing\n";
echo "NULL pembimbing_id: $nullPembimbing\n\n";

// Check pembimbing table
$totalPembimbing = \App\Models\Pembimbing::count();
echo "Total Pembimbing records: $totalPembimbing\n\n";

// Show pembimbing with dudi assignments
$pembimbings = \App\Models\Pembimbing::with('dudi')->get();
foreach ($pembimbings as $p) {
    $dudiName = $p->dudi ? $p->dudi->name : 'NO DUDI';
    $siswaCount = \App\Models\Siswa::where('pembimbing_id', $p->id)->count();
    echo "Pembimbing #{$p->id}: {$p->name} | DUDI: {$dudiName} | Siswa assigned: {$siswaCount}\n";
}

echo "\n--- Siswa with NULL pembimbing but HAS dudi ---\n";
$orphans = \App\Models\Siswa::whereNull('pembimbing_id')
    ->whereNotNull('dudi_id')
    ->with('dudi')
    ->limit(10)
    ->get();
foreach ($orphans as $s) {
    echo "Siswa #{$s->id}: {$s->name} | DUDI: " . ($s->dudi ? $s->dudi->name : 'NULL') . " | pembimbing_id: NULL\n";
}

// Check how DataPembimbing assigns pembimbing to siswa
echo "\n--- Sample Siswa with pembimbing loaded ---\n";
$samples = \App\Models\Siswa::with(['pembimbing', 'dudi'])->whereNotNull('dudi_id')->limit(10)->get();
foreach ($samples as $s) {
    $pName = $s->pembimbing ? $s->pembimbing->name : 'NULL';
    echo "Siswa #{$s->id}: {$s->name} | DUDI: " . ($s->dudi->name ?? 'N/A') . " | Pembimbing: {$pName} (id={$s->pembimbing_id})\n";
}
