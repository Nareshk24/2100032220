const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const windowSize = 10;
let numbers = [];
let windowCurrState = [];
let windowPrevState = [];

const fetchNumbers = async (numberID) => {
  // Fetch numbers from the third-party server
  try {
    const response = await axios.get(`http://your-third-party-api/numbers/${numberID}`);
    return response.data.numbers; // Assuming the API response has a 'numbers' field
  } catch (error) {
    console.error('Error fetching numbers:', error);
    return [];
  }
};

const calculateAverage = (nums) => {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return sum / nums.length;
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  const newNumbers = await fetchNumbers(numberid);

  if (newNumbers.length === 0) {
    return res.status(500).send('Error fetching numbers');
  }

  // Update the window state
  windowPrevState = [...windowCurrState];
  numbers = [...numbers, ...newNumbers].filter((value, index, self) => self.indexOf(value) === index);

  if (numbers.length > windowSize) {
    windowCurrState = numbers.slice(-windowSize);
  } else {
    windowCurrState = [...numbers];
  }

  const avg = calculateAverage(windowCurrState);

  res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg: avg.toFixed(2),
  });
});

app.listen(port, () => {
  console.log(`Average Calculator HTTP Microservice running on http://localhost:${port}`);
});
