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
        basic.pause(500);
    }

    // Funkcia na prijatie odpovede z ESP8266
    function receiveResponse(): string {
        let response = serial.readString();
        //console.log(response);  // Zobrazí odpoveď na konzole pre debugovanie
        return response;
    }

    // Funkcia na konverziu Unix timestampu na dátum (rok, mesiac, deň, hodina, minúta, sekunda)
    function unixToDate(timestamp: number): Time {
        let t = timestamp;

        // Počet sekúnd v dni
        const SECONDS_IN_DAY = 86400;

        // Počet dní v mesiaci
        const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // pre neprestupný rok

        // Zistíme, koľko rokov uplynulo od Unix epochy (1.1.1970)
        let years = Math.floor(t / (SECONDS_IN_DAY * 365.25)); // Priemerný počet sekúnd za rok, vrátane prestupných rokov
        let year = 1970 + years;

        // Počet dní, ktoré už uplynuli v aktuálnom roku
        let daysInYear = Math.floor(t / SECONDS_IN_DAY) - (years * 365);
        let month = 0;
        let day = 0;

        // Zistíme, ktorý mesiac a deň v mesiaci je
        while (daysInYear >= DAYS_IN_MONTH[month]) {
            daysInYear -= DAYS_IN_MONTH[month];
            month++;
        }

        day = daysInYear + 1;  // Mesiace začínajú od 1, nie 0

        // Získame hodinu, minútu a sekundu
        let hours = Math.floor((t % SECONDS_IN_DAY) / 3600);
        let minutes = Math.floor((t % SECONDS_IN_DAY) % 3600 / 60);
        let seconds = (t % SECONDS_IN_DAY) % 60;

        // Vytvoríme objekt Time
        let time: Time = {
            year: year,
            month: month + 1,  // Mesiac je 0-indexovaný, ale v kalendári je 1-indexovaný
            day: day,
            hour: hours,
            minute: minutes,
            second: seconds
        };

        return time;
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

        // Konverzia Unix timestampu na dátum a čas
        let time = unixToDate(timestamp);

        // Prispôsobenie času podľa UTC (ak je treba)
        time.hour += utc;
        if (time.hour >= 24) {
            time.hour -= 24;
            time.day += 1;
        }

        return time;
    }

    // Funkcia na prevod odpovede do hexadecimálneho formátu
    function Dump(response: string): string {
        let hexString = "";
        // Overíme, či je odpoveď reťazec, ak nie, prevodíme na reťazec
        if (typeof response !== "string") {
            response = response.toString();  // Preveďme odpoveď na reťazec
        }

        // Prechádzame každý znak v reťazci odpovede a prevádzame ho na hexadecimálnu hodnotu
        for (let i = 0; i < response.length; i++) {
            let hex = response.charCodeAt(i).toString(16).toUpperCase();  // Prevedieme znak na hex
            // Pridáme formátovaný hexadecimálny kód (doplníme nulu na začiatok ak je potrebné)
            hexString += (hex.length == 1 ? "0" : "") + hex + " ";
        }
        return hexString.trim();  // Vrátíme hexadecimálny reťazec bez poslednej medzery
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

    // Testovacia funkcia na komunikáciu s ESP8266 a prevod odpovede do hexadecimálneho formátu
    //% block="TestNTP s príkazom %command"
    //% command.defl="AT"
    export function TestNTP(command: string): string {
        sendCommand(command);  // Posielame príkaz na ESP8266
        let response = receiveResponse();  // Čítame odpoveď z ESP8266

        // Prevod odpovede do hexadecimálneho formátu
        let hexResponse = Dump(response);

        return hexResponse;  // Vrátime odpoveď v hexadecimálnom formáte
    }
}
