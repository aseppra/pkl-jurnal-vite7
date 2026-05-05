<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Jurnal PKL - {{ $siswa->name }}</title>
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
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 0;
            line-height: 1.4;
        }
        .kop p {
            font-size: 9pt;
            color: #333;
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
            padding: 3px 3px;
            border: 0.5px solid #2d3748;
        }
        .data-table td {
            font-size: 8pt;
            padding: 2px 4px;
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
        }
        .signature-wrapper {
            height: 60px;
            margin-top: 10px;
            margin-bottom: -20px;
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
        <h1>REKAP JURNAL</h1>
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
