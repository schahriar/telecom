const Telecom = require('../Telecom');
const telecom = new Telecom();

telecom.parallelize(4, () => {
  console.log("@P1");
  if (Math.random() < 0.4) setTimeout(() => {
    throw new Error('Crash process');
  }, Math.random() * 1000);
});

telecom.parallelize(2, () => {
  console.log("@P2");
  if (Math.random() < 0.1) setTimeout(() => {
    throw new Error('Crash process #2');
  }, Math.random() * 1000);
});