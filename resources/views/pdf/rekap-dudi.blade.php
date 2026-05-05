<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekapitulasi Penempatan DUDI PKL</title>
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
            margin-bottom: 8px;
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

        /* === IDENTITAS & PERIODE === */
        .periode-info {
            margin-bottom: 8px;
            font-size: 9pt;
            font-weight: bold;
            text-align: center;
        }

        /* === TABEL DATA === */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .data-table th {
            background-color: #f2f2f2;
            font-size: 8pt;
            font-weight: bold;
            padding: 5px;
            border: 1px solid #000;
            text-align: center; /* Center headers */
        }
        .data-table td {
            font-size: 8pt;
            padding: 3px 4px;
            border: 1px solid #000;
            vertical-align: middle;
        }
        
        /* col widths */
        .col-no { width: 25px; text-align: center; }
        .col-dudi { width: 140px; }
        .col-siswa { width: 160px; }
        .col-gender { width: 30px; text-align: center; }
        .col-pembimbing { width: auto; }

        .list-items {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        .list-items li {
            margin-bottom: 4px;
            padding-bottom: 4px;
            border-bottom: 1px dashed #ccc;
        }
        .list-items li:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .dudi-title {
            font-weight: bold;
            font-size: 8pt;
            margin-bottom: 1px;
        }

        /* === FOOTER === */
        .footer {
            margin-top: 10px;
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
    </style>
</head>
<body>
    <div class="kop">
        <h1>PETA PENEMPATAN SISWA</h1>
        <h1>PRAKTEK KERJA LAPANGAN</h1>
        @if(!empty($major))
        <p>(Jurusan: {{ $major }})</p>
        @endif
        <p>SMK NEGERI 2 SRAGEN</p>
    </div>

    <div class="periode-info">
        Periode : {{ \Carbon\Carbon::parse($startDate)->translatedFormat('d F Y') }} — {{ \Carbon\Carbon::parse($endDate)->translatedFormat('d F Y') }}
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th class="col-no">No</th>
                <th class="col-dudi">Nama DUDI</th>
                <th class="col-siswa">Nama Siswa</th>
                <th class="col-gender">L/P</th>
                <th class="col-pembimbing">Pembimbing PKL</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dudis as $i => $dudi)
                @php
                    $siswas = $dudi->siswas;
                    $rowCount = $siswas->count() ?: 1;
                @endphp
                @foreach($siswas as $j => $siswa)
                <tr>
                    @if($j === 0)
                    <td class="col-no" rowspan="{{ $rowCount }}">{{ $i + 1 }}</td>
                    <td class="col-dudi" rowspan="{{ $rowCount }}">
                        <div class="dudi-title">{{ $dudi->name }}</div>
                        <div style="font-size: 7pt; color: #444;">{{ $dudi->address ?: '-' }}</div>
                    </td>
                    @endif
                    
                    <td class="col-siswa">
                        {{ $siswa->name }}
                    </td>
                    <td class="col-gender">
                        {{ strtoupper(substr($siswa->gender ?? '-', 0, 1)) }}
                    </td>

                    @if($j === 0)
                    <td class="col-pembimbing" rowspan="{{ $rowCount }}">
                        @foreach($dudi->pembimbings as $pembimbing)
                            <div style="font-weight: bold; margin-bottom: 2px;">{{ $pembimbing->name }}</div>
                            <div style="font-size: 7pt; color: #555;">NIP. {{ $pembimbing->nip ?: '-' }}</div>
                            @if(!$loop->last) <hr style="border: 0.1px solid #eee; margin: 3px 0;"> @endif
                        @endforeach
                    </td>
                    @endif
                </tr>
                @endforeach

                {{-- Jika tidak ada siswa --}}
                @if($siswas->count() === 0)
                <tr>
                    <td class="col-no">{{ $i + 1 }}</td>
                    <td class="col-dudi">
                        <div class="dudi-title">{{ $dudi->name }}</div>
                        <div style="font-size: 7pt; color: #444;">{{ $dudi->address ?: '-' }}</div>
                    </td>
                    <td class="col-siswa" colspan="2" style="text-align: center; color: #888; font-style: italic;">
                        Belum ada siswa
                    </td>
                    <td class="col-pembimbing">
                        @foreach($dudi->pembimbings as $pembimbing)
                            <div style="font-weight: bold;">{{ $pembimbing->name }}</div>
                            <div style="font-size: 7pt;">NIP. {{ $pembimbing->nip ?: '-' }}</div>
                        @endforeach
                    </td>
                </tr>
                @endif
            @empty
            <tr>
                <td colspan="5" style="text-align: center; padding: 10px;">Data tidak ditemukan</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <table>
            <tr>
                <td style="width:60%;">
                    <i style="font-size:8pt; color:#555;">Dokumen dibuat pada {{ now()->translatedFormat('d F Y, H:i') }} WIB</i>
                </td>
                <td style="width:40%;">
                    <div class="ttd">
                        <div>Mengetahui,</div>
                        <div style="font-size:8pt">Kepala SMK Negeri 2 Sragen</div>
                        <div class="signature-wrapper">
                            @if(!empty($coordinator_signature))
                                <img src="{{ $coordinator_signature }}" class="signature-image">
                            @endif
                        </div>
                        <div class="line"></div>
                        <div style="margin-top:4px;"><strong>{{ $coordinator_name ?: '(..........................................)' }}</strong></div>
                        <div style="font-size: 8pt;">NIP. {{ $coordinator_nip ?: '..........................................' }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
