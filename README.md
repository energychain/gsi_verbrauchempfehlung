# gsi_verbrauchempfehlung
Beispiel für die Nutzung des GrünstromIndex als Empfehlung für Zeiten zur Stromnutzung

*Ich möchte ein einfaches Javascript erstellen, welches mir eine Empfehlung gibt, wann ich in den kommenden 24 Stunden mehr Strom verbrauchen sollte und wann weniger. Datenquelle ist der GrünstromIndex unter https://api.corrently.io/v2.0/gsi/prediction?zip=69256, wobei 69256 die Postleitzahl meines Ortes ist. Im Ergebnis des API Aufrufs gibt es einen Array von Objekten mit dem Namen "forecast", der den Wert GrünstromIndex für eine Stunde (Feld timeStamp) im Feld "gsi" enthält. Auf meiner Webseite soll die Stunde mit dem höchsten GSI Wert in den kommenden 24 Stunden ausgegeben werden als die Stunde, bei dem viel Strom aus erneuerbarer Energie stammt. Das Javascript sollte sich einfach in eine Webseite implementieren lassen.*

## Beispiel
https://energychain.github.io/gsi_verbrauchempfehlung/

## Claude.AI
Gerne erstelle ich ein einfaches JavaScript für Sie, das die gewünschte Funktionalität bietet. Ich werde ein Script erstellen, das die Daten vom GrünstromIndex API abruft, analysiert und die Empfehlung für den Stromverbrauch ausgibt.

```Javascript
// Funktion zum Abrufen und Analysieren der GrünstromIndex-Daten
async function getGruenstromEmpfehlung(plz) {
    const url = `https://api.corrently.io/v2.0/gsi/prediction?zip=${plz}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Finden der Stunde mit dem höchsten GSI-Wert in den nächsten 24 Stunden
        const jetzt = new Date();
        const in24Stunden = new Date(jetzt.getTime() + 24 * 60 * 60 * 1000);
        
        let maxGSI = -1;
        let maxGSIZeit = null;
        
        data.forecast.forEach(stunde => {
            const stundeZeit = new Date(stunde.timeStamp);
            if (stundeZeit >= jetzt && stundeZeit <= in24Stunden && stunde.gsi > maxGSI) {
                maxGSI = stunde.gsi;
                maxGSIZeit = stundeZeit;
            }
        });
        
        if (maxGSIZeit) {
            return `Die beste Zeit für hohen Stromverbrauch ist am ${maxGSIZeit.toLocaleDateString()} um ${maxGSIZeit.toLocaleTimeString()} Uhr mit einem GrünstromIndex von ${maxGSI}.`;
        } else {
            return "Keine Daten für die nächsten 24 Stunden verfügbar.";
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        return "Fehler beim Abrufen der GrünstromIndex-Daten.";
    }
}

// Funktion zum Anzeigen der Empfehlung auf der Webseite
function zeigeEmpfehlung(plz) {
    const empfehlungElement = document.getElementById('gruenstrom-empfehlung');
    empfehlungElement.textContent = 'Lade Empfehlung...';
    
    getGruenstromEmpfehlung(plz).then(empfehlung => {
        empfehlungElement.textContent = empfehlung;
    });
}

// Beispielaufruf (kann in Ihre Webseite integriert werden)
zeigeEmpfehlung('69256');
```

Dieses JavaScript kann einfach in Ihre Webseite integriert werden. Hier sind die Schritte, um es zu implementieren:

1. Fügen Sie folgenden HTML-Code an der Stelle ein, wo die Empfehlung angezeigt werden soll:
```
<div id="gruenstrom-empfehlung"></div>
```
Fügen Sie das obige JavaScript in ein `<script>`-Tag am Ende Ihres `<body>`-Tags ein oder in eine separate .js-Datei, die Sie in Ihre HTML-Seite einbinden.

Rufen Sie die Funktion `zeigeEmpfehlung('69256')` auf, wenn die Seite geladen ist oder wenn Sie die Empfehlung anzeigen möchten. Sie können die Postleitzahl nach Bedarf ändern.

Das Script macht Folgendes:

- Es definiert eine asynchrone Funktion getGruenstromEmpfehlung, die die Daten vom API abruft und analysiert.
- Es findet die Stunde mit dem höchsten GSI-Wert in den nächsten 24 Stunden.
- Es gibt eine Empfehlung mit Datum, Uhrzeit und GSI-Wert zurück.
- Die Funktion zeigeEmpfehlung ruft getGruenstromEmpfehlung auf und zeigt das Ergebnis auf der Webseite an.

Dieses Script ist einfach zu implementieren und sollte die gewünschte Funktionalität bieten. Wenn Sie Fragen haben oder Änderungen wünschen, lassen Sie es mich wissen!