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

    // Funkcia na odoslanie príkazu do ESP8266
    function sendCommand(command: string): void {
        serial.writeString(command + "\r\n");
        basic.pause(100);
    }

    // Funkcia na prijatie odpovede z ESP8266
    function receiveResponse(): string {
        let response = serial.readString();
        return response;
    }

    // Funkcia na získanie času z NTP servera
    function getntptime(utc: number): Time {
        // Príkaz na komunikáciu s ESP8266 a získanie času z NTP servera
        sendCommand("AT+CIPSTART=\"TCP\",\"pool.ntp.org\",123");  // Otvorenie TCP spojenia
        sendCommand("AT+CIPSEND=48");  // Oznámenie o veľkosti dát, ktoré sa odosielajú
        sendCommand("1B 00 04 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00");  // Odoslanie požiadavky v NTP formáte

        let response = receiveResponse();  // Získanie odpovede z NTP servera

        // Predpokladám, že odpoveď bude v binárnom formáte, z ktorého získame Unix timestamp (v sekundách)
        let timestamp = parseInt(response.substr(43, 8), 16);  // Extrahovanie timestampu zo správnej pozície v odpovedi

        // Konverzia Unix timestampu na dátum a čas
        let dta = new Date(timestamp * 1000);  // JavaScript Date používa milisekundy, takže násobíme 1000

        // Vytvorenie objektu Time
        let time: Time = {
            year: dta.getUTCFullYear(),
            month: dta.getUTCMonth() + 1,  // Mesiac je 0-indexovaný (0 = január)
            day: dta.getUTCDate(),
            hour: dta.getUTCHours(),
            minute: dta.getUTCMinutes(),
            second: dta.getUTCSeconds()
        };

        // Prispôsobenie času podľa UTC (ak je treba)
        time.hour += utc;
        if (time.hour >= 24) {
            time.hour -= 24;
            time.day += 1;
        }

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

    // NTP Read Block
    //% block="NTP Read"
    export function ntpRead(): string {
        // Príkazy na komunikáciu s ESP8266 a získanie odpovede z NTP servera
        sendCommand("AT+CIPSTART=\"TCP\",\"pool.ntp.org\",123");  // Otvorenie TCP spojenia
        sendCommand("AT+CIPSEND=48");  // Oznámenie o veľkosti dát, ktoré sa odosielajú
        sendCommand("1B 00 04 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00");  // Odoslanie požiadavky v NTP formáte
        let response = receiveResponse();
        return response;
    }

}
