// Importovanie potrebných knižníc
//% color=#0fbc11 icon="\uf1eb"
//% block="ESP8266 Time Extension"
namespace ESP8266TimeExtension {

    interface Time {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
    }

    // Funkcia na získanie času z NTP servera
    function getntptime(utc: number): Time {
        // Príkazy na komunikáciu s ESP8266 a získanie času z NTP servera
        // Toto je len príklad, skutočná implementácia bude závisieť od použitého NTP servera a formátu odpovede
        ESP8266_IoT.sendCommand("AT+CIPSTART=\"TCP\",\"pool.ntp.org\",123");
        ESP8266_IoT.sendCommand("AT+CIPSEND=48");
        ESP8266_IoT.sendCommand("BEEF");
        let response = ESP8266_IoT.receiveResponse();

        // Parsovanie odpovede a výpočet času
        let time: Time = {
            year: 2024,
            month: 12,
            day: 28,
            hour: 1,
            minute: 26,
            second: 23
        };
        // Prispôsobenie času podľa UTC
        time.hour += utc;
        return time;
    }

    // GetTime Block
    //% block="GetTime Rok %year Mesiac %month Den %day Hodina %hour Minuta %minute Sekunda %second UTC %utc"
    export function getTime(year: number, month: number, day: number, hour: number, minute: number, second: number, utc: number): void {
        // Získanie času z NTP servera
        let time = getntptime(utc);
        // Nastavenie premenných
        year = time.year;
        month = time.month;
        day = time.day;
        hour = time.hour;
        minute = time.minute;
        second = time.second;
    }
}
