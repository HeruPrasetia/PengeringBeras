import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const host = "http://192.168.1.3/";

export function Pesan2(Pesan, Judul = "", Jenis = "success", Position = "top") {
    Toast.show({
        type: Jenis,
        text1: Judul,
        text2: Pesan,
        position: Position
    });
}

export function Pesan(Pesan, Judul = "", Jenis = "success") {
    Alert.alert(Judul, Pesan);
}

export const formatTanggal = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';

    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
};

export const tanggalIndo = function (data, time = false) {
    let d = new Date(data);
    if (isNaN(d.getTime())) return '';

    let year = d.getFullYear();
    let month = ('0' + (d.getMonth() + 1)).slice(-2);
    let day = ('0' + d.getDate()).slice(-2);

    let hasil = [year, month, day].join('-');
    if (hasil === "0000-00-00" || hasil == null) return hasil;

    const BulanIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    let tgl = hasil.substring(8, 10);
    let bln = hasil.substring(5, 7);
    let thn = hasil.substring(2, 4);

    let result = `${tgl} ${BulanIndo[parseInt(bln, 10) - 1]} ${thn}`;

    if (time === true) {
        let jam = ('0' + d.getHours()).slice(-2);
        let menit = ('0' + d.getMinutes()).slice(-2);
        let detik = ('0' + d.getSeconds()).slice(-2);
        result += ` ${jam}:${menit}:${detik}`;
    }

    return result;
};

export const numberFormat = function (ini) {
    var formatter = new Intl.NumberFormat("en-GB", { style: "decimal" });
    var nmr = 0;
    if (isNaN(ini)) {
        nmr = 0;
    } else {
        nmr = ini;
    }
    return formatter.format(nmr.toString().replace(/,/g, ""));
}

export const api = async function (url, data = {}, debug = false) {
    try {
        let Host = await AsyncStorage.getItem("host") || host;
        const response = await fetch(`${Host}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const hasil = await response.text();

        if (debug) console.log("API Response:", hasil);

        try {
            return JSON.parse(hasil);
        } catch (err) {
            return { status: "gagal", pesan: "Gagal Koneksi Device" };
        }

    } catch (e) {
        Pesan2("Terjadi Kesalahan", "Gagal menghubungi Device.", "error");
        console.log("API Error:", e);
        return { status: "gagal", pesan: e.message };
    }
};