## Пример реализации проекта Timeline Visualization (Time Series + Events)
Для запуска откройте main.html в любом (современном) браузере.
### Важные замечания
Поскольку проект "не в продакшн", я активно использую возможности ES6 (arrow functions, string interpolation, classes) для создания более простого и чистого кода. Если Вы используете браузер, не поддерживающий ES6, в проект включен файл `chart_legacy.js` - пропущенный через Babel `chart.js`. Достаточно в `main.html` изменить строчку

```javascript
    <script src="chart.js"></script>
```  

на

```javascript
    <script src="chart_legacy.js"></script>
```  

### Структура проекта
`chart.js` содержит основную реализацию требуемой функциональности.

`example.js` использует класс Chart из `chart.js` для создания двух графиков для демонстрации работы.
