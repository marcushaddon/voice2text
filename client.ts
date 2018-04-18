export class Client {

    private _sentimentApiBaseUrl: string = 'http://localhost:5000';

    async getSentiment(text: string) {
        let endpoint = this._sentimentApiBaseUrl + '/sentiment';
        let body = JSON.stringify({
            text: text
        });

        let response = await fetch(
            endpoint,
            {
                method: 'POST',
                body: body
            }
        );

        if (response.status == 200) {
            return await response.json();
        }
    }
}