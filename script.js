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
            <td>${item.nama}</td>
            <td>Rp ${item.harga.toLocaleString()}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="tambahKeKeranjang('${item.id}')">Pilih</button><br>
                <button class="btn btn-warning btn-sm" onclick="editBarang('${item.id}')">Edit</button><br>
                <button class="btn btn-danger btn-sm" onclick="hapusBarang('${item.id}')">Hapus</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Inisialisasi DataTable setelah data dimuat
    $("#barangTable").DataTable();
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
            <td>Rp ${item.harga.toLocaleString()}</td>
            <td><input type="number" min="1" value="${item.jumlah}" class="form-control" 
                onchange="ubahJumlah(${index}, this.value)"></td>
            <td>Rp ${subtotal.toLocaleString()}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="hapusDariKeranjang(${index})">Hapus</button>
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
        document.getElementById("formTitle").textContent = "Edit Barang";
        const barang = barangData.find(item => item.id === id);
        if (!barang) return;

        inputId.value = barang.id;
        inputNama.value = barang.nama;
        inputHarga.value = barang.harga;
    } else {
        document.getElementById("formTitle").textContent = "Tambah Barang";
        inputId.value = "";
        inputNama.value = "";
        inputHarga.value = "";
    }
}


// Simpan barang (Tambah/Edit)
aasync function simpanBarang() {
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

    const payload = { nama, harga };

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
            sembunyikanForm();
            loadBarang();
        } else {
            throw new Error("Gagal menyimpan data");
        }
    } catch (error) {
        console.error("Error menyimpan barang:", error);
        alert("Terjadi kesalahan saat menyimpan barang!");
    }
}


// Load barang saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadBarang);
