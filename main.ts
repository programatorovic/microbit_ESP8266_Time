// Importovanie potrebných knižníc
//% color=#0fbc11 icon="\uf1eb"
//% block="ESP8266 Time Extension"
namespace ESP8266TimeExtension {

    // Connect 8266 Block
    //% block="Connect 8266 Tx %tx Rx %rx SSID %ssid KEY %key"
    export function connect8266(tx: SerialPin, rx: SerialPin, ssid: string, key: string): number {
        // Inicializácia ESP8266
        ESP8266_IoT.initwifi(tx, rx);
        // Pripojenie k WiFi
        let connected = ESP8266_IoT.connectwifi(ssid, key);
        return connected ? 1 : 0;
    }

    // Connected Block
    //% block="Connected"
    export function isConnected(): number {
        return ESP8266_IoT.isconnected() ? 1 : 0;
    }

    // GetTime Block
    //% block="GetTime Rok %year Mesiac %month Den %day Hodina %hour Minuta %minute Sekunda %second UTC %utc"
    export function getTime(year: number, month: number, day: number, hour: number, minute: number, second: number, utc: number): void {
        // Získanie času z NTP servera
        let time = ESP8266_IoT.getntptime(utc);
        // Nastavenie premenných
        year = time.year;
        month = time.month;
        day = time.day;
        hour = time.hour;
        minute = time.minute;
        second = time.second;
    }
}
