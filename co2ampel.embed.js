$(document).ready(function() {
    moment.locale('de');
    function getLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

    function askForPostalCode() {
        return prompt("Bitte geben Sie Ihre Postleitzahl ein:");
    }

    function fetchDataGeo(lat,lon) {
        return $.getJSON(`https://api.corrently.io/v2.0/gsi/advisor?lat=${lat}&lon=${lon}`);
    }
    function fetchData(postalCode) {
        return $.getJSON(`https://api.corrently.io/v2.0/gsi/advisor?q=${postalCode}`);
    }

    function updateAmpel(advice, co2Value, info) {
        $('.ampel-light').removeClass('active').text('');
        $(`#ampel-${advice.toLowerCase()}`).addClass('active').text(co2Value +"g");                
    }

    function getColorForAdvice(advice) {
        switch(advice.toLowerCase()) {
            case 'red': return '#a1262d';
            case 'yellow': return '#e8bf28';
            case 'green': return '#008e5e';
            default: return '#gray';
        }
    }

    function updateChart(data) {
        $('#qpoll1').show();
        const ctx = $('#chart')[0].getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => moment(d.time)),
                datasets: [{
                    label: 'CO2 Wert',
                    data: data.map(d => ({x: moment(d.time), y: d.co2})),
                    backgroundColor: data.map(d => getColorForAdvice(d.advice))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'DD.MM. HH:mm'
                            }
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: false,
                            callback: function(value, index, values) {
                                const date = moment(value);                                       
                                /* 
                                if (date.hours() === 0 || date.hours() === 6 || date.hours() === 12 || date.hours() === 18) {
                                    return date.format('DD.MM. HH:mm');
                                } else return 'x';
                                */
                                return date.format('DD.MM. HH:mm');
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'CO2 (g/kWh)'
                        }
                    }
                },
                plugins: {
                    legend: {
                            display: false // Legende ausblenden
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return moment(context[0].parsed.x).format('DD.MM.YYYY, HH:mm [Uhr]');
                            },
                            label: function(context) {
                                return `CO2: ${context.parsed.y} g/kWh`;
                            }
                        }
                    }
                }
            }
        });
        $('#bestHour').empty();
        let best = 999999999;
        let candytime = data[0].time;
        for(let i=0;i<data.length;i++) {
            $('#bestHour').append('<option value="'+data[i].time+'">'+moment(data[i].time).format('DD.MM., HH:mm [Uhr]')+'</option>');                    
            if(i+5<data.length) {
                let candyco2 = 0;
                for(let j=0;j<5;j++) {
                    candyco2 += data[i+j].co2 * 1;
                }
                if(candyco2 < best) {
                    best = candyco2;
                    candytime = data[i].time;
                }
            }
        }
        $('#bestHour').change(function() {
            const value = $(this).val();
            $('#qpoll1').empty();
            $('#qpoll1').removeClass('bg-dark');
            let result = "Super!";
            if(value == candytime) { $('#qpoll1').addClass('bg-success'); } else { $('#qpoll1').addClass('bg-danger'); result = "Nicht ganz!"; }

            $('#qpoll1').html('<span><strong>'+result+'</strong> Mit einem Start um '+new Date(candytime).toLocaleTimeString()+' Uhr nutzt du die umweltfreundlichste Energie, die gerade im Netz ist. Ein System wie <a href="https://openems.io/" target="_blank">OpenEMS</a> macht das ganz automatisch für dich.');
           
        });               
    }

    async function init() {

            let lat, lon,data;                    
            try {
                const position = await getLocation();
                lat = position.coords.latitude;
                lon = position.coords.longitude;
                data = await fetchDataGeo(lat, lon);
            } catch (error) {
                console.error("Geolocation error:", error);
                const postalCode = askForPostalCode();                        
                data = await fetchData(postalCode);
            }                                         
            $('#cityName').text(`für ${data.location.city}`);
            let index = 0;
            const now = new Date().getTime();
            while((index<data.data.length) && (data.data[index++].time < now)) {}
            index=index-2;                        
            if(index<0) index=0;
            updateAmpel(data.data[index].advice, data.data[index].co2, data.info);
            updateChart(data.data);
    }
    init();
});