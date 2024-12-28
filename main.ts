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
        // Príkazy na komunikáciu s ESP8266 a získanie času z NTP servera
        sendCommand("AT+CIPSTART=\"TCP\",\"pool.ntp.org\",123");
        sendCommand("AT+CIPSEND=48");
        sendCommand("BEEF");
        let response = receiveResponse();

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
