// const API_URL = "http://localhost:3000/barang";
const API_URL = "https://admin-barang.vercel.app/";
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
            <td>${item.stok}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="tambahKeKeranjang('${item.id}')">Pilih</button>
                <button class="btn btn-warning btn-sm" onclick="editBarang('${item.id}')">Edit</button>
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
    const totalHarga = parseInt(document.getElementById("totalHarga").textContent.replace(/,/g, "")) || 0;
    const uangBayar = parseInt(document.getElementById("uangBayar").value) || 0;
    const kembalian = uangBayar - totalHarga;

    document.getElementById("kembalian").textContent = kembalian >= 0 ? kembalian.toLocaleString() : "Kurang!";
}

// Menampilkan form untuk tambah/edit barang
function tampilForm(id = null) {
    const form = document.getElementById("formBarang");
    form.classList.remove("d-none");

    if (id) {
        document.getElementById("formTitle").textContent = "Edit Barang";
        const barang = barangData.find(item => item.id === id);
        if (!barang) return;
        
        document.getElementById("editId").value = barang.id;
        document.getElementById("namaBarang").value = barang.nama;
        document.getElementById("hargaBarang").value = barang.harga;
        document.getElementById("stokBarang").value = barang.stok;
    } else {
        document.getElementById("formTitle").textContent = "Tambah Barang";
        document.getElementById("editId").value = "";
        document.getElementById("namaBarang").value = "";
        document.getElementById("hargaBarang").value = "";
        document.getElementById("stokBarang").value = "";
    }
}

// Menyembunyikan form
function sembunyikanForm() {
    document.getElementById("formBarang").classList.add("d-none");
}

// Simpan barang (Tambah/Edit)
async function simpanBarang() {
    const id = document.getElementById("editId").value;
    const nama = document.getElementById("namaBarang").value;
    const harga = document.getElementById("hargaBarang").value;
    const stok = document.getElementById("stokBarang").value;

    if (!nama || !harga || !stok) {
        alert("Semua field harus diisi!");
        return;
    }

    const payload = { nama, harga: Number(harga), stok: Number(stok) };

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
    }
}

// Edit barang
function editBarang(id) {
    tampilForm(id);
}

// Hapus barang
async function hapusBarang(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadBarang();
}

// Load barang saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadBarang);
