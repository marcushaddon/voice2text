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
}

var mic;
var unit;
var recognition;

function setup() {
    recognition = new window['webkitSpeechRecognition']();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() { console.log("Beginning recording!"); }
    recognition.onresult = record;
    recognition.onerror = function(event) { console.log("There was an error!", event); }
    recognition.onend = function() { console.log("Stopped recording!"); beginRecording(); }
    beginRecording();
}

function record(event) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        // This is our final result
        console.log("Final: ", event.results[i][0].transcript);
        const client = new Client();
        client.getSentiment(event.results[i][0].transcript)
        .then((sentiment) => {
            sentiment.json()
            .then(sentiment => {
                console.log(sentiment);
                addSentiment(sentiment);
            })
            
        } );

      } else {
          console.log("Interim: ", event.results[i][0].transcript);
      }
    }
}

function beginRecording() {
    recognition.start();
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


