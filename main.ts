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
        // Otvorenie TCP spojenia na NTP server
        sendCommand("AT+CIPSTART=\"TCP\",\"pool.ntp.org\",123");  // NTP port je 123
        basic.pause(100); // Dáme trochu času na inicializáciu spojenia
        sendCommand("AT+CIPSEND=48");  // Požiadame ESP8266 o odoslanie 48 bajtov
        basic.pause(100); // Pauza pred odoslaním dát
        sendCommand("1B 00 04 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00"); // NTP požiadavka

        let response = receiveResponse();  // Získanie odpovede z NTP servera

        // Zisťujeme timestamp zo správnej pozície v odpovedi
        // Odpoveď je binárna, teda bude potrebné správne dekódovať dáta.
        // Očakávame, že timestamp je na pozícii 43-47 v odpovedi
        let timestampHex = response.substr(43, 8);

        // Získame timestamp v sekúndach (binárne dáta môžeme previesť na celé číslo)
        let timestamp = parseInt(timestampHex, 16);

        // Konverzia Unix timestampu na dátum a čas (v milisekundách)
        let dta = new Date(timestamp * 1000);  // Prevod na JavaScript Date (milisekundy)

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
        // Otvorenie TCP spojenia na NTP server
        sendCommand("AT+CIPSTART=\"TCP\",\"pool.ntp.org\",123");  // NTP port je 123
        basic.pause(100); // Dáme trochu času na inicializáciu spojenia
        sendCommand("AT+CIPSEND=48");  // Požiadame ESP8266 o odoslanie 48 bajtov
        basic.pause(100); // Pauza pred odoslaním dát
        sendCommand("1B 00 04 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00"); // NTP požiadavka
        let response = receiveResponse();
        return response;
    }

}
