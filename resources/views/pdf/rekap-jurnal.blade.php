<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Jurnal PKL - {{ $siswa->name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0.3mm 0.3mm 0.4mm 0.3mm;
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
            font-size: 14pt;
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
            padding: 4px 3px;
            border: 0.5px solid #2d3748;
        }
        .data-table td {
            font-size: 8pt;
            padding: 3px 4px;
            border: 0.5px solid #ccc;
            vertical-align: top;
        }
        .data-table tr:nth-child(even) {
            background-color: #f7f7f7;
        }
        .data-table .col-no { text-align: center; width: 25px; }
        .data-table .col-tanggal { width: 85px; }
        .data-table .col-judul { width: 140px; }
        .data-table .col-desc { width: auto; }

        /* === RINGKASAN === */
        .ringkasan {
            border: 1px solid #ccc;
            padding: 5px 8px;
            margin-bottom: 8px;
            background: #f9f9f9;
            font-size: 8pt;
        }
        .ringkasan strong {
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
            padding-top: 4px;
        }
        .ttd .line {
            margin-top: 40px;
            border-bottom: 1px solid #333;
            width: 140px;
            display: inline-block;
        }

        /* truncate long text */
        .truncate-text {
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            line-height: 1.3;
        }
    </style>
</head>
<body>
    {{-- KOP --}}
    <div class="kop">
        <h1>Rekap Jurnal PKL</h1>
        <p>Praktik Kerja Lapangan (PKL)</p>
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

    {{-- TABEL JURNAL --}}
    <table class="data-table">
        <thead>
            <tr>
                <th class="col-no">No</th>
                <th class="col-tanggal">Tanggal</th>
                <th class="col-judul">Judul Kegiatan</th>
                <th class="col-desc">Deskripsi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($journals as $i => $journal)
            <tr>
                <td class="col-no">{{ $i + 1 }}</td>
                <td class="col-tanggal">{{ $journal->date->translatedFormat('D, d M Y') }}</td>
                <td class="col-judul">{{ $journal->title }}</td>
                <td class="col-desc">{{ \Illuminate\Support\Str::limit($journal->description, 120) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align:center; padding:12px; color:#999;">Tidak ada data jurnal pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    {{-- RINGKASAN --}}
    <div class="ringkasan">
        Total Jurnal: <strong>{{ $journals->count() }}</strong> entri pada periode {{ \Carbon\Carbon::parse($startDate)->translatedFormat('d M Y') }} — {{ \Carbon\Carbon::parse($endDate)->translatedFormat('d M Y') }}
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        <table>
            <tr>
                <td style="width:50%;">
                    <span style="font-size:7pt; color:#888;">Dicetak pada: {{ now()->translatedFormat('d F Y, H:i') }} WIB</span>
                </td>
                <td style="width:50%;">
                    <div class="ttd">
                        <div>Mengetahui,</div>
                        <div style="font-size:7pt; color:#666;">Pembimbing PKL</div>
                        <div class="line"></div>
                        <div style="margin-top:2px;">{{ $siswa->pembimbing->name ?? '.........................' }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
