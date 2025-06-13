// Clear old localStorage keys if they exist
localStorage.removeItem('financeDeals');
console.log('Cleared old financeDeals localStorage');
console.log(
  'Current singleFinanceDeals count:',
  localStorage.getItem('singleFinanceDeals')
    ? JSON.parse(localStorage.getItem('singleFinanceDeals')).length
    : 0
);
