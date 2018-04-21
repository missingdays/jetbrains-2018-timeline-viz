
var januaryData = [];

for(var i = 1; i < 32; i++){
  januaryData.push({
    date: new Date(2018, 1, i),
    value: Math.random() * 5
  });
}


var chart = new Chart('main', januaryData);
chart.plot();
