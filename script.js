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




// Load barang saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadBarang);
