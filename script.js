// const API_URL = "http://localhost:3000/barang";
const API_URL = "https://admin-barang.vercel.app/barang";
let barangData = [];
let cart = [];

// Load barang dari server
async function loadBarang() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Pastikan data dalam bentuk array
        barangData = Array.isArray(data) ? data : [data];
        tampilkanBarang(barangData);
    } catch (error) {
        console.error("Gagal memuat barang:", error);
    }
}

// Simpan barang (Tambah/Edit)
async function simpanBarang() {
    const id = document.getElementById("editId").value;
    const nama = document.getElementById("namaBarang").value.trim();
    const harga = Number(document.getElementById("hargaBarang").value.trim());
    const stok = 1;

    if (!nama || !harga) {
        alert("Semua field harus diisi!");
        return;
    }

    const payload = { id, nama, harga, stok };

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
        loadBarang();
    } catch (error) {
        console.error("Error menyimpan barang:", error);
        alert("Terjadi kesalahan saat menyimpan barang!");
    }
}

// Hapus barang
async function hapusBarang(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) {
            throw new Error("Gagal menghapus barang!");
        }
        loadBarang();
    } catch (error) {
        console.error("Error menghapus barang:", error);
        alert("Terjadi kesalahan saat menghapus barang!");
    }
}

// Load barang saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadBarang);
