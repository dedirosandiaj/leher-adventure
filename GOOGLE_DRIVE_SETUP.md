# Setup Google Drive Private Key di Coolify

## Masalah
Error `DECODER routines::unsupported` terjadi karena format private key tidak valid.

## Solusi

### Cara 1: Format Single Line (RECOMMENDED untuk Coolify)

Di environment variables Coolify, masukkan `GOOGLE_PRIVATE_KEY` dalam **satu baris** dengan `\n` literal:

```
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(key content)...xyz\n-----END PRIVATE KEY-----\n
```

**PENTING:**
- Gunakan `\n` (backslash + n), BUKAN enter/newline asli
- Jangan gunakan quotes (tidak perlu '...' atau "...")
- Pastikan ada `\n` setelah `-----END PRIVATE KEY-----`

### Cara 2: Copy dari File JSON

1. Buka file JSON service account dari Google Cloud Console
2. Copy nilai `private_key` (termasuk BEGIN dan END)
3. Paste ke Coolify environment variable
4. Code akan otomatis formatting dengan benar

### Cara 3: Via File .env

Buat file `.env` di root project:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...(seluruh key di sini, bisa multiline)...
xyz123
-----END PRIVATE KEY-----
"
```

Lalu upload file `.env` ke Coolify.

## Verifikasi

Setelah deploy, cek logs di Coolify:

```
Google Drive credentials loaded: {
  private_key_exists: true,
  private_key_length: 1600,
  private_key_starts_correctly: true,
  private_key_ends_correctly: true
}
```

Jika semua `true`, berarti format sudah benar!

## Troubleshooting

### Error: DECODER routines::unsupported
- Pastikan ada `-----BEGIN PRIVATE KEY-----` di awal
- Pastikan ada `-----END PRIVATE KEY-----` di akhir
- Pastikan tidak ada spasi di tengah key
- Pastikan `\n` adalah literal backslash+n, bukan newline

### Error: Invalid Grant
- Pastikan private_key_id sesuai
- Pastikan client_email benar
- Pastikan service account punya akses ke Google Drive

### Error: Key too short/long
- Private key RSA harus sekitar 1600-1700 karakter
- Jika terlalu pendek, mungkin key terpotong
- Jika terlalu panjang, mungkin ada karakter tambahan

## Contoh Format yang BENAR:

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1+yJv4kXdNWaRLGjj3S5X3M5gQ7E2xZ8q3Rz4kVzHn...
-----END PRIVATE KEY-----

```

## Contoh Format yang SALAH:

❌ Tanpa BEGIN/END:
```
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
```

❌ Dengan newline asli (bukan \n literal):
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
-----END PRIVATE KEY-----
```

❌ Dengan quotes:
```
"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```
