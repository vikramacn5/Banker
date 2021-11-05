'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-02-03T17:01:17.194Z',
    '2021-02-05T23:36:17.929Z',
    '2021-02-08T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(Math.abs(value));
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // GETTING THE DATE FROM moVEMENTSDATES ARRAY
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementDate(date, acc.locale);

    const formatedMovement = formatCur(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class = "movements__date">${displayDate}</div>
        <div class="movements__value">${formatedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formatedMovement = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formatedMovement}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements.reduce(
    (acc, mov) => (mov > 0 ? acc + mov : acc),
    0
  );
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements.reduce(
    (acc, mov) => (mov < 0 ? acc + mov : acc),
    0
  );
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .reduce((acc, int) => (int > 1 ? acc + int : acc), 0);
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  // Calling the fnction one time to start the timer from
  // defied time while logging in
  function tick() {
    const minutes = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${minutes}:${seconds}`;

    // When 0 seconds, stop the timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  }

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // long, numeric, 2-digit
      year: 'numeric',
      // weekday: 'long',
    };

    const locale = navigator.language;
    console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const now = new Date();
    // labelDate.textContent = now;
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    console.log(timer);
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Restetting the timer
    clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Resetting the timer
      clearInterval(timer);
      timer = startLogOutTimer();

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// ======================================================== //
// ----------- CONVERTING AND CHECKING NUMBERS ------------ //
// ======================================================== //

// ------------------------- BASE ------------------------- //

console.log(23 === 23.0);

// Base 10 = 0 to 9. 1/10 = 0.1. 10/3 = 3.3333333333
// Binary base 2 = 0 and 1.

// What we use in real life is base 10 which is 0 - 9 whereas
// in computers we use binary (base 2) which is 0 and 1
// How we get 3.33333 to infinity when dividing 3 from 10 same
// way computers give error when using 0.1.
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// -------------------------------------------------------- //

// ---------------------- CONVERSION ---------------------- //

console.log(Number('23'));
console.log(+'23'); // Type coercion

// -------------------------------------------------------- //

// ----------------------- PARSING ------------------------ //

console.log(Number.parseInt('30px', 10)); // (string, radix)
// radix is the base of numeral system that we are using
// (base 10) which is 0 to 9 so, that's why we nneed to pass
// the parameter as 10 if we are using base 10 numbers, if we
// are using binary numbers then we need to pass 2 as parameter
console.log(Number.parseInt('e23', 10)); // should start with number

console.log(Number.parseFloat('2.5rem'));
console.log(Number.parseInt('2.5rem')); // parseInt doesn't recognise the '.'
console.log(Number.parseFloat('   2.5rem   ')); // space doesn't affect

// -------------------------------------------------------- //

// ---------- CHECKING FOR WHETHER IT IS A NUMBER --------- //

console.log(Number.isNaN(20)); // false since it is a value
console.log(Number.isNaN('20')); // false since it is a value
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // false since Infinity is also a value

// isFinite method is the best way of checking whether it
// is a number especially if we are working with floats
// if we are working with inntegers we can also use isInteger
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.3)); // false
console.log(Number.isInteger(23 / 0)); // false

// -------------------------------------------------------- //

// ======================================================== //
// ------------------- MATH AND ROUNDING ------------------ //
// ======================================================== //

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); // gives the same answer as above
console.log(25 ** (1 / 3)); // possibly the only way to find out the cube root of a  number

console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2)); // does type coercion
console.log(Math.max(5, 18, '23px', 11, 2)); // doesn't do parsing

console.log(Math.min(5, 18, 23, 11, 2));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

// ROUNDING NUMBERS
console.log(Math.trunc(23.3));

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor('23.9')); // type coercion works here

console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3)); // works better in negative numbers too

// ROUNDING DECIMALS
console.log((2.7).toFixed(0)); // returns a string
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2));

// -------------------------------------------------------- //

// ======================================================== //
// ----------------- THE REMAINDER OPERATOR --------------- //
// ======================================================== //

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'lightgrey';
    if (i % 3 === 0) row.style.backgroundColor = 'darkgrey';
  });
});

// -------------------------------------------------------- //

// ======================================================== //
// ----------------- THE REMAINDER OPERATOR --------------- //
// ======================================================== //

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(4862354642148662156464622886846530154686516n);
console.log(BigInt(4656864));
// first takes in the max safe value and the converts to bigint

// OPERATIONS //
console.log(10000n + 10000n);
console.log(4862354642148662156464622886846530154686516n + 1000000000n);

const huge = 546246562565156215444666n;
const num = 23;
// console.log(huge * num); // operations between normal integers and bigint wont work
console.log(huge * BigInt(num));
// console.log(Math.sqrt(16n)); // This won't work

// EXCEPTIONS //
console.log(20n > 15);
console.log(20n === 20); // '===' doesn't accept type coercion (they are different BigInt and Number).
console.log(typeof 20n);
console.log(20n == '20'); // '==' does type coercion
console.log(huge + ' is REALLY BIG!!!'); // works with string concatenation

// DIVISIONS //
console.log(10n / 3n); // doesn't give the exact result instead truncs the decimal part
console.log(10 / 3);

// -------------------------------------------------------- //

// ======================================================== //
// -------------------- CREATING DATES -------------------- //
// ======================================================== //

// // Create a date
// const now = new Date();
// console.log(now);

// console.log(new Date('Aug 02 2020 18:05:41'));
// console.log(new Date('Dec 24 2015'));
// console.log(new Date('December 24 2015'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 23, 5));
// // (year, month, date, hour, minutes, seconds)
// // month starts from 0 that's why 10 is november

// console.log(new Date(2037, 10, 31)); // goes to the next month
// console.log(new Date(2037, 10, 35));

// console.log(new Date(0)); // start date
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); // 3 days after start date

// // WORKING WITH DATES
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(account1.movementsDates[0]);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime()); // gives timestamp

// console.log(new Date(2142237180000)); // gives the date as per timestamp
// console.log(Date.now());

// console.log(future.setFullYear(2040));
// console.log(future);

// const past = new Date('Dec 25 2013 21:35:41');
// console.log(past);
// console.log(past.getFullYear());

// -------------------------------------------------------- //

// ======================================================== //
// ----------------- OPERATION WITH DATES ----------------- //
// ======================================================== //

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(+future);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs((date2 - date1) / (24 * 60 * 60 * 1000));

// const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
// console.log(days1);

// -------------------------------------------------------- //

// ======================================================== //
// --------------------- INTL NUMBERS --------------------- //
// ======================================================== //

// const num2 = 384764.234466;

// const options = {
//   style: 'currency', // unit, currency, percentage
//   unit: 'celsius', // Ignores the unit if style = percentage or currency
//   currency: 'EUR', // if style is currency then this should be defined
//   // useGrouping: false, // removes the comma seperators in numbers
// };

// console.log('US      ', new Intl.NumberFormat('en-US', options).format(num2));
// console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(num2));
// console.log('hi', 20 + 30);
// console.log('Syria:  ', new Intl.NumberFormat('ar-SY').format(num2));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, options).format(num2)
// );

// -------------------------------------------------------- //

// ======================================================== //
// --------------------- SET TIMEOUT ---------------------- //
// ======================================================== //

// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );

// console.log('waiting...');

// if (ingredients.includes('spinach')) {
//   clearTimeout(pizzaTimer);
// }

// setInterval(() => {
//   const now = new Date();
//   const hour = now.getHours();
//   const minute = now.getMinutes();
//   const seconds = now.getSeconds();
//   console.log(`${hour}:${minute}:${seconds}`);
// }, 1000);

// setInterval(() => {
//   const now = new Date();
//   const formatTime = new Intl.DateTimeFormat('en-US', {
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//   }).format(now);
//   console.log(formatTime);
// }, 1000);
// -------------------------------------------------------- //

let testFunc;
const closureTest = function () {
  testFunc = function innerFunc() {
    console.log(testVar);
  };
  let testVar = 10;
};

closureTest();
testFunc();
