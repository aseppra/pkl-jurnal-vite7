<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Presensi PKL - {{ $siswa->name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 17.5mm 10mm 17.5mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 9pt;
            color: #1a1a1a;
            padding: 3mm;
        }

        /* === KOP / HEADER === */
        .kop {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }
        .kop h1 {
            font-size: 12pt;
            font-weight: bold;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 1px;
        }
        .kop p {
            font-size: 9pt;
            color: #555;
        }

        /* === IDENTITAS SISWA === */
        .identitas {
            margin-bottom: 6px;
        }
        .identitas table {
            width: 100%;
            border-collapse: collapse;
        }
        .identitas td {
            padding: 1px 0;
            font-size: 9pt;
            vertical-align: top;
        }
        .identitas td.label {
            width: 90px;
            font-weight: bold;
        }
        .identitas td.sep {
            width: 10px;
            text-align: center;
        }
        .identitas td.value {
        }

        /* === TABEL DATA === */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .data-table th {
            background-color: #2d3748;
            color: #fff;
            font-size: 8pt;
            font-weight: bold;
            text-align: center;
            padding: 3px 3px;
            border: 0.5px solid #2d3748;
        }
        .data-table td {
            font-size: 8pt;
            padding: 2px 4px;
            border: 0.5px solid #ccc;
            vertical-align: middle;
        }
        .data-table tr:nth-child(even) {
            background-color: #f7f7f7;
        }
        .data-table .col-no { text-align: center; width: 25px; }
        .data-table .col-tanggal { width: 85px; }
        .data-table .col-jam { text-align: center; width: 50px; }
        .data-table .col-status { text-align: center; width: 60px; }
        .data-table .col-ket { width: auto; }

        /* status badges */
        .badge { padding: 1px 4px; border-radius: 2px; font-size: 7pt; font-weight: bold; text-transform: uppercase; }
        .badge-hadir { background: #c6f6d5; color: #22543d; }
        .badge-terlambat { background: #feebc8; color: #7b341e; }
        .badge-izin { background: #bee3f8; color: #2a4365; }
        .badge-sakit { background: #fefcbf; color: #744210; }
        .badge-alpa, .badge-alpha { background: #fed7d7; color: #742a2a; }

        /* === RINGKASAN === */
        .ringkasan {
            border: 1px solid #ccc;
            padding: 5px 8px;
            margin-bottom: 8px;
            background: #f9f9f9;
        }
        .ringkasan h4 {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .ringkasan-grid {
            display: inline;
        }
        .ringkasan-item {
            display: inline;
            font-size: 8pt;
            margin-right: 12px;
        }
        .ringkasan-item strong {
            font-size: 9pt;
        }

        /* === FOOTER === */
        .footer {
            margin-top: 8px;
        }
        .footer table {
            width: 100%;
            border-collapse: collapse;
        }
        .footer td {
            vertical-align: top;
            font-size: 8pt;
        }
        .ttd {
            text-align: center;
        }
        .signature-wrapper {
            height: 60px; 
            margin-top: 10px;
            margin-bottom: -20px; /* Tarik garis agar TTD menempel/menumpuk */
            display: block;
        }
        .signature-image {
            max-height: 60px;
            max-width: 180px;
            display: inline-block;
        }
        .ttd .line {
            border-bottom: 1px solid #333;
            width: 160px;
            display: inline-block;
            margin-top: 0;
        }
    </style>
</head>
<body>
    {{-- KOP --}}
    <div class="kop">
        <h1>REKAP PRESENSI</h1>
        <h1>PRAKTEK KERJA LAPANGAN</h1>
        <p>SMK NEGERI 2 SRAGEN</p>
    </div>

    {{-- IDENTITAS --}}
    <div class="identitas">
        <table>
            <tr>
                <td class="label">Nama</td>
                <td class="sep">:</td>
                <td class="value"><strong>{{ $siswa->name }}</strong></td>
                <td class="label" style="padding-left:20px;">Kelas</td>
                <td class="sep">:</td>
                <td class="value">{{ $siswa->class }}</td>
            </tr>
            <tr>
                <td class="label">NISN</td>
                <td class="sep">:</td>
                <td class="value">{{ $siswa->nisn }}</td>
                <td class="label" style="padding-left:20px;">Pembimbing</td>
                <td class="sep">:</td>
                <td class="value">{{ $siswa->pembimbing->name ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Tempat PKL</td>
                <td class="sep">:</td>
                <td class="value">{{ $siswa->dudi->name ?? '-' }}</td>
                <td class="label" style="padding-left:20px;">Periode</td>
                <td class="sep">:</td>
                <td class="value">{{ \Carbon\Carbon::parse($startDate)->translatedFormat('d M Y') }} — {{ \Carbon\Carbon::parse($endDate)->translatedFormat('d M Y') }}</td>
            </tr>
        </table>
    </div>

    {{-- TABEL PRESENSI --}}
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-no">No</th>
                <th class="col-tanggal">Tanggal</th>
                <th class="col-jam">Masuk</th>
                <th class="col-jam">Pulang</th>
                <th class="col-status">Status</th>
                <th class="col-ket">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($attendances as $i => $att)
            <tr>
                <td class="col-no">{{ $i + 1 }}</td>
                <td class="col-tanggal">{{ $att->date->translatedFormat('D, d M Y') }}</td>
                <td class="col-jam">{{ $att->check_in ? substr($att->check_in, 0, 5) : '-' }}</td>
                <td class="col-jam">{{ $att->check_out ? substr($att->check_out, 0, 5) : '-' }}</td>
                <td class="col-status">
                    @php
                        $displayStatus = strtolower($att->status) === 'terlambat' ? 'hadir' : strtolower($att->status);
                    @endphp
                    <span class="badge badge-{{ $displayStatus }}">{{ ucfirst($displayStatus) }}</span>
                </td>
                <td class="col-ket">{{ $att->reason ?? ($att->notes ?? '') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align:center; padding:12px; color:#999;">Tidak ada data presensi pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    {{-- RINGKASAN --}}
    <div class="ringkasan">
        <h4>Ringkasan Kehadiran</h4>
        <div class="ringkasan-grid">
            <span class="ringkasan-item">Hadir: <strong>{{ $stats['hadir'] }}</strong></span>
            <span class="ringkasan-item">Izin: <strong>{{ $stats['izin'] }}</strong></span>
            <span class="ringkasan-item">Sakit: <strong>{{ $stats['sakit'] }}</strong></span>
            <span class="ringkasan-item">Alpha: <strong>{{ $stats['alpha'] }}</strong></span>
            <span class="ringkasan-item" style="margin-left:8px; border-left:1px solid #999; padding-left:12px;">Total Hari: <strong>{{ $attendances->count() }}</strong></span>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        <table>
            <tr>
                <td style="width:50%;">
                    <div class="ttd">
                        <div>&nbsp;</div>
                        <div style="font-size:7pt">Pembimbing PKL</div>
                        <div class="signature-wrapper">
                            {{-- Space for manual signature --}}
                        </div>
                        <div class="line"></div>
                        <div style="margin-top:2px;"><strong>{{ $siswa->pembimbing->name ?? '.........................' }}</strong></div>
                        <div style="font-size: 7pt;">NIP. {{ $siswa->pembimbing->nip ?? '.........................' }}</div>
                    </div>
                </td>
                <td style="width:50%;">
                    <div class="ttd">
                        <div>Mengetahui,</div>
                        <div style="font-size:7pt">Kepala SMK Negeri 2 Sragen</div>
                        <div class="signature-wrapper">
                            @if(!empty($coordinator_signature))
                                <img src="{{ $coordinator_signature }}" class="signature-image">
                            @endif
                        </div>
                        <div class="line"></div>
                        <div style="margin-top:2px;"><strong>{{ $coordinator_name ?: '(.........................)' }}</strong></div>
                        <div style="font-size: 7pt;">NIP. {{ $coordinator_nip ?: '.........................' }}</div>
                    </div>
                </td>
            </tr>
        </table>
        <i style="font-size:6pt; color:#888; margin-top: 10px;">Dicetak pada: {{ now()->translatedFormat('d F Y, H:i') }} WIB</i>
    </div>
</body>
</html>
