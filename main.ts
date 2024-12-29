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
        // Toto je len príklad, skutočná implementácia bude závisieť od použitého NTP servera a formátu odpovede
        let time: Time = {
            year: parseInt(response.substr(0, 4)),
            month: parseInt(response.substr(5, 2)),
            day: parseInt(response.substr(8, 2)),
            hour: parseInt(response.substr(11, 2)),
            minute: parseInt(response.substr(14, 2)),
            second: parseInt(response.substr(17, 2))
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
