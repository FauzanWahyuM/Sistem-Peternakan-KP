export class StorageUtils {
    // Cek apakah localStorage tersedia
    static isLocalStorageAvailable(): boolean {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Mendapatkan ukuran data di localStorage (dalam KB)
    static getStorageSize(): number {
        if (!this.isLocalStorageAvailable()) return 0;

        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return Math.round(total / 1024 * 100) / 100; // KB dengan 2 desimal
    }

    // Mendapatkan semua keys yang ada di localStorage
    static getAllKeys(): string[] {
        if (!this.isLocalStorageAvailable()) return [];

        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) keys.push(key);
        }
        return keys;
    }

    // Backup semua data localStorage ke file JSON
    static exportAllData(): string {
        if (!this.isLocalStorageAvailable()) return '{}';

        const data: Record<string, string> = {};
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                data[key] = localStorage[key];
            }
        }
        return JSON.stringify(data, null, 2);
    }

    // Restore data dari backup
    static importAllData(jsonString: string): boolean {
        if (!this.isLocalStorageAvailable()) return false;

        try {
            const data = JSON.parse(jsonString);
            for (let key in data) {
                localStorage.setItem(key, data[key]);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Hapus semua data localStorage
    static clearAllData(): void {
        if (this.isLocalStorageAvailable()) {
            localStorage.clear();
        }
    }

    // Download file
    static downloadFile(content: string, filename: string, contentType: string = 'application/json'): void {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}