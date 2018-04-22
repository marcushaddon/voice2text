class Client {
    constructor() {
        this._sentimentApiBaseUrl = 'http://localhost:5000/';
    }

    getSentiment(text) {
        let endpoint = this._sentimentApiBaseUrl + 'sentiment';
        const body = JSON.stringify({
            text: text
        });

        let headers = new Headers({
            'Content-Type': 'application/json'
        });

        return fetch(
            endpoint,
            {
                method: 'post',
                headers: headers,
                body: body
            }
        );
    }

    registerEvent(event) {
        let endpoint = this._sentimentApiBaseUrl + event;

        let headers = new Headers({
            'Content-Type': 'application/json'
        });

        return fetch(
            endpoint,
            {
                method: 'post',
                headers: headers
            }
        );
    }
}

var mic;
var unit;
var recognition;
var recording = false;

function setup() {
    recognition = new window['webkitSpeechRecognition']();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() { console.log("Beginning recording!"); }
    recognition.onresult = record;
    recognition.onerror = function(event) { console.log("There was an error!", event); }
    recognition.onend = function() { console.log("Stopped recording!"); beginRecording(); }
    beginRecording();

    setTimeout(refresh, 60000);
}

function refresh() {
    if (recording) {
        client.registerEvent('Recording/end')
        .then(() => {
            console.log("Cutting it off...");
            let client = new Client();
            client.getSentiment('')
            .then(
                () => {
                    location.reload(true);
                    setTimeout(refresh, 60000);
                }
            )
        })
    } else {
        location.reload(true);
        setTimeout(refresh, 60000);
    }
}

function record(event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {

        // This is our final result
        console.log("Final: ", event.results[i][0].transcript);
        const client = new Client();
        const result = event.results[i][0];

        // Register end of recording
        recording = false;
        client.registerEvent('Recording/end')
        .then((res) => {
            console.log('Registered end of recording');
            // Get the sentiment
            client.getSentiment(result.transcript)
            .then((sentiment) => {
                sentiment.json()
                .then(sentiment => {
                    console.log(sentiment);
                    addSentiment(sentiment);
                });
                
            } );
        });

        

      } else {
          
          if (!recording) {
            // This is the beginning of a recording
            const client = new Client();
            client.registerEvent('Recording/start')
            .then((res) => console.log("Registerd beginning of recording"));
            recording = true;
          } // else we are already recording
          
          console.log("Interim: ", event.results[i][0].transcript);
      }
    }
}

function beginRecording() {
    recognition.start();
}

function stopRecording() {
    recognition.stop();
}

function addSentiment(sentiment) {
    let li = document.createElement('li');
    li.innerText = sentiment.text;
    let cls;
    if (sentiment.sentiment === 0) {
        cls = 'neutral';
    } else if (sentiment.sentiment < 0) {
        cls = 'negative';
    } else {
        cls = 'positive';
    }

    li.classList.add(cls);

    let ul = document.querySelector('#sentiments');
    ul.appendChild(li);
}

setup();


