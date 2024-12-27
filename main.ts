// Importovanie potrebných knižníc
//% color=#0fbc11 icon="\uf1eb"
//% block="ESP8266 Time Extension"
namespace ESP8266TimeExtension {

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
