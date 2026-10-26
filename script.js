function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) throw new Error("Nice try! Can't divide by zero.");
  return a / b;
}

function operate(operator, a, b) {
  const operations = { '+': add, '-': subtract, '*': multiply, '/': divide };
  if (!operations[operator]) throw new Error('Operador no válido.');
  return operations[operator](a, b);
}

if (typeof document !== 'undefined') {
const display = document.querySelector('#display');
const history = document.querySelector('#history');
const keys = document.querySelector('.keys');

let firstOperand = null;
let operator = null;
let currentInput = '0';
let waitingForSecondOperand = false;
let justCalculated = false;
let hasError = false;

function formatResult(value) {
  if (!Number.isFinite(value)) throw new Error('El resultado no es válido.');
  return String(Number(value.toPrecision(10)));
}

function render() {
  display.textContent = currentInput;
  display.classList.toggle('display__value--error', hasError);
  history.textContent = firstOperand !== null && operator
    ? `${firstOperand} ${operatorSymbol(operator)}`
    : '';
}

function operatorSymbol(value) {
  return ({ '*': '×', '/': '÷', '-': '−', '+': '+' })[value];
}

function clear() {
  firstOperand = null;
  operator = null;
  currentInput = '0';
  waitingForSecondOperand = false;
  justCalculated = false;
  hasError = false;
  render();
}

function showError(message) {
  currentInput = message;
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  justCalculated = false;
  hasError = true;
  render();
}

function inputDigit(digit) {
  if (hasError) clear();
  if (justCalculated) {
    firstOperand = null;
    operator = null;
    currentInput = digit;
    justCalculated = false;
  } else if (waitingForSecondOperand) {
    currentInput = digit;
    waitingForSecondOperand = false;
  } else {
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
  render();
}

function inputDecimal() {
  if (hasError) clear();
  if (justCalculated) {
    firstOperand = null;
    operator = null;
    currentInput = '0';
    justCalculated = false;
  }
  if (waitingForSecondOperand) {
    currentInput = '0.';
    waitingForSecondOperand = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  render();
}

function selectOperator(nextOperator) {
  if (hasError) clear();
  if (justCalculated) justCalculated = false;

  if (operator && !waitingForSecondOperand) {
    calculate();
    if (hasError) return;
  }

  justCalculated = false;
  firstOperand = Number(currentInput);
  operator = nextOperator;
  waitingForSecondOperand = true;
  render();
}

function calculate() {
  if (!operator || firstOperand === null || waitingForSecondOperand) return;
  try {
    const secondOperand = Number(currentInput);
    currentInput = formatResult(operate(operator, firstOperand, secondOperand));
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    justCalculated = true;
    hasError = false;
    render();
  } catch (error) {
    showError(error.message);
  }
}

function backspace() {
  if (hasError || justCalculated) return;
  if (waitingForSecondOperand) return;
  currentInput = currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))
    ? '0'
    : currentInput.slice(0, -1);
  render();
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) selectOperator(button.dataset.operator);
  else if (button.dataset.action === 'decimal') inputDecimal();
  else if (button.dataset.action === 'equals') calculate();
  else if (button.dataset.action === 'clear') clear();
  else if (button.dataset.action === 'backspace') backspace();
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.' || event.key === ',') inputDecimal();
  else if (['+', '-', '*', '/'].includes(event.key)) selectOperator(event.key);
  else if (event.key === 'Enter' || event.key === '=') calculate();
  else if (event.key === 'Backspace') backspace();
  else if (event.key === 'Escape') clear();
  else return;
  event.preventDefault();
});

render();

}

// Exporta las funciones matemáticas para poder probarlas en Node.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { add, subtract, multiply, divide, operate };
}
