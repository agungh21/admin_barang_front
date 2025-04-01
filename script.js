// const API_URL = "http://localhost:3000/barang";
const API_URL = "https://admin-barang.vercel.app/barang";
let barangData = [];
let cart = [];

// Load barang dari server
async function loadBarang() {
    const response = await fetch(API_URL);
    barangData = await response.json();
    tampilkanBarang(barangData);
}

function tampilkanBarang(data) {
    const tbody = document.getElementById("barangList");
    tbody.innerHTML = "";

    data.forEach(item => {
        const row = `<tr>
            <td>
            <button class="btn btn-warning btn-sm" onclick="tampilForm('${item.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm" onclick="hapusBarang('${item.id}')"><i class="fas fa-trash"></i></button>
            </td>
            <td>${item.nama}</td>
            <td>${item.harga.toLocaleString()}</td>
            <td><button class="btn btn-success btn-sm" onclick="tambahKeKeranjang('${item.id}')"><i class="fas fa-plus"></i></button></td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Inisialisasi DataTable dengan opsi pageLength 3
    $("#barangTable").DataTable({
        "pageLength": 10,
        "lengthChange": false,
        "language": {
            "search": "Cari Barang:" // Mengubah teks default "Search:" menjadi "Cari Barang:"
        },
        "dom": '<"top"f>rt<"bottom"p><"clear">' // Mengatur agar hanya search box di atas
    });
}

// Pencarian barang
function cariBarang() {
    const keyword = document.getElementById("searchBarang").value.toLowerCase();
    const hasilFilter = barangData.filter(item => item.nama.toLowerCase().includes(keyword));
    tampilkanBarang(hasilFilter);
}

// Menambahkan barang ke keranjang
function tambahKeKeranjang(id) {
    const barang = barangData.find(item => item.id === id);
    if (!barang) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.jumlah += 1;
    } else {
        cart.push({ ...barang, jumlah: 1 });
    }
    hitungKembalian();
    tampilkanKeranjang();
}

// Menampilkan keranjang belanja
function tampilkanKeranjang() {
    const tbody = document.getElementById("cartList");
    tbody.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.harga * item.jumlah;
        total += subtotal;

        const row = `<tr>
            <td>${item.nama}</td>
            <td>${item.harga.toLocaleString()}</td>
            <td><input type="number" min="1" value="${item.jumlah}" class="form-control" 
                onchange="ubahJumlah(${index}, this.value)"></td>
            <td>${subtotal.toLocaleString()}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="hapusDariKeranjang(${index})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });

    document.getElementById("totalHarga").textContent = total.toLocaleString();
}

// Mengubah jumlah barang di keranjang
function ubahJumlah(index, jumlah) {
    cart[index].jumlah = parseInt(jumlah) || 1;
    tampilkanKeranjang();
}

// Menghapus barang dari keranjang
function hapusDariKeranjang(index) {
    cart.splice(index, 1);
    tampilkanKeranjang();
}

// Menghitung kembalian
function hitungKembalian() {
    // Ambil nilai total harga & bersihkan format angka
    const totalHargaText = document.getElementById("totalHarga").textContent.replace(/[^\d]/g, ""); // Hapus semua kecuali angka
    const totalHarga = parseInt(totalHargaText, 10) || 0;

    // Ambil nilai uang bayar & pastikan angka valid
    const uangBayarText = document.getElementById("uangBayar").value.replace(/[^\d]/g, ""); // Hapus karakter selain angka
    const uangBayar = parseInt(uangBayarText, 10) || 0;

    // Hitung kembalian
    const kembalian = uangBayar - totalHarga;

    // Tampilkan hasil
    document.getElementById("kembalian").textContent = 
        kembalian >= 0 ? kembalian.toLocaleString() : "Kurang!";
}

// Menampilkan form untuk tambah/edit barang
function tampilForm(id = null) {
    const form = document.getElementById("formBarang");
    if (!form) return;

    form.classList.remove("d-none");

    const inputId = document.getElementById("editId");
    const inputNama = document.getElementById("namaBarang");
    const inputHarga = document.getElementById("hargaBarang");

    if (!inputId || !inputNama || !inputHarga) {
        console.error("Elemen form tidak ditemukan!");
        return;
    }

    if (id) {
        const barang = barangData.find(item => item.id === id);
        if (!barang) return;

        inputId.value = barang.id;
        inputNama.value = barang.nama;
        inputHarga.value = barang.harga;
    } else {
        inputId.value = "";
        inputNama.value = "";
        inputHarga.value = "";
    }
}


// Simpan barang (Tambah/Edit)
async function simpanBarang() {
    const inputId = document.getElementById("editId");
    const inputNama = document.getElementById("namaBarang");
    const inputHarga = document.getElementById("hargaBarang");

    if (!inputId || !inputNama || !inputHarga) {
        console.error("Elemen input tidak ditemukan!");
        return;
    }

    const id = inputId.value;
    const nama = inputNama.value.trim();
    const harga = Number(inputHarga.value.trim());

    if (!nama || !harga) {
        alert("Nama dan harga harus diisi!");
        return;
    }

    const payload = {id, nama, harga };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            payload.id = Date.now().toString();
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            // sembunyikanForm();
            window.location.reload();
        } else {
            throw new Error("Gagal menyimpan data");
        }
    } catch (error) {
        console.error("Error menyimpan barang:", error);
        alert("Terjadi kesalahan saat menyimpan barang!");
    }
}

function sembunyikanForm() {
    const form = document.getElementById("formBarang");
    if (form) {
        form.classList.add("d-none");
    }
}

// Fungsi untuk menghapus barang
async function hapusBarang(id) {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        try {
            const response = await fetch(API_URL, {  // Kirim tanpa ID di URL
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }) // Kirim ID dalam body
            });

            if (!response.ok) {
                throw new Error(`Gagal menghapus barang: ${response.statusText}`);
            }
            
            alert('Barang berhasil dihapus');
            loadBarang(); 
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghapus barang');
        }
    }
}

function tambahUang(nominal) {
    let uangBayar = document.getElementById("uangBayar");
    let nilaiSekarang = parseInt(uangBayar.value) || 0;
    uangBayar.value = nilaiSekarang + nominal;
    hitungKembalian();
}

function resetUangBayar(){
    let uangBayar = document.getElementById("uangBayar");
    uangBayar.value = 0;
    hitungKembalian();
}

function filterKategori(kategori) {
    var table = $('#barangTable').DataTable();
    table.column(1).search(kategori).draw();
}

function resetFilter() {
    var table = $('#barangTable').DataTable();
    table.column(1).search('').draw();
}

function printShoppingCalculator() {
    var printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Shopping Calculator</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Courier, monospace; font-size: 10px; width: 250px; margin: 0; padding: 10px; }');
    printWindow.document.write('table { width: 100%; border: none; margin-bottom: 10px; font-size: 10px; }');
    printWindow.document.write('th, td { text-align: left; padding: 5px 0.5px; }');
    printWindow.document.write('th { font-weight: bold; }');
    printWindow.document.write('.text-end { text-align: right; }');
    printWindow.document.write('.text-center { text-align: center; }');
    printWindow.document.write('.text-danger { color: red; font-weight: bold; }');
    printWindow.document.write('.text-success { color: green; font-weight: bold; }');
    printWindow.document.write('.text-primary { color: blue; font-weight: bold; }');
    printWindow.document.write('.bg-success { background-color: #28a745; color: white; }');
    printWindow.document.write('hr { border-top: 1px dashed #000; margin: 5px 0; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    
    // Title/Store Name
    printWindow.document.write('<h3 class="text-center">Toko Emoh</h3>');
    printWindow.document.write('<h3 class="text-center">Jl. Bandorasa-Linggarjati Desa Bandorasawetan</h3>');
    printWindow.document.write('<hr>');
    
     // Table
    printWindow.document.write('<table>');
    printWindow.document.write('<thead>');
    printWindow.document.write('<tr><th>Nama</th><th class="text-end">Hrg</th><th class="text-end">Jml<th class="text-end">Subtotal</th></tr>');
    printWindow.document.write('</thead>');
    printWindow.document.write('<tbody>');
    
    var totalBelanja = 0; // Initialize total
    var cartItems = document.getElementById('cartList').getElementsByTagName('tr');
    for (var i = 0; i < cartItems.length; i++) {
        var row = cartItems[i];
        var harga = parseFloat(row.cells[1].innerText.replace(/[^0-9.-]+/g, ""));
        
        // Get the quantity from the input field
        var jumlah = parseInt(row.cells[2].querySelector('input').value) || 0;  // Default to 0 if empty or invalid
        
        var subtotal = harga * jumlah;

        totalBelanja += subtotal; // Add subtotal to total
        
        printWindow.document.write('<tr>');
        printWindow.document.write('<td>' + row.cells[0].innerText + '</td>');
        printWindow.document.write('<td class="text-end">' + harga.toLocaleString() + '</td>');
        printWindow.document.write('<td class="text-end">' + jumlah + '</td>');
        printWindow.document.write('<td class="text-end">' + subtotal.toLocaleString() + '</td>');
        printWindow.document.write('</tr>');
    }

    printWindow.document.write('</tbody>');
    printWindow.document.write('</table>');

    // Total Section
    printWindow.document.write('<hr>');
    
    // Assuming you have input fields or variables for 'uangBayar' and 'kembalian'
    var uangBayar = parseInt(document.getElementById('uangBayar').value) || 0;
    var kembalian = uangBayar - totalBelanja;

    printWindow.document.write('<div class="text-end text-dark">Total Belanja: ' + totalBelanja.toLocaleString() + '</div>');
    printWindow.document.write('<div class="text-end text-dark">Kembalian: ' + kembalian.toLocaleString() + '</div>');
    printWindow.document.write('<div class="text-end text-dark">Uang Bayar: ' + uangBayar.toLocaleString() + '</div>');

    printWindow.document.write('<hr>');
    printWindow.document.write('<div class="text-center">Terima Kasih</div>');
    printWindow.document.write('<div class="text-center">Selamat Belanja Kembali!</div>');
    // Get current date and time in Indonesian format
    var now = new Date();
    var tanggal = now.toLocaleString('id-ID', {
        weekday: 'long', // Day of the week (e.g., "Senin")
        year: 'numeric', // Year (e.g., "2025")
        month: 'long', // Month (e.g., "Januari")
        day: 'numeric', // Day (e.g., "1")
        hour: '2-digit', // Hour (e.g., "10")
        minute: '2-digit', // Minute (e.g., "10")
        second: '2-digit', // Second (e.g., "00")
    });
    tanggal = tanggal.replace('pukul', '').trim();
    
    printWindow.document.write('<div class="text-center">'+ tanggal + '</div>');
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.print();
}

function downloadShoppingCalculatorV1() {
    
    // Create a new instance of jsPDF with custom page size (58mm x 297mm for thermal paper)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', [58, 297]); // Portrait mode, 58mm x 297mm page size

    // Set the font and size for thermal printer
    doc.setFontSize(6);  // Reduce font size for better readability on small paper

    $strip = '-';
    for (let index = 0; index < 180; index++) {
        $strip += '-';
    }

    // Title/Store Name
    doc.text('Toko Emoh', 29, 10, { align: 'center' });
    doc.text('Jl. Bandorasa-Linggarjati', 29, 14, { align: 'center' });
    doc.text('Desa Bandorasawetan', 29, 18, { align: 'center' });
    doc.text($strip, 0, 22, { align: 'center' });

    // Table headers
    doc.text('Nama', 8, 26);
    doc.text('Harga', 34, 26, { align: 'right' });
    doc.text('Jml', 40, 26, { align: 'right' });
    doc.text('Subtotal', 50, 26, { align: 'right' });

    doc.text($strip, 0, 30, { align: 'center' });

    var totalBelanja = 0; // Initialize total
    var cartItems = document.getElementById('cartList').getElementsByTagName('tr');
    var yPosition = 34; // Initial position for the items in the table

    for (var i = 0; i < cartItems.length; i++) {
        var row = cartItems[i];
        var harga = parseFloat(row.cells[1].innerText.replace(/[^0-9.-]+/g, ""));
        
        // Get the quantity from the input field
        var jumlah = parseInt(row.cells[2].querySelector('input').value) || 0;  // Default to 0 if empty or invalid
        
        var subtotal = harga * jumlah;

        totalBelanja += subtotal; // Add subtotal to total

        // Adding row data to the PDF
        doc.text(row.cells[0].innerText, 8, yPosition);
        doc.text(harga.toLocaleString(), 34, yPosition, { align: 'right' });
        doc.text(jumlah.toString(), 40, yPosition, { align: 'right' });
        doc.text(subtotal.toLocaleString(), 50, yPosition, { align: 'right' });

        yPosition += 4; // Move to the next line
    }

    doc.text($strip, 0, yPosition, { align: 'center' });

    // Total Section
    var uangBayar = parseInt(document.getElementById('uangBayar').value) || 0;
    var kembalian = uangBayar - totalBelanja;

    yPosition += 4;
    doc.text('Total Belanja: ' + totalBelanja.toLocaleString(), 50, yPosition, { align: 'right' });
    yPosition += 4;
    doc.text('Uang Bayar: ' + uangBayar.toLocaleString(), 50, yPosition, { align: 'right' });
    yPosition += 4;
    doc.text('Kembalian: ' + kembalian.toLocaleString(), 50, yPosition, { align: 'right' });

    doc.text($strip, 0, yPosition+4, { align: 'center' });

    // Footer
    yPosition += 8;
    doc.text('Terima Kasih', 29, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text('Selamat Belanja Kembali!', 29, yPosition, { align: 'center' });

    // Get current date and time in Indonesian format
    var now = new Date();
    var tanggal = now.toLocaleString('id-ID', {
        weekday: 'long', // Day of the week (e.g., "Senin")
        year: 'numeric', // Year (e.g., "2025")
        month: 'long', // Month (e.g., "Januari")
        day: 'numeric', // Day (e.g., "1")
        hour: '2-digit', // Hour (e.g., "10")
        minute: '2-digit', // Minute (e.g., "10")
        second: '2-digit', // Second (e.g., "00")
    });
    tanggal = tanggal.replace('pukul', '').trim();
    doc.text(tanggal, 29, yPosition + 4, { align: 'center' });

    // Trigger PDF download
    doc.save('struk_belanja.pdf');
}

function downloadShoppingCalculator() {
    // Pastikan jsPDF dan autoTable tersedia
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', [58, 297]); // Mode Potrait, 58mm x 297mm (thermal paper)
    
    // Set ukuran font untuk thermal printer
    doc.setFontSize(6);

    $strip = '-';
    for (let index = 0; index < 180; index++) {
        $strip += '-';
    }

    // Header Toko
    doc.text('Toko Emoh', 29, 10, { align: 'center' });
    doc.text('Jl. Bandorasa-Linggarjati', 29, 14, { align: 'center' });
    doc.text('Desa Bandorasawetan', 29, 18, { align: 'center' });

    // Garis pemisah
    doc.text($strip, 0, 22);

    // Ambil data dari tabel HTML (id="cartList")
    var cartItems = document.getElementById('cartList').getElementsByTagName('tr');
    var totalBelanja = 0;
    var data = []; // Array untuk tabel PDF

    for (var i = 0; i < cartItems.length; i++) {
        var row = cartItems[i];
        var nama = row.cells[0].innerText;
        var harga = parseFloat(row.cells[1].innerText.replace(/[^0-9.-]+/g, ""));
        var jumlah = parseInt(row.cells[2].querySelector('input').value) || 0;
        var subtotal = harga * jumlah;

        totalBelanja += subtotal;

        data.push([nama, harga.toLocaleString(), jumlah, subtotal.toLocaleString()]);
    }

    // Tabel daftar belanja
    doc.autoTable({
        startY: 26, // Mulai di posisi Y: 26mm
        margin: { left: 4, right: 4 }, // Mulai dari X = 4mm
        head: [['Nama', 'Harga', 'Jml', 'Subtotal']],
        body: data,
        theme: 'plain', // Hapus warna latar belakang
        styles: { fontSize: 6, cellPadding: 1, fillColor: false }, // Hilangkan background
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });

    // Posisi setelah tabel
    var finalY = doc.lastAutoTable.finalY + 4;

    // Garis pemisah
    doc.text($strip, 0, finalY);

    // Ambil nilai uang bayar
    var uangBayar = parseInt(document.getElementById('uangBayar').value) || 0;
    var kembalian = uangBayar - totalBelanja;

    // Total belanja, uang bayar, dan kembalian
    finalY += 4;
    doc.text(`Total Belanja : ${totalBelanja.toLocaleString()}`, 53, finalY, { align: 'right' });
    finalY += 4;
    doc.text(`Uang Bayar    : ${uangBayar.toLocaleString()}`, 53, finalY, { align: 'right' });
    finalY += 4;
    doc.text(`Kembalian     : ${kembalian.toLocaleString()}`, 53, finalY, { align: 'right' });

    // Garis pemisah lagi
    doc.text($strip, 0, finalY + 4);

    // Footer
    finalY += 8;
    doc.text('Terima Kasih', 29, finalY, { align: 'center' });
    finalY += 4;
    doc.text('Selamat Belanja Kembali!', 29, finalY, { align: 'center' });

    // Tanggal & Waktu Cetak
    var now = new Date();
    var tanggal = now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace('pukul', '').trim();

    doc.text(tanggal, 29, finalY + 6, { align: 'center' });

    // Download PDF
    doc.save('struk_belanja.pdf');
}


// Load barang saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadBarang);
