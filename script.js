// const API_URL = "http://localhost:3000/barang";
const API_URL = "https://admin-barang.vercel.app/barang";
let barangData = [];
let cart = [];

// Load barang dari server
async function loadBarang() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Gagal memuat data: ${response.statusText}`);
        }
        barangData = await response.json();
        tampilkanBarang(barangData);
    } catch (error) {
        console.error("Error saat memuat barang:", error);
        alert("Gagal memuat data barang! Periksa koneksi atau server.");
    }
}

function tampilkanBarang(data) {
    const tbody = document.getElementById("barangList");
    tbody.innerHTML = "";

    if (!Array.isArray(data)) {
        console.error("Data barang bukan array!", data);
        return;
    }

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

    if ($.fn.DataTable.isDataTable("#barangTable")) {
        $("#barangTable").DataTable().destroy();
    }
    $("#barangTable").DataTable();
}

function tampilForm(id = null) {
    const form = document.getElementById("formBarang");
    if (!form) {
        console.error("Elemen form tidak ditemukan!");
        return;
    }
    form.classList.remove("d-none");

    if (id) {
        document.getElementById("formTitle").textContent = "Edit Barang";
        const barang = barangData.find(item => item.id === id);
        if (!barang) {
            console.error("Barang tidak ditemukan!");
            return;
        }

        document.getElementById("editId").value = barang.id || "";
        document.getElementById("namaBarang").value = barang.nama || "";
        document.getElementById("hargaBarang").value = barang.harga || "";
        document.getElementById("stokBarang").value = barang.stok || 1;
    } else {
        document.getElementById("formTitle").textContent = "Tambah Barang";
        document.getElementById("editId").value = "";
        document.getElementById("namaBarang").value = "";
        document.getElementById("hargaBarang").value = "";
        document.getElementById("stokBarang").value = 1;
    }
}

function sembunyikanForm() {
    document.getElementById("formBarang").classList.add("d-none");
}

async function simpanBarang() {
    const id = document.getElementById("editId").value.trim();
    const nama = document.getElementById("namaBarang").value.trim();
    const harga = document.getElementById("hargaBarang").value.trim();
    const stok = document.getElementById("stokBarang").value.trim();

    if (!nama || !harga || !stok) {
        alert("Semua field harus diisi!");
        return;
    }

    const payload = { nama, harga: Number(harga), stok: Number(stok) };

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

        if (!response.ok) {
            throw new Error("Gagal menyimpan barang!");
        }

        sembunyikanForm();
        await loadBarang();
    } catch (error) {
        console.error("Error menyimpan barang:", error);
        alert("Terjadi kesalahan saat menyimpan barang!");
    }
}

async function hapusBarang(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadBarang();
}

document.addEventListener("DOMContentLoaded", loadBarang);