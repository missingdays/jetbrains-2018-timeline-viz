
var januaryData = [];

for(var i = 1; i < 32; i++){
  januaryData.push({
    date: new Date(2018, 1, i),
    value: Math.random() * 5
  });
}

var handcraftedValues = [1, 1, 1, 4, 5, 5, 6,
                         7, 8, 1, 2, 3, 1, 1,
                         -4, -5, -6, -4, -5, -6, -5,
                         1, 1, 1, 1, 1, 1, 1]
var handcraftedData = [];

for(var i = 1; i < 29; i++){
  handcraftedData.push({
    date: new Date(2018, 4, i),
    value: handcraftedValues[i-1]
  });
}

var handcraftedChart = new Chart('main', handcraftedData);
handcraftedChart.plot();

var randomChart = new Chart('random', januaryData);
randomChart.plot();
