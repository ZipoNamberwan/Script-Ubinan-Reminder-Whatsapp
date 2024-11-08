const wppconnect = require('@wppconnect-team/wppconnect');
// const cron = require('node-cron');
const axios = require('axios');

wppconnect.create({
  session: 'test',
})
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {
  // cron.schedule('* * * * *', () => {

  const url = 'https://ubinan.bpskabprobolinggo.com/api/message-today';
  const maxRetries = 3;
  const delay = 5000;

  async function fetchDataWithRetry(url, retries = maxRetries) {
    try {
      const response = await axios.get(url);
      console.log('Data fetched successfully');
      return response.data;
    } catch (error) {
      if (retries > 0) {
        console.log(`Request failed. Retrying in ${delay / 1000} seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchDataWithRetry(url, retries - 1);
      } else {
        console.error('Max retries reached. Could not fetch data.');
        throw error;
      }
    }
  }

  function delayExec(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function sendMessagesWithDelay(data) {
    for (const dt of data) {
      try {
        var phone_number = dt['phone_number'].replace('+', '');
        // var phone_number = '6282236981385'

        const result = await client.sendText(phone_number, dt['message']);
        console.log('Result: ', result);
      } catch (error) {
        console.error('Error when sending: ', error);
      }
      await delayExec(5000);
    }
  }

  fetchDataWithRetry(url)
    .then(async data => {
      await sendMessagesWithDelay(data);

      client.close()
    })
    .catch(error => {
      console.error('Error fetching data:', error.message);
    });

  // });
}
